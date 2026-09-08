# PEGASUS ZONA 0.2.0

**Intelligence Fusion & Verification Layer** is a defensive OSINT console for public, owned, or explicitly authorized data. Version 0.2 adds stateful watch/change/alert, claim-review, evidence-integrity, entity-review, governance, reporting, and evidence-bound AI workflows while retaining every 0.1 command.

## Run

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

The default providers are deterministic local demonstration providers and are always labeled **MOCK**. Configure future provider adapters through environment variables; never commit tokens. No real external result is implied by demo output.

## Command reference

Press **Ctrl+K** or run `help`. Major command families are `dashboard`, `watch`, `changes`, `alert`, `claim`, `source`, `resolve`, `entity`, `org`, `ioc`, `cve`, `threat`, `exposure`, `collection`, `capture`, `evidence`, `note`, `hypothesis`, `question`, `lead`, `playbook`, `report`, `access`, `audit`, `retention`, `redaction`, `ask`, and `ai`. Existing search, phone, email, username, media, document, domain, graph, and timeline commands remain available.

Example end-to-end workflows:

```text
watch add domain example.com
changes domain example.com --since 30d
alert list
claim create "A public claim"
claim verify CLAIM-001
capture url https://example.com
 evidence verify E-001
 evidence redact E-001
entity merge E-101 E-202 --review
report create CASE-2026-001
report export REP-001 --format json
```

## Security and limitations

The parser accepts application workflows, never operating-system commands, and rejects shell separators and harmful-action language. Collection is passive: there is no active scan, login attempt, payload, exploitation, malware execution, or live location tracking. URLs and files require a future allow-listed provider before network retrieval. Sensitive exposure fields are masked. Evidence originals are immutable; annotations and redactions create newly hashed derivatives. Entity merges are proposals until analyst review. AI output is evidence-bound and returns an explicit limitation instead of manufacturing a conclusion. The in-browser store is a development persistence layer, not an accredited evidence repository; production deployments must connect append-only storage, RBAC identity, retention, rate limiting, SSRF egress controls, timeouts, retry policy, and approved PDF/DOCX/STIX renderers.

All timestamps are stored in UTC. The UI may render locale time for the analyst. Exports require provenance and analyst approval.
