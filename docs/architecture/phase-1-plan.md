# Phase 1 — Bounded Architecture Verification Plan

Status: **DRAFT / HUMAN APPROVAL REQUIRED**

Phase 1 resolves the exact technical contracts that Phase 0 intentionally deferred. No product implementation is authorized until this plan is checked, approved, and the first bounded task is activated by Genesis.

## Planning principles

- One bounded task is active at a time.
- Every task is linked to stable FR/NFR/AC identifiers.
- Every task has an executable acceptance gate.
- Medium/high-risk tasks require independent review.
- Product-owner decisions remain explicit when architecture changes review behavior, trust, cost, UX, or an irreversible boundary.
- Technical findings are recorded in ADRs and durable architecture documents before implementation uses them.

## Task map

### P1-01 — Architecture principles and dependency rule
Requirements: NFR-009, NFR-015, AC-002, AC-003, AC-004.
Scope: finalize module ownership, inward-only dependency rules, and architecture invariants.
Gate: architecture consistency check over the module graph and ADR index.

### P1-02 — Review identity, installation, tenancy, and lifecycle model
Requirements: FR-002, FR-010, FR-017, NFR-004, NFR-010, NFR-011, NFR-012, AC-001, AC-007, AC-008.
Scope: formalize GitHub installation → repository → tenant → logical review → pass/run identity and supersession semantics.
Gate: executable state-transition and idempotency scenario suite.

### P1-03 — GitHub ingress, permissions, and webhook matrix
Requirements: FR-001, FR-002, FR-003, NFR-001, NFR-004, AC-004, AC-007.
Scope: finalize App permission set, event subscriptions, authenticity validation, delivery deduplication, and trigger/cancel rules.
Gate: executable ingress contract tests using signed/invalid/duplicate event fixtures.

### P1-04 — Workflow-engine boundary and execution lifecycle
Requirements: FR-013, NFR-003, NFR-006, NFR-009, NFR-013.
Scope: define workflow interface, LangGraph adapter boundary, checkpoint/resume/error states, timeout ownership, and no-replay semantics.
Gate: workflow interface contract test with success, timeout, retry, and uncertain-side-effect fixtures.

### P1-05 — Repository understanding and retrieval architecture
Requirements: FR-003, FR-004, NFR-006, NFR-013, AC-004, AC-008.
Scope: diff acquisition, repository snapshot contract, chunk provenance, FTS/vector fusion, freshness, and degraded retrieval semantics.
Gate: retrieval contract test proving stale/missing evidence cannot be marked fresh.

### P1-06 — Embedding benchmark and parser coverage
Requirements: FR-004, FR-015, NFR-006, NFR-008, NFR-015, AC-009.
Scope: benchmark dataset, candidate embeddings, retrieval metrics, parser support coverage, cost/latency bounds, and vector-dimension freeze procedure.
Gate: benchmark runner produces reproducible development/holdout report without candidate access to holdout labels.

### P1-07 — Specialist and finding contract
Requirements: FR-005, FR-006, FR-007, NFR-002, NFR-005, NFR-015, AC-005.
Scope: typed specialist input/output, evidence/provenance, normalization, semantic deduplication, and partial-specialist failure semantics.
Gate: finding contract fixtures covering valid, invalid, conflicting, duplicate, and provenance-missing outputs.

### P1-08 — Decision, confidence, autonomy, and HITL policy boundary
Requirements: FR-008, FR-009, FR-016, NFR-002, NFR-012, AC-006.
Scope: deterministic policy schema, confidence semantics, critical escalation, per-repository overrides, dispute handling, and prompt/policy versioning boundary.
Gate: policy decision matrix with positive/negative/HITL cases and audit assertions.

### P1-09 — GitHub publication contract
Requirements: FR-010, FR-014, NFR-002, NFR-004, NFR-005, NFR-011, AC-006, AC-007.
Scope: inline review, summary/check fallback, stable identifiers, anchoring, update/retraction, rate-limit behavior, and publication idempotency.
Gate: publication simulator proving duplicate deliveries cannot duplicate externally visible findings.

### P1-10 — Durable data-lane architecture
Requirements: FR-011, FR-017, NFR-007, NFR-010, NFR-011, NFR-014, AC-008.
Scope: review truth, finding truth, HITL, event lineage, cost/latency records, retrieval memory, indexes, constraints, and retention hooks.
Gate: schema ownership/consistency checks and lineage reconstruction fixture.

### P1-11 — Reliability and failure-state architecture
Requirements: FR-013, NFR-003, NFR-004, NFR-006, NFR-013, AC-007, AC-008.
Scope: retries, backoff, timeouts, circuit breakers, DLQ, checkpoint recovery, dependency degradation, large-PR passes, and uncertain side-effect handling.
Gate: fault matrix with executable recovery scenarios.

### P1-12 — Economics and BudgetGuard
Requirements: FR-012, FR-011, NFR-007, NFR-006, AC-008.
Scope: pre-call budget checks, review/agent/model cost attribution, quota semantics, and fail-closed budget behavior.
Gate: budget scenarios demonstrating hard-stop before expensive execution.

### P1-13 — Security, tool capabilities, and prompt-injection boundary
Requirements: FR-018, FR-001, NFR-001, NFR-002, NFR-012, NFR-014, AC-004.
Scope: tool registry, capability scopes, credentials, repository-content trust markers, prompt-injection defenses, and authorization checks.
Gate: adversarial boundary fixture proving untrusted content cannot become executable policy.

### P1-14 — Evaluation and learning boundary
Requirements: FR-015, FR-016, FR-017, NFR-008, NFR-011, NFR-015, AC-009.
Scope: golden PR dataset, dev/holdout isolation, evaluator protection, calibration, regression gates, candidate/baseline comparison, promotion, rollback.
Gate: evaluator-isolation and holdout-integrity scenarios.

### P1-15 — API, frontend, and operator/HITL experience
Requirements: FR-009, FR-014, NFR-012, NFR-005.
Scope: minimal capability-driven browser/API surface, auth/RBAC, HITL queue, dispute workflow, evidence views, health/cost/latency visibility.
Gate: API authorization and HITL state-transition contract tests.

### P1-16 — Managed AWS deployment/security topology
Requirements: NFR-001, NFR-003, NFR-006, NFR-014, NFR-010.
Scope: ECS/Fargate candidate topology, managed ingress, Redis-compatible queue, Tiger/Postgres spine, secret management, networking, isolation, cost envelope.
Gate: deployment architecture review checklist plus security/cost verification evidence.

### P1-17 — ADR set and architecture source-of-truth alignment
Requirements: AC-001, AC-002, AC-003, NFR-009, NFR-015.
Scope: finalize ADRs for workflow engine, dependencies, data spine, retrieval, BudgetGuard, evidence-backed autonomy, publication, identity, and SaaS tenancy.
Gate: ADR consistency checker ensuring each architectural commitment maps to a requirement or explicit decision.

### P1-18 — End-to-end architecture verification and implementation readiness
Requirements: FR-001..FR-018, NFR-001..NFR-015, AC-001..AC-010.
Scope: trace every requirement to an architecture component, ownership rule, testable acceptance condition, and deferred decision status.
Gate: full traceability report with no orphan requirement and no hidden unresolved product decision.

### P1-19 — Independent Phase 1 review
Requirements: AC-003, AC-010.
Scope: independent review of the current Phase 1 architecture, proofs, decisions, risks, and requirement traceability.
Gate: independent human review evidence recorded through Genesis.

### P1-20 — Phase 1 green gate
Requirements: AC-010.
Scope: explicit human approval of the checked Phase 1 architecture/plan before first product implementation task is activated.
Gate: Genesis plan approval plus current source-hash verification.

## Deferred decisions tracked through Phase 1

- TDEC-001 exact GitHub App permissions.
- TDEC-002 webhook event matrix.
- TDEC-003 review identity/tenant mapping.
- TDEC-004 embedding benchmark dataset and threshold.
- TDEC-005 autonomy policy schema.
- TDEC-006 HITL role matrix.
- TDEC-007 privacy/retention.
- TDEC-008 managed cloud topology.
- TDEC-009 tool/sandbox execution policy.

## Phase 1 completion rule

Phase 1 is complete only when the architecture and implementation plan are traceable to the approved specification, all required technical decisions are resolved or intentionally deferred with bounded evidence, independent review is recorded, and the human green gate is present in canonical Genesis state. Product code remains blocked until then.
