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
