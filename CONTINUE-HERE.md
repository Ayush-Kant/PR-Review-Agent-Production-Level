# Continue Here — PR Review Agent Production Level

> Session handoff artifact. Canonical truth is `.genesis/project.json` plus approved specification/architecture artifacts.

Current repo: `Ayush-Kant/PR-Review-Agent-Production-Level`
Active construction branch: `develop`
Production-intent branch: `main`

## Owner decisions

- LLM: provider-neutral interface + one evaluated provider/model initially.
- Embeddings: benchmark retrieval first; derive/freeze vector dimension only after model selection and compatibility verification.
- Publication: design for inline review + summary/check; if dual publication cannot be made reliable without unjustified complexity, ship inline review + summary only.
- Languages: Python, JavaScript, TypeScript, Java, Spring Boot, focused on AI/ML and MERN/PERN/modern JS/TS workloads.
- HITL: GitHub identity + pluggable application RBAC.
- Autonomy: per-repository configurable policy, conservative by default.
- Frontend: minimal/capability-driven.
- Customer experience: hosted cloud SaaS via GitHub App; no customer-side runtime infrastructure.
- Large PRs: staged/degraded multi-pass review with explicit limitations + human intervention.
- Deployment: managed containers; AWS ECS/Fargate is an approved candidate.
- GitHub App installation scope: C, with fallback to simpler B if complexity becomes disproportionate.

## Current gate

**Production application/agent implementation is still blocked.** Genesis requires Phase 0 independent review + human approval before Phase 1 becomes green, and Phase 1 must be green before product implementation starts.

## Work completed in this session

- Recorded owner decisions in `docs/architecture/owner-decisions-2026-09-14.md`.
- Updated `docs/architecture/decision-queue.md` with closed owner decisions and remaining technical decisions.
- Refined `docs/architecture/phase-1-proposal.md` for the cloud GitHub-App SaaS model, installation/tenant boundaries, large-PR passes, retrieval benchmark, and managed deployment.
- Added and persisted this handoff protocol.
- Synchronized `.genesis/project.json` with the owner decisions, SaaS/cloud constraints, new invariants, and continuity rule.

## Next admissible work

1. Verify the current `develop` HEAD and canonical Genesis file.
2. Perform Phase 0 verification/independent review.
3. Resolve only the remaining technical decisions listed in `docs/architecture/decision-queue.md` as required for Phase 1.
4. Obtain human Phase 0 approval.
5. Run Phase 1 independent review and green gate.
6. Then begin bounded product implementation tasks.

## Cross-chat rule

When this chat approaches its practical context boundary, the coding agent must checkpoint before continuity is lost, tell the product owner to start a new chat, and provide a copy-paste resume prompt.

Resume prompt:

```text
Continue the PR-Review-Agent-Production-Level project as my coding agent.

First read and verify:
1. CONTINUE-HERE.md
2. .genesis/project.json
3. SPEC.md
4. docs/phase-0.md
5. applicable architecture/ADR files
6. latest Git history on develop

Treat the repository as the durable source of truth, not previous chat memory.
Verify the latest checkpoint against the current repository, identify the next admissible Genesis task, and continue exactly from there.
Do not repeat completed discovery, do not silently change product-owner decisions, and do not begin gated product implementation before the required Genesis approvals are present.
If any contradiction exists between handoff and canonical Genesis state, reconcile it from the higher-priority source rather than guessing.
```

Before handoff, ensure durable decisions, active task, blocker, next action, and unfinished work are represented in the repository.
