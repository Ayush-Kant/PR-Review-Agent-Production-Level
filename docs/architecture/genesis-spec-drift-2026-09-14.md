# Genesis Specification Drift Record — 2026-09-14

## Status

**OPEN — HUMAN SPECIFICATION RE-APPROVAL REQUIRED**

This record exists because the official Genesis v2.4.0 CLI reported `specification is stale` during `genesis plan check .`.

## Observed evidence

- The canonical ledger records the approved Phase 0 `SPEC.md` source hash as `ed156c20d4b7bf543871065a6cbf682f3c9cb55dc3b04cc680752f0eb2e49d86`.
- The current `SPEC.md` has a different content hash according to Genesis 2.4.0, causing the plan check to fail closed.
- `genesis spec check .` currently succeeds and recognizes 43 requirements.

## Interpretation

This is not a harmless checksum mismatch. Genesis intentionally makes specification approval stale when the source artifact changes after approval. The current file contains planning-era clarifications and constraints that were not part of the exact approved Phase 0 source artifact.

Therefore the project must not silently update `project.json` to the new hash. Doing so would manufacture a new approval without the required human product-approval event.

## Correct Genesis path

1. Keep the current Phase 0 approval record immutable as historical evidence.
2. Treat the changed `SPEC.md` as a new checked specification candidate.
3. Run `genesis spec check .` against the current file.
4. Present the checked current specification for explicit human review.
5. Only after the human explicitly approves the current specification should Genesis record the new approval hash and move/retain the workflow in planning.
6. Rerun `genesis plan check .` against the newly approved specification and current task ledger.
7. Do not run `genesis plan approve` until the resulting plan has passed the current plan check and completed the required independent review.

## Why this is preferable

The project has accumulated legitimate Phase 1 architecture clarifications. Reverting them solely to preserve the historical Phase 0 hash would throw away durable planning knowledge. Silently changing the hash would weaken Genesis's human-control contract. Re-approval is the only path that preserves both the work and the audit trail.

## Current blocker

**Human specification re-approval is required before Phase 1 plan checking can become valid again.**

The product implementation remains blocked.
