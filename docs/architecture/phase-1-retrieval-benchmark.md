# Phase 1 — Retrieval and Embedding Benchmark Specification

Status: **DRAFT / TECHNICAL VERIFICATION**

This specification operationalizes TDEC-004. It deliberately does not freeze an embedding provider, model, or vector dimension before measured evaluation.

## 1. Goal

Select the retrieval configuration that gives the best evidence quality for PR review under explicit quality, latency, cost, storage, and compatibility constraints.

The benchmark evaluates the complete first-stage retrieval behavior, not embeddings in isolation:

`query → vector retrieval + keyword retrieval → fusion → top-k evidence`

A candidate may only become the production embedding choice after the benchmark report, compatibility verification, and independent review are complete.

## 2. Candidate classes

The benchmark should include at least:

1. a provider-neutral baseline embedding;
2. a current code-focused embedding candidate;
3. a current general-purpose embedding candidate;
4. a lower-cost/low-latency candidate.

Current external documentation makes `voyage-code-4` a relevant code-retrieval candidate, while `voyage-4`/`voyage-4-lite` provide general-purpose alternatives. Cohere documents `embed-v4.0` with selectable dimensions. Candidate inclusion remains subject to API availability, data-policy compatibility, and measured cost.

The benchmark must not assume that a vendor's published quality claim transfers directly to this PR-review workload.

## 3. Dataset composition

The development benchmark should contain representative repositories or repository slices covering:

- Python / AI-ML;
- JavaScript / TypeScript;
- Java / Spring Boot;
- MERN / PERN / modern JS/TS;
- mixed-language repositories where cross-file context matters.

Each case should contain:

- a changed-code fragment or PR diff;
- one or more retrieval queries derived from realistic reviewer questions;
- gold evidence files/chunks/symbols;
- optionally hard negatives that contain similar vocabulary but are semantically irrelevant.

The holdout set must be independently selected and unavailable to candidate-selection code.

## 4. Query families

At minimum, include:

- exact symbol/reference queries;
- behavioral/conceptual queries;
- security-impact queries;
- test-location queries;
- API/contract queries;
- configuration/deployment dependency queries;
- cross-file architecture queries;
- historical/procedural convention queries where such records are intentionally indexed.

## 5. Metrics

Primary retrieval metrics:

- Recall@k;
- Precision@k;
- MRR;
- nDCG@k;
- evidence coverage for the changed symbol/file;
- stale-evidence rate;
- false-context rate from hard negatives.

Operational metrics:

- median and tail latency;
- embedding cost per million input tokens or equivalent provider unit;
- ingestion throughput;
- vector storage footprint;
- index build/update cost;
- query-time resource cost.

System-level metric:

- proportion of specialist review cases where the retrieved context contains at least one independently judged sufficient evidence item for the review question.

## 6. Retrieval variants

Compare at least:

A. keyword-only;
B. vector-only;
C. hybrid vector + keyword with reciprocal-rank fusion;
D. hybrid plus optional reranking only if the added cost is justified.

The production architecture should prefer the simplest configuration that reaches the required quality target rather than automatically adding a reranker.

## 7. Benchmark protocol

For every candidate and variant:

1. build indexes from the same repository snapshot;
2. run identical query sets;
3. keep top-k and fusion parameters controlled;
4. record quality, latency, cost, and storage results;
5. evaluate development data first;
6. freeze the candidate-selection configuration;
7. run the frozen configuration on holdout data using an evaluator that the candidate cannot modify;
8. retain exact model/version, dimension, chunking, index settings, and dataset fingerprints.

No candidate may read holdout labels or modify evaluator code/artifacts.

## 8. Acceptance rule

There is intentionally no arbitrary universal numeric threshold yet.

The decision should use a bounded scorecard with minimum floors for retrieval correctness and stale-evidence behavior, plus explicit maximums for latency/cost where the owner has approved them. A candidate that wins on average quality but violates a mandatory safety or evidence floor must be rejected.

The final model/dimension choice must therefore be evidence-backed and reproducible, not selected because its dimension is convenient for Postgres/vector storage.

## 9. Dimension freeze

After selecting the embedding model, record its native/default dimension and any supported reduced dimensions actually evaluated. Verify compatibility with the chosen vector extension/index strategy before freezing the database type.

Until then, `vector(N)` must not appear in authoritative schema or migration code.

## 10. Reproducibility artifact

The eventual benchmark report must include:

- dataset version/hash;
- repository/source snapshot identifiers;
- query-set hash;
- model/provider/version;
- embedding dimension;
- chunking configuration;
- vector similarity metric;
- index configuration;
- hybrid/fusion configuration;
- evaluation code version;
- development results;
- holdout results;
- cost/latency measurements;
- final recommendation and rejected alternatives.

## 11. External references consulted

Verified 2026-09-14:

- Voyage AI embedding documentation: current `voyage-4*` family and `voyage-code-4`, with supported dimensions.
- Cohere Embed documentation: current `embed-v4.0` and selectable dimensions.
- Voyage reranker documentation: reranking is a distinct second-stage retrieval component and therefore must be justified by measured benefit.

## 12. Recommendation

Start with a small, representative development corpus and a frozen set of reviewer-style queries. Compare hybrid retrieval against vector-only and keyword-only baselines before investing in a reranker or higher-dimensional storage. Select the embedding model only after the holdout evaluation confirms the choice.
