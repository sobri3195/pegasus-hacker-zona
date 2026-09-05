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

The original Phase 1 baseline had no database migration or HTTP route because neither Prisma nor a persistent application server was present. Phone Intelligence Phase 1–2 adds narrowly scoped Vercel functions; broader command persistence still requires session RBAC, durable rate limiting, audit persistence, and server-side provider credentials.

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

## Phone Intelligence Indonesia (Phase 1–2)

`phone` commands reuse the command parser, workspace result, graph, timeline, evidence, and case action surfaces. The normalization and prefix allocation dataset live in `src/modules/phone`; public search is behind a provider adapter. Browser code never receives search credentials. `api/zona/phone/lookup.js` selects Serper or Brave from server-side environment variables, applies request throttling, query deduplication, HTTPS URL checks, timeouts, and result deduplication. Without configuration the client uses safe mock data only for `+6281200000000`; every other number returns an honest empty-footprint state.

Supported commands: `phone <number>`, `phone lookup`, `phone footprint`, `phone web`, `phone documents`, `phone graph`, `phone timeline`, `phone evidence`, and `phone pivot`.
