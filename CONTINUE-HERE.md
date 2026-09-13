# Continue Here — PR Review Agent Production Level

> Session handoff artifact. Canonical truth is `.genesis/project.json` plus approved specification/architecture artifacts, with Genesis contracts taking precedence.

Current repo: `Ayush-Kant/PR-Review-Agent-Production-Level`
Active construction branch: `develop`
Production-intent branch: `main`

## Owner decisions

- LLM: provider-neutral interface + one evaluated provider/model initially.
- Embeddings: benchmark retrieval first; derive/freeze vector dimension only after model selection and compatibility verification.
- Publication: design for inline review + summary/check; if dual publication cannot be made reliable without unjustified complexity, ship inline review + summary only.
- Languages: Python, JavaScript, TypeScript, Java, Spring Boot, focused on AI/ML and MERN/PERN/modern JS/TS workloads.
- HITL authentication: GitHub identity + pluggable application RBAC.
- Autonomy: per-repository configurable policy, conservative by default.
- Frontend: minimal/capability-driven.
- Customer experience: hosted cloud SaaS via GitHub App; no customer-side runtime infrastructure.
- Large PRs: staged/degraded multi-pass review with explicit limitations + human intervention.
- Deployment: managed containers; AWS ECS/Fargate is an approved candidate.
- GitHub App installation scope: support individual/repository-oriented and organization/account-oriented flows where practical; simplify if disproportionate.
- PR title/body edits: do not automatically trigger a fresh full review; preserve metadata for later review context.

## Phase 1 owner decisions

The following decisions were selected by the product owner and are recorded in the architecture decision artifacts. Their substance is compatible with Genesis, but they are **not yet canonical Genesis decisions** because the current `.genesis/project.json` has not been synchronized with them.

- **Autonomy:** A initially → evolve toward B when evaluation earns it. Critical never auto-publishes; high goes to HITL during initial calibration; medium/low require evidence completeness, freshness, provenance, and calibrated confidence. Repository policy may tighten but not weaken global safety invariants.
- **HITL roles:** A externally + C internally. Customer UX starts with Reviewer and Repository administrator; internal authorization is capability-based so enterprise roles can be added later without changing review/domain models.
- **Privacy:** C retention classes. Secrets never in application DB; execution context is ephemeral; evidence/payload retention is minimized; findings/HITL/audit records live longer; exact durations/deletion/export/legal-hold policy remains explicit configuration/governance work.
- **Tool execution:** A initially → B later only if evaluation justifies it. No arbitrary repository shell/code execution in the first release. Future execution must be a separate isolated capability/service and cannot alter the specialist finding contract.

See `docs/architecture/genesis-alignment-2026-09-14.md` for the reconciliation and authority rules.

## Current gate

**Production application/agent implementation is still blocked.** Phase 0 is approved in canonical Genesis state. Phase 1 remains in planning until the requirement-linked plan passes the actual Genesis plan-check contract, receives the required independent review, and is explicitly approved.

Canonical current state:

- Genesis lifecycle phase: `planning`
- active task: none
- `workflow.plan_check`: null
- `workflow.plan_approval`: null

## Phase 1 progress

Completed or recommendation-ready:

- GitHub App permission and webhook analysis: `docs/architecture/phase-1-github-boundary-analysis.md`
- Review identity/installation/tenancy analysis: `docs/architecture/phase-1-identity-tenancy-analysis.md`
- Retrieval/embedding benchmark contract: `docs/architecture/phase-1-retrieval-benchmark.md`
- Autonomy policy analysis: `docs/architecture/phase-1-autonomy-policy-analysis.md`
- HITL role analysis: `docs/architecture/phase-1-hitl-role-analysis.md`
- Privacy/retention analysis: `docs/architecture/phase-1-privacy-retention-analysis.md`
- Managed AWS topology: `docs/architecture/phase-1-aws-topology-analysis.md`
- Tool/sandbox analysis: `docs/architecture/phase-1-tool-sandbox-analysis.md`
- Phase 1 bounded task map: `docs/architecture/phase-1-plan.md`
- Decision queue: `docs/architecture/decision-queue.md`
- Owner decision record: `docs/architecture/owner-decisions-2026-09-14.md`
- Genesis authority reconciliation: `docs/architecture/genesis-alignment-2026-09-14.md`

## Remaining work before Phase 1 green gate

1. Canonically reconcile the selected Phase 1 decisions into `.genesis/project.json` through the Genesis workflow.
2. Validate every Phase 1 task against Genesis rules: known requirement IDs, complete requirement coverage, executable proof gates, scenario validity, dependency validity, and independent review requirements.
3. Regenerate/verify the Genesis planning view from canonical state and ensure no sidecar document is being treated as authority.
4. Complete final technical verification for GitHub permissions/webhooks, identity lifecycle, retrieval benchmark design, and AWS topology.
5. Complete requirement traceability from FR/NFR/AC to architecture contracts and executable verification.
6. Finalize the Phase 1 ADR set and architecture source-of-truth alignment.
7. Run the Phase 1 independent review with current evidence.
8. Obtain explicit Phase 1 human green approval through Genesis.
9. Only then activate the first bounded product implementation task.

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
8. docs/architecture/owner-decisions-2026-09-14.md
9. docs/architecture/genesis-alignment-2026-09-14.md
10. applicable architecture/ADR files
11. latest Git history on develop

Treat the repository as the durable source of truth, not previous chat memory. Genesis contracts and `.genesis/project.json` outrank sidecar architecture notes.
Verify the latest checkpoint against the current repository, identify the next admissible Genesis task, and continue exactly from there.
Do not repeat completed discovery, do not silently change product-owner decisions, and do not begin gated product implementation before the required Genesis approvals are present.
If any contradiction exists between handoff, architecture documents, and canonical Genesis state, reconcile it from the higher-priority source rather than guessing.
```

Before handoff, ensure durable decisions, active task, blocker, next action, latest checkpoint, and unfinished work are represented in the repository.
