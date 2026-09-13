# Owner Decisions — 2026-09-14

Status: DECIDED by product owner. Affected implementation remains gated by Genesis Phase 0/Phase 1 approval.

## Decisions

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

Implementation consequence:
- Initial parser/retrieval/evaluation work prioritizes these ecosystems.
- Unsupported languages must degrade honestly and must never be implied to have equivalent review coverage.
- Do not add broad language support merely for feature-count purposes.

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

Implementation consequence:
- Avoid speculative dashboard work.
- Frontend consumes backend contracts and durable system truth; it is never an alternate source of authoritative state.
- Build login, repository connection, review state, finding review, and HITL surfaces only as those workflows become implementation-ready.

### DEC-008 — End-user infrastructure model
Decision: **Cloud SaaS / GitHub App**. End users do not install Redis, databases, agents, runtimes, or local infrastructure.

Implementation consequence:
- User flow is browser login → GitHub App installation/authorization → repository selection → cloud review.
- Production review execution occurs in our managed cloud environment.
- Local Docker/development substitutes are engineering conveniences for maintainers, not customer requirements.
- Exact production provider remains an implementation/deployment concern; AWS managed containers are an approved target under DEC-010.

### DEC-009 — Large PR handling
Decision: **B + human intervention** — staged/degraded review with explicit limitations, including human-directed multi-pass review for unusually large PRs.

Implementation consequence:
- Normal PRs should follow the standard single review workflow.
- Large PRs may be split into bounded review passes while retaining one logical review identity.
- The system must expose what was and was not analyzed.
- The system must never silently truncate a large review and report an unjustifiably complete result.
- Human intervention may choose reduced-scope, risk-focused, or additional passes.

### DEC-010 — Deployment target
Decision: **B**, with **AWS** explicitly considered an appropriate managed-container target.

Implementation consequence:
- Prefer containerized services on managed compute rather than Kubernetes from day one.
- AWS ECS/Fargate is an acceptable initial production deployment target, subject to Phase 1 security/networking/cost verification.
- Keep deployment concerns behind infrastructure/configuration boundaries so another managed container platform remains possible.

### DEC-011 — GitHub App installation scope
Decision: **C** — support both individual/repository-oriented onboarding and organization/account-level installation where practical; if the combined experience becomes disproportionately complex, simplify to **B** (broader account-level installation with repository controls).

Implementation consequence:
- Model GitHub App installation separately from application user identity.
- Support selected-repository installation where the GitHub installation flow permits it.
- Design tenancy/authorization boundaries so repository access is never inferred from dashboard visibility alone.
- Organization-level controls must not weaken least privilege.

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
