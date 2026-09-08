"""Deterministic backend primitives for authorized intelligence workflows.

This module deliberately performs no shell execution and no arbitrary network
requests. Provider adapters can replace the deterministic findings at a server
boundary after authorization, rate limiting, and audit controls are installed.
"""

from __future__ import annotations

import hashlib
import ipaddress
import re
from datetime import datetime, timezone
from urllib.parse import urlparse

COMMANDS = {
    "domain", "infra", "infra-history", "subdomains", "dns", "ip", "asn",
    "whois", "cert", "archive", "url", "person", "organization", "entity",
    "geo", "investigate", "graph", "timeline", "pivot", "case", "evidence",
    "report", "search", "web", "news", "username", "email", "phone",
    "footprint", "recon", "document", "media", "image", "status", "history",
}
DOMAIN_RE = re.compile(r"^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$", re.I)


def _validate(command: str, target: str) -> str:
    value = target.strip()
    if not value:
        raise ValueError("target is required")
    if command in {"domain", "infra", "infra-history", "subdomains", "dns", "whois", "cert", "archive", "recon"}:
        value = value.removeprefix("domain ").lower().rstrip(".")
        if not DOMAIN_RE.fullmatch(value):
            raise ValueError("a valid public domain name is required")
    elif command == "ip":
        value = str(ipaddress.ip_address(value))
    elif command == "asn":
        number = value.upper().removeprefix("AS")
        if not number.isdigit() or not 0 <= int(number) <= 4_294_967_295:
            raise ValueError("a valid ASN is required")
        value = f"AS{number}"
    elif command == "url":
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise ValueError("an HTTP(S) URL is required")
    return value


def execute(command: str, target: str) -> dict[str, object]:
    """Validate and create an auditable, provider-neutral workflow result."""
    command = command.lower().strip()
    if command not in COMMANDS:
        raise ValueError(f"unknown application command: {command}")
    value = _validate(command, target)
    now = datetime.now(timezone.utc).isoformat()
    run_id = "PY-" + hashlib.sha256(f"{command}:{value}".encode()).hexdigest()[:12].upper()
    return {
        "runId": run_id,
        "command": command,
        "target": value,
        "status": "complete",
        "retrievedAt": now,
        "provider": "SAFE_DETERMINISTIC_ADAPTER",
        "stages": ["VALIDATE", "NORMALIZE", "CORRELATE", "PROVENANCE"],
        "findings": [{
            "id": f"{run_id}-F1", "label": "Normalized public target", "value": value,
            "source": "analyst input", "retrievedAt": now, "confidence": "HIGH",
        }],
        "notice": "No operating-system command or unauthorized access was performed.",
    }
