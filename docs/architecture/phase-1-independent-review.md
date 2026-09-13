# Phase 1 Independent Review — Pre-Review

## Status

**CONDITIONAL / NOT GREEN**

This is an adversarial pre-review by the current coding agent. It is intentionally **not** the Genesis independent-review approval and must not be used as human approval evidence.

## Scope reviewed

- `.genesis/project.json` canonical Phase 1 task map and decision state;
- `SPEC.md` and Phase 0 evidence;
- Phase 1 architecture proposal and task map;
- GitHub boundary, identity/tenancy, retrieval, autonomy, HITL, privacy, AWS, and tool-sandbox analyses;
- Phase 1 technical verification, contracts, traceability, ADRs, evaluation contract;
- Genesis plan preflight;
- current GitHub and AWS documentation relevant to the major platform claims.

## Positive findings

1. The product intent remains coherent with the approved Phase 0 specification.
2. Genesis canonical authority is now explicit and DEC-013..016 have been reconciled into the ledger.
3. Product implementation remains blocked before plan approval.
4. Trust boundaries are explicit: repository/model/tool data are untrusted and cannot acquire privilege by content alone.
5. Specialists are separated from aggregation/publication authority.
6. Review identity includes repository state and therefore supports head-SHA supersession.
7. Retrieval evidence carries freshness/provenance rather than being treated as generic context.
8. Initial execution avoids arbitrary repository code execution, substantially reducing first-release execution risk.
9. Evaluation includes development/holdout separation and human-required promotion.
10. Privacy is expressed as explicit retention classes instead of hidden service defaults.

## Findings requiring attention before Phase 1 green approval

### R1 — Official Genesis plan check receipt is still missing

The environment cannot currently install or execute the official Genesis CLI because outbound GitHub access is unavailable from the shell.

**Severity:** release-gate blocker.

**Required action:** run the official `genesis plan check .` in an environment with the Genesis CLI installed. Do not manually set the plan-check receipt.

### R2 — Several executable planning gates are structurally valid but shallow

Many current task gates test document existence or string presence rather than evaluating a real state transition or architecture invariant. Genesis accepts them as executable commands, but AC-003 and the project's evidence-first philosophy call for stronger proof.

**Severity:** high planning-quality concern.

**Required action before implementation:** replace presence-only checks with assertion-rich architecture verification scripts where practical. Examples include deterministic lifecycle transition fixtures, publication idempotency simulations, policy matrices, retrieval freshness fixtures, and evaluator-isolation checks.

### R3 — Head-SHA supersession needs a concrete concurrency rule

The architecture says a new PR head supersedes pending work, but implementation must prevent an older in-flight worker from publishing after the newer head becomes canonical.

**Severity:** high.

**Required action:** require a compare-and-swap/lease or equivalent durable generation token before aggregation and again before publication. Publication must fail closed when the worker's head generation is no longer current.

### R4 — Publication uncertainty requires an explicit durable state machine

The publication contract identifies `PUBLICATION_UNCERTAIN`, but the implementation must distinguish confirmed failure from lost-response ambiguity. Retrying must use stable publication IDs and reconcile external state before creating anything new.

**Severity:** high.

**Required action:** add a publication reconciliation algorithm and integration fixtures for timeout-after-send, duplicate submission, outdated-line failure, and partial multi-surface publication.

### R5 — Retrieval context must be snapshot-consistent

Repository retrieval, diff retrieval, and evidence citation must use the same reviewed head generation. A race where the repository index refreshes while review analysis continues could otherwise produce mixed-head evidence.

**Severity:** high.

**Required action:** bind review context to an immutable repository snapshot/index version and reject or downgrade evidence that cannot prove alignment.

### R6 — Provider/model behavior remains intentionally unresolved

This is an approved planning boundary, not a defect. The system correctly keeps the provider behind an interface and requires evaluation before freezing the initial provider/model.

**Severity:** accepted planning dependency.

**Required action:** benchmark and select during the appropriate later task; do not leak provider-specific assumptions into domain contracts.

### R7 — Exact retention periods remain policy work

The retention-class decision is sound, but production deployment cannot rely on unspecified durations forever.

**Severity:** accepted but must be completed before external production commitments.

**Required action:** define retention/deletion/export/legal-hold and backup-erasure behavior before the production readiness gate.

## Security review notes

- Do not interpolate PR/repository text into privileged system instructions without explicit untrusted-data delimiting.
- Tool selection must come from typed policy/configuration, never from model-generated tool names.
- GitHub access must always use the installation authorization associated with the review.
- Webhook delivery identity and repository authorization should be persisted before expensive processing.
- No model result can create or modify IAM, GitHub permissions, policy configuration, or evaluator state.

## Reliability review notes

- Unique constraints should protect transport delivery ID and logical review identity.
- Every queue item needs a review/pass generation and idempotency key.
- Recovery must distinguish not-started, running, completed, failed, and uncertain-side-effect attempts.
- Retries must not duplicate external publication.
- Degraded output must state its limitations and coverage rather than appear as a complete review.

## Product review notes

The selected autonomy progression is appropriate: conservative initial routing with future evolution earned through calibration/evaluation. Repository policy can tighten the global policy but cannot weaken global invariants.

The selected no-arbitrary-execution initial release is also appropriate for the first production boundary. It keeps the evidence contract focused on static/retrieval/model reasoning and leaves execution as a separable future capability rather than entangling it with the specialist interface.

## Recommendation

**Do not enter build yet.**

First obtain the official Genesis plan-check receipt, strengthen the shallow architecture gates where practical, resolve the concurrency/publication/retrieval consistency requirements above, and then have a human independent reviewer examine the resulting package. Only after that review should the product owner perform Genesis plan approval.
