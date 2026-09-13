# Phase 1 Requirement Traceability Matrix

Status: planning evidence; final verification remains subject to Genesis plan check and independent review.

## Traceability rule

Every approved specification requirement must map to at least one canonical Genesis task. Architecture evidence below identifies the contract/document that explains the intended behavior and the task that owns executable proof.

## Functional requirements

| Requirement | Planning owner | Architecture evidence | Verification intent |
|---|---|---|---|
| FR-001 | P1-03, P1-13 | GitHub boundary + security contract | authenticated webhook ingress; adversarial boundary cases |
| FR-002 | P1-02, P1-03 | review identity/idempotency | duplicate delivery and superseding-head scenarios |
| FR-003 | P1-05 | retrieval contract | current PR diff + repository context with freshness |
| FR-004 | P1-05, P1-06 | hybrid retrieval + benchmark | vector/lexical retrieval and benchmark evidence |
| FR-005 | P1-07 | specialist boundary | four typed evidence-producing specialists |
| FR-006 | P1-07 | canonical finding contract | evidence/provenance validation |
| FR-007 | P1-07 | aggregation contract | normalization, deduplication, reconciliation |
| FR-008 | P1-08 | autonomy policy | deterministic confidence/policy routing |
| FR-009 | P1-08, P1-15 | HITL contract | authorized approve/reject/dispute/reanalysis |
| FR-010 | P1-02, P1-09 | publication contract | stable publication identity and commit anchoring |
| FR-011 | P1-10, P1-12 | durable data + cost contracts | review/findings/events/cost/latency evidence |
| FR-012 | P1-12 | BudgetGuard | cost gate before expensive model work |
| FR-013 | P1-04, P1-11 | workflow + degradation contract | retry, timeout, checkpoint, DLQ and uncertain-side-effect states |
| FR-014 | P1-09, P1-15 | publication/operator contract | observable review and publication status |
| FR-015 | P1-06, P1-14 | evaluation contract | dev/holdout retrieval and review benchmark |
| FR-016 | P1-08, P1-14 | policy/evaluation contracts | versioned policy and measured promotion |
| FR-017 | P1-02, P1-10, P1-14 | identity/lineage/evaluation | reproducible context and lineage |
| FR-018 | P1-13 | tool boundary | scoped, authorized capabilities |

## Non-functional requirements

| Requirement | Planning owner | Primary evidence |
|---|---|---|
| NFR-001 | P1-03, P1-13, P1-16 | security and cloud boundary |
| NFR-002 | P1-07, P1-08, P1-13 | finding/policy/trust contracts |
| NFR-003 | P1-04, P1-11, P1-16 | workflow reliability + cloud topology |
| NFR-004 | P1-02, P1-03, P1-09, P1-11 | idempotency/publication/reliability |
| NFR-005 | P1-07, P1-09, P1-15 | evidence/publication/operator UX |
| NFR-006 | P1-04, P1-05, P1-06, P1-11, P1-12, P1-16 | retrieval/workflow/economics/cloud |
| NFR-007 | P1-10, P1-12 | durable data + budget evidence |
| NFR-008 | P1-06, P1-14 | benchmark/evaluation integrity |
| NFR-009 | P1-01, P1-04, P1-17 | architecture dependency boundary |
| NFR-010 | P1-02, P1-10, P1-16 | tenancy, lineage, cloud |
| NFR-011 | P1-02, P1-09, P1-10, P1-14 | idempotency, publication, lineage, evaluation |
| NFR-012 | P1-02, P1-08, P1-13, P1-15 | authorization, HITL, trust boundary |
| NFR-013 | P1-04, P1-05, P1-11 | workflow/retrieval/reliability |
| NFR-014 | P1-10, P1-13, P1-16 | lineage, security, cloud |
| NFR-015 | P1-01, P1-06, P1-07, P1-14, P1-17 | architecture, retrieval, finding, evaluation, ADRs |

## Acceptance criteria

| Requirement | Planning owner | Acceptance evidence |
|---|---|---|
| AC-001 | P1-02, P1-17 | cold-session identity and durable architecture/handoff |
| AC-002 | P1-01, P1-17, P1-18 | complete requirement-linked plan and traceability |
| AC-003 | P1-01, P1-17, P1-18, P1-19 | bounded executable gates plus independent review |
| AC-004 | P1-01, P1-03, P1-05, P1-13 | explicit trust/retrieval/GitHub boundary |
| AC-005 | P1-07 | canonical evidence-backed finding contract |
| AC-006 | P1-08, P1-09 | policy and publication gates |
| AC-007 | P1-02, P1-03, P1-09, P1-11 | duplicate event and publication idempotency |
| AC-008 | P1-02, P1-05, P1-10, P1-11, P1-12 | durable lineage, freshness, failure and cost evidence |
| AC-009 | P1-06, P1-14 | development/holdout evaluator isolation |
| AC-010 | P1-19, P1-20 | independent review followed by explicit human Genesis green gate |

## Orphan check

No approved requirement is intentionally left without a task owner. P1-18 is the end-to-end traceability task for the main requirements, P1-19 is the independent review boundary, and P1-20 owns the final human approval boundary.

## Important distinction

This matrix is supporting evidence. It does not change the canonical requirement coverage used by Genesis. The actual plan status remains determined by `.genesis/project.json` and the official Genesis CLI.
