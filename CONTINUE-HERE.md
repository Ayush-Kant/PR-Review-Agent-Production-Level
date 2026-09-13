# Continue Here — PR Review Agent Production Level

> Session handoff. Canonical truth is `.genesis/project.json` plus approved specification/architecture artifacts, with Genesis contracts taking precedence.

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

These decisions are now recorded canonically in `.genesis/project.json` as DEC-013 through DEC-016. Architecture decision documents remain supporting rationale and evidence, not a competing source of truth.

- **Autonomy:** A initially → evolve toward B when evaluation earns it. Critical never auto-publishes; high goes to HITL during initial calibration; medium/low require evidence completeness, freshness, provenance, and calibrated confidence. Repository policy may tighten but not weaken global safety invariants.
- **HITL roles:** A externally + C internally. Customer UX starts with Reviewer and Repository administrator; internal authorization is capability-based so enterprise roles can be added later without changing review/domain models.
- **Privacy:** C retention classes. Secrets never in application DB; execution context is ephemeral; evidence/payload retention is minimized; findings/HITL/audit records live longer; exact durations/deletion/export/legal-hold policy remains explicit configuration/governance work.
- **Tool execution:** A initially → B later only if evaluation justifies it. No arbitrary repository shell/code execution in the first release. Future execution must be a separate isolated capability/service and cannot alter the specialist finding contract.

## Current gate

**Production application/agent implementation is still blocked.** Phase 0 is approved in canonical Genesis state. Phase 1 remains in planning until the current canonical requirement-linked plan passes the actual Genesis plan check, receives the required independent review, and is explicitly approved.

Canonical current state:

- Genesis lifecycle phase: `planning`
- active task: none
- `workflow.plan_check`: null
- `workflow.plan_approval`: null

## Phase 1 work completed

### Genesis governance

- Canonicalized DEC-013 through DEC-016 into `.genesis/project.json`.
- Corrected P1-19 so it has both an executable proof gate and the mandatory independent-review gate required for high-risk work.
- Recorded the source-level Genesis plan preflight and the environment limitation preventing an official CLI execution receipt.
- Preserved the planning gate; no false `plan_check` or `plan_approval` was recorded.

### Architecture verification and contracts

- GitHub App boundary and least-privilege posture: `docs/architecture/phase-1-github-boundary-analysis.md`
- Identity/installation/tenancy lifecycle: `docs/architecture/phase-1-identity-tenancy-analysis.md`
- Retrieval/embedding benchmark contract: `docs/architecture/phase-1-retrieval-benchmark.md`
- Autonomy policy: `docs/architecture/phase-1-autonomy-policy-analysis.md`
- HITL roles: `docs/architecture/phase-1-hitl-role-analysis.md`
- Privacy/retention: `docs/architecture/phase-1-privacy-retention-analysis.md`
- AWS topology: `docs/architecture/phase-1-aws-topology-analysis.md`
- Tool/sandbox boundary: `docs/architecture/phase-1-tool-sandbox-analysis.md`
- Technical verification package: `docs/architecture/phase-1-technical-verification.md`
- Architecture contracts: `docs/architecture/phase-1-contracts.md`
- Requirement traceability: `docs/architecture/phase-1-requirement-traceability.md`
- Phase 1 ADR index: `docs/architecture/adr-index.md`
- Evaluation contract: `docs/evaluation/phase-1-evaluation-contract.md`
- Genesis reconciliation: `docs/architecture/genesis-alignment-2026-09-14.md`
- Genesis plan preflight: `docs/architecture/genesis-plan-preflight-2026-09-14.md`

### External verification incorporated

Current GitHub documentation supports the minimum-permission App boundary, webhook secret/signature validation, and Pull requests write for creating reviews. Current AWS documentation supports Fargate as a managed container option, Secrets Manager integration for ECS, and separate task-execution/application roles.

## Remaining work before Phase 1 green gate

1. Run the official Genesis plan check against the current canonical ledger.
2. If it reports any contradiction, fix the canonical ledger and rerun it; never bypass failures through sidecar documents.
3. Regenerate/verify the Genesis planning view from canonical state.
4. Run the Phase 1 independent review with the current architecture/evaluation evidence.
5. Obtain explicit Phase 1 human green approval through Genesis.
6. Only then activate the first bounded product implementation task.

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
10. docs/architecture/genesis-plan-preflight-2026-09-14.md
11. docs/architecture/phase-1-technical-verification.md
12. docs/architecture/phase-1-contracts.md
13. docs/architecture/phase-1-requirement-traceability.md
14. docs/evaluation/phase-1-evaluation-contract.md
15. applicable ADR files
16. latest Git history on develop

Treat the repository as the durable source of truth, not previous chat memory. Genesis contracts and `.genesis/project.json` outrank sidecar architecture notes.
Verify the latest checkpoint against the current repository, identify the next admissible Genesis action, and continue exactly from there.
Do not repeat completed discovery, do not silently change product-owner decisions, and do not begin gated product implementation before the required Genesis approvals are present.
If any contradiction exists between handoff, architecture documents, and canonical Genesis state, reconcile it from the higher-priority source rather than guessing.
```

Before handoff, ensure durable decisions, active task, blocker, next action, latest checkpoint, and unfinished work are represented in the repository.
