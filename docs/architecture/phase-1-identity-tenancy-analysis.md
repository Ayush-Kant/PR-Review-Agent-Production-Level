# Phase 1 — Review Identity and Tenancy Analysis

Status: **DRAFT / TECHNICAL VERIFICATION**

This document resolves the technical shape of TDEC-003 without granting dashboard users repository authority beyond the GitHub App installation.

## 1. External authorization facts

A GitHub App installation grants the app access to an account or organization and to the repositories selected for that installation. Installation access is distinct from user authorization: installing an app grants repository/account resource access to the app, while user authorization identifies a user and allows actions on that user's behalf.

The system therefore must not collapse these concepts into one user or tenant identifier.

## 2. Proposed identity layers

### Installation identity

`github_installation_id`

The durable external authorization boundary for repository access. Every privileged GitHub API operation must resolve through an installation context whose repository scope permits the target repository.

### Installation target

`github_target_type` + `github_target_id`

Represents the GitHub personal account or organization on which the App is installed. This is useful for onboarding, account-level controls, and auditing but is not a substitute for repository scope.

### Repository identity

`github_repository_id`

The stable GitHub repository identifier. Review execution is scoped to the repository plus the authorized installation.

### Application tenant

`tenant_id`

Internal application security/billing/isolation boundary. One tenant may eventually contain multiple GitHub installations or repositories, but repository authorization must still be checked against the corresponding installation context.

For the initial product, a conservative mapping is acceptable: the tenant owns application configuration and users; installation records establish GitHub access; repositories reference their authorized installation.

### Application user

`user_id`

Internal identity for browser/HITL authorization. It may originate from GitHub login initially. A user record does not itself grant repository access.

### Logical review identity

`review_id`

Internal durable identity for one logical review target. Proposed natural binding:

`tenant_id + github_installation_id + github_repository_id + github_pr_number`

The current PR head SHA is review-version state, not part of the permanent logical review identity.

### Review pass/run identity

`review_pass_id` / `review_run_id`

Each actual analysis execution receives a unique run identity under the logical review. A new head SHA supersedes the previous pass while preserving historical evidence. Large-PR multi-pass executions remain children of one logical review.

## 3. Idempotency model

Webhook delivery ID is a transport-level idempotency key.

Logical review identity prevents creation of unrelated reviews for the same PR.

Head SHA plus trigger/action semantics determine whether a new pass is required.

Proposed uniqueness constraints:

- one installation/repository mapping for an authorized repository context;
- one logical review for a tenant + installation + repository + PR number;
- one ingress record per GitHub delivery ID;
- one active or superseding review pass per logical review/head/action generation according to the final event state machine;
- one publication attempt identity per finding/review destination/version.

Exact database constraints and race handling remain P1-10/P1-11 work.

## 4. Authorization rule

For every privileged repository operation:

1. resolve the logical review/repository;
2. resolve its GitHub App installation;
3. verify that the repository is inside the installation's granted scope;
4. mint/use an installation access token with no broader repository/permission scope than required;
5. perform the operation under an auditable review/run context.

A browser session, tenant membership, or dashboard visibility alone never authorizes repository access.

## 5. Multi-installation and future enterprise cases

The model intentionally allows the same application tenant to own multiple installations while keeping installation boundaries explicit. This supports organizations that connect multiple GitHub accounts/orgs without forcing a one-installation-per-tenant assumption.

The system must also tolerate one GitHub repository being unavailable to an installation after uninstall or repository-scope changes. Such changes must cause access checks to fail closed and must not reuse stale credentials.

## 6. Recommendation

Adopt the six-layer model:

`tenant → user / installation → repository → logical review → review pass/run`

with GitHub installation identity as the privileged repository-access boundary and user identity as the HITL/application-authorization boundary.

This resolves TDEC-003 at the architecture level while leaving exact table names, foreign keys, lifecycle-state transitions, and uninstall/race recovery to the executable data/reliability tasks.

## 7. External evidence

GitHub documentation verified on 2026-09-14 distinguishes App installation permissions from user authorization and states that installation access can be limited to selected repositories. Installation access tokens are bounded by the installation's granted repositories and permissions and expire after one hour.
