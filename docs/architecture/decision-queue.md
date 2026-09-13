# Architecture Decision Queue

Status: ACTIVE — product-owner decisions DEC-001..DEC-016 are selected. Remaining items are technical verification and evidence work; affected implementation remains gated by Phase 1 approval.

This document prevents the coding agent from silently making product or architecture choices that materially affect review behavior, trust, cost, UX, or long-term system shape.

## Closed owner decisions

See `docs/architecture/owner-decisions-2026-09-14.md` for full rationale and implementation consequences.

- DEC-001 LLM/model provider strategy → **C**: provider-neutral interface, one initial provider/model.
- DEC-002 Embedding strategy → **B**: benchmark retrieval candidates; derive/freeze dimension after selection.
- DEC-003 Publication surface → **C**, conditional on reliable dual publication; otherwise **A**.
- DEC-004 Language support → **targeted Python + JavaScript + TypeScript + Java/Spring Boot** for AI/ML and MERN/PERN/modern JS/TS workloads.
- DEC-005 HITL identity/roles → **C**: GitHub identity with pluggable application RBAC.
- DEC-006 Autonomy → **C**: per-repository policy with conservative defaults.
- DEC-007 Frontend timing → **C**: minimal, capability-driven frontend.
- DEC-008 Customer infrastructure model → **cloud SaaS via GitHub App**; no customer-side infrastructure.
- DEC-009 Large PR handling → **B + human intervention**; staged/multi-pass with explicit scope.
- DEC-010 Deployment → **B**: managed containers; AWS is an approved candidate, including ECS/Fargate.
- DEC-011 GitHub App installation scope → **C**, fallback to simpler **B** if combined UX becomes disproportionate.
- DEC-012 `pull_request.edited` behavior → **A**: do not automatically trigger a fresh full review for title/body-only edits.
- DEC-013 Autonomy policy evolution → **A initially → evolve toward B when evaluation earns it**.
- DEC-014 HITL role model → **A externally + C internally**.
- DEC-015 Privacy and retention model → **C: retention classes**.
- DEC-016 Tool/sandbox execution → **A initially → evolve toward B only when evidence justifies it**.

## Technical verification remaining

### TDEC-001 — Exact GitHub App permission set

Recommendation ready: Metadata read, Contents read, Pull requests write; Checks write only if the validated publication contract requires Check Runs. Final verification must include installation behavior and API contract tests.

### TDEC-002 — GitHub webhook event matrix

Recommendation ready: automatic review triggering centered on `pull_request`; feedback events do not recursively start reviews; `pull_request.edited` does not start a fresh full review.

### TDEC-003 — Review identity and tenant/install mapping

Recommendation ready: separate App installation authorization from application user identity, with review identity scoped by installation/repository/PR/head/event semantics and tenant-aware access paths.

### TDEC-004 — Embedding benchmark dataset and acceptance threshold

Benchmark contract ready. Candidate embedding/model and native vector dimension remain unfrozen until reproducible benchmark evidence exists.

### TDEC-008 — Managed cloud topology

Recommendation ready pending final security/cost verification. Leading candidate: ECS/Fargate + managed ingress + private networking + managed secrets + managed Redis-compatible queue + Tiger/Postgres-compatible durable spine.

## Explicit future-extension boundaries

### Autonomy

Option B is a future policy-engine evolution, not a rewrite. The policy engine must accept typed evidence/confidence/policy inputs so calibration can increase automation without changing specialist contracts.

### HITL authorization

Initial customer roles are Reviewer and Repository administrator. Authorization is implemented through capabilities so enterprise roles can be introduced without redesigning domain records or review workflows.

### Privacy

Retention classes are fixed as the architectural model; exact durations, deletion, export, legal hold, and backup-erasure behavior remain policy/configuration concerns and must be verified before production launch.

### Tool execution

Initial reviewer execution is non-arbitrary: GitHub/API/static/retrieval/model evidence only. Future sandbox execution must be a separate capability/service with explicit authorization and isolation; it must not change the specialist finding contract.

## Decision protocol

For every technical decision, the coding agent investigates and explains the problem, alternatives, consequences, and recommendation. Product-owner input is required whenever the choice changes product behavior, trust, cost, user workflow, or an irreversible architecture boundary.

## Rule

No implementation task may silently convert an unresolved decision into an irreversible architecture choice. Temporary implementation assumptions must use explicit interfaces/configuration seams and be recorded in durable architecture state.
