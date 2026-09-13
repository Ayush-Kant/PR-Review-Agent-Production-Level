# Phase 1 — GitHub Boundary Analysis

Status: **DRAFT / OWNER REVIEW PENDING**

This document records current external verification for TDEC-001 (GitHub App permissions) and TDEC-002 (webhook event matrix). It is not a final product-owner decision record.

## 1. Verified GitHub App permission principles

GitHub states that GitHub App permissions determine both API capabilities and which webhook events are available, and recommends selecting the minimum permissions required. Installation access is separately scoped to the repositories selected by the installer. The application must therefore preserve both the App installation identity and the selected repository scope.

### Proposed minimum repository permissions for the initial review path

| Permission | Proposed level | Reason | Status |
|---|---|---|---|
| Metadata | read | Repository identity and basic metadata required by normal GitHub App operations. | Proposed |
| Contents | read | Read repository files and commit/tree content used to build review context. | Proposed |
| Pull requests | write | Read PRs/diffs/comments and publish review comments/reviews. GitHub's create-review API requires Pull requests: write. | Proposed |
| Checks | write | Required only if the chosen dual publication contract includes creating/updating check runs. | Conditional |

No repository write access to source contents is proposed. No administration, workflows, secrets, variables, deployments, or security-alert write permissions are proposed for the initial review product.

### Identity implication

The App installation is the authorization boundary for repository access. User authorization may additionally be used for application identity/HITL, but a logged-in dashboard user must never expand the installation's repository scope.

## 2. Proposed webhook event matrix

The production trigger should remain centered on `pull_request`. GitHub documents that the `pull_request` webhook requires at least read-level Pull requests permission and exposes an `action` field. The following matrix is a conservative first draft.

| Event/action | Proposed behavior | Reason |
|---|---|---|
| `pull_request.opened` | Create logical review | New review target. |
| `pull_request.reopened` | Create/resume logical review | Previously closed PR is active again. |
| `pull_request.synchronize` | Supersede/refresh logical review for new head SHA | New code requires fresh analysis. |
| `pull_request.ready_for_review` | Create/refresh review | Draft becomes reviewable. |
| `pull_request.converted_to_draft` | Cancel/pause pending publication; do not start a new automatic review | PR is no longer review-ready. |
| `pull_request.closed` | Finalize/cancel active review as appropriate; never begin fresh analysis | Review target is closed. |
| `pull_request.edited` | Re-evaluate only if the change is materially relevant to review policy (decision remains open) | Avoid expensive review churn from title/body-only edits. |
| `pull_request_review.*` | Ingest human review decisions/feedback only; do not recursively start normal PR review | Supports HITL, dispute, and feedback. |
| `pull_request_review_comment.*` | Ingest human inline feedback only; no automatic review loop by default | Avoid feedback recursion. |
| `issue_comment.*` | Ingest only when the comment is part of the defined HITL/control surface; otherwise ignore | PRs are represented as issues as well. Exact control syntax is deferred. |
| `pull_request_review_thread.*` | Ingest resolution state for findings/HITL where available; no automatic recursive review by default | Supports durable review state. |

The event delivery ID must be retained for ingress idempotency; the logical review identity must additionally bind installation, repository, PR, and relevant head/event state so retries and rapid successive pushes converge correctly.

## 3. Decisions intentionally left open

1. Whether `pull_request.edited` should trigger a review when only the title/body changes.
2. Whether `Checks: write` remains mandatory for the first release if the fallback publication contract is selected.
3. Whether human review/dispute events should update the logical review immediately or only append durable feedback.
4. Exact event-to-state transition rules, cancellation races, and supersession semantics.

These are Phase 1 product/behavior decisions and must not be silently encoded by implementation code.

## 4. Evidence

GitHub documentation consulted on 2026-09-14:

- Choosing permissions for a GitHub App: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app
- Permissions required for GitHub Apps: https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps
- Pull request review REST API: https://docs.github.com/en/rest/pulls/reviews
- Pull request review comments REST API: https://docs.github.com/en/rest/pulls/comments
- Using webhooks with GitHub Apps: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps
- Webhook events and payloads: https://docs.github.com/en/webhooks/webhook-events-and-payloads
- Check runs REST API: https://docs.github.com/en/rest/checks/runs

## 5. Current recommendation

Proceed with the smallest permission set above and subscribe initially to `pull_request`. Add `Checks: write` only if the validated publication contract requires a Check Run. Keep human-feedback webhook ingestion separate from automatic review triggering so the system cannot accidentally create review loops.

This recommendation is subject to product-owner confirmation where it changes review behavior or publication UX.
