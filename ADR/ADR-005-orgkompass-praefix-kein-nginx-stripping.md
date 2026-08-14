# ADR-005: Flask-Routen mit /orgkompass-Präfix, nginx ohne Pfad-Stripping

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Beim Deployment (Phase 6) musste OrgKompass unter `https://umbenennen.duckdns.org/orgkompass/` erreichbar gemacht werden, während `app.py` intern ursprünglich Routen ohne Präfix registrierte (`/`, `/login`, `/api/ask`, …). Zwei nginx-Muster sind auf dem Server bereits etabliert:

1. **Pfad-Stripping** (`/newsletter/` → `proxy_pass http://127.0.0.1:5006/;`): Flask-App hat Routen ohne Präfix, nginx schneidet den Präfix beim Weiterleiten ab.
2. **Kein Stripping** (`/sentiment/` → `proxy_pass http://127.0.0.1:5005/sentiment/;`): Flask-App hat den Präfix selbst in jeder Route.

## Entscheidung

Muster 2 gewählt: Alle Flask-Routen in `app.py` sind selbst mit `/orgkompass`-Präfix registriert (`PREFIX = "/orgkompass"`, `@app.route(f"{PREFIX}/...")`), nginx proxied ohne Stripping.

## Begründung

OrgKompass hat (anders als Newsletter Digest) eine eigene Login/Session-Logik mit `redirect()`-Aufrufen. Flask-`redirect()` mit absolutem Pfad (`redirect("/login")`) erzeugt einen `Location`-Header, der vom Browser relativ zur **Domain-Root** aufgelöst wird — nicht relativ zum nginx-Location-Präfix. Würde nginx den Präfix strippen (Muster 1), landete ein Redirect nach dem Login auf `https://umbenennen.duckdns.org/login` statt `https://umbenennen.duckdns.org/orgkompass/login` — ein funktionaler Bug, der erst beim tatsächlichen Login-Flow auffällt, nicht bei einfachen GET-Tests auf einzelne Routen.

`sentiment-scanner` hat exakt dasselbe Problem (Login/Redirects) und löst es bereits mit Muster 2 — als Referenzimplementierung übernommen.

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Pfad-Stripping (wie `/newsletter/`) | Bricht Login-Redirects, da Flask `redirect()` absolute Pfade relativ zur Domain-Root auflöst, nicht relativ zum nginx-Präfix |
| Flask `APPLICATION_ROOT`/`SCRIPT_NAME`-Mechanismus (WSGI-Standard für Sub-Path-Mounting) | Zusätzliche Komplexität (WSGI-Middleware/`ProxyFix` nötig), kein bestehendes Referenzmuster im Projekt, während die explizite Präfix-in-Route-Variante bereits bei `sentiment-scanner` bewährt ist |

## Gilt unter

Gilt, solange OrgKompass unter einem Sub-Path (`/orgkompass/`) statt einer eigenen Subdomain läuft. Bei jeder neuen Route: Präfix nicht vergessen (`f"{PREFIX}/..."`), sonst funktioniert die Route hinter nginx nicht (404).

## Konsequenzen

- Jede neue Backend-Route und jeder `redirect()`-Aufruf muss den Präfix explizit führen — leicht zu vergessen, daher als Pitfall in `CLAUDE.md` festgehalten.
- Frontend-Code mit absoluten Pfaden (`fetch()`, Formular-`action`, `window.location.href`) muss ebenfalls den Präfix führen — betraf 3 Stellen (`login.html`, `app.js` zweimal).
- Lokale Entwicklung läuft ebenfalls unter dem Präfix (`http://127.0.0.1:5007/orgkompass/login`), nicht unter der Root — im Team/für künftige Sessions nicht sofort intuitiv, daher in `CLAUDE.md` dokumentiert.
