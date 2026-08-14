# ADR-002: Passwortschutz via Flask-Session + Secrets.env-Passwort

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Die App ist aus dem Internet erreichbar und hat einen kostenpflichtigen Claude-API-Endpunkt (`/api/ask`). Ohne Zugriffsschutz könnte jede:r im Internet unbegrenzt Anfragen stellen und Kosten verursachen.

## Entscheidung

Ein einfaches, gemeinsames Passwort (`ORGKOMPASS_PASSWORD` in `/etc/pka/secrets.env`), geprüft via `hmac.compare_digest`, mit Flask-Session (30 Tage gültig, `HttpOnly`-Cookie). `manifest.json`, Icons und `sw.js` bleiben ungeschützt (PWA-Installation vor Login möglich), die eigentliche App und `/api/ask` sind geschützt.

## Begründung

- Kein Multi-User-System nötig — es handelt sich um ein geteiltes Passwort, kein individuelles Konto.
- `Claude-Remote/app.py` nutzt bereits ein ähnliches Flask-Session-Pattern (dort mit `htpasswd`-Datei) — die Grundidee (Session + `login_required`-Decorator) wird übernommen, aber vereinfacht.

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| nginx BasicAuth (htpasswd auf Webserver-Ebene) | Zusätzliche Konfigurationsebene außerhalb der App; erschwert das eigene Login-Flow-Design (z. B. PWA-Installation vor Login) |
| htpasswd-Datei wie bei Claude-Remote | Overhead für einen einzigen geteilten Zugang nicht gerechtfertigt — ein einzelnes Passwort in `secrets.env` reicht |
| Komplett offen (kein Schutz) | Bei aktiver Nutzung würde ein öffentlicher, ungeschützter Claude-API-Endpunkt unkontrollierbare Kosten verursachen — von Josef in dieser Session explizit abgelehnt |

## Gilt unter

Gilt, solange die App einen kostenpflichtigen API-Endpunkt hat und für einen kleinen, bekannten Nutzerkreis (Josef selbst, ggf. wenige weitere Personen) gedacht ist. Bei größerem Nutzerkreis oder individuellen Konten müsste dies neu bewertet werden (echtes Auth-System).

## Konsequenzen

- Einfache Implementierung, aber kein Passwort-Reset-Flow, keine Multi-User-Trennung.
- Zusätzliche Absicherung durch nginx-Rate-Limit (`claude_zone`) und Kosten-Tracking mit Hard-Kill (siehe Implementierungsplan) — der Passwortschutz ist eine von mehreren Schutzebenen, nicht die einzige.
