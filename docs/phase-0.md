# Phase 0 — Cognitive Design & Product Specification

Phase 0 defines what the production PR-review system is allowed to become before architecture or product implementation begins.

## 1. Phase objective

Turn the target PR-review concept into an approved, testable product contract with explicit requirements, invariants, trust boundaries, risks, success measures, assumptions, and unresolved questions.

**Phase 0 exit condition:** a reviewer can inspect canonical Genesis state plus this specification and determine exactly what the system must do, what it must not do, why the major constraints exist, and what evidence is required before Phase 1 architecture work begins.

## 2. Source-of-truth order

1. `.genesis/project.json` — canonical project state.
2. Genesis contracts, skills, decisions, recipes, and executable tests.
3. `SPEC.md` and subsequently approved architecture/specification artifacts for this repository.
4. Existing `Multiagent-PR-Review-System` — reference evidence only; reuse requires explicit justification and verification.
5. General engineering knowledge or external research — only when the higher sources do not decide the issue.

## 3. Product thesis

The product succeeds when it finds materially useful defects in pull requests with high precision and enough evidence for a human reviewer to trust or challenge the finding. The system is not optimized for generating the largest number of comments or for minimizing latency at the cost of correctness.

## 4. Cognitive model

The review should be reasoned as:

`PR event → verified review identity → changed-code understanding → repository-context retrieval → parallel specialist reasoning → normalized findings → deduplication → confidence/policy gate → human escalation when required → publication → durable evidence`

Every transition should have an explicit contract. Free-form model output is never itself an authoritative system decision.

## 5. Actors and consequence levels

| Actor | Primary concern | Consequence of a wrong decision |
|---|---|---|
| Developer | Useful, actionable review | wasted time / missed defect |
| Repository administrator | secure integration and policy | repository exposure / workflow disruption |
| Reviewer | trustworthy evidence | bad decision / reviewer fatigue |
| Human adjudicator | difficult or consequential findings | acceptance of a critical false claim |
| Operator | health, cost, reliability | outages / runaway spending |
| AI reviewer | bounded analysis | unsafe or unjustified action |

## 6. Trust boundaries

### Untrusted

- webhook payload contents until authenticated
- PR title/body/comments
- changed source and unchanged repository files
- retrieved code/context
- test output and tool output
- model-generated text, scores, and suggested actions
- external provider responses

### Privileged

- GitHub installation credentials/tokens
- publication of review comments/checks
- repository write operations, if ever enabled
- persistence of authoritative review state
- budget/policy changes
- model/tool configuration
- learning/promotion operations

### Required boundary behavior

Untrusted data may be analyzed but cannot silently become execution policy. Privileged actions must require an explicit authorization path, bounded scope, auditability, and failure handling.

## 7. Phase 0 invariants

The initial invariant set is recorded canonically in `.genesis/project.json` under `invariants`. Any later modification must be a deliberate, recorded decision rather than an informal prompt change.

## 8. Requirements decomposition

The functional requirements in `SPEC.md` are deliberately grouped around these system capabilities:

1. **Ingress and identity** — authentic GitHub events and stable review identity.
2. **Repository understanding** — diff extraction, repository state, parsing, retrieval, freshness.
3. **Specialist reasoning** — independent security, quality, tests, and documentation analysis.
4. **Decision layer** — normalization, aggregation, deduplication, confidence, policy.
5. **Human control** — escalation, approval/rejection, disputes, attribution.
6. **Publication** — safe, idempotent GitHub output.
7. **Data spine** — relational truth, retrieval memory, time-series/event telemetry.
8. **Reliability** — retries, timeout, circuit breaking, dead-letter, recovery, fault injection.
9. **Economics** — budget guard, cost ledger, per-agent attribution.
10. **Evaluation** — golden dataset, baseline/holdout, regression, promotion/rollback.
11. **Governance** — versioned prompts/policies, audit, access control, retention.
12. **Developer/operations experience** — traces, replay, health, evidence inspection.

## 9. Initial architecture constraints that Phase 1 must honor

- Modular monolith with inward-only dependencies.
- Workflow-engine abstraction with LangGraph as the first implementation.
- Redis + ARQ for asynchronous job execution unless Phase 1 establishes a stronger justified alternative.
- Postgres-compatible/Tiger Cloud data spine for relational truth and time-series/event concerns unless architecture evaluation rejects or modifies the choice.
- Hybrid retrieval using semantic/vector plus keyword evidence and explicit repository freshness state.
- Four parallel specialist agents for the initial production contract.
- Central aggregator/deduplicator/confidence gate before external publication.
- Scoped tool registry and security boundary for repository/tool access.
- HITL as a first-class system boundary, not an afterthought.
- Event lineage and cost telemetry across the review lifecycle.

## 10. Existing repository reuse policy

The previous PR-review repository may be mined for proven implementation knowledge, including GitHub authentication, webhook handling, LangGraph patterns, tree-sitter extraction, model wrappers, frontend patterns, and deployment lessons.

Reuse is allowed only when all of the following are true:

1. a current requirement calls for the capability;
2. the old implementation fits the new module boundary;
3. its security/reliability behavior is inspected rather than assumed;
4. its tests are adequate or new tests are written;
5. reuse does not force the old architecture onto the new system.

## 11. Phase 0 task plan

### P0-01 — Canonical Genesis state

Establish project state, policy, invariants, assumptions, and the active Phase 0 task.

**Gate:** state validates against the Genesis schema and remains readable in a cold session.

### P0-02 — Product intent and users

Finalize problem, outcome, actors, and consequence model.

**Gate:** every actor has an explicit system concern and at least one observable outcome.

### P0-03 — Scope and non-goals

Freeze initial release boundaries and explicitly reject uncontrolled feature expansion.

**Gate:** every major proposed capability is either in-scope, deferred, or non-goal.

### P0-04 — Trust and security model

Identify untrusted inputs, privileged actions, credential boundaries, and prompt-injection/tool-overreach risks.

**Gate:** every privileged capability has an intended authorization boundary.

### P0-05 — Finding and decision contract

Finalize the canonical finding schema, evidence model, confidence semantics, deduplication responsibility, and publication decision path.

**Gate:** a specialist can return one canonical finding shape and the aggregator owns publication eligibility.

### P0-06 — Functional requirements

Finalize stable FR identifiers and their observable behavior.

**Gate:** every core lifecycle capability has a requirement ID.

### P0-07 — Non-functional requirements

Finalize security, reliability, economics, evaluation, privacy, observability, extensibility, and degradation requirements.

**Gate:** each NFR has a measurable or verifiable characteristic.

### P0-08 — Risk register

Record failure modes and the intended control class for each.

**Gate:** no critical Phase 0 risk is accepted without an explicit mitigation or intentional deferral.

### P0-09 — Success and evaluation metrics

Define how review quality, operational health, cost, human outcomes, and drift will be measured.

**Gate:** metrics map to product outcomes and can later become evaluation artifacts.

### P0-10 — Architecture decisions for Phase 1

Freeze the architectural constraints that are already known and explicitly defer decisions that require technical investigation.

**Gate:** no architecture decision is hidden inside implementation convenience.

### P0-11 — Open questions and assumptions

Separate unknown facts from chosen constraints so Phase 1 can resolve them deliberately.

**Gate:** every unresolved item has an owner/phase in the later planning model.

### P0-12 — Independent Phase 0 review

Review the specification and canonical state for contradictions, omissions, unsupported claims, and accidental scope creep.

**Gate:** reviewer is independent of the authoring step and evidence is recorded.

### P0-13 — Phase 0 green gate

Human approval of the final specification and plan readiness.

**Gate:** implementation remains blocked until this gate is explicitly satisfied.

## 12. What Phase 0 must not produce

- production agent code
- production database migrations
- deployment infrastructure
- model prompts intended for production execution
- broad framework scaffolding with no approved requirement
- speculative microservices
- benchmark claims without an evaluator and dataset

The only implementation allowed during Phase 0 is tooling needed to maintain or verify the Genesis/project state itself, not product behavior.

## 13. Phase 1 handoff

Phase 1 may begin only after:

- `SPEC.md` is approved and its hash is current;
- requirements are stable and traceable;
- the implementation plan covers every requirement;
- every implementation task has an executable gate;
- non-low-risk tasks have independent-review gates;
- major trust and reliability boundaries are explicit;
- unresolved architecture questions are represented as bounded Phase 1 tasks;
- the Phase 0 green gate is recorded in canonical state.
