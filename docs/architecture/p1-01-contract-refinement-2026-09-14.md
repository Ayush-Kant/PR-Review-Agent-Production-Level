# P1-01 Contract-Boundary Refinement — 2026-09-14

Status: **P1-01 architecture correction evidence**

This record documents the correction made after substantive P1-01 review. It is an architecture-record update, not a product implementation change.

## 1. Review finding

The first P1-01 module matrix correctly established inward-only dependency direction, but four contract owners were only referenced textually and were not represented as modules in the graph:

- `core.workflow_engine` in ADR-001 / the earlier proposal;
- persistence repository contracts;
- provider/model abstraction;
- telemetry/event emission contract.

This created ambiguity about who owns those interfaces and made the original P1-01 executable gate weaker than the architecture claim it was intended to prove.

## 2. Correction

The exact P1-01 module graph now makes the following contract modules first-class:

| Contract module | Owns | Adapter/implementation boundary |
|---|---|---|
| `workflow` | workflow-engine start/resume/query and execution lifecycle interface | `integrations/workflow_langgraph` |
| `data` | persistence repository contracts and durable-record access interfaces | `database` and future storage adapters |
| `model_provider` | provider-neutral model interface and model/cost metadata contract | `integrations/model_provider` and future provider adapters |
| `telemetry` | event/span/audit/cost emission contract | `observability` and future telemetry transports |

`models` remains reserved for domain schemas and stable cross-module data contracts; it is not the LLM model/provider abstraction.

## 3. Relationship to earlier architecture

This correction does not replace the system architecture proposal. It makes its previously conceptual boundaries explicit so implementation cannot invent ownership at the adapter layer.

- Earlier `core.workflow_engine` concept → explicit `workflow` contract module.
- Earlier `data` concept → explicit `data` contract module.
- Previously implicit provider boundary → explicit `model_provider` contract module.
- Previously implicit event/telemetry boundary → explicit `telemetry` contract module.

The infrastructure adapters implement these contracts and do not become the source of policy or architectural ownership.

## 4. Verification correction

The P1-01 executable gate was also strengthened. It now validates the module matrix itself instead of only checking for invariant phrases in a separate document.

The deterministic proof checks:

1. each declared module has one ownership row;
2. each allowed dependency edge references declared modules;
3. required contract modules are present;
4. adapter/contract direction is preserved;
5. explicitly forbidden contract-to-adapter and agent/publication paths remain forbidden;
6. no edge is inferred merely from module existence.

This closes the gap between the P1-01 acceptance claim and the evidence actually produced by the gate.

## 5. Decision impact

No product-owner behavior, GitHub permission, autonomy rule, provider choice, embedding choice, retention duration, or deployment choice is changed by this correction.

No product runtime implementation is authorized by this record. It only makes the architecture contract internally consistent before later Phase 1 tasks rely on it.
