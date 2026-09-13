# Phase 1 Review Resolution — 2026-09-14

## Status

**CONDITIONAL — remediation in progress; Genesis approval remains intentionally absent.**

This record resolves the substantive P1-19 findings against the current architecture package. It does not impersonate a Genesis human approval and does not mutate Genesis gate status.

## Finding disposition

### R1 — Shallow executable gates

**Accepted.** The previous gates were structurally executable but several relied on document existence or substring checks. They are replaced by deterministic, dependency-free architecture fixtures in `scripts/genesis/phase1-gate-runner.mjs`.

Production implication: these fixtures are planning proof only. After implementation is authorized, the same invariants must become normal automated test suites around the real domain/application boundaries.

### R2 — Policy-engine failure behavior

**Accepted and closed at contract level.** Policy evaluation failure is now explicitly fail-closed: `HITL_REQUIRED` or an explicit degraded/failed state. It can never become publication authorization.

This is protected by the P1-08 deterministic fixture.

### R3 — Head-SHA supersession

**Accepted as implementation verification, not an architecture gap.** The architecture contract already binds work to a durable generation tied to the reviewed head and requires current-generation checks immediately before aggregation, policy/publication authorization, and each external publication mutation.

Production implementation must prove this with compare-and-swap/lease or an equivalent durable generation check.

### R4 — Publication uncertainty

**Accepted as implementation verification, not an architecture gap.** Publication already uses deterministic identity and an explicit reconciliation state machine. The P1-09 fixture verifies lost-response handling and identity convergence.

### R5 — Retrieval snapshot consistency

**Accepted as implementation verification, not an architecture gap.** Review passes bind to repository/head/index/context versions and mismatched evidence is degraded rather than silently treated as fresh. P1-05 now exercises that invariant.

### R6 — Per-finding cryptographic signatures

**Rejected as premature.** The architecture already has review/pass identity, source evidence digests, specialist/model/tool provenance, event lineage, and publication identity. Cryptographic component signatures would add complexity without a demonstrated requirement in the current threat model.

### R7 — Hard-coded organization allowlist

**Rejected.** Authorization is installation/repository/tenant aware and must support the product's intended repository-oriented and organization/account-oriented onboarding modes. A fixed organization allowlist would be a narrower product policy than the approved decision.

### R8 — Separate GCP/network isolation for evaluation

**Rejected as a mandatory architecture choice.** The current evaluation contract requires immutable/access-controlled holdout data and denies candidate write access to the evaluator and holdout. Physical cloud-account/network separation may be adopted later if evidence justifies it.

### R9 — Exact retention durations

**Deferred by approved decision.** Retention classes are canonical. Exact durations, deletion/export/legal hold, and backup-erasure are bounded governance work before production commitments.

### R10 — Concurrency/reconciliation implementation fixtures

**Accepted.** The architecture is sufficient; implementation proof remains a hard requirement before corresponding production behavior is considered complete.

## New cross-cutting invariant package

`docs/architecture/phase-1-architecture-invariants.md` now records shared rules for:

- trust vs policy separation;
- authentication before scheduling;
- monotonic review generations;
- snapshot-bound retrieval evidence;
- single publication authority;
- reconciliation after uncertain external effects;
- fail-closed policy and budget behavior;
- evaluator isolation;
- capability-based human authorization;
- explicit degradation;
- privacy minimization;
- future execution isolation.

## Green criteria

Phase 1 can move toward green when:

1. the strengthened deterministic gate runner is wired into the canonical Genesis task gates;
2. `genesis plan check .` passes against the modified canonical ledger;
3. the complete Phase 1 review package is independently reviewed by an authorized reviewer who did not author the reviewed work;
4. no new blocking contradiction is found;
5. the product owner explicitly performs Genesis plan approval.

No product implementation begins before those conditions are satisfied.
