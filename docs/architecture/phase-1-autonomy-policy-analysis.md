# Phase 1 — Autonomy, Confidence, and HITL Policy Analysis

Status: **PROPOSED / OWNER DECISION REQUIRED**

This document translates the Phase 0 autonomy decision into a deterministic policy boundary. It does not silently choose final product behavior.

## 1. Non-negotiable constraints

- Autonomy is decided by deterministic application policy, not by LLM-generated instructions.
- LLM confidence is a routing signal, never proof of truth.
- Critical-impact, low-confidence, disputed, and policy-sensitive findings must be eligible for HITL.
- Repository-specific policy may be stricter than the global default.
- The aggregator is the only authority allowed to route findings toward publication or HITL.
- Policy changes must be versioned, auditable, evaluated, and reversible.

## 2. Candidate policies

### Option A — Conservative severity-first

- CRITICAL: always HITL.
- HIGH: HITL by default.
- MEDIUM: eligible for automatic publication only after evidence completeness and calibrated confidence checks pass.
- LOW: eligible for automatic publication after evidence completeness and calibrated confidence checks pass.
- Any dispute, policy-sensitive category, missing provenance, stale retrieval, or incomplete specialist coverage: HITL/block.

Advantages: easiest to explain, safest early production posture, low risk of over-trusting model confidence.

Cost: fewer automatic findings until calibration is strong.

### Option B — Evidence + calibrated confidence matrix

Use severity, evidence completeness, calibrated probability, specialist agreement, retrieval freshness, and repository policy together.

Advantages: higher eventual automation ceiling and better use of measured model reliability.

Cost: substantially more evaluation work; threshold mistakes can create silent false publication risk.

### Option C — Per-repository policy from day one

Expose a fully configurable matrix of severity/confidence/evidence thresholds per repository.

Advantages: maximum customization.

Cost: more UX complexity, more configuration mistakes, harder supportability, and larger evaluation surface.

## 3. Recommendation

Use **Option A as the initial production default**, while designing the policy engine so Option B can be introduced after calibration evidence.

Recommended initial invariant set:

1. CRITICAL never auto-publishes.
2. Missing or unverifiable evidence never auto-publishes.
3. Stale or incomplete retrieval cannot be treated as fresh/full evidence.
4. A disputed finding cannot auto-publish again without an explicit new review state.
5. Policy-sensitive categories can force HITL regardless of confidence.
6. Repository configuration may tighten policy but may not weaken global safety invariants.
7. Every decision records policy version, evidence state, confidence inputs, and routing result.

Exact confidence thresholds should remain an evaluation output, not a guessed constant.

## 4. Required policy input model

The final implementation should operate on a typed policy input containing at least:

- repository policy version;
- finding severity/category;
- calibrated confidence (if available);
- evidence completeness;
- repository freshness/index health;
- specialist coverage/partial-failure state;
- dispute state;
- critical-impact flag;
- policy-sensitive flag;
- publication surface capability;
- current budget/reliability state.

## 5. Required audit output

A routing decision must be reproducible from durable data:

`review_id + finding_id + policy_version + evidence_state + confidence_state + routing_result + reason`

The policy engine itself must not call an LLM.

## 6. Owner decision

The product owner should select A, B, or C before P1-08 becomes an implementation contract. The repository already commits to conservative defaults and policy authority remaining outside the LLM; this document only makes the alternatives explicit.
