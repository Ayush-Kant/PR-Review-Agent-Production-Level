# Phase 1 Technical Verification

## Purpose

This document records the current technical verification performed before the Phase 1 human green gate. It is planning evidence, not implementation authorization and not a substitute for Genesis `plan check` or human approval.

## Verification posture

The project remains in Genesis `planning` with no active implementation task. `.genesis/project.json` is the operational source of truth. Architecture documents are supporting evidence only.

## 1. GitHub App boundary

### Verified constraints

- GitHub App permissions must be minimum-required rather than broad defaults.
- Webhook delivery is an authenticated ingress path using a configured webhook secret and signature validation before scheduling work.
- The first trigger remains the `pull_request` webhook family.
- Delivery identity and logical review identity are separate concepts. Delivery idempotency prevents duplicate transport effects; logical review identity prevents duplicate analysis/publication for the same PR head.
- Publication requires Pull Requests write. Creating a pull-request review through the REST API requires Pull requests repository permission at write level.
- Checks write is conditional on the final publication contract; it is not assumed merely because a check surface is desirable.
- Source contents write, administration, workflow, secrets, deployment, and unrelated security-alert write capabilities remain outside the initial permission set unless a later approved requirement proves necessity.

Current GitHub documentation confirms that GitHub App permissions determine available API actions and webhook subscriptions and recommends selecting the minimum required permissions. The pull-request review REST endpoints require Pull requests write permission for GitHub App installation access tokens. The App webhook configuration supports a dedicated secret for validating deliveries.

### Required ingress sequence

1. Receive request and preserve the raw bytes needed for signature verification.
2. Verify the GitHub webhook signature and required GitHub headers before interpreting payload fields as trusted metadata.
3. Derive a transport idempotency key from the GitHub delivery identifier and installation context.
4. Reject or safely acknowledge duplicate deliveries without scheduling duplicate review work.
5. Parse the event into an internal untrusted event envelope.
6. Authorize the repository against the GitHub App installation and tenant context.
7. Compute the logical review key from installation, repository, pull request, and head SHA.
8. Persist the event/review transition before asynchronous work is scheduled where the durable store can support the transaction boundary.
9. Schedule only the resulting admissible work item.

### PR action policy

| `pull_request` action | Default behavior |
| --- | --- |
| `opened` | Create a new review for the current head |
| `reopened` | Resume/create review for current head if none is active |
| `synchronize` | Supersede prior head work and review the new head |
| `ready_for_review` | Create/refresh review when the PR becomes actionable |
| `converted_to_draft` | Pause pending publication; do not start a fresh review |
| `closed` | Finalize/cancel outstanding work; no fresh review |
| `edited` | Record metadata change; do not automatically trigger a full review |

The `edited` behavior is an explicit product decision and is deliberately separated from transport processing so later policy changes do not require changing identity semantics.

## 2. Review identity and lifecycle

The canonical review hierarchy is:

`tenant -> GitHub App installation -> authorized repository -> PR -> review identity -> review pass -> specialist runs -> findings -> publication`

The logical review identity is bound to the reviewed repository state rather than only to a PR number. A new head SHA represents a new review pass under the same PR lifecycle.

### Idempotency rules

- Same delivery identifier: transport duplicate; acknowledge without duplicate side effects.
- Same logical review key `(installation, repository, PR, head SHA)`: do not create a second review pass unless an explicit recovery/retry policy permits it.
- New head SHA for the same PR: supersede pending analysis for the older head and create a new pass.
- Retries after uncertain publication: retry through a stable finding/publication identifier; never synthesize a second finding merely because the network result was uncertain.

## 3. Retrieval contract

Retrieval is evidence production, not instruction execution.

Every retrieved item must carry:

- repository identity;
- commit/head SHA or other freshness anchor;
- path and source range when applicable;
- retrieval method;
- lexical/vector score components;
- combined ranking information;
- freshness/invalidity state;
- chunk or document identifier.

The system uses hybrid retrieval because keyword exactness and semantic similarity solve different failure modes. Reciprocal-rank fusion remains the default combination method in the architecture until benchmark evidence supports another choice.

The embedding model and vector dimension remain unfrozen until the retrieval benchmark is run against representative Python, JavaScript, TypeScript, Java/Spring Boot, AI/ML, MERN, PERN, and modern JS/TS repositories. This preserves INV-014.

## 4. Specialist and finding boundary

Specialists are evidence producers. They do not publish directly.

Every specialist output must normalize into the canonical finding contract before aggregation:

```text
FindingCandidate {
  finding_id: deterministic identity within a review pass;
  category: security | quality | tests | documentation;
  severity: critical | high | medium | low;
  confidence: calibrated numeric/confidence band;
  title: concise statement;
  rationale: evidence-based explanation;
  affected_change: exact reviewed hunk/range;
  repository_evidence: zero or more cited repository spans;
  provenance: retrieval/tool/model lineage;
  freshness: source state used for the conclusion;
  policy_tags: zero or more routing tags;
  suggested_action: remediation guidance, never executable control;
}
```

The aggregator is the only component authorized to turn candidates into canonical findings. Deduplication, evidence completeness, policy routing, publication eligibility, and HITL routing happen after specialist execution and before publication.

## 5. Autonomy and HITL

Initial autonomy policy is conservative and typed rather than LLM-controlled:

| Condition | Routing |
| --- | --- |
| Critical | HITL / never automatic publication |
| High during calibration | HITL |
| Medium/Low with incomplete evidence, stale retrieval, unresolved provenance, disputed status, or policy-sensitive tags | HITL / block |
| Medium/Low with complete provenance, fresh evidence, calibrated confidence and policy allowance | Eligible for automatic publication |
| Repository policy | May tighten global policy; may not weaken global safety invariants |

This is intentionally designed as a policy engine boundary so later calibrated-confidence evolution can occur without changing specialist contracts or publication adapters.

## 6. Tool boundary

Initial release is intentionally static-analysis/retrieval-first.

No arbitrary repository shell, test runner, package installer, build command, or code execution capability is required for the first release. Repository APIs, static parsers, retrieval, and model reasoning are sufficient to establish the primary review contract with substantially lower execution risk.

If later evidence justifies execution, it must be introduced as a separately isolated capability with explicit authorization, resource limits, network policy, ephemeral filesystem state, credential denial by default, and independent observability. It must not change the canonical specialist finding contract.

## 7. Durable data and lineage

The durable spine is separated conceptually into:

- truth lane: reviews, passes, canonical findings, publication state, HITL decisions;
- memory lane: retrieval chunks, embeddings, semantic/episodic/procedural memory;
- event lane: webhook deliveries, workflow transitions, tool calls, timing, failures, retries and cost evidence.

A production decision must be reconstructable from these lanes without depending on chat history.

## 8. Economics and BudgetGuard

Budget checks occur before expensive model calls where technically possible.

Budget decisions are deterministic policy inputs, not model-generated recommendations. A request that would exceed configured limits should fail closed or degrade to a cheaper admissible path rather than silently overspend.

Cost evidence must include at least:

- review/pass identifier;
- model/provider identifier;
- prompt/input accounting where available;
- output accounting where available;
- retry count;
- estimated and realized cost;
- budget state before execution;
- final routing/degradation result.

## 9. AWS topology verification

The leading deployment candidate remains:

`Internet -> ALB -> ECS/Fargate services -> private network -> managed queue / PostgreSQL-compatible durable store`

with Secrets Manager for application secrets and CloudWatch-compatible operational telemetry.

AWS documentation confirms Fargate runs containers without customer-managed EC2 instances, and AWS supports integrating ECS with Secrets Manager rather than hardcoding secrets in application configuration. ECS task roles separate task execution permissions from application task permissions, supporting least-privilege separation.

Open infrastructure questions that remain bounded engineering work rather than product-owner decisions:

- exact managed Redis-compatible queue choice;
- Tiger/Postgres deployment/retention configuration;
- private egress strategy for GitHub/model APIs;
- observability retention and alert thresholds;
- cost envelope and autoscaling thresholds.

## 10. Privacy / retention

Retention classes are:

1. secrets: secret manager only;
2. ephemeral execution context: short-lived workspace/context;
3. evidence: minimum necessary provenance and relevant source span;
4. findings/HITL/audit: durable operational records;
5. telemetry: operational retention;
6. evaluation: separately governed datasets and holdouts.

Exact duration, export, deletion, legal hold, and backup-erasure policies remain explicit configuration/governance work and must not be implied by code defaults.

## 11. Evaluation integrity

The evaluation system is a protected boundary.

The candidate system must not be able to modify holdout data, scoring code, baseline results, or evaluator logic during an experiment. Learning/policy changes are proposals until baseline/candidate evaluation, independent review, explicit promotion, and rollback evidence exist.

## 12. Current conclusion

No current technical verification finding requires changing the approved Phase 0 product intent.

The architecture is ready for the next planning work items, but implementation remains blocked until the Genesis plan is checked and explicitly approved after the independent Phase 1 review.

### External verification sources

- GitHub App permissions and webhooks: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app
- GitHub App webhooks: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps
- GitHub pull-request review API: https://docs.github.com/en/rest/pulls/reviews
- AWS ECS/Fargate private container pattern: https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/access-container-applications-privately-on-amazon-ecs-by-using-aws-fargate-aws-privatelink-and-a-network-load-balancer.html
- AWS ECS Secrets Manager integration: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/secrets-app-secrets-manager.html
- AWS ECS IAM role separation: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-iam-role-overview.html
