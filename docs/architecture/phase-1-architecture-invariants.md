# Phase 1 Cross-Cutting Architecture Invariants

Status: planning evidence; implementation remains blocked until Genesis plan approval.

This document closes the cross-task gaps identified during P1-19 review. It is subordinate to `.genesis/project.json`, the approved specification, and Genesis contracts, but it is binding planning evidence for implementation design.

## 1. Trust and policy are separate concerns

Untrusted repository content, PR text, retrieved chunks, model output, and tool output are data. They never become policy, authorization, tool selection, or privileged instructions merely because a model requests it.

The policy engine consumes typed, system-produced inputs only. Prompt text is not policy configuration.

## 2. Authentication precedes scheduling

Webhook authenticity and GitHub App installation/repository authorization must be established before expensive processing is scheduled. Delivery identity is durably deduplicated before work can create externally visible effects.

## 3. Review generation is monotonic

A review pass is bound to a reviewed head SHA and a monotonically increasing durable generation. A worker with a stale generation cannot aggregate canonical findings or mutate an external publication surface.

## 4. Retrieval evidence is snapshot-bound

Evidence is admissible only when repository, reviewed head, index version, and context-assembly version are compatible with the review pass. Unknown or mismatched snapshot state produces degraded/HITL routing rather than fresh evidence.

## 5. Publication has one authority

Specialists and retrieval components cannot publish. Only the post-aggregation decision/publication boundary can create external GitHub effects, using a deterministic publication identity.

## 6. Publication is reconciliation-driven

An external write that loses its response is `UNCERTAIN`, not a failure that may be blindly retried. Reconciliation must query current external state using stable identity before another mutation is attempted.

## 7. Policy evaluation fails closed

If policy evaluation is unavailable, malformed, internally inconsistent, or otherwise unable to produce a trustworthy decision, the safe result is `HITL_REQUIRED` or an explicit degraded/failed state. The system must never interpret policy uncertainty as publication authorization.

This rule applies equally to repository-specific policy overlays and future calibrated autonomy matrices.

## 8. Budget uncertainty fails closed

If cost estimation, budget state, or the authoritative budget policy cannot be established, expensive model execution is blocked or reduced to a documented safe path. Model output cannot override a budget block.

## 9. Evaluator isolation is directional

The candidate may consume immutable development/holdout evaluation inputs only according to the evaluation protocol. It has no write capability over the evaluator, holdout labels, baseline records, or promotion authority.

## 10. Human control is capability-based

UI visibility never implies authorization. Every HITL decision is authorized by explicit capability and persists actor, capability, policy version, reason, and timestamp.

## 11. Degradation is explicit

Partial specialist coverage, stale retrieval, unavailable policy, budget blocks, uncertain publication, and dependency failure must be visible in durable review state. A degraded review is never represented as a complete review.

## 12. Privacy is minimization-first

Durable evidence favors identifiers, digests, coordinates, and minimum necessary content. Secrets never enter application truth tables or raw traces. Exact retention/deletion behavior remains governed policy, not hidden infrastructure defaults.

## 13. Future execution is a separate capability

The first release has no arbitrary repository shell/code execution. Any later execution capability must cross a separate authorization and isolation boundary without changing the specialist finding contract.

## 14. Proof requirement

Every high-risk or critical architecture claim must have an executable deterministic fixture where feasible. Document-presence or substring checks are insufficient when the claim is about state transition, authorization, idempotency, failure handling, snapshot consistency, or trust-boundary behavior.

The canonical lightweight proof entry point is:

```text
node scripts/genesis/phase1-gate-runner.mjs P1-XX
```

The runner is planning evidence only; product implementation will replace these fixtures with production test suites after Genesis permits build work.
