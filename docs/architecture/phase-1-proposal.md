# Phase 1 — System Architecture Proposal

Status: DRAFT. This document is an architecture proposal derived from the approved/working Phase 0 requirements and the supplied production PR-review architecture study. It does not authorize application implementation until Genesis records the required Phase 0/Phase 1 approvals and gates.

## 1. Architecture goals

The system must:
- ingest GitHub pull-request events securely and idempotently;
- decouple ingress from expensive review work;
- reason over the PR diff plus bounded repository context;
- run four specialist domains in parallel;
- normalize, deduplicate, confidence-gate, and policy-gate findings before publication;
- escalate uncertain/high-consequence cases to humans;
- persist review truth, retrieval memory, event lineage, cost, latency, and feedback in durable form;
- enforce least privilege and explicit tool scopes;
- degrade safely under dependency failure;
- keep workflow implementation replaceable behind a narrow interface.

## 2. System style

Initial style: modular monolith with explicit inward-only module dependencies.

The first deployment should prefer one application codebase with clearly separated internal modules over premature microservices. Horizontal extraction may occur later when measured queue throughput, workflow concurrency, or operational requirements justify it.

## 3. End-to-end logical flow

```text
GitHub
  │
  ▼
webhook_receiver
  │  HMAC + event validation + delivery idempotency
  ▼
api / queue boundary
  │
  ▼
Redis + ARQ
  │
  ▼
core.workflow_engine
  │
  ▼
orchestrator (LangGraph implementation)
  │
  ├──────────────┬──────────────┬──────────────┐
  ▼              ▼              ▼              ▼
security       quality         tests          docs
  │              │              │              │
  └──────────────┴──────────────┴──────────────┘
                         │
                         ▼
                     aggregator
                         │
              normalize + dedupe + confidence
                         │
                    policy / BudgetGuard
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
             HITL                publish
              │                     │
              └──────────┬──────────┘
                         ▼
                      GitHub
```

The durable data spine sits beside and beneath the workflow rather than being owned by individual agents.

## 4. Core boundaries

### 4.1 Ingress boundary

Only the webhook receiver handles raw GitHub webhook requests. It owns:
- signature verification;
- payload parsing;
- delivery-id idempotency;
- event classification;
- enqueueing.

It must not perform the full review inline.

### 4.2 Queue boundary

Redis + ARQ owns asynchronous execution and short-lived queue/checkpoint state. Queue semantics do not become the durable source of review truth.

### 4.3 Workflow boundary

`core.workflow_engine` is the only abstraction used by surrounding modules to start/resume/query workflows.

Initial implementation: LangGraph.

Future alternative: Temporal or another engine, if measured requirements justify it.

### 4.4 Agent boundary

Agents receive typed review context and return typed findings. Agents do not publish directly to GitHub, mutate durable policy, or bypass the aggregator.

### 4.5 Retrieval boundary

`memory` owns embeddings, chunk retrieval, keyword retrieval, fusion, freshness, and context assembly. Retrieval returns data/evidence plus provenance.

### 4.6 Decision boundary

The aggregator owns finding normalization, deduplication, overall confidence calculation, policy evaluation, and routing to publication or HITL.

### 4.7 Publication boundary

GitHub publication is a privileged integration operation and must occur only after the decision path approves the finding/review.

### 4.8 Tool boundary

Every tool invocation passes through capability scope and authorization checks. Tool implementations do not implicitly inherit the privileges of the application process.

## 5. Data architecture

### 5.1 Durable spine

Target: Tiger Cloud / Postgres-compatible database with appropriate vector and time-series extensions.

Three lanes live in one durable system:

1. Memory lane
   - `code_chunks`
   - vector embeddings
   - DiskANN/pgvectorscale index
   - `content_tsv` + GIN full-text index
   - freshness/index metadata

2. Truth lane
   - `pr_review_records`
   - `finding_records`
   - `hitl_reviews`
   - `hitl_feedback`

3. Event lane
   - `agent_events`
   - time partitioning/hypertable
   - span hierarchy
   - model/token/cost/latency/confidence/outcome metadata

Derived rollups:
- `agent_health_1m`
- `pr_cost_hourly`

### 5.2 Data ownership

`database` owns persistence primitives and repositories.

`models` owns domain schemas, not database connections.

`memory` uses the database through explicit memory/repository interfaces; agents must not issue arbitrary SQL.

`observability` writes through a controlled event path rather than letting arbitrary modules mutate the audit spine.

## 6. Retrieval architecture

Each specialist receives a bounded context package built from:
- PR diff and changed-file metadata;
- vector similarity retrieval;
- keyword/full-text retrieval;
- repository structure/symbol relationships where available;
- freshness state;
- procedural policy/convention records.

Vector and FTS retrieval execute independently, then merge using reciprocal-rank fusion. Retrieval must preserve path/symbol/source metadata so a finding can explain what repository evidence it used.

Stale or missing context must be visible to the decision layer. It must never be silently represented as fresh evidence.

## 7. Orchestration architecture

The workflow graph is conceptually:

```text
START
  ↓
load_review
  ↓
prepare_diff
  ↓
build_context
  ↓
parallel specialists
  ├─ security
  ├─ quality
  ├─ tests
  └─ docs
  ↓
aggregate
  ↓
dedupe + confidence/policy
  ├─ needs HITL → human queue → decision
  └─ publishable → GitHub publication
  ↓
finalize / audit
```

Each specialist node is independently timeout-bounded. Partial failure must be represented explicitly; the aggregator must know whether it received all specialist outputs and at what evidence quality.

## 8. Finding and decision architecture

The canonical finding is structured data, not model prose.

Minimum fields:
- agent type
- severity
- category
- summary
- file path
- line start/end
- suggestion
- confidence
- rationale
- provenance/review identity

Aggregator responsibilities:
1. validate the contract;
2. normalize categories/severity representations;
3. deduplicate overlapping findings;
4. preserve contributing-agent agreement/provenance;
5. compute overall review confidence;
6. enforce deterministic policy gates;
7. route to publication or HITL.

Deterministic routing must not be replaced with free-form model judgment where the same input should yield the same policy decision.

## 9. HITL architecture

Initial autonomy level: human handles exceptions.

Default routing:
- high-confidence, non-critical, policy-eligible → publication path;
- below confidence threshold → HITL queue;
- any CRITICAL finding → escalation path regardless of confidence;
- developer dispute → dispute/feedback path.

Human decisions become durable relational truth and feed evaluation/learning workflows only after evidence thresholds and governance checks.

## 10. Observability architecture

Every meaningful operation should produce an attributable event chain:

```text
review
 └─ agent span
     ├─ retrieval/tool calls
     ├─ LLM call
     └─ decision/span end
```

The event record should support reconstruction of:
- what ran;
- under which prompt/model version;
- which tools/context were used;
- token and cost consumption;
- latency;
- confidence/outcome;
- escalation/publication decisions.

The same durable event spine powers traces, audit views, cost reporting, and drift signals.

## 11. Economics boundary

BudgetGuard is invoked before costly LLM work where feasible.

Required outputs:
- review-level cost;
- agent-level cost;
- model-level cost;
- token counts;
- latency;
- daily/running budget state.

Budget breach behavior: fail closed rather than silently continue.

## 12. Security architecture

Threat assumptions:
- webhook payloads can be forged;
- repository content can contain prompt injection;
- PR descriptions/comments can contain adversarial instructions;
- tools can fail or return malicious/unexpected data;
- model outputs can be incorrect or manipulative;
- credentials are high-value secrets.

Required controls:
- HMAC verification;
- GitHub App least privilege;
- RBAC;
- secret masking/redaction;
- prompt/context trust-boundary markers;
- capability-scoped tool registry;
- credential scoping;
- sandboxed execution for code/tool paths that require it;
- immutable/auditable decision lineage.

## 13. Reliability architecture

Reliability controls are explicit per external boundary:
- bounded retries with backoff;
- timeouts;
- circuit breakers;
- idempotency keys;
- deduplication;
- dead-letter path;
- checkpoint/resume;
- no silent replay after uncertain side effects;
- degraded/reduced-scope review behavior.

## 14. Evaluation architecture

Evaluation is a separate trust boundary from the production reviewer.

Inputs:
- golden PR dataset;
- development split;
- holdout split;
- evaluator/judge policy;
- candidate version;
- baseline version.

Outputs:
- finding precision/recall or equivalent quality measures;
- confidence calibration;
- false-positive rate;
- duplicate rate;
- regression decision;
- promotion evidence.

A candidate cannot modify the evaluator or benchmark artifacts used to judge it.

## 15. Target module graph

The planned modules are:

```text
core
├── models
├── reliability
├── security
├── database
├── integrations
├── memory
├── data
├── economics
├── observability
├── orchestrator
├── agents
├── hitl
├── evaluation
├── tools
├── webhook_receiver
├── job_queue
├── auth
└── api
```

This is a conceptual dependency order, not permission for unrestricted imports. A later architecture task will formalize the exact allowed edges and import checks.

Frontend remains outside the backend inward-dependency graph and communicates through stable APIs/query contracts.

## 16. Technology commitments vs open choices

Committed/strongly intended by the planning source:
- Python backend
- FastAPI
- Redis + ARQ
- LangGraph initially
- Tiger/Postgres-compatible durable spine
- pgvector/pgvectorscale/DiskANN direction
- hybrid vector + FTS retrieval
- four specialists
- Next.js frontend direction
- GitHub App integration

Still requiring explicit architecture/evaluation decisions:
- exact GitHub permission scopes;
- exact webhook event matrix;
- exact database schema and extension availability;
- exact embedding/provider/model choices and fallbacks;
- exact supported languages/parsers;
- exact Docker sandbox design;
- exact telemetry stack details around the product event spine;
- exact HITL authentication/roles/UX;
- exact privacy/retention configuration.

## 17. Phase 1 work packages

P1-01 Architecture principles and dependency rule
P1-02 Module graph and ownership matrix
P1-03 External integration boundaries
P1-04 Review identity and lifecycle model
P1-05 Workflow-engine interface and LangGraph boundary
P1-06 Data-lane architecture and persistence ownership
P1-07 Retrieval architecture and freshness contract
P1-08 Security/trust-boundary architecture
P1-09 Reliability/failure-state architecture
P1-10 Observability/event contract
P1-11 Economics/BudgetGuard boundary
P1-12 Evaluation boundary
P1-13 Frontend/API boundary
P1-14 Architecture ADR set
P1-15 Architecture verification plan
P1-16 Phase 1 independent review
P1-17 Phase 1 green gate

## 18. Phase 1 completion condition

Phase 1 is green only when the module graph, dependency rule, major interfaces, data ownership, external boundaries, ADRs, and verification plan are explicit enough that implementation can begin without resolving architectural decisions inside arbitrary source files.
