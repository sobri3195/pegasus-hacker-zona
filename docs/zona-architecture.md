# Pegasus Zona architecture plan

## Repository audit
The repository started as an empty Git skeleton: no existing routing, design system, authentication, database, or API could be integrated. Phase 1 therefore establishes an isolated Vite/React module without inventing production authentication or backend credentials.

The current audit confirms React Router owns the `/zona` workspace and module placeholders, Zustand owns ephemeral analyst state, and Tailwind utility classes form the component system. There is still no Prisma schema, server runtime, authentication middleware, or API route layer in this repository. Phase 1 therefore stays behind a typed provider/service boundary rather than presenting a browser mock as a secured server API. The visible analyst identity and case are demo context, not authentication or RBAC.

## Phase 1 implementation
- `footprint <domain|username|organization> <target>` creates a structured discovery result with per-finding provenance, entities, evidence-backed relationships, timeline events, and explainable confidence.
- `recon domain <target>` executes the deterministic WHOIS-to-correlation pipeline and reports stage progress and totals.
- `domain <target>` now opens the same structured workspace and PEGASUS SMART PIVOT recommendations.
- The safe mock adapter validates domain inputs and uses documentation-only IP space. It never performs an arbitrary external fetch.
- Result actions update auditable workspace state; graph, timeline, and evidence actions open working views, while pivot queue/ignore controls persist for the session.

No database migration or HTTP route was added: neither Prisma nor a server exists in this frontend-only baseline. A future backend should expose `POST /api/zona/commands`, `/footprint`, `/recon`, and `/pivot` only after session RBAC, rate limiting, cancellation, audit persistence, and server-side provider credentials are available.

## Boundaries
The console parses an application command language only; it never invokes an operating-system shell. A deny-list guard rejects offensive access, credential, malware, phishing, tracking, and exploitation intents. Phase 1 providers are deterministic fictional mocks using reserved `.example`/`.test` domains and documentation IP ranges.

## Modules and future seams
- `modules/command`: registry, parser, validation, safe mock executor, UI, autocomplete, keyboard history and internal pipelines.
- `modules/providers`: provider-neutral TypeScript contract; future API-backed adapters keep secrets server-side.
- `stores`: local workspace state, ready to swap persistence behind an API boundary.
- Future backend: Fastify + Prisma/PostgreSQL, session RBAC, append-only audit events, provider workers and SSE execution streams.
- Future phases: cases/entities/evidence; relationship/timeline/geo; authorized providers; reporting/RBAC/audit.

## Security model
All future external retrieval must be server-side through allow-listed provider adapters, scoped credentials, rate limits, structured audit events, and case authorization. Relationship assertions must retain source, timestamp, confidence, and analyst validation. Analysts cannot delete audit records.
