# Production PR Review Planning Reference

This document persists the architectural knowledge extracted from the supplied planning study used for this project. It is a durable project reference; canonical project state remains `.genesis/project.json` and approved decisions/requirements remain authoritative over this summary.

## Source

Primary planning source: `Pasted markdown(20260913-191948).md`, an architecture study titled **Designing an AI Pull-Request Review Agent**.

## Core product thesis

The system is not a linter with an LLM attached. It is a selective, evidence-driven fan-out of specialist reasoners operating over a PR diff plus retrieved repository context. The product exists to reclaim scarce senior-reviewer attention by automating mechanical/high-value review work while routing uncertainty and high-consequence cases to humans.

## Design method

Use the five-move design loop for major architectural decisions:
1. Map the real workflow.
2. Name the precise trigger and output.
3. Assign deterministic/tool/LLM/human components appropriately.
4. Choose autonomy based on consequence, reversibility, and maturity.
5. Design failure behavior before implementation.

Never assign an LLM to a deterministic step that must be identical for the same input. Failure behavior must degrade toward slower-but-correct rather than fast-but-wrong.

## Failure catalog

Design explicitly against:
- critical-path hallucination
- model drift
- tool/API timeout
- feedback-loop poisoning
- orchestration deadlock
- human escalation bottlenecks
- almost-right outputs that appear trustworthy

The corresponding defenses include evidence/citations, human review for high-stakes cases, monitoring, safe feedback thresholds, retries/backoff, circuit breakers, node timeouts, health checks, idempotency, dead letters, escalation-rate monitoring, confidence routing, deduplication, and known-bad evaluation cases.

## Human autonomy model

The system uses a five-level HITL spectrum: full automation, human verifies output, human handles exceptions, human decides/system prepares, and full human with AI assistance. Autonomy must be earned. Consequence of error, reversibility, and system maturity determine the appropriate level.

Initial intended posture: human handles exceptions, with escalation to human decision for critical cases. High-confidence non-critical reviews may publish automatically only after the evaluation system demonstrates that the policy is trustworthy.

## Review reasoning model

A senior reviewer's reasoning is decomposed into four distinct concerns:
- security: injection, secrets, auth bypass, unsafe deserialization
- quality: correctness, logic bugs, code smells, unnecessary complexity
- tests: missing cases, edge conditions, brittle assertions, coverage gaps
- docs: missing/outdated documentation, public API explanation, unexplained decisions

The system therefore uses four parallel specialists rather than one universal reviewer.

## Finding contract

The canonical review unit is a structured `Finding` carrying:
- `agent_type`
- `severity`
- `category`
- `summary`
- `file_path`
- `line_start`
- `line_end`
- `suggestion`
- `confidence`
- `rationale`

The contract must also retain sufficient provenance to link the finding back to the producing review run and evidence lineage. Specialists produce findings; they do not publish them directly.

## Grounding and memory

Every specialist reviews `diff + retrieved repository context`, not the diff alone. Context should be relevant and bounded rather than dumping the repository into prompts.

Three durable data shapes:
- semantic memory: code/functions/classes/modules/ADRs/conventions; vector/ANN retrieval
- episodic truth: reviews/findings/HITL history; relational rows
- procedural memory: conventions, ADRs, severity policy; small structured records

## Durable data spine

The study selects one Postgres-compatible Tiger Cloud data spine rather than separate durable vector, relational, and time-series systems.

Lane 1: memory
- `code_chunks`
- vector embeddings
- pgvectorscale/DiskANN index
- full-text `TSVECTOR` + GIN index

Lane 2: relational truth
- `pr_review_records`
- `finding_records`
- `hitl_reviews`
- `hitl_feedback`

Lane 3: time/event spine
- `agent_events`
- hypertable partitioned by time
- `span_id`/`parent_span`
- model, token counts, cost, latency, confidence, outcome, payload

Derived rollups include:
- `agent_health_1m`
- `pr_cost_hourly`

These power dashboard metrics, BudgetGuard, cost attribution, latency analysis, and drift signals.

Redis remains intentionally separate for high-churn asynchronous queue/checkpoint workloads. One durable database does not mean forcing queues into SQL.

## Ingress and queue

Primary production entry point: GitHub App webhook.

Ingress contract:
1. verify HMAC-SHA256
2. use `X-GitHub-Delivery` as an idempotency key
3. enqueue bounded work to Redis + ARQ
4. acknowledge quickly

Heavy review work must not run inline in the webhook request.

## Orchestration

The workflow is a graph, not a linear pipeline.

LangGraph is the initial implementation because its parallel fan-out and checkpointing fit the first workload. It must remain behind:

`backend/core/workflow_engine.py`

with the initial implementation in:

`backend/orchestrator/langgraph_engine.py`

The interface is intentionally narrow (`run`, `resume`, `get_state`) so Temporal can replace LangGraph later if measured scale or coordination needs justify the cost.

Target LangGraph workflow:
- build context
- parallel security/quality/tests/docs specialists
- aggregate
- deduplicate
- confidence/policy decision
- HITL or publication

Checkpointing is intended at node boundaries, and every node requires explicit timeout/recovery behavior.

## Retrieval

Retrieval is hybrid:
- semantic vector search using the embedding lane
- keyword/full-text search using the GIN index
- reciprocal-rank fusion of result sets
- bounded top-k context
- freshness via `repo_file_index`
- incremental re-indexing when repository files change

The retrieval layer should expose evidence and provenance, never executable instructions.

## Events and proof

Every meaningful action is recorded as an event: spans, LLM calls, tool calls, decisions, escalations, cost, latency, confidence, and outcome. The same event spine supports trace reconstruction, auditability, economics, and learning/drift analysis.

If the system cannot reconstruct why a finding was produced and what it cost, the review is not sufficiently trustworthy.

## Budget control

BudgetGuard is a pre-LLM policy boundary wherever feasible. It reads running cost/usage summaries and hard-blocks uncontrolled model calls when a budget limit is exceeded.

Cost is attributable to a review and agent, with model/token/latency evidence persisted.

## Tooling and security

Repository content, PR text, retrieved context, tool output, and model output are untrusted. No such data becomes implicit control instructions.

Tools are accessed through explicit capability scopes and authorization. Required security architecture includes prompt-injection defense, least-privilege credentials, masking, RBAC/Zero Trust boundaries, auditability, and Docker sandboxing where tool execution requires isolation.

## Evaluation

Evaluation is independent from production execution. The intended system includes:
- golden PR dataset
- development/holdout separation
- independent judging
- regression gates
- promotion evidence
- candidate/evaluator isolation

The candidate system must not mutate or control its evaluator.

## Reliability

Required reliability mechanics are justified by known failure modes:
- retries with bounded backoff
- circuit breakers
- per-node/tool/model timeouts
- ingress idempotency
- aggregator deduplication
- dead-letter handling
- checkpoint/resume behavior
- fault-injection tests
- degraded/reduced-scope review when dependencies fail

Never silently replay an uncertain externally visible side effect.

## Production lifecycle

The planning source defines these phases:
0. Cognitive Design
1. System Architecture
2. Frontend
3. Backend/API
4. Workflow Orchestration
5. LLM/Reasoning
6. Memory Architecture
7. Tooling/Sandboxing
8. Multi-Agent Systems
9. Evaluation
10. Observability
11. Security
12. Reliability
13. Infrastructure
14. Data Engineering
15. Governance
16. Economics
17. Developer Experience
18. CI/CD for AI
19. Human-in-the-Loop
20. Continuous Learning

Every phase ends in a written green gate before the next phase starts.

## Module target

The target is a modular monolith with inward-only dependencies. The reference module surface is:
- `agents/`
- `api/`
- `auth/`
- `core/`
- `data/`
- `database/`
- `economics/`
- `evaluation/`
- `hitl/`
- `integrations/`
- `job_queue/`
- `memory/`
- `models/`
- `observability/`
- `orchestrator/`
- `prompts/`
- `reliability/`
- `security/`
- `tools/`
- `webhook_receiver/`
- migrations
- frontend

The dependency rule is that `core` remains inward/neutral, outer modules depend inward, and cross-cutting observability is injected rather than becoming a backdoor dependency hub.

## Module responsibilities

- `agents/`: four specialist agents, shared base, contracts
- `api/`: review/economics/HITL/queue REST routes
- `auth/`: FastAPI RBAC dependencies
- `core/`: workflow-engine abstraction and shared exceptions
- `data/`: ingestion and freshness/index maintenance
- `database/`: async database engine, Tiger pool, ORM models, repositories
- `economics/`: costs, BudgetGuard, routing advice
- `evaluation/`: golden data, judge, regression gate
- `hitl/`: queue, escalation, feedback, disputes
- `integrations/`: GitHub client and payload models
- `job_queue/`: ARQ worker
- `memory/`: Tiger memory client, embeddings, hybrid retrieval, Redis client
- `models/`: typed domain models/enums/webhooks/findings/reviews
- `observability/`: events, tracing, audit, alerts, workflow context
- `orchestrator/`: graph, nodes, state, LangGraph implementation
- `prompts/`: registry and versioned prompt templates
- `reliability/`: retry, circuit breaker, idempotency, timeout
- `security/`: threat model, injection guard, RBAC, masking
- `tools/`: tool registry, model router, LLM client, sandbox, capability scope
- `webhook_receiver/`: HMAC validation, parsing, routing to queue
- migrations: idempotent Tiger/Tiger-compatible schema DDL
- frontend: dashboard, HITL queue, trace viewer, economics views

## Tiger integration sequence

A. Infrastructure: provision Tiger, run initial schema, verify required extensions and rollups.

B. Events: wire event emission through orchestrator and LLM/tool paths; verify every intended event lands in `agent_events`.

C. Memory: retire the old Qdrant direction; validate hybrid DiskANN + FTS retrieval over `code_chunks`.

D. Dashboard: expose continuous-aggregate metrics such as per-agent cost and p95 latency.

## Reuse policy for the old repository

`Multiagent-PR-Review-System` is a reference implementation only. Reuse is allowed only when a capability is explicitly justified by a current requirement, its impact is understood, its trust boundary is compatible, and the copied/reimplemented behavior is independently verified. The old repository's topology, dependencies, and state model are not inherited automatically.

## Architectural reasoning rules

For every significant addition, answer:
1. What problem/scarcity does this component solve?
2. What mature workflow or precedent justifies its decomposition?
3. What is the precise trigger/output/data contract?
4. What failure mode requires it?
5. What data shape does it serve?
6. Can an existing component handle it?
7. Can the decision be hidden behind a narrow interface?
8. How will we prove that it works and remains safe?

If a component cannot be traced to a defensible question, requirement, or failure mode, it is a candidate for deletion or deferral.
