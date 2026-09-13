# Architecture Decision Queue

Status: ACTIVE — product-owner decisions DEC-001..DEC-011 have been selected; remaining items are technical decisions requiring investigation before affected implementation.

This document prevents the coding agent from silently making product or architecture choices that materially affect review behavior, trust, cost, UX, or long-term system shape.

## Closed owner decisions

See `docs/architecture/owner-decisions-2026-09-14.md` for the full rationale and implementation consequences.

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

## Remaining technical decisions

### TDEC-001 — Exact GitHub App permission set

Need to determine the minimum repository/account permissions required for:
- reading PRs/diffs/commits/contents;
- publishing inline review comments;
- publishing checks/summary if dual publication survives verification;
- repository selection/installation state;
- webhook delivery.

Rule: least privilege. Do not request broad permissions for future speculative features.

### TDEC-002 — GitHub webhook event matrix

Need to define exactly which events trigger work, which update an existing review, and which are ignored. Idempotency and review lifecycle semantics must be explicit.

### TDEC-003 — Review identity and tenant/install mapping

Need to formalize the mapping:
`GitHub delivery → App installation → repository → application tenant/user → logical review → workflow runs/passes`.

### TDEC-004 — Embedding benchmark dataset and acceptance threshold

Need to define the representative repository/query dataset, candidate models, metrics, cost/latency bounds, and decision threshold before choosing the concrete embedding model and vector dimension.

### TDEC-005 — Exact autonomy policy schema

Need to define the repository policy fields, defaults, allowed severity/confidence combinations, override authority, and audit semantics. LLM output cannot mutate policy.

### TDEC-006 — HITL role matrix

Need to define the minimum roles and permissions while retaining the pluggable RBAC boundary.

### TDEC-007 — Privacy and retention policy

Need explicit retention/deletion rules for repository content, retrieved context, traces, findings, HITL decisions, and model/provider payloads.

### TDEC-008 — Managed cloud topology

Need to verify the first AWS deployment topology (for example ECS/Fargate + ALB + Secrets Manager + managed Redis-compatible queue + Tiger/Postgres-compatible durable spine) against security, networking, cost, and sandbox requirements.

### TDEC-009 — Tool/sandbox execution policy

Need to determine whether initial release requires code execution at all. If yes, define capability scopes, isolation, network policy, time/resource limits, credential boundaries, and evidence capture before implementation.

## Decision protocol

For every remaining technical decision, the coding agent must investigate and explain the problem, alternatives, consequences, and recommendation. Product-owner input is required whenever the choice changes product behavior, trust, cost, user workflow, or an irreversible architecture boundary.

## Rule

No implementation task may silently convert an unresolved decision into an irreversible architecture choice. Where temporary implementation work is necessary, use an explicit interface/configuration seam and record the temporary assumption.
