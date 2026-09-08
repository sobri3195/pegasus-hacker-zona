# Persona Intelligence v0.3.0

## Implementation plan and changed surface

Repository audit found the shared command parser/executor, entity/result types, provenance-first evidence views, relationship graph, timeline, fusion watch/alert/report commands, and the routed React workspace. The implementation extends—rather than replaces—those surfaces.

- `src/types/command.ts`: person/profile result and confidence contracts.
- `src/modules/persona/personaService.ts`: purpose, authorization, scope, immutable-style audit events, analyst gate, and person seed commands.
- `src/modules/persona/providers.ts`: per-platform provider abstraction and restricted-provider fallback.
- `src/modules/persona/PersonaWorkspace.tsx`: three-panel public social media OSINT workspace.
- `src/modules/command/*`: command registration and execution integration.
- `src/App.tsx` and `src/components/layout/Sidebar.tsx`: routed module navigation.
- `src/modules/persona/__tests__/*`: authorization, scope, provenance, and no-auto-confirm tests.

Collection adapters intentionally return no fabricated candidates. Restricted platforms direct the analyst to official search and lawful manual evidence attachment. A production adapter must use official APIs where available, enforce rate limits, cache, timeout/retry, robots and terms policy, sanitize output, and preserve a SHA-256 snapshot before it can be marked available.

Identity merges and platform reports are never automatic. Public interaction edges describe observable events only; they do not infer private relationships. Reports must pass the existing evidence and redaction workflows, with `external-redacted` masking personal contacts, addresses, coordinates, identifiers, family/minor data, health data, private usernames, and secrets.
