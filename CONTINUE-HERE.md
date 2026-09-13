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
- HITL identity: GitHub identity + pluggable application RBAC.
- Autonomy: per-repository configurable policy, conservative by default. Exact policy matrix remains an owner decision under TDEC-005.
- Frontend: minimal/capability-driven.
- Customer experience: hosted cloud SaaS via GitHub App; no customer-side runtime infrastructure.
- Large PRs: staged/degraded multi-pass review with explicit limitations + human intervention.
- Deployment: managed containers; AWS ECS/Fargate is an approved candidate.
- GitHub App installation scope: C, with fallback to simpler B if complexity becomes disproportionate.
- PR title/body edits: do not automatically trigger a fresh full review; preserve edited metadata for later code-triggered review context.

## Current gate

**Production application/agent implementation is still blocked.** Phase 0 is approved in canonical Genesis state. Phase 1 remains in planning until the requirement-linked plan is checked, independently reviewed, and explicitly approved.

## Phase 1 progress

Completed or recommendation-ready:

- GitHub App permission and webhook analysis: `docs/architecture/phase-1-github-boundary-analysis.md`
- Review identity/installation/tenancy analysis: `docs/architecture/phase-1-identity-tenancy-analysis.md`
- Retrieval/embedding benchmark contract: `docs/architecture/phase-1-retrieval-benchmark.md`
- Autonomy policy alternatives: `docs/architecture/phase-1-autonomy-policy-analysis.md`
- HITL role alternatives: `docs/architecture/phase-1-hitl-role-analysis.md`
- Privacy/retention model: `docs/architecture/phase-1-privacy-retention-analysis.md`
- Managed AWS topology: `docs/architecture/phase-1-aws-topology-analysis.md`
- Tool/sandbox execution boundary: `docs/architecture/phase-1-tool-sandbox-analysis.md`
- Phase 1 bounded task map: `docs/architecture/phase-1-plan.md`
- Decision queue synchronized with investigation status: `docs/architecture/decision-queue.md`

## Remaining owner decisions blocking affected architecture contracts

1. TDEC-005 — choose autonomy policy Option A/B/C. Recommendation: A initially.
2. TDEC-006 — choose HITL role Option A/B/C. Recommendation: A initially behind capability-based authorization.
3. TDEC-007 — approve retention-class model and later choose exact durations/deletion-export commitments.
4. TDEC-009 — choose tool/sandbox Option A/B/C. Recommendation: A initially (no arbitrary code execution).

TDEC-008 remains a technical verification item; the leading AWS topology is documented but still requires final security/cost verification before production deployment is treated as fixed.

## Next admissible work

After the owner decisions above are resolved:

1. finalize the affected Phase 1 architecture contracts;
2. run full Genesis plan check and requirement traceability;
3. perform independent Phase 1 review;
4. obtain explicit Phase 1 green approval;
5. only then activate the first bounded product implementation task.

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
5. docs/phase-0-independent-review.md
6. docs/architecture/phase-1-plan.md
7. docs/architecture/decision-queue.md
8. applicable architecture/ADR files
9. latest Git history on develop

Treat the repository as the durable source of truth, not previous chat memory.
Verify the latest checkpoint against the current repository, identify the next admissible Genesis task, and continue exactly from there.
Do not repeat completed discovery, do not silently change product-owner decisions, and do not begin gated product implementation before the required Genesis approvals are present.
If any contradiction exists between handoff and canonical Genesis state, reconcile it from the higher-priority source rather than guessing.
```

Before handoff, ensure durable decisions, active task, blocker, next action, latest checkpoint, and unfinished work are represented in the repository.
