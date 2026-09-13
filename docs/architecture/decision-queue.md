# Architecture Decision Queue

Status: ACTIVE — product-owner decisions DEC-001..DEC-012 are selected. Phase 1 technical investigations are in progress; unresolved choices remain explicitly gated.

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
- DEC-012 `pull_request.edited` behavior → **A**: do not automatically trigger a fresh full review for title/body-only edits; ingest metadata for context/history and allow explicit future re-review through policy if needed.

## Technical investigations completed / recommendations ready

### TDEC-001 — Exact GitHub App permission set

**Investigation status: recommendation ready.** Proposed minimum repository permissions are Metadata: read, Contents: read, Pull requests: write, with Checks: write conditional on the final publication contract. No source-content write, administration, workflows, secrets, deployments, or security-alert write permissions are proposed for the initial review product.

Evidence and rationale are recorded in `docs/architecture/phase-1-github-boundary-analysis.md`.

### TDEC-002 — GitHub webhook event matrix

**Investigation status: recommendation ready.** Automatic review triggering remains centered on `pull_request`; human review/comment events are ingested as feedback rather than recursively creating reviews. `pull_request.edited` is explicitly decided as no automatic fresh review.

Evidence and rationale are recorded in `docs/architecture/phase-1-github-boundary-analysis.md`.

### TDEC-003 — Review identity and tenant/install mapping

**Investigation status: recommendation ready.** The authorization model separates GitHub App installation from application user identity and derives logical review identity from installation + repository + PR + review-relevant head/event state. Repository scope is never inferred from dashboard visibility.

Detailed analysis is recorded in `docs/architecture/phase-1-identity-tenancy-analysis.md`.

### TDEC-004 — Embedding benchmark dataset and acceptance threshold

**Investigation status: benchmark contract ready.** The benchmark will compare candidate retrieval approaches using representative target ecosystems, development/holdout separation, retrieval quality, latency, cost, storage impact, and vector-index compatibility. No vector dimension is frozen before model selection.

Detailed benchmark contract is recorded in `docs/architecture/phase-1-retrieval-benchmark.md`.

## Owner decision required before affected contract is final

### TDEC-005 — Exact autonomy policy schema

**Analysis complete; owner decision required.** Proposed default is Option A (conservative severity-first), with the policy engine designed to support later calibrated evidence+confidence routing. See `docs/architecture/phase-1-autonomy-policy-analysis.md`.

### TDEC-006 — HITL role matrix

**Analysis complete; owner decision required.** Proposed default is Option A (Reviewer + Repository administrator) behind an internal capability-based authorization interface. See `docs/architecture/phase-1-hitl-role-analysis.md`.

### TDEC-007 — Privacy and retention policy

**Analysis complete; owner decision required.** Proposed direction is retention classes with minimal raw repository/model-payload retention and longer-lived normalized finding/HITL/audit records. Exact durations and deletion/export commitments remain owner decisions. See `docs/architecture/phase-1-privacy-retention-analysis.md`.

### TDEC-008 — Managed cloud topology

**Investigation status: recommendation ready pending final security/cost verification.** Leading candidate is ECS/Fargate + ALB + private networking + managed secrets + managed Redis-compatible queue + Tiger/Postgres durable spine. See `docs/architecture/phase-1-aws-topology-analysis.md`.

### TDEC-009 — Tool/sandbox execution policy

**Analysis complete; owner decision required.** Proposed initial release is Option A: no arbitrary repository code execution; keep a capability boundary ready for a future isolated execution service if evaluation proves it necessary. See `docs/architecture/phase-1-tool-sandbox-analysis.md`.

## Decision protocol

For every remaining technical decision, the coding agent investigates and explains the problem, alternatives, consequences, and recommendation. Product-owner input is required whenever the choice changes product behavior, trust, cost, user workflow, or an irreversible architecture boundary.

## Rule

No implementation task may silently convert an unresolved decision into an irreversible architecture choice. Where temporary implementation work is necessary, use an explicit interface/configuration seam and record the temporary assumption.
