# Owner Decisions — 2026-09-14

Status: DECIDED by product owner. Affected implementation remains gated by Genesis Phase 0/Phase 1 approval.

### DEC-001 — LLM/model provider strategy
Decision: **C** — provider-neutral model interface with one configured provider initially.

Implementation consequence:
- Agents must not depend directly on a provider SDK.
- Provider selection belongs behind the model-router/model-provider boundary.
- Start with one evaluated provider/model.
- Add multi-provider routing only when evaluation, reliability, cost, or availability evidence justifies it.

### DEC-002 — Embedding provider/model
Decision: **B** — benchmark retrieval candidates before freezing the embedding model or vector dimension.

Implementation consequence:
- Do not hard-code the planning document's proposed embedding dimension as an architectural constraint.
- Build a retrieval benchmark using representative Python, JS/TS, Java/Spring Boot, AI/ML, MERN/PERN repositories.
- Evaluate retrieval quality, latency, cost, storage impact, and compatibility with the chosen vector index.
- Freeze the embedding model and native dimension only after the benchmark decision.
- The memory interface must remain independent of the concrete embedding provider/model.

### DEC-003 — GitHub publication surface
Decision: **C**, conditional on reliability; otherwise fall back to **A**.

Implementation consequence:
- Design the publication boundary to support both inline review comments and a review/check summary.
- Do not publish a second surface until both outputs can be produced consistently without duplicated or conflicting findings.
- If dual publication increases correctness risk or implementation complexity beyond the justified value of the first release, ship inline review + summary only.
- Agents never publish directly; only the post-aggregation publication boundary may do so.

### DEC-004 — Initial language support
Decision: targeted support for **Python, JavaScript, TypeScript, Java, and Spring Boot**, optimized for AI/ML and MERN/PERN/modern JS/TS workloads.

### DEC-005 — HITL authentication/roles
Decision: **C** — GitHub identity first with a pluggable application RBAC layer, designed so a simpler GitHub-only authorization mode can be integrated easily.

Implementation consequence:
- Separate authentication (who the user is) from authorization (what the user can approve/manage).
- Keep the authorization policy behind an internal interface.
- Initial identity may come from GitHub; later enterprise/application identity providers must be replaceable without redesigning the HITL domain.

### DEC-006 — Production autonomy
Decision: **C** — configurable per-repository autonomy policy with conservative defaults.

Implementation consequence:
- Autonomy is a policy decision, not an LLM decision.
- The aggregator remains publication authority.
- Critical, low-confidence, disputed, or policy-sensitive findings must remain eligible for HITL.
- A repository may choose stricter policy than the global default.
- Default behavior must remain conservative until calibration/evaluation establishes earned trust.
- Confidence is a routing signal, never proof of truth.

### DEC-007 — Frontend timing
Decision: **C** — minimal operational/HITL frontend built only when the underlying capability requires it.

### DEC-008 — End-user infrastructure model
Decision: **Cloud SaaS / GitHub App**. End users do not install Redis, databases, agents, runtimes, or local infrastructure.

### DEC-009 — Large PR handling
Decision: **B + human intervention** — staged/degraded review with explicit limitations, including human-directed multi-pass review for unusually large PRs.

### DEC-010 — Deployment target
Decision: **B**, with **AWS** explicitly considered an appropriate managed-container target.

### DEC-011 — GitHub App installation scope
Decision: **C** — support both individual/repository-oriented onboarding and organization/account-level installation where practical; if the combined experience becomes disproportionately complex, simplify to **B** (broader account-level installation with repository controls).

### DEC-012 — PR description/title edits
Decision: **A** — do **not** automatically trigger a fresh full review for `pull_request.edited`.

Implementation consequence:
- Title/body-only edits do not start a new specialist review run by default.
- The latest title/body must still be available as review context for the next code-triggered run.
- `pull_request.edited` may be ingested for durable metadata/history, HITL context, or a future explicit policy-controlled re-review operation.
- This avoids expensive review churn while preserving the information for the next relevant review.

## Phase 1 owner decisions

### DEC-013 — Autonomy policy evolution
Decision: **A initially → evolve toward B when evaluation earns it**.

Initial behavior:
- CRITICAL findings never auto-publish.
- HIGH findings go to HITL by default during initial production calibration.
- MEDIUM/LOW findings may auto-publish only when evidence completeness, provenance, retrieval freshness, and calibrated confidence conditions pass.
- Missing provenance, stale retrieval, incomplete specialist coverage, policy-sensitive findings, or disputed findings route to HITL/block.
- Repository policy may tighten global behavior but may not weaken global safety invariants.

Future-ready boundary:
- The policy engine exposes typed inputs for severity, category, calibrated confidence, evidence completeness, retrieval/index health, specialist coverage, dispute state, critical-impact flag, policy-sensitive flag, publication capability, budget state, and reliability state.
- Routing remains deterministic and versioned.
- A future calibrated evidence/confidence matrix (Option B) can be introduced without changing specialist or publication interfaces.
- Fully configurable per-repository matrices remain a later extension, not a first-release requirement.

### DEC-014 — HITL role model
Decision: **A externally + C internally**.

External product roles initially:
- **Reviewer:** inspect findings/evidence, approve/reject HITL findings, dispute findings, view authorized review history.
- **Repository administrator:** all Reviewer capabilities plus integration/repository configuration and permitted repository policy configuration.

Internal authorization boundary:
- Model authorization as explicit capabilities such as `review.read`, `review.decide`, `review.dispute`, `policy.read`, `policy.write`, `integration.read`, `integration.write`, and `audit.read`.
- Customer-facing roles are capability bundles, not authorization logic embedded throughout domain code.
- This permits future enterprise roles without replacing the HITL domain model.

### DEC-015 — Privacy and retention model
Decision: **C — retention classes**.

Implementation consequence:
- Security secrets are never stored in application data; use managed secret storage.
- Repository working trees and expanded review context are ephemeral by default.
- Retrieved evidence retains only minimum necessary content/provenance for explanation and audit.
- Raw model prompts/outputs are minimized, redacted, access-controlled, and retained only when needed for audit/evaluation.
- Findings and HITL decisions are longer-lived product/audit truth.
- Telemetry follows operational/billing needs without unnecessary customer source retention.
- Evaluation datasets are separately governed and isolated.

Future-ready boundary:
- Exact retention durations are configuration/policy, not data-model assumptions.
- Deletion, export, legal-hold, and backup-erasure workflows are explicit capabilities rather than hard-coded storage behavior.

### DEC-016 — Tool/sandbox execution
Decision: **A initially → evolve toward B only when evidence justifies it**.

Initial behavior:
- No arbitrary repository shell/code execution.
- Review agents use GitHub APIs, repository content, static parsing, retrieval, and model reasoning.
- Findings must distinguish static/API/CI evidence from any future execution evidence.

Future-ready boundary:
- Define a separate execution capability/service boundary rather than allowing agents to inherit process privileges.
- If enabled later, require explicit authorization, filesystem isolation, network policy, CPU/memory/time limits, credential isolation, artifact limits, audit evidence, cleanup, and evaluator isolation.
- Adding execution must not change the canonical specialist finding contract.

## Cross-cutting product direction

The product is a hosted GitHub-native service, not a local developer tool. The intended end-user experience is:

`Browser → GitHub sign-in → GitHub App installation/authorization → select repository/repositories → GitHub PR event → cloud review → GitHub-native findings + dashboard/HITL when required`.

## Embedding dimension rule

The vector dimension is **not decided yet**. It is a derived implementation parameter that follows the selected embedding model after retrieval benchmarking and compatibility verification. Any previous planning example of a fixed dimension is treated as a proposal only.

## Chat continuity rule

This project must remain resumable across chat sessions without relying on conversational memory. Before the current chat approaches its practical context boundary, the coding agent must checkpoint durable project state in the repository and tell the product owner that a handoff is needed.

The agent must provide a copy-paste continuation prompt that instructs a fresh session to:
1. read `CONTINUE-HERE.md`;
2. read `.genesis/project.json`;
3. read the current specification and applicable architecture/ADR files;
4. verify the active branch and last checkpoint against the repository;
5. determine the next admissible Genesis task;
6. continue without repeating completed discovery or silently changing owner decisions.

`CONTINUE-HERE.md` is a session handoff artifact, not the canonical authority. Canonical state remains Genesis plus approved project artifacts.
