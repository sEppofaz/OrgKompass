import os
from pathlib import Path

SECRETS_FILE = Path("/etc/pka/secrets.env")


def load_secrets() -> dict:
    """Lädt KEY=VALUE-Zeilen aus /etc/pka/secrets.env.
    Lokal (kein Server-Zugriff) fällt jeder Key auf os.environ zurück."""
    secrets = {}
    if SECRETS_FILE.exists():
        for line in SECRETS_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            secrets[key.strip()] = value.strip()
    for key in ("CLAUDE_API_KEY", "ORGKOMPASS_PASSWORD"):
        secrets.setdefault(key, os.environ.get(key, ""))
    return secrets
