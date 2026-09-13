# Phase 1 Architecture Contracts

Status: planning artifact; implementation blocked until Genesis plan approval.

## 1. Trust-boundary contract

### Untrusted

- webhook payload values;
- PR title/body/comments;
- repository source and configuration;
- retrieved chunks and documentation;
- tool output;
- model prompts and model output;
- third-party metadata supplied through repository content.

### Trusted only after explicit checks

- GitHub delivery authentication result;
- GitHub App installation identity;
- repository authorization result;
- durable review identity;
- parsed diff/source spans obtained through an authorized GitHub App access path;
- policy configuration loaded from the durable policy store;
- executable system configuration;
- publication authorization decision.

No untrusted string can select a tool, change authorization, override policy, or create a privileged action merely because a model or repository file requested it.

## 2. Event envelope

```text
ReviewEvent {
  event_id: GitHub delivery identifier;
  installation_id: string;
  repository_id: string;
  repository_full_name: string;
  pull_request_number: integer;
  action: string;
  received_at: timestamp;
  delivery_signature_valid: boolean;
  payload_digest: string;
  source_head_sha: string | null;
  authorization_state: authorized | rejected | unknown;
}
```

The envelope records authentication and authorization outcomes separately so a rejected delivery cannot become indistinguishable from a valid event later in the pipeline.

## 3. Review identity state machine

```text
RECEIVED
  -> AUTHENTICATED
  -> AUTHORIZED
  -> REGISTERED
  -> QUEUED
  -> RUNNING
  -> AGGREGATING
  -> POLICY_DECIDING
  -> HITL_PENDING | PUBLICATION_READY | DEGRADED | FAILED
  -> PUBLISHED | DISPUTED | CANCELLED | SUPERSEDED
```

A `synchronize` action creates a new pass for the new head SHA and transitions unresolved work for the previous head toward `SUPERSEDED` rather than mutating historical evidence.

A cancelled, disputed, or published review remains historically queryable. State changes append events; they do not erase the prior causal trail.

## 4. Retrieval evidence contract

```text
RetrievedEvidence {
  evidence_id: string;
  repository_id: string;
  commit_sha: string;
  path: string;
  start_line: integer | null;
  end_line: integer | null;
  content_digest: string;
  retrieval_mode: vector | lexical | hybrid;
  semantic_rank: integer | null;
  lexical_rank: integer | null;
  fused_rank: integer;
  freshness: fresh | stale | unknown;
  index_version: string;
}
```

The source commit is part of the evidence identity. Evidence from a different head cannot silently satisfy a current-head finding.

## 5. Canonical finding contract

```text
CanonicalFinding {
  finding_id: deterministic string;
  review_id: string;
  pass_id: string;
  category: security | quality | tests | documentation;
  severity: critical | high | medium | low;
  confidence: numeric | calibrated band;
  title: string;
  rationale: string;
  change_evidence: one or more source/diff spans;
  repository_evidence: zero or more RetrievedEvidence records;
  provenance: specialist/model/retrieval/tool lineage;
  policy_tags: string[];
  status: candidate | canonical | hitl_pending | approved | rejected | published | disputed;
  created_at: timestamp;
}
```

A finding cannot move to `published` unless change evidence, provenance, freshness, policy decision, and publication identity are available.

## 6. Aggregation contract

The aggregator performs:

1. schema validation;
2. evidence/provenance validation;
3. duplicate grouping;
4. deterministic severity/confidence reconciliation according to policy;
5. policy-sensitive tag evaluation;
6. repository-specific policy overlay;
7. HITL routing;
8. publication eligibility;
9. stable ID assignment.

Specialists cannot call publication adapters directly.

## 7. Publication contract

```text
PublicationIntent {
  publication_id: deterministic string;
  finding_id: string;
  repository_id: string;
  pull_request_number: integer;
  commit_sha: string;
  surface: inline | summary | check;
  target: file/line/range | summary surface;
  body_digest: string;
  policy_decision_id: string;
}
```

A retry with the same publication identity must converge on the same external outcome or record an explicit uncertain-side-effect state. It must never create a second logically identical finding because the first HTTP response was lost.

## 8. HITL contract

```text
HITLDecision {
  decision_id: string;
  review_id: string;
  finding_id: string | null;
  actor_identity: GitHub user identity;
  actor_capabilities: capability[];
  decision: approve | reject | dispute | request_reanalysis;
  reason: string;
  policy_version: string;
  created_at: timestamp;
}
```

The application must validate the actor's capability for the requested decision. A visible dashboard item is never itself authorization.

## 9. Budget contract

```text
BudgetDecision {
  review_id: string;
  pass_id: string;
  estimated_cost: number;
  current_spend: number;
  configured_limit: number;
  remaining_budget: number;
  decision: allow | degrade | block;
  basis: deterministic policy inputs;
}
```

The model cannot override a `block` decision through natural-language output.

## 10. Event lineage contract

Every meaningful asynchronous or model action has:

- `review_id`;
- `pass_id`;
- `span_id`;
- `parent_span_id`;
- actor/component identity;
- event type;
- started/ended timestamps;
- status/outcome;
- model/provider when applicable;
- token/cost metadata when available;
- relevant source/evidence digests;
- error class when unsuccessful.

This supports reconstruction of why a finding was emitted, why it was routed to HITL, and what was eventually published.

## 11. Privacy contract

Source material and prompts are minimized. Durable records favor digests, source coordinates, and evidence references rather than storing entire repository snapshots or full model conversations unless a separately approved evaluation/governance policy requires them.

Secret-bearing material must be redacted before durable tracing. Secrets belong in the cloud secret-management boundary, not application tables or source control.

## 12. Degradation contract

When a dependency is unavailable or budget policy blocks an expensive path, the workflow must produce an explicit state such as:

- `DEGRADED_RETRIEVAL`;
- `DEGRADED_MODEL`;
- `HITL_REQUIRED`;
- `PUBLICATION_UNCERTAIN`;
- `FAILED_RETRYABLE`;
- `FAILED_TERMINAL`.

No degraded result is presented as equivalent to a full review. Limitations become part of durable review evidence.

## 13. Large-PR contract

Large pull requests may be split into staged passes. Each pass carries its own context/evidence scope and is linked to the same PR lifecycle. A later pass must never silently overwrite the evidence of an earlier pass.

The product may explicitly surface incomplete coverage and request a human-directed additional pass instead of fabricating full coverage.

## 14. Review-generation concurrency contract

Each active review pass has a monotonically increasing `head_generation` or equivalent durable generation token tied to the reviewed head SHA.

Before a worker performs any externally visible action, it must prove that its generation is still current. A stale worker must transition to `SUPERSEDED` or `STALE_WORK` and must not publish findings.

The check is required at minimum:

1. immediately before aggregation commits canonical findings;
2. immediately before policy/publication authorization;
3. immediately before each external publication mutation.

A queue retry cannot resurrect an older head generation merely because the older attempt remains physically runnable.

## 15. Publication reconciliation contract

Publication uses a deterministic `publication_id` and a durable reconciliation state:

```text
NOT_STARTED
  -> REQUESTED
  -> CONFIRMED
  -> UNCERTAIN
  -> RECONCILING
  -> CONFIRMED | NOT_PUBLISHED | TERMINAL_FAILURE
```

`UNCERTAIN` means the client cannot prove whether GitHub accepted the mutation, such as a timeout after the request was sent. The system must reconcile GitHub state using stable identity and current commit context before retrying.

Inline publication failures caused by an outdated line/range must not be silently converted into a new inline target. The adapter may fall back to a summary surface only when policy permits it, and the durable record must retain the reason for the fallback.

## 16. Snapshot-consistent retrieval contract

Every review pass binds to a repository snapshot identified by at least:

- repository ID;
- reviewed head SHA;
- base SHA when needed for diff semantics;
- repository index version;
- context-assembly version.

Retrieved evidence is admissible only when its snapshot identity matches the review pass or when an explicit compatibility rule marks it as safe. A moving index must never silently turn mixed-commit evidence into one current-head conclusion.

If snapshot alignment cannot be established, the system marks the context stale/unknown and routes the review through a degraded or HITL path instead of treating it as fully evidenced.
