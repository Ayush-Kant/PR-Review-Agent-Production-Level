# Continue Here — PR Review Agent Production Level

> This is a **session handoff**, not the canonical source of truth. Canonical project truth is `.genesis/project.json` plus approved specification/architecture artifacts.

## Current project

Repository: `Ayush-Kant/PR-Review-Agent-Production-Level`

Active construction branch: `develop`
Production-intent branch: `main`

Genesis protocol is mandatory. Product implementation is blocked until the required Phase 0 and Phase 1 gates are satisfied.

## Product direction decided by owner

1. **LLM strategy:** provider-neutral model interface; one evaluated provider/model initially.
2. **Embeddings:** benchmark retrieval candidates first. Freeze the model and vector dimension only after benchmark + compatibility verification.
3. **GitHub publication:** design for both inline review and a summary/check surface; if dual publication cannot be made reliable without unjustified complexity, release with inline review + summary only.
4. **Languages:** Python, JavaScript, TypeScript, Java, Spring Boot, with focus on AI/ML and MERN/PERN/modern JS/TS workloads.
5. **HITL auth:** GitHub identity first with a pluggable application RBAC layer; preserve an easy path for a simpler GitHub-only mode.
6. **Autonomy:** configurable per repository, conservative by default; critical/low-confidence/disputed/policy-sensitive cases remain eligible for human escalation.
7. **Frontend:** minimal and capability-driven; no speculative dashboard work.
8. **Customer deployment model:** cloud SaaS via GitHub App. Customers install/authorize the App and use the browser; they do not install our runtime, Redis, database, or workers.
9. **Large PRs:** staged/degraded review with explicit limitations and optional human-directed multi-pass review. One logical review identity spans the passes.
10. **Deployment:** managed containers are preferred; AWS ECS/Fargate is an approved target subject to architecture/security/cost verification.
11. **GitHub App installation scope:** both user/repository-oriented and organization/account-oriented onboarding where practical; fall back to the simpler broader-installation model if the combined experience becomes disproportionately complex.

## Important architecture rules

- Specialists produce evidence-backed findings; they do not publish directly.
- Aggregation, normalization, deduplication, confidence and policy gating happen before publication.
- LLM confidence is a routing signal, not proof of truth.
- Repository content, PR text, retrieved context, tool output and model output are untrusted data unless an explicit trusted boundary says otherwise.
- Privileged actions require explicit authorization, least privilege and durable attribution.
- Budget checks occur before expensive model work where technically possible.
- Evaluation artifacts and evaluators must be protected from the candidate system.
- Slower-but-correct is preferred over fast-but-unjustified.
- No architecture/product decision may be silently changed by the coding agent.

## Current implementation boundary

**Do not start production agent/application implementation yet.**

The repository is still in the Genesis planning/specification gate. The current Phase 0 task must reach independent review and human approval before Phase 1 implementation-ready architecture work can become green.

Current expected next work:

1. Make the canonical `.genesis/project.json` reflect the owner decisions and continuity policy.
2. Update the decision queue/ADR index so closed decisions are clearly distinguished from unresolved technical decisions.
3. Refine the Phase 1 architecture for the cloud GitHub-App SaaS model, including tenancy, installation identity, user identity, repository scope, webhook flow, publication adapters, and managed deployment boundaries.
4. Define the retrieval benchmark plan that will select the embedding model and only then freeze the vector dimension/schema.
5. Complete remaining Phase 0 open questions and verification criteria.
6. Run the required independent Phase 0 review.
7. Obtain human Phase 0 approval.
8. Proceed to Phase 1 architecture verification and green gate.
9. Only after those gates, begin bounded product implementation tasks.

## Last verified repository checkpoint

The latest durable owner-decision checkpoint is the commit that adds:

- `docs/architecture/owner-decisions-2026-09-14.md`
- this handoff file

Before continuing, verify the current `develop` HEAD and confirm these files still exist.

## Cross-chat continuity protocol

When the current chat approaches its practical context boundary, the coding agent must **stop before losing continuity**, checkpoint the project to the repository, and tell the product owner to start a new chat.

The agent must then provide a copy-paste continuation prompt similar to:

```text
Continue the PR-Review-Agent-Production-Level project as my coding agent.

First read and verify:
1. CONTINUE-HERE.md
2. .genesis/project.json
3. SPEC.md
4. docs/phase-0.md
5. the applicable architecture/ADR files
6. the latest Git history on develop

Treat the repository as the durable source of truth, not the previous chat memory.
Verify the last checkpoint against the current repository state, identify the next admissible Genesis task, and continue from exactly that point.
Do not repeat completed discovery, do not silently change product-owner decisions, and do not begin gated product implementation before the required Genesis approvals are present.
If any contradiction exists between the handoff and canonical Genesis state, stop and reconcile it from the higher-priority source rather than guessing.
```

### Handoff requirements

Before handing off:
- durable decisions must be in repository artifacts;
- current Genesis state must be valid and current;
- the active task and blocker/next action must be explicit;
- any unfinished work must have a bounded next action;
- no important product choice should exist only in chat.

### Fresh-session startup rule

A new session should be able to recover the project from the repository without asking the product owner to reconstruct the whole history from memory.
