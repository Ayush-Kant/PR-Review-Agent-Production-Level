# Phase 1 — Privacy and Retention Analysis

Status: **PROPOSED / OWNER DECISION REQUIRED**

## 1. Data classes

The system handles several materially different data classes:

1. Repository source and PR content — customer-controlled, potentially confidential.
2. Retrieved review context/chunks — derived customer code/context.
3. Model prompts and outputs — potentially contain customer code and provider payloads.
4. Findings and HITL decisions — durable product records, generally less sensitive than raw source but still customer data.
5. Operational telemetry — latency, cost, token counts, error state, identifiers.
6. Security material — webhook secrets, GitHub credentials/tokens, model/database credentials.
7. Evaluation datasets — must be separately protected from candidate mutation.

## 2. Recommended retention principles

- Secrets: never persist in review records or raw traces; use managed secret storage.
- Webhook delivery payloads: retain only as long as necessary for idempotency, debugging, and audit, with redaction where possible.
- Full repository snapshots: avoid durable persistence by default; prefer ephemeral bounded retrieval/build context unless a concrete feature requires longer retention.
- Retrieved chunks/context: retain only the provenance and minimum content required to reproduce or explain a finding.
- Model prompts/outputs: retain redacted, access-controlled records when necessary for audit/evaluation; avoid indefinite raw retention by default.
- Findings/HITL decisions: retain longer than transient execution data because they are product/audit truth.
- Cost/latency/event metadata: retain according to operational and billing needs without retaining customer source unnecessarily.
- Evaluation artifacts: isolated and access-controlled independently from production candidate execution.

## 3. Candidate retention model

Use configurable retention classes rather than one global deletion timer:

| Class | Example | Default posture |
|---|---|---|
| Security secret | App secret, token, DB credential | never in application DB; managed secret store |
| Ephemeral execution | working tree, expanded context | minutes/hours, bounded by workflow lifecycle |
| Review evidence | evidence excerpts/provenance | product retention window, configurable |
| Findings/HITL | normalized finding, decision | longer-lived audit/product record |
| Telemetry | latency/cost/error metadata | operational retention window |
| Evaluation | golden/holdout datasets | separately governed, versioned, access-controlled |

Exact durations, deletion/export semantics, and customer-configurable controls remain product-owner decisions.

## 4. Security requirements

- Tenant/repository authorization checks apply to every sensitive read/write.
- Raw traces must redact secrets and avoid unnecessary source duplication.
- Encryption in transit and at rest is mandatory for production storage paths.
- Deletion must be auditable and must not leave hidden secondary copies under application control.
- Provider requests must be attributable to a review and must not leak credentials into prompts or telemetry.

## 5. Recommendation

Adopt the retention-class model above. Keep customer source and model payload retention minimal by default, retain normalized findings/HITL/audit state longer, and make the exact durations and customer deletion/export commitments an explicit owner decision before production launch.
