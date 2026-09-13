# Genesis Phase 1 Plan Preflight — 2026-09-14

## Authority

This preflight follows the official Genesis workflow contract and regression-test behavior. The canonical operational source is `.genesis/project.json`; architecture documents and `CONTINUE-HERE.md` are supporting evidence/handoff only.

## Current state

- Workflow: `new-product`
- Phase: `planning`
- Active task: none
- Specification: approved and hash-bound in Genesis
- Plan check: intentionally not recorded yet
- Plan approval: intentionally absent
- Product implementation: blocked

## Canonicalized owner decisions

Phase 1 decisions DEC-013 through DEC-016 are now recorded in `.genesis/project.json` so they cannot become a competing source of truth.

Their substance remains constrained by Genesis policy and project invariants:

- autonomy starts conservative and may expand only when evaluation earns the evidence;
- customer-facing HITL roles stay simple while authorization remains capability-based internally;
- privacy uses explicit retention classes and keeps secrets out of the application database;
- arbitrary repository execution is excluded from the first release and any future execution capability must be separately isolated and authorized.

## Genesis plan preflight

The Genesis `planProblems()` contract requires:

1. the specification to remain approved;
2. at least one non-spec task;
3. every task to reference one or more known specification requirements;
4. no task to reference an unknown requirement;
5. every task to contain at least one executable command gate.

The Phase 1 ledger covers the full approved FR/NFR/AC requirement set. During this preflight, one genuine Genesis defect was found: P1-19 had only a human `independent-review` gate, which by itself is not an executable command gate. A separate executable `review-package` gate was added while preserving the mandatory human independent-review gate.

P1-01 through P1-18 and P1-20 already contain executable gates. P1-19 now contains both required forms.

## Approval boundary

This preflight does **not** record plan approval. Genesis requires a successful current plan check followed by explicit human approval before entering `build`. That boundary remains intact.

## Execution limitation

The current coding environment does not have the Genesis CLI installed locally, and direct shell network access is unavailable. Therefore this file records a source-level Genesis preflight, not a claim that the official `genesis plan check .` process was executed in this environment.

Before Phase 1 approval, the canonical ledger should be checked with the official Genesis CLI. Any failure must be resolved in the ledger and rechecked; no manual approval should bypass that result.
