# ADR-001: Backend + Hetzner statt reines GitHub-Pages-Hosting

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

OrgKompass soll eine Frage-Funktion bieten, bei der Nutzer:innen Freitext-Fragen stellen und Claude über die API antwortet. Reine GitHub-Pages-Apps (wie z. B. der Vokabeltrainer) sind statisches Hosting ohne Backend — ein API-Key dürfte dort nicht clientseitig liegen.

## Entscheidung

OrgKompass bekommt ein eigenes Flask-Backend auf dem Hetzner-Server (`/opt/orgkompass/`, Port 5007), das als Proxy zwischen App und Claude-API vermittelt. Kein GitHub-Pages-Hosting.

## Begründung

- Der Claude-API-Key darf nicht im Browser sichtbar sein (Sicherheitsanforderung).
- Ein Backend erlaubt zusätzlich serverseitiges Kosten-Tracking (Hard-Kill bei Tageslimit) und den Passwortschutz für die App (siehe ADR-002).

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| GitHub Pages + Client-seitiger API-Call | API-Key wäre im Browser sichtbar und extrahierbar — inakzeptables Sicherheitsrisiko |
| Externe Serverless-Function (z. B. Cloudflare Worker) als Proxy | Zusätzlicher Anbieter/Account nötig, während der bestehende Hetzner-Server bereits alle nötigen Fähigkeiten (Flask, nginx, systemd) bietet — unnötige Komplexität |

## Gilt unter

Diese Entscheidung gilt, solange die Frage-Funktion Teil der App ist. Sollte sie entfallen, könnte eine rein statische Variante erneut geprüft werden.

## Konsequenzen

- Zusätzlicher Wartungsaufwand (systemd-Service, nginx-Location, venv) gegenüber einer reinen GitHub-Pages-App.
- Ermöglicht im Gegenzug Passwortschutz und Kosten-Tracking (siehe ADR-002).
