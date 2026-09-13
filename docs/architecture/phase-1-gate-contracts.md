# Phase 1 Executable Gate Contracts

Status: planning evidence; Genesis plan approval still pending.

## Purpose

This matrix defines what each Phase 1 executable gate must actually prove. A gate may inspect architecture documents as supporting evidence, but it must exercise a deterministic invariant or state transition when the task is about behavior.

| Task | Proof target | Required behavior |
|---|---|---|
| P1-01 | Architecture invariants | inward-only dependency rule and cross-cutting trust/publication authority are present |
| P1-02 | Identity | duplicate delivery converges; newer head creates a new generation |
| P1-03 | Ingress | invalid signature rejects; valid delivery accepts; duplicate delivery deduplicates |
| P1-04 | Workflow | timeout/transient failure is retryable; uncertain side effect is not silently replayed |
| P1-05 | Retrieval | evidence from a different reviewed head is not admissible as fresh context |
| P1-06 | Evaluation | holdout is immutable and candidate cannot write evaluator/holdout state |
| P1-07 | Findings | provenance/evidence are required for canonical findings |
| P1-08 | Policy | critical/low-confidence/disputed/error cases route to HITL; policy failure never grants publication |
| P1-09 | Publication | deterministic identity prevents duplicate effect; lost response enters reconciliation |
| P1-10 | Lineage | meaningful events carry review/pass/span ownership and timing |
| P1-11 | Concurrency | stale generation cannot publish |
| P1-12 | Budget | over-budget and budget-unknown cases block expensive work |
| P1-13 | Security | repository/model content cannot select a privileged tool or authorization |
| P1-14 | Evaluation isolation | candidate cannot mutate evaluator or holdout |
| P1-15 | HITL authorization | capabilities distinguish reviewer decisions from repository administration |
| P1-16 | Cloud boundary | secrets are externalized and managed deployment/security topology is explicit |
| P1-17 | ADR integrity | required durable architecture decisions have ADR coverage |
| P1-18 | Traceability | every approved requirement has a task owner and review-resolution record exists |
| P1-19 | Independent review | review package is complete before human review is recorded |
| P1-20 | Green gate | pre-green verification preserves planning state and absent plan approval |

## Runner

The dependency-free runner is:

```powershell
node scripts/genesis/phase1-gate-runner.mjs P1-01
```

The Genesis task gate should call the corresponding task ID. This keeps the plan executable while allowing the fixture implementation to evolve independently of the product runtime.

## Acceptance rule

A command gate is considered meaningful only when a passing result would distinguish at least one unsafe state from a safe state. String-presence checks may remain as supplemental sanity checks, but they must not be the sole proof for high-risk security, idempotency, authorization, concurrency, or failure semantics.
