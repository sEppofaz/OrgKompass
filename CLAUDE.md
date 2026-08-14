# OrgKompass

Lern-App für Organisationsberatung (PWA + Flask-Backend). Übergeordnete Regeln: `~/Dropbox/CLAUDE.md`, `~/Dropbox/Apps/Claude/PKA/CLAUDE.md`.

## Kurzüberblick

- **Live-URL:** `https://umbenennen.duckdns.org/orgkompass/` (seit Phase 6, 2026-08-14)
- **GitHub:** `sEppofaz/OrgKompass` (public)
- **Lokaler Pfad:** `~/Dropbox/Apps/Claude/OrgKompass/`
- **Server:** `/opt/orgkompass/` (Owner `webhook:webhook`), systemd `orgkompass.service`, Port **5007**
- **Stack:** Vanilla-JS-PWA (kein Framework/Build-Step) + Flask-Backend (Login-Schutz + Claude-API-Proxy + Dropbox-Speicherung)
- **Stand:** Phase 1–3 (Content, 12 Module) + Phase 6 (Backend/Deployment) fertig. Offen: Phase 4 (Glossar-Suche verfeinern), Phase 5 (Einstufungstest + Fortschritts-Dashboard).

## Architektur

- `static/index.html` — App-Shell (Bottom-Tab-Navigation: Lernen/Quiz/Glossar/Frage/Fortschritt), `static/app.js` — State, Gamification, Quiz-Engine, SM-2, Frage-Verlauf-Akkordeon
- `static/content/*.js` — Content als separate Dateien (nicht Single-File, siehe ADR-003): `content-core.js` zuerst, dann `content-modul-01…12-*.js` (10 Kern + 2 Bonus), dann `content-glossar.js`, `content-diagramme.js`. **Jede neue Content-Datei muss an zwei Stellen eingetragen werden:** `<script>`-Tag in `index.html` UND `SHELL`-Array in `sw.js` (sonst offline nicht verfügbar).
- `app.py` — Flask, **alle Routen mit `/orgkompass`-Präfix** (`PREFIX`-Konstante, s. u.): Login (Session, `ORGKOMPASS_PASSWORD`), statisches Ausliefern, `POST /api/ask` (Claude-Proxy, Modell `claude-haiku-4-5-20251001`, Retry/Backoff bei 529, Vorab-Hard-Kill-Check), `GET /api/ask-history` (liest Frage-Verlauf aus Dropbox, strukturiert als JSON).
- `app_secrets.py` — Secrets-Loader (Name bewusst nicht `secrets.py`, um das gleichnamige Python-Stdlib-Modul nicht zu shadowen — `app.py` braucht `secrets.token_hex()` für den Session-Key).
- `costs.py` — Kosten-Tracking, 1:1-Template aus `PKA/BKM/Claude-API-Kosten-Tracking.md` + `is_hard_killed_today()` für den Vorab-Check.

## nginx-Präfix (`/orgkompass`) — wichtige Architekturentscheidung

Alle Flask-Routen sind selbst mit `/orgkompass`-Präfix registriert (`@app.route(f"{PREFIX}/...")`), nginx proxied **ohne Pfad-Stripping** (`proxy_pass http://127.0.0.1:5007/orgkompass/;`). Grund: OrgKompass hat Login/Redirects (`redirect(f"{PREFIX}/login")`) — würde nginx den Präfix strippen (wie bei `/newsletter/`, das keine Auth hat), würden Flask-Redirects mit absolutem Pfad (`/login`) auf die Domain-Root statt auf `/orgkompass/login` zeigen. Gleiches Muster wie `sentiment-scanner`. Betroffen: alle `@app.route()`, alle `redirect()`, plus 3 Frontend-Stellen mit absoluten Pfaden (`login.html` Form-Action, `app.js` `fetch()` zu `/api/ask`/`/api/ask-history`, Logout-Link).

## Design-System

Überwiegend Weiß, hellgraue Symbole/Linien/Rahmen, monochromes Farbschema (kein Farbakzent außer Quiz-Feedback Grün/Gelb/Rot — Pflicht lt. `PWA-Standards.md`). Bottom-Tab-Bar fix mit 5 Tabs. Icon-Hintergrund Graphit `#2c2c2e` mit weißem Kompass (Lucide `compass`). Seit 2026-08-14 zusätzlich Elevation/Tiefe: `--shadow-sm/md/lg`-Tokens, Gradient-Buttons (`--accent` → `--accent-soft`), Karten mit Schatten, Tab-Bar-Active-Pill (Josef-Wunsch „mehr Stil und Hochglanz" — Ergebnis von Josef noch nicht als voll gelungen bewertet, aber bewusst erstmal so belassen; Redesign-Verfeinerung ist ein offener Punkt für eine künftige Session).

## Icon-Erstellung

**Methode A** (nicht Methode B/cairosvg wie ursprünglich geplant) — bewusste Vereinfachung: `qlmanage -t -s 1024 -o /tmp icon.svg` + `sips -z <size> <size>` lokal, PNGs werden ins Repo committed und statisch ausgeliefert. Kein Laufzeit-Icon-Generierungscode im Backend nötig (weniger Fehlerquellen, kein PermissionError-Risiko). Bei Icon-Änderung: `icon.svg` bearbeiten, PNGs neu generieren, SW-Cache-Namen hochzählen.

## SW-Cache-Name

`orgkompass-v13` (in `static/sw.js`, Stand 2026-08-14) — **Korrektur einer früheren Fehlannahme in dieser Datei:** hochzählen bei Änderung an Icons/Manifest/sw.js **UND bei jeder Änderung an bereits gecachten Dateien** (`index.html`, `app.js`, `login.html`, `content-*.js`) — diese stehen alle im `SHELL`-Array und werden für Nicht-HTML-Assets **cache-first** ausgeliefert (`sw.js`-Fetch-Handler). Nur bei **neuen** Dateien (die vorher noch nicht im Cache waren) ist kein Bump nötig. Reine Content-*Ergänzungen* (neues Modul) brauchen trotzdem einen Bump, weil `sw.js` selbst sich ändert (neuer SHELL-Eintrag).

## Claude-API-Proxy (`/api/ask`)

Modell `claude-haiku-4-5-20251001`, `max_tokens=1500`, System-Prompt scopt Antworten auf Organisationsberatung. Retry mit Backoff bei HTTP 529 (bis zu 3 Versuche, 15s/30s Wartezeit — Referenzmuster `Vereinskalender/src/services/rename/routes.py:190-216`). Vor jedem Call: `costs.is_hard_killed_today()`-Check (429 statt Absturz). `CLAUDE_API_KEY` wird projektübergreifend mitgenutzt (bereits in `secrets.env` vorhanden, kein neues Secret nötig).

## Frage-Verlauf auf Dropbox (Josef-Wunsch, 2026-08-14)

Jede erfolgreiche `/api/ask`-Antwort wird zusätzlich an `/Apps/Claude/OrgKompass/fragen-verlauf.md` (Dropbox) angehängt (Download → Text anhängen → Upload, best-effort — Fehler werden geloggt, blockieren aber nie die Antwort). Nutzt den **bereits bestehenden projektübergreifenden Dropbox-App-Zugang** (`DROPBOX_APP_KEY`/`DROPBOX_APP_SECRET`/`DROPBOX_REFRESH_TOKEN`, auch von Life-Doku/Newsletter-Digest/Vereinskalender genutzt) — **kein neuer Dropbox-App-Aufwand nötig**, einfach denselben Zugang mit projekteigenem Pfad verwenden. `GET /api/ask-history` liest die Datei, parst sie per Regex in Einträge (`ts`/`question`/`answer`) und liefert sie neueste-zuerst als JSON. Frontend zeigt sie als Akkordeon (nur Frage sichtbar, Antwort ausklappbar, Datum/Uhrzeit klein).

## Deployment

```bash
# Lokal:
cd ~/Dropbox/Apps/Claude/OrgKompass
git add -A && git commit -m "..." && git push

# Server:
ssh root@89.167.104.145 "cd /opt/orgkompass && sudo -u webhook git pull && systemctl restart orgkompass"
```

`ORGKOMPASS_PASSWORD` + `CLAUDE_API_KEY` (bereits vorhanden) in `/etc/pka/secrets.env` — nur via `SOPs/Token-Deployment.md`, nie im Chat. Nach jedem `git`-Vorgang, der neue Dateien anlegt oder Owner ändert: `chown webhook:webhook` nicht vergessen (Erstklon lief initial als root).

## Pitfalls

- `secrets.py` als Dateiname vermeiden (shadowt Python-Stdlib) — Projekt nutzt `app_secrets.py`.
- Content-Dateien müssen an zwei Stellen registriert werden (s.o.).
- `CLAUDE_API_KEY` (nicht `ANTHROPIC_API_KEY`) in secrets.env — projektübergreifende Namenskonvention lt. `PKA/BKM/Claude-API-Verwendung.md`.
- **Alle Routen brauchen den `/orgkompass`-Präfix** (s.o.) — wird eine neue Route ergänzt, IMMER `f"{PREFIX}/..."` verwenden, sonst funktioniert sie hinter nginx nicht.
- **Git-Ownership auf dem Server:** `/opt/orgkompass` wurde initial als `root` geklont (`.git`-Interna gehörten root), `sudo -u webhook git pull`/`git checkout` schlug mit „dubious ownership" fehl, bis `git config --system --add safe.directory /opt/orgkompass` gesetzt wurde. Bei künftigen Root-Aktionen im Verzeichnis (z. B. `git checkout <file>` zum Zurücksetzen einer Testeinstellung) danach immer `chown webhook:webhook` auf betroffene Dateien nicht vergessen.
- **SW-Cache-Bump bei JEDER Änderung an bereits gecachten Dateien** (s. o.) — nicht nur bei Icons/Manifest, sonst sehen Nutzer mit installierter PWA Änderungen nie.
- **`fragen-verlauf.md` landet lokal im Projektordner:** Der Dropbox-Pfad `/Apps/Claude/OrgKompass/fragen-verlauf.md`, an den die App schreibt, entspricht exakt diesem lokalen (Dropbox-gesyncten) Projektordner — die Datei taucht daher als (gitignorte) Datei direkt hier auf, sobald Josef eine Frage stellt. Kein Bug, aber bei `git status` nicht wundern.
- **Kosten-Schwellen-Test:** Werden `DAILY_WARN_USD`/`DAILY_HARD_KILL_USD` in `costs.py` für einen Verifikationstest **direkt auf dem Server** temporär gesenkt (nicht committed), danach zwingend `git checkout costs.py` zum Zurücksetzen — nicht manuell zurückschreiben (Tippfehlerrisiko).

## Offen: PWA-Standard „Tab-Leiste am unteren Bildschirmrand" nachziehen

Neuer PKA-Standard seit 2026-08-14 (`PKA/BKM/PWA-Standards.md`), bereits in 7 anderen Apps umgesetzt. Bei OrgKompass bewusst zurückgestellt, solange die App noch aktiv gebaut wird – bei Abschluss der App bzw. bei der nächsten größeren UI-Überarbeitung nachziehen (OrgKompass hat bereits eine fixe Bottom-Tab-Bar seit Phase 1 — prüfen, was der neue Standard darüber hinaus konkret verlangt, bevor er hier umgesetzt wird).

## Lokale Entwicklung

```bash
cd ~/Dropbox/Apps/Claude/OrgKompass
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
ORGKOMPASS_PASSWORD=test python3 app.py   # lokal: Passwort via env var statt secrets.env
# Aufrufen unter http://127.0.0.1:5007/orgkompass/login (Praefix gilt auch lokal!)
```
