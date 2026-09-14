# Phase 1 — Module Ownership and Dependency Direction Matrix

Status: **P1-01 corrected implementation evidence**

This document is the exact module/dependency contract for P1-01. It is subordinate to `.genesis/project.json`, the approved `SPEC.md`, and Genesis contracts. It refines the earlier conceptual module graph in `phase-1-proposal.md` by making contract ownership explicit. The earlier proposal remains useful for system topology; this matrix is authoritative for module ownership and allowed application-level dependency edges.

## 1. Governing rule

The backend is a modular monolith with **inward-only dependencies**.

A module may depend on a more inward layer only through that layer's owned public contract. Concrete outer adapters implement inner-owned contracts; they do not become the owners of application policy merely because they perform I/O.

Three rules are non-negotiable:

1. Inner/domain/contract modules never depend on concrete GitHub, queue, database, provider/model, cloud, or UI adapters.
2. Infrastructure adapters implement interfaces owned by inner/application contract modules; dependency direction does not reverse merely because the adapter performs the work.
3. Cross-cutting infrastructure such as telemetry, retries, and persistence is accessed through explicit owned interfaces rather than unrestricted shared utility dependencies.

## 2. Layer model

```text
L0  Contracts / domain schemas
    models  workflow  data  model_provider  telemetry

L1  Core policy / domain services
    security  auth  tenancy  economics  hitl  evaluation  reliability

L2  Review capabilities
    memory  tools  agents

L3  Application orchestration / inbound boundaries
    orchestrator  api  webhook_receiver  job_queue

L4  External / infrastructure adapters
    integrations/github  integrations/workflow_langgraph  integrations/model_provider  database  observability
```

The layer numbers express architectural inwardness, not deployment units. Explicit same-layer application edges are allowed only when listed in section 4; an omitted edge is not implicitly allowed.

`models` remains the domain-schema module. The `model_provider` contract is deliberately separate so domain models cannot be confused with LLM/provider abstractions.

The earlier proposal's `core.workflow_engine` concept maps to the `workflow` contract module here. The proposal's `data` concept maps directly to the `data` contract module. The provider and telemetry abstractions are explicit contract modules here so their ownership cannot be left implicit.

## 3. Module ownership matrix

| Module | Owns | May depend inward on | Must not depend on | Primary consumers |
|---|---|---|---|---|
| `models` | Typed domain schemas and stable cross-module contracts | none | every other application module | all backend layers |
| `workflow` | Workflow-engine interface for start/resume/query and execution lifecycle contracts | `models` | LangGraph/Temporal SDKs, queue/database implementations, UI | `orchestrator`, workflow adapters |
| `data` | Persistence repository contracts and durable-record access interfaces | `models` | database drivers, GitHub SDK, provider SDKs, UI | `auth`, `tenancy`, `economics`, `memory`, `hitl`, `evaluation`, `orchestrator`, API |
| `model_provider` | Provider-neutral model interface, request/response types, model metadata/cost contract | `models` | concrete OpenAI/Anthropic/other provider SDKs, GitHub SDK, UI | `agents`, `orchestrator`, model-provider adapters |
| `telemetry` | Controlled event/span/audit/cost emission contract | `models` | telemetry SDK internals, database driver, UI, business decision mutation | all application modules through the contract |
| `reliability` | Retry/backoff, timeout, idempotency, circuit/DLQ/checkpoint abstractions, failure-state semantics | `models`, `telemetry` | concrete GitHub/queue/database/provider/cloud implementations | orchestration, integrations, job queue |
| `security` | Trust-boundary markers, authentication/authorization primitives, capability policy interfaces | `models`, `reliability`, `telemetry` | GitHub SDK, UI, concrete database/provider SDKs | ingress, API, tools, integrations |
| `auth` | Application identity/session and capability resolution boundary | `models`, `security`, `reliability`, `data` | UI internals, GitHub SDK, database implementation | API, HITL, tenancy |
| `tenancy` | Installation/repository/tenant authorization context and isolation contracts | `models`, `security`, `auth`, `data` | GitHub SDK, database connection, UI | API, webhook, memory, data access |
| `economics` | BudgetGuard decision contract, cost policy, quota semantics | `models`, `reliability`, `security`, `data`, `telemetry` | LLM/provider client, queue client, UI | orchestrator, agents, evaluation |
| `hitl` | HITL domain states, capability-checked decisions, dispute/reanalysis contracts | `models`, `security`, `auth`, `tenancy`, `reliability`, `data`, `telemetry` | GitHub SDK, UI implementation, direct database connection | orchestrator, API |
| `evaluation` | Evaluation-domain contracts, benchmark/promotion policy, candidate/baseline comparison interfaces | `models`, `security`, `reliability`, `economics`, `data`, `telemetry` | production reviewer mutation of holdout/evaluator, concrete cloud/provider adapters | API/operator tooling, orchestrator through explicit evaluation interfaces |
| `memory` | Retrieval, indexing/context-assembly contracts, freshness and provenance semantics | `models`, `security`, `tenancy`, `reliability`, `data`, `telemetry` | direct agent-owned SQL, concrete GitHub calls outside integration interfaces, UI | agents, orchestrator |
| `tools` | Capability-scoped tool registry and invocation interfaces | `models`, `security`, `tenancy`, `reliability`, `telemetry` | arbitrary shell/code execution in initial release, direct unscoped provider/IAM operations | agents, orchestrator |
| `agents` | Specialist orchestration contracts and typed specialist implementations | `models`, `security`, `economics`, `memory`, `tools`, `model_provider`, `reliability`, `telemetry` | publication adapters, direct DB connections, policy-store mutation, UI | orchestrator |
| `orchestrator` | Review workflow use cases, aggregation boundary, lifecycle coordination | `models`, `workflow`, `security`, `auth`, `tenancy`, `economics`, `hitl`, `evaluation`, `memory`, `agents`, `tools`, `data`, `model_provider`, `reliability`, `telemetry` | concrete GitHub SDK, concrete DB driver, concrete LangGraph/provider SDK, UI internals | API, webhook receiver, job queue |
| `api` | HTTP/query/command boundary and capability-protected application endpoints | `models`, `security`, `auth`, `tenancy`, `hitl`, `orchestrator`, `data`, `reliability`, `telemetry` | database driver, GitHub SDK, model/provider SDK | frontend/operator clients |
| `webhook_receiver` | Raw GitHub webhook ingress, authenticity verification handoff, delivery classification and enqueue request | `models`, `security`, `tenancy`, `orchestrator`, `job_queue`, `reliability`, `telemetry` | full review execution inline, database internals, model/provider calls | GitHub external system |
| `job_queue` | Async job submission/worker adapter boundary | `models`, `orchestrator`, `workflow`, `reliability`, `security`, `telemetry` | domain policy ownership, direct UI, publication decisions outside orchestrator | webhook/API/orchestrator |
| `integrations/github` | GitHub App authentication, repository/PR data access, review publication adapters | `models`, `security`, `auth`, `tenancy`, `data`, `reliability`, `telemetry` | workflow orchestration, agent logic, policy ownership, UI | webhook receiver, memory adapters, publication boundary |
| `integrations/workflow_langgraph` | LangGraph implementation of the `workflow` contract | `models`, `workflow`, `reliability`, `telemetry` | domain policy ownership, direct publication, UI | workflow boundary |
| `integrations/model_provider` | Concrete provider clients implementing `model_provider` | `models`, `model_provider`, `security`, `reliability`, `telemetry`, `economics` | agent policy ownership, UI, GitHub control, evaluator mutation | model-provider boundary |
| `database` | Persistence primitives, connection management, transactions, repository implementation | `models`, `data`, `security`, `tenancy`, `reliability`, `telemetry` | agent/business policy, GitHub SDK, UI | data/repository interfaces and infrastructure adapters |
| `observability` | Concrete telemetry/event transport implementing the `telemetry` contract | `models`, `telemetry`, `reliability` | changing business decisions, direct UI state ownership, domain policy | all layers through controlled telemetry interface |

## 4. Allowed dependency edges

The following are the **application-level directed edges** permitted by this architecture. An omitted edge is not implicitly allowed.

```text
workflow -> models
data -> models
model_provider -> models
telemetry -> models
reliability -> models, telemetry
security -> models, reliability, telemetry
auth -> models, security, reliability, data
tenancy -> models, security, auth, data
economics -> models, reliability, security, data, telemetry
hitl -> models, security, auth, tenancy, reliability, data, telemetry
evaluation -> models, security, reliability, economics, data, telemetry
memory -> models, security, tenancy, reliability, data, telemetry
tools -> models, security, tenancy, reliability, telemetry
agents -> models, security, economics, memory, tools, model_provider, reliability, telemetry
orchestrator -> models, workflow, security, auth, tenancy, economics, hitl, evaluation, memory, agents, tools, data, model_provider, reliability, telemetry
api -> models, security, auth, tenancy, hitl, orchestrator, data, reliability, telemetry
webhook_receiver -> models, security, tenancy, orchestrator, job_queue, reliability, telemetry
job_queue -> models, orchestrator, workflow, reliability, security, telemetry
integrations/github -> models, security, auth, tenancy, data, reliability, telemetry
integrations/workflow_langgraph -> models, workflow, reliability, telemetry
integrations/model_provider -> models, model_provider, security, reliability, telemetry, economics
database -> models, data, security, tenancy, reliability, telemetry
observability -> models, telemetry, reliability
```

Contract modules (`workflow`, `data`, `model_provider`, `telemetry`) have no concrete-adapter dependency. Concrete adapters depend on those contracts; application/domain code depends on the contracts instead of the adapters.

## 5. Explicitly forbidden dependency patterns

The following are architecture violations regardless of implementation convenience:

- `models -> *` application imports;
- `workflow -> integrations/workflow_langgraph` or any concrete workflow SDK;
- `data -> database` or any concrete persistence driver;
- `model_provider -> integrations/model_provider` or any concrete provider SDK;
- `telemetry -> observability` or any concrete telemetry transport;
- any L0/L1 contract or policy module importing an L4 concrete adapter;
- `agents -> integrations/github` for publication or arbitrary GitHub mutation;
- `agents -> database` or direct SQL;
- `agents -> observability` implementation internals rather than the controlled telemetry contract;
- `orchestrator -> integrations/workflow_langgraph` or concrete LangGraph APIs;
- `orchestrator -> integrations/model_provider` or concrete provider APIs;
- `api -> database` for business decisions that bypass application/domain contracts;
- `webhook_receiver -> LLM/model/provider` calls;
- `integrations/github -> orchestrator` control inversion;
- `database -> domain business policy`;
- `observability -> domain decision mutation`;
- any new execution/sandbox dependency that grants arbitrary repository code execution to the initial release.

## 6. Interface ownership rule

Interfaces belong to the module that owns the **policy/contract**, not the concrete implementation.

| Contract | Owner | Concrete implementation |
|---|---|---|
| Workflow engine | `workflow` | `integrations/workflow_langgraph` |
| Persistence repositories | `data` | `database` and future storage adapters |
| Model/provider | `model_provider` | `integrations/model_provider` and future provider adapters |
| Telemetry/event emission | `telemetry` | `observability` and future telemetry transports |
| GitHub repository/review gateway | application/integration contract consumed by `integrations/github` | `integrations/github` |

The four previously implicit contracts are now first-class architecture modules. This removes the prior ambiguity where an L4 adapter or a non-existent `core.*` package could appear to own an inner contract.

## 7. Enforcement strategy

P1-01 now has two layers of proof:

1. **Deterministic graph proof:** `scripts/genesis/phase1-gate-runner.mjs P1-01` parses the module matrix, validates unique ownership, validates every allowed edge endpoint, verifies that the required contract modules exist, and checks the explicitly forbidden boundary patterns.
2. **Architecture review:** the independent-review gate checks whether the graph is coherent with the approved requirements, ADRs, trust boundaries, and deferred decisions.

A production implementation should additionally fail CI when a changed import crosses a forbidden edge. Dynamic/runtime wiring must preserve the same ownership rule even where static imports are indirect.

The architecture may later evolve from this textual matrix to a machine-readable graph, but that evolution must preserve the same explicit ownership and direction semantics.

## 8. Change control

Changing a module's owner, moving a module between layers, adding a cross-layer dependency, or changing a contract/adaptor boundary is an architecture change. It requires:

1. a durable ADR or architecture-record update;
2. a requirement/decision rationale;
3. impact analysis for trust, reliability, security, and test boundaries;
4. updated dependency proof;
5. independent review when required by Genesis risk policy.

The P1-01 correction is recorded in `docs/architecture/p1-01-contract-refinement-2026-09-14.md` and does not authorize product implementation by itself.