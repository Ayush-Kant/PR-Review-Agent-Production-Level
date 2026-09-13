# Phase 1 — Managed AWS Topology Analysis

Status: **PROPOSED / VERIFICATION REQUIRED**

## 1. Target posture

The first production deployment should remain a managed-container SaaS, not Kubernetes-first infrastructure.

Proposed topology:

```text
Internet
   |
Route 53 / DNS
   |
WAF (where required by threat/cost assessment)
   |
ALB
   +----------------------+----------------------+
   |                                             |
API service                                 Webhook ingress
ECS/Fargate                                 ECS/Fargate
   |                                             |
   +----------------------+----------------------+
                          |
                    private network
                          |
             +------------+------------+
             |                         |
       Redis-compatible          Tiger/Postgres
       queue/cache               durable spine
             |                         |
             +------------+------------+
                          |
                   ECS/Fargate workers
                          |
          +---------------+----------------+
          |               |                |
       GitHub APIs     model APIs      observability
```

## 2. Security shape

- Run application and worker tasks in private subnets unless a workload explicitly needs public ingress.
- Keep the ALB as the public boundary; do not expose worker services directly.
- Use security groups and explicit network paths between services.
- Store secrets in AWS Secrets Manager or Parameter Store rather than repository files or baked container images.
- Prefer task IAM roles with least privilege.
- Encrypt durable stores and ephemeral Fargate storage.
- Keep GitHub App signing secrets, private keys, model credentials, and database credentials out of application traces.

AWS documents Fargate as using isolated task infrastructure and recommends managed secret storage; its current ECS guidance supports Secrets Manager/Parameter Store injection and IAM-scoped access. The final topology still requires cost and networking verification. citeturn906020search3turn906020search6turn906020search15

## 3. Queue boundary

Redis-compatible infrastructure is for short-lived job/queue/checkpoint/cache concerns. It must not become the canonical review-truth store.

A managed Redis-compatible service is preferable to running Redis inside the application cluster unless a cost or capability analysis shows otherwise.

## 4. Durable spine

Tiger/Postgres remains the intended durable truth system for:

- tenant/install/repository authorization mappings;
- review and finding records;
- HITL decisions;
- event lineage and operational cost/latency records;
- retrieval/index metadata.

Exact extension availability, indexing strategy, retention, and scaling characteristics remain P1 technical verification items.

## 5. Scaling posture

Start with independently scalable API/webhook and worker services. Do not split the modular monolith into microservices until measured bottlenecks, isolation requirements, or operational ownership justify it.

Autoscaling signals should include queue depth and worker utilization rather than raw HTTP traffic alone.

## 6. Failure posture

- GitHub API failure: bounded retry/circuit-break/degraded state.
- Model provider failure: provider-level timeout/retry policy, with no false completion.
- Queue failure: durable review state remains authoritative; recovery must avoid duplicate effects.
- Database failure: fail closed for decisions requiring durable truth; do not publish unsupported output.
- Secret/config failure: startup/readiness failure rather than silently running with unsafe defaults.

## 7. Observability

The product event spine remains authoritative for review-level lineage. Cloud-native logs/metrics are supplemental infrastructure telemetry, not an alternate source of review truth.

At minimum capture:

- request/webhook latency;
- queue age and depth;
- worker execution state;
- model latency/tokens/cost;
- GitHub API rate-limit/error state;
- database/Redis health;
- review completion/degradation/HITL outcomes.

## 8. Current recommendation

Proceed with ECS/Fargate + ALB + private worker/API networking + managed secrets + managed Redis-compatible queue + Tiger/Postgres durable spine as the leading candidate. Keep interfaces platform-neutral so another managed container platform can replace AWS without redesigning the product.
