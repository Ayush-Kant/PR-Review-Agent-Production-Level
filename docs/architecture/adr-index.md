# Phase 1 — Architecture ADR Index

Status: DRAFT. These ADRs are derived from the project planning source and remain subject to Phase 1 verification before implementation.

## ADR-001 — LangGraph behind a workflow-engine interface

**Decision:** Use LangGraph as the first workflow implementation, behind `core.workflow_engine`.

**Why:** The initial workload requires four-way parallel fan-out, typed state, checkpoint/resume, and LLM-oriented orchestration. The planning source identifies LangGraph as the lower-operational-cost choice for the first system.

**Constraint:** No surrounding module may depend directly on LangGraph-specific APIs. A future Temporal implementation must be able to replace the engine behind the interface.

**Revisit when:** sustained concurrent workflow demand, cross-service coordination, or checkpoint durability requirements demonstrate that a different engine is justified.

## ADR-002 — Modular monolith with inward-only dependencies

**Decision:** Start with a modular monolith rather than premature microservices.

**Why:** The product has many logical boundaries but no initial evidence that independent deployment is required. A modular monolith makes ownership and transaction boundaries explicit while keeping deployment and debugging simpler.

**Rule:** Core/inward modules must not depend on outer/adaptor modules. Cross-cutting telemetry is injected through controlled interfaces rather than becoming a catch-all dependency.

**Revisit when:** measured queue throughput, worker isolation, deployment cadence, or service ownership requirements justify extraction.

## ADR-003 — Tiger/Postgres-compatible single durable spine

**Decision:** Use Tiger Cloud / compatible Postgres as the durable memory/truth/time spine; keep Redis for queue/checkpoint workloads.

**Why:** The same PR/review identity should connect retrieved code context, review truth, HITL decisions, events, costs, and audit history without stitching separate durable stores in application code.

**Lanes:** `code_chunks`, relational review/HITL tables, `agent_events` hypertable, continuous aggregates.

**Trade-off:** Managed Tiger becomes a significant platform dependency, but it reduces the number of durable systems and keeps joins/audit reconstruction inside one database model.

**Revisit when:** measured workload exposes a database capability or operating constraint that the chosen spine cannot satisfy.

## ADR-004 — BudgetGuard as a fail-closed pre-LLM policy boundary

**Decision:** Evaluate running budget state before expensive model work wherever the execution path permits it; block when the configured budget is exceeded.

**Why:** Cost is part of system correctness and safety, not only a reporting concern. Unbounded LLM calls can turn retries, large PRs, or feedback loops into uncontrolled spend.

**Required evidence:** review-level cost, agent-level cost, model/token usage, latency, and budget decision events.

## ADR-005 — Evidence-backed confidence-weighted autonomy

**Decision:** Specialists produce evidence-backed structured findings; the aggregator owns deduplication and deterministic publication/HITL policy.

**Why:** Specialists have different mindsets and must remain independently useful, but no specialist should independently decide what is externally published. High-confidence, non-critical findings can earn automatic publication; low-confidence, critical, disputed, or policy-sensitive cases escalate.

**Constraint:** Confidence is a routing signal and must be calibrated/evaluated. It is not ground truth.

## ADR-006 — Hybrid retrieval in the durable memory lane

**Decision:** Use vector + full-text retrieval over repository code, fused by reciprocal rank, with explicit freshness/index state.

**Why:** Semantic search retrieves conceptually related code; keyword search preserves exact identifiers, error strings, configuration names, and symbols. Freshness prevents stale context from masquerading as evidence.

**Constraint:** Retrieval output is data/evidence, never an instruction source.

## ADR-007 — Durable event spine for proof, audit, cost and learning

**Decision:** Every meaningful agent action emits a time-ordered durable event with lineage and outcome metadata.

**Why:** Trace reconstruction, auditability, cost attribution, incident analysis, and drift detection all need the same causal history.

**Required lineage:** review ID, span ID, parent span, agent, event type, model, tokens, cost, latency, confidence, outcome, payload/provenance where safe.

## ADR-008 — Greenfield reuse policy for the previous repository

**Decision:** Existing `Multiagent-PR-Review-System` code is a reference implementation, not an inherited architecture.

**Rule:** Reuse only after mapping the capability to an approved requirement, checking architecture/trust-boundary compatibility, reviewing impact, and independently verifying behavior.

## ADR-009 — GitHub App least-privilege ingress and publication boundary

**Decision:** Treat GitHub as an authenticated external system behind a dedicated App boundary. Validate webhook signatures before payload interpretation, authorize against the installation before repository access, and request only the minimum permissions required for the current publication contract.

**Initial permission posture:** repository metadata read, contents read, pull requests write, and checks write only if the final dual-publication design proves it necessary. No source write, workflow, secrets, administration, deployment, or unrelated security-alert mutation permissions in the first release.

**Why:** GitHub App permissions control API capabilities and webhook availability; minimum permissions reduce blast radius. Pull-request review creation requires Pull requests write.

**Verification:** ingress contract tests must cover signature failure, duplicate delivery, revoked installation, inaccessible repository, and malformed event cases.

## ADR-010 — Review identity is repository-state-bound and idempotent

**Decision:** Separate delivery identity from logical review identity. A delivery ID suppresses transport duplicates; `(installation, repository, pull request, head SHA)` determines the logical review pass.

**Why:** A PR number alone is insufficient because the same PR evolves across head SHAs and webhook retries can be duplicated. Publication uncertainty also needs stable identities to prevent double posting.

**Required behavior:** same delivery → no duplicate effects; same logical review key → no duplicate fresh pass; new head SHA → supersede stale pending work and review the new state; uncertain publication → retry idempotently by stable IDs.

## ADR-011 — Explicit privacy and retention classes

**Decision:** Use six retention classes: secrets, ephemeral execution context, evidence, findings/HITL/audit, telemetry, and evaluation.

**Constraints:** secrets never enter application database tables; evidence stores only the minimum necessary source/provenance information; model inputs/outputs are minimized and redacted where feasible; evaluation datasets remain separately governed.

**Why:** Retention is a product/data-governance boundary and should not be hidden in arbitrary service defaults.

**Revisit when:** legal, customer, or measured operational requirements define concrete retention periods and deletion/export obligations.

## ADR-012 — No arbitrary repository execution in initial release

**Decision:** The first release performs repository understanding through GitHub APIs, static parsing, retrieval, and model reasoning. It does not run arbitrary repository shell commands, tests, builds, package installers, or generated code.

**Why:** This materially reduces prompt-injection and supply-chain execution risk while establishing the evidence-backed review contract.

**Future path:** if evaluation demonstrates that execution materially improves review quality, introduce it as a separate isolated capability with explicit authorization, network/resource policy, ephemeral storage, credential denial by default, and independent telemetry.

## ADR-013 — Simple customer roles, capability-based internal authorization

**Decision:** Expose two customer-facing roles initially: Reviewer and Repository Administrator. Implement authorization internally as typed capabilities so more granular enterprise roles can be added without changing the domain model.

**Core capabilities:** `review.read`, `review.decide`, `review.dispute`, `policy.read`, `policy.write`, `integration.read`, `integration.write`, `audit.read`.

**Why:** This keeps first-release UX understandable while preserving a future-ready authorization boundary.

## ADR-014 — Managed AWS containers with secret separation

**Decision:** Keep ECS/Fargate as the leading cloud deployment candidate behind an ordinary application/container boundary. Use private networking for internal services, a load balancer for ingress, managed durable storage, managed queue infrastructure, and Secrets Manager for sensitive configuration.

**Security rule:** ECS task execution permissions and application task permissions remain distinct. Application code should receive only the cloud permissions required for its specific operations.

**Revisit when:** load/latency/cost evidence demonstrates a different topology or managed service is materially better.

## ADR-015 — Conditional dual-surface GitHub publication

**Decision:** Design publication for inline review plus a summary/check surface, but allow a deliberate fallback to inline review plus summary when reliable dual publication would require unjustified coupling or permission expansion.

**Constraints:** publication is downstream of normalization, aggregation, deduplication, evidence validation, policy routing, and HITL where required. Every published finding has a stable identity and source commit/head reference.

**Why:** User-visible output is valuable, but publication correctness outranks surface count.

## ADR-016 — Evaluation earns autonomy

**Decision:** Start with conservative autonomy and evolve toward richer calibrated evidence/confidence matrices only when development/holdout evaluation and independent review demonstrate adequate precision, recall, calibration, and operational safety.

**Constraint:** repository-local policy may tighten the global policy but cannot weaken the project's safety invariants.

**Why:** This makes autonomy an evidence-backed product capability rather than a model-confidence feature switch.
