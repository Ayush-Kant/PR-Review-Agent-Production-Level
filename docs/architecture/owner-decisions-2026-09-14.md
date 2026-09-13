# Product Owner Architecture Decisions — 2026-09-14

Status: ACCEPTED for architecture planning; implementation remains gated by Genesis Phase 0/Phase 1 approvals.

## DEC-001 — LLM/model provider strategy
Decision: **C — provider-neutral model interface with one configured provider initially.**
Consequence: agents depend on an internal model boundary, not a provider SDK. We can evaluate one model first and add providers later without rewriting specialist agents.

## DEC-002 — Embeddings
Decision: **B — benchmark current candidates before freezing the embedding model and vector dimension.**
Constraint: do not hard-code the planning document's proposed dimension merely for compatibility. First build a retrieval benchmark using representative Python/AI/ML and MERN/JS/TS repository queries plus relevant Java/Spring Boot cases. Select the model and its native embedding dimension based on measured retrieval quality, cost, latency, and operational fit. Then freeze the Tiger vector schema to the selected dimension and record the benchmark evidence.

## DEC-003 — GitHub publication surface
Decision: **C — support inline review comments and a review/check summary from the beginning, subject to implementation feasibility and quality safeguards.**
Fallback rule: if implementing both safely at the first release would materially weaken correctness, idempotency, or trust, ship **A — inline review comments + summary** first rather than cutting corners.

## DEC-004 — Initial language support
Decision: **Targeted set for Python/AI-ML and MERN/PERN/JavaScript/TypeScript ecosystems, plus Java/Spring Boot where reliably supportable.**
Initial scope should prioritize Python, JavaScript, TypeScript, Java, and Spring-oriented Java repositories. Other languages must degrade explicitly rather than imply equivalent coverage.

## DEC-005 — HITL authentication/roles
Decision: **C — GitHub identity first with a pluggable application RBAC layer, designed so an A-style GitHub-only authorization model remains easy to use later.**
Consequence: authentication/identity stays GitHub-native, while authorization is behind a replaceable application policy boundary. The first release should avoid building a second credential system unless required.

## DEC-006 — Production autonomy
Decision: **C — per-repository configurable autonomy with a conservative default, implemented accurately and fail-closed.**
Policy principle: autonomy is policy-controlled, evidence-backed, and earned through evaluation. Critical, low-confidence, disputed, or policy-sensitive outcomes must escalate according to policy. No finding bypasses normalization, aggregation, deduplication, or policy gating.

## DEC-007 — Frontend timing
Decision: **C — build only the minimum operational/HITL frontend needed at each stage.**
Consequence: no large dashboard project up front. UI must consume stable backend contracts and must not become an alternate source of truth.

## DEC-008 — Developer infrastructure / delivery model
Decision: **Cloud-first SaaS experience.**
Consequence: end developers should not install the system locally. The intended flow is: user signs in, installs/authorizes the GitHub App, selects repositories, and the cloud service receives GitHub webhooks, accesses permitted repository data, performs the review, and publishes results back to GitHub. Local Docker/Redis/Tiger setup is an internal developer convenience, not an end-user requirement.

## DEC-009 — Large PR handling
Decision: **B — staged/degraded review, with human intervention when needed.**
Consequence: large reviews may be split across multiple passes or escalated to a human rather than silently truncating context. The system must state what was reviewed and what limitations applied.

## DEC-010 — Deployment target
Decision: **B — containerized managed deployment; AWS is an acceptable target.**
Planning direction: evaluate AWS managed/container primitives first (for example ECS/Fargate) rather than operating Kubernetes from day one. Tiger remains the intended durable spine subject to architecture validation; AWS can host compute, networking, secrets, queues/cache, observability, and other supporting components as justified.

## Cross-cutting product direction

The resulting product is a hosted GitHub App / SaaS architecture, not a locally installed developer tool. The user-facing dependency should be GitHub access plus browser access. Infrastructure dependencies such as Redis, Tiger/Postgres, workers, orchestration, model providers, and sandboxing remain on the service side.

The architecture must preserve least-privilege GitHub App permissions, webhook verification, repository-scoped installation access, idempotent delivery handling, and explicit separation between GitHub authentication/installation and application authorization.
