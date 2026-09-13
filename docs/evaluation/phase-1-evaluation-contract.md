# Phase 1 Evaluation Contract

Status: planning artifact; evaluation implementation is deferred until Genesis permits implementation work.

## Goal

Establish how review quality, retrieval quality, confidence calibration, policy routing, and economic behavior will be measured without contaminating holdout evidence.

## Dataset partitions

### Development set

May be inspected and iterated against during prompt, retrieval, parser, and policy development.

### Holdout set

Must be access-controlled and immutable from the candidate review system. It is evaluated only after a candidate is frozen for a measurement cycle.

### Regression fixtures

Small deterministic cases for unit/integration behavior such as duplicate webhook deliveries, stale evidence, missing provenance, publication retries, critical findings, policy disputes, budget exhaustion, and evaluator isolation.

## Retrieval metrics

At minimum:

- recall@k for relevant code spans;
- precision of top-k evidence;
- reciprocal-rank quality;
- freshness correctness;
- parser coverage by target language;
- latency per retrieval path;
- storage/cost footprint.

Embedding model and vector dimension are selected only after the benchmark produces evidence across representative target ecosystems.

## Finding quality metrics

At minimum:

- precision and recall by severity;
- evidence attribution correctness;
- duplicate rate;
- stale-evidence rate;
- unsupported-claim rate;
- specialist agreement/disagreement;
- publication eligibility error rate.

Metrics must be broken out by specialist and target language where sample size supports it.

## Confidence calibration

Confidence must be evaluated as a routing signal, not accepted as truth. Measure calibration error, coverage at confidence thresholds, false-positive rate at each autonomy band, and critical-finding miss rate.

The initial autonomy policy should use conservative thresholds. Moving toward a richer evidence-plus-calibration matrix requires a measured improvement over the baseline and independent review.

## Policy evaluation

Every evaluation case records:

- input review characteristics;
- evidence completeness;
- freshness status;
- specialist outputs;
- calibrated confidence;
- policy version;
- repository-specific policy overlay;
- expected route;
- actual route;
- whether human escalation occurred;
- whether publication was permitted.

A policy change cannot be promoted merely because one case looks better.

## Evaluator isolation

The candidate system must not have write access to the evaluator or holdout dataset. Evaluation runs should consume immutable snapshots and emit results into a separate evidence location.

A successful evaluation is not sufficient by itself for promotion. Promotion also requires independent review, explicit human authorization, and a rollback path.

## Economic evaluation

Track review-level and specialist-level cost, retries, model latency, token usage where provided by the provider, cache effects, degraded-path frequency, and budget-block frequency.

A more accurate but much more expensive policy is not automatically an improvement; product economics are a first-class evaluation dimension.

## Acceptance baseline

The first benchmark release should establish a baseline before optimization. Claims of improvement must compare the same evaluation cases and policy scope, with no development data leaking into holdout.

## Future experiment record

```text
Experiment {
  experiment_id;
  baseline_version;
  candidate_version;
  dataset_snapshot;
  evaluator_version;
  metrics;
  regressions;
  independent_review;
  human_promotion;
  rollback_plan;
}
```

No experiment result automatically changes production policy.
