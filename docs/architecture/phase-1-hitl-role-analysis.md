# Phase 1 — HITL Role Matrix Analysis

Status: **PROPOSED / OWNER DECISION REQUIRED**

## 1. Goal

Provide the smallest authorization model that supports review approval, rejection, dispute, policy management, and auditability without coupling the product to GitHub-only permissions.

## 2. Option A — Two application roles

### Reviewer
- inspect findings/evidence;
- approve/reject HITL findings;
- dispute findings;
- view review history for authorized repositories.

### Repository administrator
- all Reviewer capabilities;
- install/configure repository integration;
- manage repository autonomy policy;
- manage repository-level retention/configuration where allowed.

Platform/operator remains an internal operational role outside customer RBAC.

Advantages: easy to understand, low complexity.

### Option B — Three customer roles

Reviewer, Repository administrator, and Policy administrator.

Policy administrator can change autonomy/retention/publication policy but cannot change installation ownership.

Advantages: stronger separation of duties for organizations.

Cost: more UX and authorization complexity.

### Option C — Fine-grained capability permissions

Roles are bundles of explicit capabilities such as `review.read`, `review.decide`, `policy.write`, `integration.write`, `audit.read`.

Advantages: best enterprise extensibility.

Cost: highest complexity and requires more careful UX/audit semantics.

## 3. Recommendation

Start with **Option A behind an internal capability-based authorization interface**.

This preserves the simple initial UX while allowing a future enterprise deployment to map richer roles/capabilities without changing domain models.

Global safety invariants must not be weakenable by repository administrators. In particular, no customer role can grant agents unrestricted repository write or arbitrary code execution.

## 4. Required authorization checks

Every HITL operation must evaluate:

`authenticated_user → application role/capability → tenant → repository authorization → target review/finding → requested action`

The result and policy version must be auditable.

## 5. Owner decision

Select A, B, or C before P1-15 becomes the final UX/authorization implementation contract.
