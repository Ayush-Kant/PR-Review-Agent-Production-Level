# Product specification — PR Review Agent Production Level

> Status: draft. Product implementation is not authorized until this specification and the implementation plan pass their Genesis gates.

## Problem

Modern pull requests are difficult to review comprehensively because correctness, security, test adequacy, maintainability, and documentation quality require different kinds of repository understanding. A useful AI reviewer must reason over the PR diff together with relevant repository context, produce evidence-backed findings, avoid duplicate/noisy comments, respect trust boundaries, and expose uncertainty instead of presenting unsupported model output as fact.

The product therefore needs to operate as a production review system rather than as a collection of independent prompts. It must provide authenticated GitHub ingestion, bounded asynchronous execution, repository-aware retrieval, parallel specialist analysis, structured finding aggregation, confidence and policy gating, human escalation, GitHub publication, durable auditability, evaluation, reliability controls, and cost governance.

## Users

- **Developer:** creates or updates pull requests and consumes review findings.
- **Repository administrator:** installs/configures the GitHub integration and review policy.
- **Reviewer:** evaluates findings and can approve, reject, or dispute outcomes.
- **Human adjudicator:** resolves low-confidence, critical, or policy-sensitive findings.
- **Platform/operator:** monitors reliability, cost, latency, incidents, and system health.
- **AI review system:** performs specialized analysis within explicit authorization and tool boundaries.

## Functional requirements

- FR-001: The system shall securely receive GitHub pull-request events and verify their authenticity before starting review work.
- FR-002: The system shall make review execution idempotent so duplicate or repeated delivery of the same logical PR event does not create duplicate work or duplicate published findings.
- FR-003: The system shall obtain the PR diff and the repository state required to analyze changed code in context.
- FR-004: The system shall support repository-aware retrieval over code using both semantic/vector and keyword signals, with file freshness/index state tracked separately from retrieved chunks.
- FR-005: The system shall execute the security, quality, tests, and documentation specialists as independent review units that return a common structured finding contract.
- FR-006: The canonical finding contract shall contain agent type, severity, category, summary, file path, line range, suggestion, confidence, and rationale, with enough provenance to trace the producing review run.
- FR-007: The system shall aggregate specialist findings, normalize them, deduplicate semantically overlapping findings, and retain provenance to contributing agents.
- FR-008: The system shall apply explicit confidence and policy gates before a finding can be published externally.
- FR-009: The system shall support human-in-the-loop escalation for low-confidence, critical-impact, disputed, or policy-sensitive findings.
- FR-010: The system shall publish approved findings to GitHub with stable review-run and finding identifiers so results are auditable and repeatable.
- FR-011: The system shall record durable review, finding, human-review, event, tool, latency, confidence, and cost information sufficient for audit and operational analysis.
- FR-012: The system shall enforce budget controls before expensive model calls where the architecture permits pre-call enforcement.
- FR-013: The system shall support retries, timeouts, backoff, circuit breaking, dead-letter handling, and fault-aware review recovery without silently replaying uncertain side effects.
- FR-014: The system shall expose operator/developer observability for review traces, agent health, costs, latency, rejection/acceptance outcomes, and significant failures.
- FR-015: The system shall support an evaluation workflow with a golden PR dataset, development/holdout separation, independent evaluation, regression detection, and promotion evidence.
- FR-016: The system shall version prompts/policies and prevent unvalidated changes from silently becoming production behavior.
- FR-017: The system shall preserve enough review context and event lineage to reproduce or explain a historical finding without relying on transient chat state.
- FR-018: The system shall prevent specialist agents from invoking tools outside their explicit scope or authorization.

## Non-functional requirements

- NFR-001: **Security:** all privileged integrations shall use least-privilege credentials, explicit trust boundaries, secret masking, and authenticated request verification.
- NFR-002: **Correctness:** publication must be evidence-backed and policy-gated; unsupported model assertions must not be published as established defects.
- NFR-003: **Reliability:** transient infrastructure failures must not corrupt review state or create duplicate externally visible effects.
- NFR-004: **Idempotency:** equivalent webhook deliveries and safe workflow retries must converge on one logical review outcome.
- NFR-005: **Observability:** every production review shall have attributable event/span lineage from ingress through specialist execution, aggregation, decision, and publication.
- NFR-006: **Performance:** the architecture shall support parallel specialist work and bounded review latency while allowing slower execution when additional evidence is required for correctness.
- NFR-007: **Economics:** per-review and per-agent costs shall be measurable, bounded, and attributable to a review run.
- NFR-008: **Evaluation integrity:** benchmark/evaluator artifacts shall be isolated from candidate-system mutation and shall include holdout coverage.
- NFR-009: **Maintainability:** core workflow orchestration shall depend on an internal workflow-engine abstraction so the initial LangGraph implementation can be replaced without rewriting surrounding modules.
- NFR-010: **Data integrity:** canonical relational state, event/time-series telemetry, and retrieval/index state shall have explicit ownership and consistency rules.
- NFR-011: **Auditability:** meaningful production decisions shall be reconstructable from persisted state and redacted event evidence.
- NFR-012: **Human control:** human approval, rejection, escalation, and dispute paths shall be explicit and observable rather than encoded as informal conventions.
- NFR-013: **Degradation:** when dependencies fail or context is unavailable, the system shall degrade toward slower or reduced-scope review rather than fabricate certainty.
- NFR-014: **Privacy:** secrets and sensitive provider credentials shall not be written to raw traces, findings, or prompt/context records.
- NFR-015: **Extensibility:** new specialist agents, retrieval strategies, model providers, and integrations shall be addable without violating established boundaries.

## Constraints

- `main` is production-intent; `develop` is the active construction and verification branch.
- Genesis contracts, skills, decisions, recipes, and executable tests govern development behavior.
- Product code must not be implemented before Phase 0 specification and planning gates are complete.
- The previous `Multiagent-PR-Review-System` repository may be consulted for proven implementation details but is not the architectural source of truth.
- The target architecture is a modular monolith with inward-only dependencies and explicit module ownership.
- Redis + ARQ is the intended job-queue layer; durable relational/time-series state is intended for a Postgres-compatible/Tiger Cloud spine, subject to architecture validation.
- LangGraph is the initial orchestration implementation behind an internal workflow-engine interface.
- GitHub is the first SCM/provider boundary.

## Non-goals

- Building a general-purpose autonomous software engineer.
- Allowing arbitrary repository shell access to review agents.
- Automatically modifying production code as a prerequisite for review capability.
- Supporting every SCM provider in the initial release.
- Treating LLM confidence scores as ground truth without calibration/evaluation.
- Introducing a vector database, multi-agent framework, model router, or other infrastructure solely for architectural appearance.
- Silently promoting learned prompts, rules, or policies without baseline/holdout evaluation and explicit promotion.
- Optimizing latency at the expense of review correctness or evidence quality.

## Acceptance criteria

- AC-001: A fresh development session can determine the current Phase 0 state and next admissible action from canonical Genesis state without relying on chat history.
- AC-002: Every functional requirement has a stable identifier and is covered by a planned implementation task before implementation begins.
- AC-003: Every implementation task has an executable acceptance gate and appropriate independent review requirements according to Genesis policy.
- AC-004: Trust boundaries identify all untrusted inputs and privileged actions required for a production review.
- AC-005: The review system has one canonical structured finding contract shared by all specialist agents.
- AC-006: The publication path contains explicit normalization, deduplication, confidence, policy, and optional human-escalation gates.
- AC-007: Duplicate GitHub event delivery cannot create duplicate review effects.
- AC-008: Review execution has durable event lineage sufficient to attribute agent/tool/decision/cost/latency behavior.
- AC-009: Evaluation design separates development and holdout evidence and protects the evaluator from candidate mutation.
- AC-010: Phase 0 ends with an explicit human-reviewed green gate before Phase 1 architecture work is authorized.

## Risks

- **R-001 — Prompt injection from repository content:** malicious source/comments may attempt to influence agents. Mitigation: treat repository context as data, enforce prompt-injection boundaries, scoped tools, and policy-controlled actions.
- **R-002 — False positives and reviewer fatigue:** noisy findings reduce trust. Mitigation: evidence requirements, confidence calibration, deduplication, acceptance metrics, and suppression/HITL policies.
- **R-003 — False negatives:** important defects may be missed. Mitigation: specialist diversity, repository-aware retrieval, golden PR evaluation, holdout regression testing, and continuous error analysis.
- **R-004 — Duplicate side effects:** retries or duplicate webhooks can publish repeated findings. Mitigation: ingress idempotency keys, durable review identity, aggregator deduplication, and publication idempotency.
- **R-005 — Tool overreach:** an agent may access or modify resources outside its task. Mitigation: scoped tool registry, least-privilege credentials, authorization checks, and audit trails.
- **R-006 — Cost explosion:** large repositories or repeated agent calls can exceed budget. Mitigation: BudgetGuard, context bounds, per-agent cost attribution, quotas, and pre-call hard blocks.
- **R-007 — Stale retrieval:** review may use obsolete repository context. Mitigation: repository file freshness/index tracking and invalidation/update strategy.
- **R-008 — Infrastructure failure:** queues, models, databases, or GitHub APIs may be unavailable. Mitigation: bounded retries, circuit breakers, dead-letter paths, resumable state, and graceful degradation.
- **R-009 — Evaluation contamination:** candidate behavior could influence its own benchmark. Mitigation: protected external evaluator and isolated development/holdout execution.
- **R-010 — Policy drift:** prompts or routing may change review behavior unexpectedly. Mitigation: versioning, evaluation gates, canary release, auditability, rollback.

## Open questions

1. Which exact GitHub review events and installation permissions constitute the minimum production ingress contract?
2. Which PR/diff size thresholds trigger bounded review, staged review, or explicit unsupported handling?
3. What severity taxonomy and publication policy should be standardized across specialist agents?
4. What evidence threshold is sufficient to publish a finding automatically versus route it to HITL?
5. Which model/provider routing strategy should Phase 1 evaluate, and what provider failure/degradation behavior is required?
6. What exact Tiger/Postgres schema and retention policy is appropriate for durable review truth versus time-series telemetry?
7. Which repository languages and parser capabilities are required for the first evaluated production release?
8. Which GitHub publication surfaces are in scope initially: review comments, review summary, check run, issue, or a combination?
9. What privacy/retention requirements apply to repository content, prompts, model outputs, traces, and findings?
10. Which baseline PR dataset will be used for the first regression and quality evaluation gate?
