# OrgKompass

Lern-App für Organisationsberatung (PWA + Flask-Backend). Übergeordnete Regeln: `~/Dropbox/CLAUDE.md`, `~/Dropbox/Apps/Claude/PKA/CLAUDE.md`.

## Kurzüberblick

- **Live-URL:** `https://umbenennen.duckdns.org/orgkompass/` (nach Deployment, Phase 6)
- **GitHub:** `sEppofaz/OrgKompass`
- **Lokaler Pfad:** `~/Dropbox/Apps/Claude/OrgKompass/`
- **Server:** `/opt/orgkompass/`, systemd `orgkompass.service`, Port **5007**
- **Stack:** Vanilla-JS-PWA (kein Framework/Build-Step) + Flask-Backend (Login-Schutz + Claude-API-Proxy)

## Architektur

- `static/index.html` — App-Shell (Bottom-Tab-Navigation: Lernen/Quiz/Glossar/Frage/Fortschritt), `static/app.js` — State, Gamification, Quiz-Engine, SM-2
- `static/content/*.js` — Content als separate Dateien (nicht Single-File, siehe ADR-003): `content-core.js` zuerst, dann `content-modul-*.js`, dann `content-glossar.js`, `content-diagramme.js`. **Jede neue Content-Datei muss an zwei Stellen eingetragen werden:** `<script>`-Tag in `index.html` UND `SHELL`-Array in `sw.js` (sonst offline nicht verfügbar).
- `app.py` — Flask: Login (Session, `ORGKOMPASS_PASSWORD` aus `/etc/pka/secrets.env`), statisches Ausliefern. `/api/ask` (Claude-Proxy) folgt in Phase 6.
- `app_secrets.py` — Secrets-Loader (Name bewusst nicht `secrets.py`, um das gleichnamige Python-Stdlib-Modul nicht zu shadowen — `app.py` braucht `secrets.token_hex()` für den Session-Key).
- `costs.py` — Kosten-Tracking (folgt Phase 6, Template aus `PKA/BKM/Claude-API-Kosten-Tracking.md`).

## Design-System

Überwiegend Weiß, hellgraue Symbole/Linien/Rahmen, monochromes Farbschema (kein Farbakzent außer Quiz-Feedback Grün/Gelb/Rot — Pflicht lt. `PWA-Standards.md`). Bottom-Tab-Bar fix mit 5 Tabs. Icon-Hintergrund Graphit `#2c2c2e` mit weißem Kompass (Lucide `compass`) — Kontrast zum überwiegend weißen App-Design nötig, damit das Icon auf dem Homescreen erkennbar bleibt.

## Icon-Erstellung

**Methode A** (nicht Methode B/cairosvg wie ursprünglich geplant) — bewusste Vereinfachung: `qlmanage -t -s 1024 -o /tmp icon.svg` + `sips -z <size> <size>` lokal, PNGs werden ins Repo committed und statisch ausgeliefert. Kein Laufzeit-Icon-Generierungscode im Backend nötig (weniger Fehlerquellen, kein PermissionError-Risiko). Bei Icon-Änderung: `icon.svg` bearbeiten, PNGs neu generieren, SW-Cache-Namen hochzählen.

## SW-Cache-Name

`orgkompass-v1` (in `static/sw.js`) — bei Änderung an Icons/Manifest/sw.js hochzählen (nicht bei reinen `index.html`/Content-Änderungen).

## Deployment

Siehe `~/.claude/plans/erstelle-mir-eine-umf-ngliche-stateful-sunrise.md` (Original-Implementierungsplan) Abschnitt „Deployment-Schritte". Kurzfassung: lokal committen/pushen → `ssh root@89.167.104.145 "git -C /opt/orgkompass pull && systemctl restart orgkompass"`. `ORGKOMPASS_PASSWORD` + `CLAUDE_API_KEY` in `/etc/pka/secrets.env` — nur via `SOPs/Token-Deployment.md`, nie im Chat.

## Pitfalls

- `secrets.py` als Dateiname vermeiden (shadowt Python-Stdlib) — Projekt nutzt `app_secrets.py`.
- Content-Dateien müssen an zwei Stellen registriert werden (s.o.).
- `CLAUDE_API_KEY` (nicht `ANTHROPIC_API_KEY`) in secrets.env — projektübergreifende Namenskonvention lt. `PKA/BKM/Claude-API-Verwendung.md`.

## Offen: PWA-Standard „Tab-Leiste am unteren Bildschirmrand" nachziehen

Neuer PKA-Standard seit 2026-08-14 (`PKA/BKM/PWA-Standards.md`), bereits in 7 anderen Apps umgesetzt. Bei OrgKompass bewusst zurückgestellt, solange die App noch aktiv gebaut wird (Stand 2026-08-14: Phase 2 von 6) – bei Abschluss der App bzw. bei der nächsten größeren UI-Überarbeitung nachziehen.

## Lokale Entwicklung

```bash
cd ~/Dropbox/Apps/Claude/OrgKompass
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
ORGKOMPASS_PASSWORD=test python3 app.py   # lokal: Passwort via env var statt secrets.env
```
