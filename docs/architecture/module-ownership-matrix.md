# Phase 1 — Module Ownership and Dependency Direction Matrix

Status: **P1-01 implementation evidence**

This document makes the modular-monolith dependency rule executable in architecture review. It is subordinate to `.genesis/project.json`, the approved `SPEC.md`, and Genesis contracts. It complements ADR-002 and `phase-1-architecture-invariants.md`; later Phase 1 tasks may refine individual module contracts, but they must not weaken the dependency direction established here without an explicit architecture decision.

## 1. Governing rule

The backend is a modular monolith with **inward-only dependencies**.

A module may depend on a more inward layer only through that layer's owned public contract. It may not import or otherwise couple directly to concrete implementations owned by an outer layer.

Three rules are non-negotiable:

1. Inner/domain modules never depend on concrete GitHub, queue, database, provider/model, cloud, or UI adapters.
2. Infrastructure adapters implement interfaces owned by inner/application modules; dependency direction does not reverse merely because the adapter performs the work.
3. Cross-cutting infrastructure such as telemetry, retries, and persistence is accessed through owned interfaces rather than becoming an unrestricted shared utility dependency.

## 2. Layer model

```text
L0  Contracts / domain schemas
    models

L1  Core policy / domain services
    security  auth  tenancy  economics  hitl  evaluation  reliability

L2  Review capabilities
    memory  tools  agents

L3  Application orchestration / inbound boundaries
    orchestrator  api  webhook_receiver  job_queue

L4  External / infrastructure adapters
    integrations/github  database  observability

Frontend is outside the backend module graph and consumes stable API/query contracts only.
```

The layer numbers describe dependency direction, not runtime deployment units.

## 3. Module ownership matrix

| Module | Owns | May depend inward on | Must not depend on | Primary consumers |
|---|---|---|---|---|
| `models` | Typed domain schemas and stable cross-module contracts | none | every other application module | all backend layers |
| `reliability` | Retry/backoff, timeout, idempotency, circuit/DLQ/checkpoint abstractions, failure-state semantics | `models` | concrete GitHub/queue/database/provider/cloud implementations | orchestration, integrations, job queue |
| `security` | Trust-boundary markers, authentication/authorization primitives, capability policy interfaces | `models`, `reliability` | GitHub SDK, UI, concrete database, model/provider SDKs | ingress, API, tools, integrations |
| `auth` | Application identity/session and capability resolution boundary | `models`, `security`, `reliability` | UI internals, GitHub SDK, database implementation | API, HITL, tenancy |
| `tenancy` | Installation/repository/tenant authorization context and isolation contracts | `models`, `security`, `auth` | GitHub SDK, database connection, UI | API, webhook, memory, data access |
| `economics` | BudgetGuard decision contract, cost policy, quota semantics | `models`, `reliability`, `security` | LLM/provider client, queue client, UI | orchestrator, agents, evaluation |
| `hitl` | HITL domain states, capability-checked decisions, dispute/reanalysis contracts | `models`, `security`, `auth`, `tenancy`, `reliability` | GitHub SDK, UI implementation, direct database connection | orchestrator, API |
| `evaluation` | Evaluation-domain contracts, benchmark/promotion policy, candidate/baseline comparison interfaces | `models`, `security`, `reliability`, `economics` | production reviewer mutation of holdout/evaluator, concrete cloud/provider adapters | API/operator tooling, orchestrator through explicit evaluation interfaces |
| `memory` | Retrieval, indexing/context-assembly contracts, freshness and provenance semantics | `models`, `security`, `tenancy`, `reliability` | direct agent-owned SQL, concrete GitHub calls outside integration interfaces, UI | agents, orchestrator |
| `tools` | Capability-scoped tool registry and invocation interfaces | `models`, `security`, `tenancy`, `reliability` | arbitrary shell/code execution in initial release, direct unscoped provider/IAM operations | agents, orchestrator |
| `agents` | Specialist orchestration contracts and typed specialist implementations | `models`, `security`, `economics`, `memory`, `tools`, `reliability` | publication adapters, direct DB connections, policy-store mutation, UI | orchestrator |
| `orchestrator` | Review workflow use cases, aggregation boundary, lifecycle coordination | `models`, `security`, `auth`, `tenancy`, `economics`, `hitl`, `evaluation`, `memory`, `agents`, `tools`, `reliability` | concrete GitHub SDK, concrete DB driver, UI internals | API, webhook receiver, job queue |
| `api` | HTTP/query/command boundary and capability-protected application endpoints | `models`, `security`, `auth`, `tenancy`, `hitl`, `orchestrator`, `reliability` | database driver, GitHub SDK, model/provider SDK | frontend/operator clients |
| `webhook_receiver` | Raw GitHub webhook ingress, authenticity verification handoff, delivery classification and enqueue request | `models`, `security`, `tenancy`, `orchestrator`, `job_queue`, `reliability` | full review execution inline, database internals, model/provider calls | GitHub external system |
| `job_queue` | Async job submission/worker adapter boundary | `models`, `orchestrator`, `reliability`, `security` | domain policy ownership, direct UI, publication decisions outside orchestrator | webhook/API/orchestrator |
| `integrations/github` | GitHub App authentication, repository/PR data access, review publication adapters | `models`, `security`, `auth`, `tenancy`, `reliability` | workflow orchestration, agent logic, policy ownership, UI | webhook receiver, memory adapters, publication boundary |
| `database` | Persistence primitives, connection management, transactions, repository implementation | `models`, `security`, `tenancy`, `reliability` | agent/business policy, GitHub SDK, UI | data/repository interfaces and infrastructure adapters |
| `observability` | Event/span emission, audit/cost/latency telemetry adapter | `models`, `security`, `reliability`, `economics` | changing business decisions, direct UI state ownership | all layers through controlled telemetry interface |

## 4. Allowed dependency edges

The following are the **application-level directed edges** permitted by this architecture. An omitted edge is not implicitly allowed.

```text
reliability -> models
security -> models, reliability
auth -> models, security, reliability
tenancy -> models, security, auth
economics -> models, reliability, security
hitl -> models, security, auth, tenancy, reliability
evaluation -> models, security, reliability, economics
memory -> models, security, tenancy, reliability
tools -> models, security, tenancy, reliability
agents -> models, security, economics, memory, tools, reliability
orchestrator -> models, security, auth, tenancy, economics, hitl, evaluation, memory, agents, tools, reliability
api -> models, security, auth, tenancy, hitl, orchestrator, reliability
webhook_receiver -> models, security, tenancy, orchestrator, job_queue, reliability
job_queue -> models, orchestrator, reliability, security
integrations/github -> models, security, auth, tenancy, reliability
database -> models, security, tenancy, reliability
observability -> models, security, reliability, economics
```

`models` has no inward application dependency.

`integrations/github`, `database`, and other L4 adapters do not become dependencies of L0–L3 merely because they are concrete implementations. Their concrete SDKs/drivers are private to the adapter module and are reached through owned interfaces.

## 5. Explicitly forbidden dependency patterns

The following are architecture violations regardless of implementation convenience:

- `models -> *` application imports;
- any L0/L1 module importing an L4 concrete adapter;
- `agents -> integrations/github` for publication or arbitrary GitHub mutation;
- `agents -> database` or direct SQL;
- `agents -> observability` implementation internals rather than the controlled event interface;
- `orchestrator -> concrete LangGraph` APIs outside the internal workflow-engine adapter boundary;
- `api -> database` for business decisions that bypass application/domain contracts;
- `webhook_receiver -> LLM/model/provider` calls;
- `integrations/github -> orchestrator` control inversion;
- `database -> domain business policy`;
- `observability -> domain decision mutation`;
- any new execution/sandbox dependency that grants arbitrary repository code execution to the initial release.

## 6. Interface ownership rule

When two layers need to communicate, the interface belongs to the layer that **owns the policy/contract**, not the concrete implementation.

Examples:

- workflow engine interface → owned by core/application workflow boundary; LangGraph adapter implements it;
- GitHub repository/review gateway → owned by the application/integration contract; GitHub adapter implements it;
- persistence repository interfaces → owned by the domain/application contract; database module implements them;
- telemetry/event emission contract → owned by the observability boundary; infrastructure transports implement it;
- model/provider interface → owned by the model/provider abstraction; concrete provider clients implement it.

This prevents an outer adapter from becoming the architectural source of truth.

## 7. Enforcement strategy

P1-01 establishes the architectural contract. Subsequent implementation work should enforce it mechanically with repository import checks or a dependency-graph validator rather than relying only on reviewer memory.

A production implementation should fail verification when a changed import crosses a forbidden edge. Dynamic/runtime wiring must preserve the same ownership rule even where static imports are indirect.

The architecture gate may evolve from this static matrix to a machine-readable graph, but any such evolution must preserve the same explicit ownership and direction semantics.

## 8. Change control

Changing a module's owner, moving a module between layers, or adding a cross-layer dependency is an architecture change. It requires:

1. a durable ADR or architecture-record update;
2. a requirement/decision rationale;
3. impact analysis for trust, reliability, security, and test boundaries;
4. updated dependency proof;
5. independent review when required by Genesis risk policy.

Implementation convenience is not sufficient justification for weakening inward-only dependencies.
