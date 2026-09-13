# Architecture Decision Queue

Status: OPEN — product-owner decisions required before the affected implementation tasks are authorized.

This document exists to prevent the coding agent from silently making product or architecture choices that materially affect review behavior, trust, cost, UX, or long-term system shape.

## Decision protocol

For each item, the agent must explain the problem, concrete options, consequences, and recommendation. The product owner chooses. The choice is then recorded as an ADR and reflected in canonical Genesis state before implementation.

## DEC-001 — LLM/model provider strategy

Problem: model choice affects review quality, latency, cost, privacy, structured-output behavior, and provider failure modes.

Options:
- A: one primary provider/model with a deterministic fallback model.
- B: multi-provider routing from day one.
- C: provider-neutral abstraction first, with one configured provider initially.

Current recommendation: C. Keep provider selection behind the model-router boundary, start with one evaluated provider/model, and only add multi-provider routing when evidence justifies it.

Owner decision: OPEN.

## DEC-002 — Embedding provider/model

Problem: embeddings determine retrieval quality, dimensions, cost, data movement, and the final Tiger schema.

Options:
- A: follow the planning document exactly and use the proposed OpenAI embedding path/dimension after compatibility verification.
- B: select the best current embedding model after a small retrieval benchmark.
- C: use a local/self-hosted embedding model for privacy/cost reasons.

Current recommendation: B. Benchmark retrieval quality before freezing the schema, while preserving the memory interface.

Owner decision: OPEN.

## DEC-003 — Initial GitHub publication surface

Problem: publication behavior determines user trust and required GitHub permissions.

Options:
- A: inline review comments + review summary.
- B: check run annotations + summary, with inline comments only for high-confidence findings.
- C: both inline review and check run from the beginning.

Current recommendation: A for the first user-facing release unless evaluation shows comments are too noisy; keep the integration boundary capable of supporting additional surfaces later.

Owner decision: OPEN.

## DEC-004 — Initial language support

Problem: parser/retrieval coverage determines what repositories can be reviewed reliably.

Options:
- A: start with a narrow evaluated set (for example Python + JS/TS) and explicitly degrade for others.
- B: support many languages immediately using parser adapters.
- C: choose languages from a target-repository dataset before implementation.

Current recommendation: C, then implement the smallest set justified by the dataset/evaluation plan.

Owner decision: OPEN.

## DEC-005 — HITL authentication/roles

Problem: human approval is a privileged decision surface and must have explicit identity and authorization.

Options:
- A: GitHub OAuth/app identity only.
- B: application-authenticated dashboard with its own RBAC.
- C: GitHub identity first, with a pluggable application RBAC layer.

Current recommendation: C.

Owner decision: OPEN.

## DEC-006 — Production autonomy at launch

Problem: automatic publication creates reputational and correctness consequences.

Options:
- A: all findings require human approval initially.
- B: high-confidence, non-critical findings auto-publish; exceptions go to HITL.
- C: configurable per-repository autonomy policy, defaulting conservatively.

Current recommendation: C, with the global default initially behaving like B or stricter until measured trust is earned.

Owner decision: OPEN.

## DEC-007 — Frontend timing

Problem: the architecture includes a dashboard/HITL/trace/economics surface, but building it too early can lock API contracts prematurely.

Options:
- A: build the dashboard shell early as Phase 2 specifies.
- B: design API contracts first, then build frontend against stable contracts.
- C: build a minimal operational/HITL UI early, expand later.

Current recommendation: C, provided the UI consumes stable contracts and does not become an alternate source of truth.

Owner decision: OPEN.

## DEC-008 — Local developer infrastructure

Problem: Tiger Cloud, Redis, model providers, and GitHub integration affect how much of the stack runs locally.

Options:
- A: cloud-first dependencies for developer environments.
- B: local Docker substitutes where practical, cloud services for production parity.
- C: fully local stack where possible, with cloud only for external integrations.

Current recommendation: B. Keep local development repeatable while preserving a production-parity integration path.

Owner decision: OPEN.

## DEC-009 — Initial repository/review size limits

Problem: bounded context and cost require explicit limits for large PRs/repositories.

Options:
- A: hard reject above fixed limits.
- B: staged/degraded review with explicit limitations.
- C: queue large reviews for human approval before execution.

Current recommendation: B. Prefer reduced-scope but honest review over silent truncation or fabricated certainty.

Owner decision: OPEN.

## DEC-010 — Deployment target

Problem: deployment choices affect secrets, networking, observability, Redis, Tiger connectivity, sandboxing, and operational complexity.

Options:
- A: Render/Vercel style managed deployment as a first release.
- B: containerized deployment with managed compute/container platform.
- C: Kubernetes from the start.

Current recommendation: B unless the target workload or sandbox requirements demonstrate that C is justified.

Owner decision: OPEN.

## Rule

No implementation task may silently convert an OPEN decision into an irreversible architecture choice. Where implementation needs a temporary seam, use an explicit interface/configuration boundary and record the temporary assumption.
