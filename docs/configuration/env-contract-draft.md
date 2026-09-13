# Environment Configuration Contract — Draft

Status: DRAFT. This file defines configuration categories and safety rules. It is not a complete final `.env.example`; exact keys and required/optional status must be finalized during the relevant architecture/infrastructure phases.

## Principles

- Secrets are supplied through environment/secrets management, never source code.
- `.env` is local-only and must never be committed.
- `.env.example` will contain placeholders only.
- Startup validation should fail closed for missing required production configuration.
- Provider/model choices are configuration, not hard-coded business logic.
- Configuration values must have explicit ownership: GitHub, queue, database, LLM, retrieval, observability, economics, security, frontend, or deployment.

## Configuration categories derived from the planning source

### GitHub

Known planning-source values:
- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY_PATH`
- `GITHUB_WEBHOOK_SECRET`

Expected future additions may cover installation/token/publication behavior, but exact permission/event configuration belongs to Phase 1/3 interface design.

### Durable database

- `TIGER_DATABASE_URL`

The planning source expects an SSL-enabled Postgres-compatible connection string. Exact pool sizing, statement timeouts, migrations, retention, and extension configuration belong to database/infrastructure design.

### Redis / ARQ

Expected category:
- Redis connection URL/configuration

Exact naming and checkpoint configuration will be fixed when the queue/workflow interface is implemented.

### LLM / model providers

The planning source explicitly calls for provider/model routing and cost attribution. Exact provider defaults, API keys, embedding model, reasoning model, fallback chain, and model-specific limits remain Phase 1/5 decisions.

### Embeddings / retrieval

The source proposes a 256-dimension embedding lane and hybrid DiskANN + FTS retrieval. The exact embedding model/provider and whether the dimension is retained exactly must be verified against currently supported provider/database behavior before migrations are frozen.

### Observability

Expected category:
- tracing configuration
- event-spine configuration
- log level/output configuration
- alerting configuration

Product audit events remain in the durable event spine; infrastructure tracing must not become the sole product audit trail.

### Economics

Expected category:
- daily budget limit
- per-review budget/limit
- provider/model cost tables or configuration
- routing thresholds/advice configuration

Exact policy keys are Phase 16 decisions.

### Security

Expected category:
- secret masking/redaction configuration
- tool capability policy
- sandbox configuration
- authentication/RBAC configuration

Security-sensitive defaults must be fail-closed.

### Frontend

Expected category:
- API base URL
- allowed frontend origins
- authentication/session configuration

Exact key set belongs to frontend/backend API boundary design.

## Current planning-source concrete examples

The source gives these as examples of where configuration will eventually live:

```env
TIGER_DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require
OPENAI_API_KEY=REDACTED_PLACEHOLDER
GITHUB_APP_ID=REDACTED_PLACEHOLDER
GITHUB_WEBHOOK_SECRET=REDACTED_PLACEHOLDER
GITHUB_PRIVATE_KEY_PATH=/secure/path/to/private-key.pem
```

These are examples only, not the final contract.

## Finalization rule

Do not add a provider-specific environment variable merely because an implementation happens to use it. First identify the requirement, boundary, owner, default/absence behavior, secret classification, and verification gate.
