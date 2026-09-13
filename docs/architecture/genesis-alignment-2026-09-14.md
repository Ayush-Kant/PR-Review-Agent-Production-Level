# Genesis Authority Reconciliation — 2026-09-14

## Purpose

This record resolves the working-rule conflict between architecture notes and the official Genesis workflow.

## Authority order

1. Official Genesis contracts and regression behavior.
2. `.genesis/project.json` — canonical operational source of truth.
3. Human-approved `SPEC.md` and its recorded approval hash.
4. A Genesis-checked and human-approved plan.
5. Architecture/ADR documents as supporting design evidence.
6. Historical chat decisions and previous repository implementations as non-authoritative context.

## Current gate

The repository remains in Genesis `planning` with no active implementation task. Product implementation is blocked until the Phase 1 plan is genuinely checked and explicitly approved through the Genesis lifecycle.

## Reconciliation result

The four newer Phase 1 owner choices recorded in `docs/architecture/owner-decisions-2026-09-14.md` are **compatible with the Genesis policy model** and are retained as proposed product decisions:

- DEC-013: conservative autonomy initially, with evolution toward evidence-and-calibration-based autonomy only after evaluation earns it.
- DEC-014: two external customer roles (Reviewer and Repository Administrator), backed internally by capability permissions.
- DEC-015: retention by data class, with secrets outside the durable database and explicit deletion/export/legal-hold capabilities.
- DEC-016: no arbitrary repository execution in the initial release; a future execution capability may be introduced only as a separately authorized and isolated service when evidence justifies it.

However, these four records are not yet canonical Genesis decisions because the current `.genesis/project.json` still contains only D0-001 through D0-017. Therefore they must not be treated as authoritative over the Genesis ledger until they are durably reconciled into that ledger through the Genesis workflow.

## Genesis test implications applied

The official Genesis workflow requires:

- specification approval to bind to the current specification hash;
- every planning task to reference known approved requirements;
- every planning task to contain an executable proof gate;
- `genesis plan check` to fail closed on missing, unknown, or unproved requirements;
- `genesis plan approve` to require a successful current plan check and explicit human approval;
- medium/high-risk tasks to carry an independent-review gate;
- generated `PLAN.md` and `KICKOFF.md` to remain derived views rather than independent authority;
- no product implementation during discovery, specification, or planning.

## Decision

Do not implement product code, do not mark Phase 1 green, and do not claim plan approval until the canonical Genesis ledger is synchronized with the final Phase 1 planning state and the actual Genesis plan-check contract passes against that state.

The architecture decision documents remain useful evidence, but they cannot override Genesis state.

## Known state discrepancy

At the time of this checkpoint, the canonical ledger has:

- `lifecycle.phase = planning`
- `lifecycle.active_task = null`
- `workflow.plan_check = null`
- `workflow.plan_approval = null`

This is the correct safe state for the current stage.
