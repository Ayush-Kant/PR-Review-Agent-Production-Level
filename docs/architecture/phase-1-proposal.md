# Phase 1 — System Architecture Proposal

Status: DRAFT. This document is an architecture proposal derived from Phase 0 requirements, owner decisions, and the supplied production PR-review architecture study. It does not authorize application implementation until Genesis records the required Phase 0/Phase 1 approvals and gates.

## 1. Architecture goals

The system must:
- ingest GitHub pull-request events securely and idempotently;
- operate as a hosted SaaS so customers do not install or operate our runtime/infrastructure;
- map GitHub App installations and repository scope to an explicit application tenant/security context;
- decouple ingress from expensive review work;
- reason over the PR diff plus bounded repository context;
- run four specialist domains in parallel;
- normalize, deduplicate, confidence-gate, and policy-gate findings before publication;
- escalate uncertain/high-consequence cases to humans;
- persist review truth, retrieval memory, event lineage, cost, latency, and feedback in durable form;
- enforce least privilege and explicit tool scopes;
- degrade safely under dependency failure;
- keep workflow implementation replaceable behind a narrow interface;
- keep provider/model and embedding choices replaceable until evaluation freezes them.

## 2. System style

Initial style: **modular monolith with inward-only module dependencies**, deployed as containerized services on managed cloud compute.

The first production deployment should prefer one application codebase with clearly separated internal modules over premature microservices. Horizontal extraction may occur later when measured queue throughput, workflow concurrency, sandbox isolation, or operational ownership justifies it.

The end user interacts through a browser and GitHub. Customer-side installation is limited to GitHub App authorization/installation; customers do not need Redis, databases, language runtimes, worker processes, CLI agents, or model credentials.

## 3. End-to-end logical flow

```text
User Browser
  │
  │ login / repository management / HITL
  ▼
Application API
  │
  ├──────────────► Auth + pluggable RBAC
  │
  └──────────────► GitHub App installation metadata
                         │
GitHub ◄─────────────────┘
  │
  │ PR webhook
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
             GitHub publication adapters
                         │
               inline + summary/check
                         │
                         ▼
                      GitHub
```

The durable data spine sits beside and beneath the workflow rather than being owned by individual agents.

## 4. Cloud SaaS and identity boundaries

### 4.1 GitHub App installation identity

A GitHub App installation is treated as an explicit external authorization boundary. It is not equivalent to an application user session.

The system should preserve identifiers sufficient to reconstruct:
- GitHub App installation;
- owner/account/organization context;
- repository identity;
- selected repository scope;
- application tenant mapping;
- acting user identity when available and relevant to the action.

Repository access must be checked against the installation and application policy on every privileged operation. Dashboard visibility must never imply repository authorization.

### 4.2 Application user identity

Authentication answers **who the user is**. The application authorization layer answers **what the user may do**.

Initial identity may be GitHub-backed. Authorization must sit behind an internal boundary so a future enterprise identity provider can be introduced without redesigning HITL or tenant isolation.

### 4.3 Tenant/repository isolation

The minimum security unit for review execution is the logical repository/review context derived from an authorized GitHub App installation.

All durable records that influence authorization-sensitive reads/writes must be attributable to this context. Cross-tenant or cross-installation context retrieval is forbidden.

## 5. Core boundaries

### 5.1 Ingress boundary

Only the webhook receiver handles raw GitHub webhook requests. It owns:
- signature verification;
- payload parsing;
- delivery-id idempotency;
- event classification;
- repository/installation resolution;
- enqueueing.

It must not perform the full review inline.

### 5.2 Queue boundary

Redis + ARQ owns asynchronous execution and short-lived queue/checkpoint state. Queue semantics do not become the durable source of review truth.

### 5.3 Workflow boundary

`core.workflow_engine` is the only abstraction used by surrounding modules to start/resume/query workflows.

Initial implementation: LangGraph.

Future alternative: Temporal or another engine, if measured requirements justify it.

### 5.4 Agent boundary

Agents receive typed review context and return typed findings. Agents do not publish directly to GitHub, mutate durable policy, or bypass the aggregator.

### 5.5 Retrieval boundary

`memory` owns embeddings, chunk retrieval, keyword retrieval, fusion, freshness, and context assembly. Retrieval returns data/evidence plus provenance.

The concrete embedding model and vector dimension remain open until the retrieval benchmark is complete.

### 5.6 Decision boundary

The aggregator owns finding normalization, deduplication, overall confidence calculation, policy evaluation, and routing to publication or HITL.

### 5.7 Publication boundary

GitHub publication is a privileged integration operation and must occur only after the decision path approves the finding/review.

The initial publication design exposes adapters capable of producing:
- inline review comments;
- a review summary/check surface when the dual-publication reliability gate passes.

### 5.8 Tool boundary

Every tool invocation passes through capability scope and authorization checks. Tool implementations do not implicitly inherit the privileges of the application process.

## 6. Data architecture

### 6.1 Durable spine

Target: Tiger Cloud / Postgres-compatible database with appropriate vector and time-series extensions, subject to Phase 1 verification.

Three lanes live in one durable system:

1. Memory lane
   - `code_chunks`
   - vector embeddings
   - DiskANN/pgvectorscale index direction
   - `content_tsv` + GIN full-text index direction
   - freshness/index metadata

2. Truth lane
   - `pr_review_records`
   - `finding_records`
   - `hitl_reviews`
   - `hitl_feedback`
   - repository/install/tenant authorization records as required by the final security model

3. Event lane
   - `agent_events`
   - time partitioning/hypertable direction
   - span hierarchy
   - model/token/cost/latency/confidence/outcome metadata

Derived rollups:
- `agent_health_1m`
- `pr_cost_hourly`

### 6.2 Data ownership

`database` owns persistence primitives and repositories.

`models` owns domain schemas, not database connections.

`memory` uses the database through explicit memory/repository interfaces; agents must not issue arbitrary SQL.

`observability` writes through a controlled event path rather than letting arbitrary modules mutate the audit spine.

Authorization-sensitive records must be queryable only through repository/tenant-aware access paths.

## 7. Retrieval architecture

Each specialist receives a bounded context package built from:
- PR diff and changed-file metadata;
- vector similarity retrieval;
- keyword/full-text retrieval;
- repository structure/symbol relationships where available;
- freshness state;
- procedural policy/convention records.

Vector and FTS retrieval execute independently, then merge using reciprocal-rank fusion. Retrieval must preserve path/symbol/source metadata so a finding can explain what repository evidence it used.

Stale or missing context must be visible to the decision layer. It must never be silently represented as fresh evidence.

### 7.1 Retrieval benchmark before embedding lock

The system must benchmark representative queries over target ecosystems (Python, JS/TS, Java/Spring Boot, AI/ML, MERN/PERN).

The benchmark should compare candidate embedding models using retrieval quality, latency, cost, storage footprint, and compatibility with the intended vector index. The concrete model is selected from evidence. The vector dimension is then derived from that model and frozen only after compatibility verification.

No earlier fixed dimension from planning material is treated as authoritative.

## 8. Orchestration architecture

The workflow graph is conceptually:

```text
START
  ↓
resolve_installation_and_review_identity
  ↓
load_review
  ↓
prepare_diff
  ↓
check_scope_and_budget
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

### 8.1 Large PR workflow

Large PRs use the same logical review identity but may execute bounded passes:

```text
review #42
   ├─ pass 1: changed-file / architecture triage
   ├─ pass 2: risk-focused specialist review
   └─ pass 3: targeted deep review
```

A human may select additional passes or a reduced-scope review when the normal context/cost budget is insufficient. The system must record exactly which files/passes were analyzed and must never represent partial coverage as complete coverage.

## 9. Finding and decision architecture

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

## 10. HITL architecture

Autonomy is configurable per repository with conservative defaults.

Default routing principles:
- high-confidence, non-critical, policy-eligible → publication path;
- below confidence threshold → HITL queue;
- any CRITICAL finding → escalation path regardless of confidence;
- developer dispute → dispute/feedback path;
- repository-specific policy may make any category stricter.

Human decisions become durable relational truth and feed evaluation/learning workflows only after evidence thresholds and governance checks.

## 11. Observability architecture

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

## 12. Economics boundary

BudgetGuard is invoked before costly LLM work where feasible.

Required outputs:
- review-level cost;
- agent-level cost;
- model-level cost;
- token counts;
- latency;
- daily/running budget state.

Budget breach behavior: fail closed rather than silently continue.

## 13. Security architecture

Threat assumptions:
- webhook payloads can be forged;
- repository content can contain prompt injection;
- PR descriptions/comments can contain adversarial instructions;
- tools can fail or return malicious/unexpected data;
- model outputs can be incorrect or manipulative;
- credentials are high-value secrets;
- multi-tenant authorization mistakes can cross repository boundaries.

Required controls:
- HMAC verification;
- GitHub App least privilege;
- explicit installation/repository authorization checks;
- pluggable RBAC;
- secret masking/redaction;
- prompt/context trust-boundary markers;
- capability-scoped tool registry;
- credential scoping;
- sandboxed execution for code/tool paths that require it;
- immutable/auditable decision lineage;
- tenant/repository-aware persistence access.

## 14. Reliability architecture

Reliability controls are explicit per external boundary:
- bounded retries with backoff;
- timeouts;
- circuit breakers;
- idempotency keys;
- deduplication;
- dead-letter path;
- checkpoint/resume;
- no silent replay after uncertain side effects;
- degraded/reduced-scope review behavior;
- explicit multi-pass continuation for unusually large reviews.

## 15. Evaluation architecture

Evaluation is a separate trust boundary from the production reviewer.

Inputs:
- golden PR dataset;
- development split;
- holdout split;
- evaluator/judge policy;
- candidate version;
- baseline version;
- retrieval benchmark dataset.

Outputs:
- finding precision/recall or equivalent quality measures;
- confidence calibration;
- false-positive rate;
- duplicate rate;
- retrieval quality;
- regression decision;
- promotion evidence.

A candidate cannot modify the evaluator or benchmark artifacts used to judge it.

## 16. Target module graph

The planned modules are:

```text
core
├── models
├── reliability
├── security
├── database
├── integrations
│   └── github
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
├── api
└── tenancy
```

This is a conceptual dependency order, not permission for unrestricted imports. A later architecture task will formalize the exact allowed edges and import checks.

Frontend remains outside the backend inward-dependency graph and communicates through stable APIs/query contracts.

## 17. Managed deployment target

Initial production deployment is intended to use managed container compute. AWS ECS/Fargate is an approved candidate.

Conceptual topology:

```text
Internet
  │
  ▼
ALB / managed ingress
  │
  ├── API container service
  └── webhook receiver surface
          │
          ▼
      Redis-compatible queue
          │
          ▼
      worker containers
          │
          ├── LLM/provider APIs
          ├── GitHub App APIs
          └── Tiger/Postgres durable spine

Browser
  │
  ▼
Next.js frontend / API boundary
```

Secrets must be sourced through managed secret/configuration facilities and never committed to the repository.

Kubernetes is deferred unless measured sandbox, scaling, networking, or operational requirements justify it.

## 18. Technology commitments vs open choices

Committed/strongly intended:
- Python backend
- FastAPI
- Redis + ARQ
- LangGraph initially behind an internal workflow interface
- Tiger/Postgres-compatible durable spine direction
- pgvector/pgvectorscale/DiskANN direction subject to compatibility verification
- hybrid vector + FTS retrieval
- four specialists
- Next.js frontend direction
- GitHub App integration
- managed container deployment direction
- cloud SaaS customer experience

Still requiring explicit technical decisions:
- exact GitHub permission scopes;
- exact webhook event matrix;
- exact review/install/tenant identity schema;
- exact database schema and extension availability;
- exact embedding/provider/model choices and vector dimension;
- exact parser implementation and language coverage verification;
- exact sandbox design and whether code execution is required for the initial release;
- exact telemetry stack details around the product event spine;
- exact privacy/retention configuration;
- exact AWS topology after security/cost verification.

## 19. Phase 1 work packages

P1-01 Architecture principles and dependency rule
P1-02 Module graph and ownership matrix
P1-03 External integration boundaries
P1-04 Review identity, installation, tenancy, and lifecycle model
P1-05 Workflow-engine interface and LangGraph boundary
P1-06 Data-lane architecture and persistence ownership
P1-07 Retrieval architecture and freshness contract
P1-08 Embedding retrieval benchmark specification
P1-09 Security/trust-boundary architecture
P1-10 Reliability/failure-state architecture
P1-11 Observability/event contract
P1-12 Economics/BudgetGuard boundary
P1-13 Evaluation boundary
P1-14 Frontend/API boundary
P1-15 GitHub publication adapters and permission contract
P1-16 Managed cloud deployment/security topology
P1-17 Architecture ADR set
P1-18 Architecture verification plan
P1-19 Phase 1 independent review
P1-20 Phase 1 green gate

## 20. Phase 1 completion condition

Phase 1 is green only when the module graph, dependency rule, major interfaces, installation/tenant model, data ownership, external boundaries, publication model, deployment/security topology, ADRs, retrieval benchmark plan, and verification plan are explicit enough that implementation can begin without resolving architectural decisions inside arbitrary source files.
