# Phase 0 — Decisions, Deferrals, and Design Boundaries

These decisions narrow ambiguity before Phase 1. They do not authorize product implementation.

## Decided in Phase 0

### D0-006 — Review identity

Every review is anchored to a stable logical identity derived from the GitHub installation/repository/PR/event context needed to guarantee idempotency. Exact key construction is a Phase 1 data/API design task.

### D0-007 — Ingress

GitHub App webhook ingress is the primary production entry point. Authenticity verification occurs before durable review work is scheduled. GitHub App JWT/installation-token behavior is a reference implementation candidate from the previous repository, not a copied design.

### D0-008 — Queue boundary

Redis + ARQ is the intended asynchronous execution boundary. Webhook handling should acknowledge quickly and enqueue bounded work rather than perform the entire review synchronously.

### D0-009 — Workflow boundary

The product depends on an internal workflow-engine abstraction. LangGraph is the initial engine implementation; orchestration-specific behavior must not leak into the rest of the codebase such that a future engine replacement requires a system-wide rewrite.

### D0-010 — Specialist topology

The first production review topology contains four parallel specialist domains: security, quality, tests, and documentation. Each specialist returns the same canonical finding contract and cannot directly publish externally.

### D0-011 — Decision authority

Specialists are evidence producers. The aggregator/decision layer is the authority for normalized, deduplicated, confidence/policy-eligible findings. Human adjudication is a first-class exception/decision path, not a specialist responsibility.

### D0-012 — Retrieval

Repository retrieval is hybrid: semantic/vector retrieval plus keyword/full-text retrieval, combined with an explicit freshness/index state. Retrieval results are evidence, not instructions.

### D0-013 — Durable data spine

The intended durable state backbone is Postgres-compatible/Tiger Cloud. Three conceptual lanes are separated: retrieval memory (`code_chunks`), relational truth (reviews/findings/HITL state), and event/time-series telemetry (agent events, health, cost, latency). Exact schemas are Phase 1 work.

### D0-014 — Publication

The initial external publication surface is GitHub PR review output. Publication occurs only after aggregation, deduplication, confidence/policy evaluation, and any required HITL decision. Exact GitHub API shapes and permission scopes are Phase 1 interface work.

### D0-015 — Security boundary

Repository content is data, never authority. Agent tools are scoped through an explicit registry/authorization boundary. Prompt injection defense, secret masking, credential scope, and tool allowlisting are mandatory architectural concerns.

### D0-016 — Economics boundary

BudgetGuard is a pre-LLM policy point where feasible. Review cost is attributable at review and agent level. A budget breach must fail closed rather than silently continue with uncontrolled model usage.

### D0-017 — Evaluation boundary

Evaluation is independent from production execution. The initial evaluation design includes a golden PR dataset, development/holdout separation, LLM-as-judge or equivalent independent scoring where appropriate, regression gates, and promotion evidence. The candidate system cannot rewrite or control the evaluator.

### D0-018 — Reliability posture

The system prefers slower-but-correct behavior. Failures should move reviews toward retryable, degraded, blocked, or human-reviewed states rather than toward unsupported certainty or uncontrolled replay.

## Deferred to Phase 1

### DF-001 — Exact GitHub permissions

Determine minimum installation/repository permissions for reading PR state, reading repository contents, publishing reviews, and accessing checks/statuses.

### DF-002 — Review event matrix

Define the exact set of GitHub events that create, refresh, invalidate, or cancel logical reviews.

### DF-003 — Diff/context bounds

Determine maximum PR size, file count, token/context budget, chunk limits, and degraded-review behavior based on benchmarks.

### DF-004 — Severity taxonomy

Finalize severity levels, publication defaults, confidence thresholds, and critical escalation semantics from the evaluation plan.

### DF-005 — Model/provider policy

Select initial model/provider defaults and fallback order using correctness, security, latency, and economics evidence rather than convenience.

### DF-006 — Retrieval implementation

Select exact embedding, keyword index, chunking, fusion, freshness update, and retention implementation after architecture/performance evaluation.

### DF-007 — Database schema

Design exact Tiger/Postgres tables, constraints, indexes, retention, migrations, and event/time-series schema.

### DF-008 — HITL UX

Define the exact human review queue, approval/rejection/dispute semantics, expiration behavior, and access-control model.

### DF-009 — GitHub publication contract

Define idempotent publication strategy, comment anchoring, review summaries, check-run integration, update/retraction behavior, and rate-limit handling.

### DF-010 — Language support

Select the initial supported language/parser set based on actual target repositories and evaluation coverage. Unsupported languages must degrade explicitly rather than produce fabricated analysis.

### DF-011 — Retention/privacy

Finalize repository-content, prompts, model output, event, finding, and audit retention periods and deletion/export requirements.

### DF-012 — Prompt/version lifecycle

Define exact prompt artifact format, version IDs, release/canary workflow, evaluation requirements, and rollback mechanism.

## Phase 0 conclusion

The product concept is sufficiently constrained to design the architecture, but the deferred items remain intentionally unresolved. Phase 1 must resolve them through bounded architecture/evaluation tasks and cannot silently decide them inside implementation code.
