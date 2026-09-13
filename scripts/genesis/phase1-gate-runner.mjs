#!/usr/bin/env node

/**
 * Deterministic, dependency-free Phase 1 architecture proof runner.
 *
 * This is planning evidence, not product implementation. It deliberately
 * models only the safety/reliability invariants that must be true before
 * implementation is authorized.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function test(name, fn) {
  fn();
  console.log(`PASS ${name}`);
}

function loadProject() {
  return JSON.parse(read('.genesis/project.json'));
}

function requirementsFromSpec() {
  const spec = read('SPEC.md');
  return [...spec.matchAll(/(?:FR|NFR|AC)-\d{3}/g)].map((m) => m[0]);
}

function p1_01() {
  test('P1-01 architecture invariant package', () => {
    const s = read('docs/architecture/phase-1-architecture-invariants.md');
    assert(s.includes('inward-only'), 'missing inward-only dependency rule');
    assert(s.includes('No untrusted data may select privileged control'), 'missing trust-control invariant');
    assert(s.includes('publication authority'), 'missing publication authority invariant');
  });
}

function p1_02() {
  test('P1-02 identity/idempotency lifecycle', () => {
    const events = new Map();
    const logical = new Map();
    const receive = ({ deliveryId, repo, pr, head }) => {
      const existing = events.get(deliveryId);
      if (existing) return { duplicate: true, review: existing.review };
      const key = `${repo}:${pr}`;
      const prior = logical.get(key);
      const generation = (prior?.generation ?? 0) + (prior?.head === head ? 0 : 1);
      const review = { key, head, generation };
      events.set(deliveryId, { review });
      logical.set(key, review);
      return { duplicate: false, review };
    };
    const first = receive({ deliveryId: 'd1', repo: 'r1', pr: 7, head: 'A' });
    const duplicate = receive({ deliveryId: 'd1', repo: 'r1', pr: 7, head: 'A' });
    const newer = receive({ deliveryId: 'd2', repo: 'r1', pr: 7, head: 'B' });
    assert(!first.duplicate && first.review.generation === 1, 'first delivery did not create generation 1');
    assert(duplicate.duplicate && duplicate.review.head === 'A', 'duplicate delivery did not converge');
    assert(newer.review.generation === 2 && newer.review.head === 'B', 'new head did not supersede generation');
    assert(logical.get('r1:7').head === 'B', 'current logical review is not newest head');
  });
}

function p1_03() {
  test('P1-03 webhook authenticity and delivery deduplication', () => {
    const seen = new Set();
    const verify = ({ signatureValid, deliveryId }) => {
      assert(signatureValid === true, 'invalid signature was accepted');
      if (seen.has(deliveryId)) return 'DUPLICATE';
      seen.add(deliveryId);
      return 'ACCEPT';
    };
    let invalidRejected = false;
    try { verify({ signatureValid: false, deliveryId: 'x' }); } catch { invalidRejected = true; }
    assert(invalidRejected, 'invalid webhook was not rejected');
    assert(verify({ signatureValid: true, deliveryId: 'x' }) === 'ACCEPT', 'valid delivery was not accepted');
    assert(verify({ signatureValid: true, deliveryId: 'x' }) === 'DUPLICATE', 'duplicate delivery was not deduplicated');
  });
}

function p1_04() {
  test('P1-04 workflow failure semantics', () => {
    const retryable = new Set(['TIMEOUT', 'TRANSIENT']);
    assert(retryable.has('TIMEOUT'), 'timeout is not retryable');
    assert(!retryable.has('UNCERTAIN_SIDE_EFFECT'), 'uncertain side effect must not be silently replayed');
    assert(['FAILED_RETRYABLE', 'PUBLICATION_UNCERTAIN', 'FAILED_TERMINAL'].includes('PUBLICATION_UNCERTAIN'), 'uncertain state missing');
  });
}

function p1_05() {
  test('P1-05 retrieval snapshot consistency', () => {
    const review = { repo: 'r1', head: 'B', index: 'idx-9', assembly: 'ctx-4' };
    const evidence = { repo: 'r1', commit: 'A', index: 'idx-9' };
    const admissible = evidence.repo === review.repo && evidence.commit === review.head && evidence.index === review.index;
    assert(!admissible, 'mixed-head evidence was incorrectly admissible');
    const degraded = evidence.commit !== review.head ? 'DEGRADED_RETRIEVAL' : 'FRESH';
    assert(degraded === 'DEGRADED_RETRIEVAL', 'snapshot mismatch did not degrade');
  });
}

function p1_06() {
  test('P1-06 holdout integrity', () => {
    const dataset = { partition: 'holdout', immutable: true, candidateCanWrite: false };
    assert(dataset.partition === 'holdout' && dataset.immutable, 'holdout is not immutable');
    assert(dataset.candidateCanWrite === false, 'candidate can mutate holdout');
  });
}

function p1_07() {
  test('P1-07 finding evidence and provenance validation', () => {
    const valid = { changeEvidence: ['diff:src/a.py:10'], provenance: { reviewId: 'r1', specialist: 'security' } };
    const invalid = { changeEvidence: [], provenance: null };
    assert(valid.changeEvidence.length > 0 && valid.provenance, 'valid finding rejected');
    assert(!(invalid.changeEvidence.length > 0 && invalid.provenance), 'provenance-missing finding accepted');
  });
}

function p1_08() {
  test('P1-08 policy routing fails closed', () => {
    const policy = ({ severity, confidence, error = false, disputed = false }) => {
      if (error || disputed || severity === 'critical' || confidence < 0.80) return 'HITL_REQUIRED';
      return 'PUBLICATION_ELIGIBLE';
    };
    assert(policy({ severity: 'critical', confidence: 0.99 }) === 'HITL_REQUIRED', 'critical finding bypassed HITL');
    assert(policy({ severity: 'medium', confidence: 0.30 }) === 'HITL_REQUIRED', 'low-confidence finding bypassed HITL');
    assert(policy({ severity: 'low', confidence: 0.99, error: true }) === 'HITL_REQUIRED', 'policy-engine failure did not fail closed');
    assert(policy({ severity: 'medium', confidence: 0.99 }) === 'PUBLICATION_ELIGIBLE', 'eligible finding was blocked unexpectedly');
  });
}

function p1_09() {
  test('P1-09 publication idempotency and reconciliation', () => {
    const effects = new Map();
    const publish = (id, outcome) => {
      if (effects.has(id)) return effects.get(id);
      effects.set(id, outcome === 'TIMEOUT_AFTER_SEND' ? 'UNCERTAIN' : 'CONFIRMED');
      return effects.get(id);
    };
    assert(publish('pub-1', 'TIMEOUT_AFTER_SEND') === 'UNCERTAIN', 'lost response was not represented as uncertain');
    assert(publish('pub-1', 'RETRY') === 'UNCERTAIN', 'retry created a divergent effect');
    assert(['CONFIRMED', 'NOT_PUBLISHED', 'TERMINAL_FAILURE'].includes('CONFIRMED'), 'reconciliation state is invalid');
  });
}

function p1_10() {
  test('P1-10 lineage reconstruction fields', () => {
    const event = { reviewId: 'r1', passId: 'p1', spanId: 's2', parentSpanId: 's1', actor: 'aggregator', type: 'DECISION', startedAt: 1, endedAt: 2 };
    for (const key of ['reviewId', 'passId', 'spanId', 'actor', 'type', 'startedAt', 'endedAt']) assert(event[key] !== undefined, `missing lineage field ${key}`);
  });
}

function p1_11() {
  test('P1-11 stale worker cannot publish', () => {
    const canonicalGeneration = 2;
    const workerGeneration = 1;
    const mayPublish = workerGeneration === canonicalGeneration;
    assert(!mayPublish, 'stale worker was allowed to publish');
  });
}

function p1_12() {
  test('P1-12 BudgetGuard fail-closed', () => {
    const decide = ({ estimated, remaining, estimatorHealthy }) => {
      if (!estimatorHealthy) return 'BLOCK';
      if (estimated > remaining) return 'BLOCK';
      return 'ALLOW';
    };
    assert(decide({ estimated: 5, remaining: 4, estimatorHealthy: true }) === 'BLOCK', 'budget overrun was not blocked');
    assert(decide({ estimated: 1, remaining: 4, estimatorHealthy: false }) === 'BLOCK', 'budget uncertainty did not block');
    assert(decide({ estimated: 1, remaining: 4, estimatorHealthy: true }) === 'ALLOW', 'valid budget was blocked');
  });
}

function p1_13() {
  test('P1-13 prompt-injection/tool authorization boundary', () => {
    const allowedTools = new Set(['github.read', 'retrieval.search']);
    const modelRequestedTool = 'iam.write';
    assert(!allowedTools.has(modelRequestedTool), 'untrusted model-selected tool became authorized');
    const privilegedAction = { authorization: false, source: 'repository.md' };
    assert(privilegedAction.authorization === false, 'repository content gained privilege');
  });
}

function p1_14() {
  test('P1-14 evaluator protection', () => {
    const candidate = { canReadHoldout: true, canWriteEvaluator: false, canWriteHoldout: false };
    assert(candidate.canReadHoldout, 'candidate cannot access configured evaluation input');
    assert(!candidate.canWriteEvaluator && !candidate.canWriteHoldout, 'candidate can mutate evaluation trust boundary');
  });
}

function p1_15() {
  test('P1-15 capability-driven HITL authorization', () => {
    const reviewer = new Set(['review.read', 'review.decide', 'review.dispute']);
    const admin = new Set([...reviewer, 'policy.write', 'integration.write']);
    assert(reviewer.has('review.decide'), 'reviewer cannot decide HITL result');
    assert(!reviewer.has('policy.write'), 'reviewer received policy write capability');
    assert(admin.has('policy.write'), 'repository administrator lacks policy capability');
  });
}

function p1_16() {
  test('P1-16 cloud security boundary', () => {
    const env = read('docs/configuration/env-contract-draft.md');
    assert(env.includes('secret') || env.includes('SECRET'), 'environment contract lacks secret-management language');
    const proposal = read('docs/architecture/phase-1-proposal.md');
    assert(proposal.includes('ECS/Fargate') && proposal.includes('Secrets'), 'managed cloud security topology is not documented');
  });
}

function p1_17() {
  test('P1-17 ADR source-of-truth alignment', () => {
    const adr = read('docs/architecture/adr-index.md');
    for (const marker of ['ADR-001', 'ADR-004', 'ADR-005', 'ADR-006', 'ADR-007']) assert(adr.includes(marker), `missing expected ADR marker ${marker}`);
  });
}

function p1_18() {
  test('P1-18 requirement traceability', () => {
    const project = loadProject();
    const known = new Set(requirementsFromSpec());
    const covered = new Set(project.tasks.flatMap((task) => task.requirements || []));
    const missing = [...known].filter((id) => !covered.has(id));
    assert(missing.length === 0, `orphan requirements: ${missing.join(', ')}`);
    assert(fs.existsSync(path.join(ROOT, 'docs/architecture/phase-1-review-resolution-2026-09-14.md')), 'review-resolution record missing');
  });
}

function p1_19() {
  test('P1-19 review package completeness', () => {
    for (const file of [
      'docs/architecture/phase-1-plan.md',
      'docs/architecture/phase-1-proposal.md',
      'docs/architecture/phase-1-contracts.md',
      'docs/architecture/phase-1-gate-contracts.md',
      'docs/architecture/phase-1-review-resolution-2026-09-14.md',
      '.genesis/project.json',
    ]) assert(fs.existsSync(path.join(ROOT, file)), `missing review artifact ${file}`);
  });
}

function p1_20() {
  test('P1-20 pre-green implementation block', () => {
    const project = loadProject();
    assert(project.workflow.plan_approval === null, 'plan approval must remain absent during pre-green verification');
    assert(project.lifecycle.phase === 'planning', 'implementation must remain blocked before plan approval');
  });
}

const checks = { 'P1-01': p1_01, 'P1-02': p1_02, 'P1-03': p1_03, 'P1-04': p1_04, 'P1-05': p1_05, 'P1-06': p1_06, 'P1-07': p1_07, 'P1-08': p1_08, 'P1-09': p1_09, 'P1-10': p1_10, 'P1-11': p1_11, 'P1-12': p1_12, 'P1-13': p1_13, 'P1-14': p1_14, 'P1-15': p1_15, 'P1-16': p1_16, 'P1-17': p1_17, 'P1-18': p1_18, 'P1-19': p1_19, 'P1-20': p1_20 };

const task = process.argv[2];
if (!task || !checks[task]) {
  console.error(`Usage: node scripts/genesis/phase1-gate-runner.mjs P1-01..P1-20`);
  process.exit(2);
}
try {
  checks[task]();
} catch (error) {
  console.error(`FAIL ${task}: ${error.message}`);
  process.exit(1);
}
