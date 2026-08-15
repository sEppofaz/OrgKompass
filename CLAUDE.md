# OrgKompass

Lern-App für Organisationsberatung (PWA + Flask-Backend). Übergeordnete Regeln: `~/Dropbox/CLAUDE.md`, `~/Dropbox/Apps/Claude/PKA/CLAUDE.md`.

## Kurzüberblick

- **Live-URL:** `https://umbenennen.duckdns.org/orgkompass/` (seit Phase 6, 2026-08-14)
- **GitHub:** `sEppofaz/OrgKompass` (public)
- **Lokaler Pfad:** `~/Dropbox/Apps/Claude/OrgKompass/`
- **Server:** `/opt/orgkompass/` (Owner `webhook:webhook`), systemd `orgkompass.service`, Port **5007**
- **Stack:** Vanilla-JS-PWA (kein Framework/Build-Step) + Flask-Backend (Login-Schutz + Claude-API-Proxy + Dropbox-Speicherung + Notizen/Telegram-Erinnerungen)
- **Stand:** Alle 6 Phasen fertig + Notizen-Feature + Lese-/Quiz-Fortschritts-Visualisierung (Stand 2026-08-15, v2.3). Einziger offener Punkt: Redesign-Verfeinerung (eigenes Todo, s. `CLAUDE.md`-Design-System-Abschnitt).

## Architektur

- `static/index.html` — App-Shell (Bottom-Tab-Navigation: Lernen/Glossar/Frage/Notizen/Quiz/Fortschritt — 6 Tabs seit 2026-08-14, Reihenfolge auf Josef-Wunsch geändert), `static/app.js` — State, Gamification, Quiz-Engine, SM-2, Frage-Verlauf-Akkordeon, Volltextsuche, Einstufungstest, Fortschritts-Dashboard, Notizen
- `static/content/*.js` — Content als separate Dateien (nicht Single-File, siehe ADR-003): `content-core.js` zuerst, dann `content-modul-01…12-*.js` (10 Kern + 2 Bonus), dann `content-glossar.js`, `content-diagramme.js`. **Jede neue Content-Datei muss an zwei Stellen eingetragen werden:** `<script>`-Tag in `index.html` UND `SHELL`-Array in `sw.js` (sonst offline nicht verfügbar).
- `app.py` — Flask, **alle Routen mit `/orgkompass`-Präfix** (`PREFIX`-Konstante, s. u.): Login (Session, `ORGKOMPASS_PASSWORD`), statisches Ausliefern, `POST /api/ask` (Claude-Proxy, Modell `claude-haiku-4-5-20251001`, Retry/Backoff bei 529, Vorab-Hard-Kill-Check), `GET /api/ask-history` (liest Frage-Verlauf aus Dropbox, strukturiert als JSON), `GET /api/costs` (Tages-/Monats-/Jahres-/Gesamt-Kosten für den Frage-Tab), `GET/POST /api/notizen` + `PUT/DELETE /api/notizen/<id>` (Notizen-CRUD).
- `app_secrets.py` — Secrets-Loader (Name bewusst nicht `secrets.py`, um das gleichnamige Python-Stdlib-Modul nicht zu shadowen — `app.py` braucht `secrets.token_hex()` für den Session-Key).
- `costs.py` — Kosten-Tracking, 1:1-Template aus `PKA/BKM/Claude-API-Kosten-Tracking.md` + `is_hard_killed_today()` für den Vorab-Check + `today_summary()` für die UI-Anzeige.
- `notizen_store.py` — Notizen-Datenhaltung (`notizen.json`, gitignored), Lock+Tempfile+atomares Rename nach `PKA/BKM/Atomic-Write-Pattern.md` (**zwei Schreibquellen:** Flask-CRUD-Routen + der separate Erinnerungs-Check-Cronjob, daher Pflicht).
- `check_erinnerungen.py` — Eigenständiges Skript (kein Flask-Endpunkt), per systemd-Timer alle 15 Min ausgeführt: sucht fällige, noch nicht gesendete Erinnerungen in `notizen.json`, verschickt Telegram-Nachricht über den **bereits bestehenden geteilten PKA-Bot** (Secrets-Keys sind `TOKEN`/`CHAT_ID` — **nicht** `TELEGRAM_TOKEN`/`TELEGRAM_CHAT_ID`, s. Pitfall unten — aus `secrets.env`, kein neues Secret), markiert `erinnerung_gesendet: true`.

## Notizen-Tab & Telegram-Erinnerungen (2026-08-14, PKA-Todo #277)

Datenmodell je Notiz: `{id, text, ist_todo, erledigt, erinnerung (ISO-Datetime oder null), erinnerung_gesendet, erstellt}`. Bewusst **serverseitig** gespeichert (nicht nur `localStorage` wie Fortschritt/SM-2) — Erinnerungen müssen auch feuern, wenn die App/das Handy nicht offen ist, das erfordert einen serverseitigen Cronjob, der unabhängig vom Client läuft.

**systemd (Server):**
```
/etc/systemd/system/orgkompass-erinnerungen.service   # oneshot, ruft check_erinnerungen.py
/etc/systemd/system/orgkompass-erinnerungen.timer     # OnCalendar=*:0/15 (alle 15 Min)
```
Nach jeder Änderung an `check_erinnerungen.py`/`notizen_store.py`: kein Neustart von `orgkompass.service` nötig (eigenständiges Skript), aber `systemctl restart orgkompass-erinnerungen.timer` nur bei Timer-Datei-Änderungen selbst.

## Volltextsuche (Phase 4)

`buildSearchIndex()` in `app.js` baut beim ersten Öffnen des Glossar-Tabs einen In-Memory-Index aus `GLOSSARY` (Term/Kurz/Erklärung) und allen `MODULES[].abschnitte` (Titel + von Markdown befreiter Volltext). Suche liefert zwei Ergebnisgruppen (Glossar/Module); Modul-Treffer springen per `jumpToAbschnitt(moduleId, abschnittId)` direkt zum passenden Abschnitt (setzt `id="abschnitt-{id}"` auf jeden `.section-block`, `scrollIntoView`). Vorschlagsliste (Autocomplete) folgt `PKA/BKM/PWA-Standards.md` „Suchfeld-Vorschlagsliste"-Standard 1:1 (nicht neu erfunden).

## Einstufungstest & Fortschritts-Dashboard (Phase 5)

- **Diagnostik-Fragen:** `getDiagnostikFragen()` filtert alle Fragen mit `diagnostik: true` aus den 10 **Kernmodulen** (Bonus-Module explizit ausgeschlossen, s. Fix-Commit vom 2026-08-14 zu Modul 11/12) → 20 Fragen, verteilt über 16 distinkte `themenfeld`-Werte (einige Kernmodule haben 2 Diagnostik-Fragen im selben Themenfeld statt in zwei verschiedenen — dadurch 16 statt 20 Auswertungs-Keys).
- **Ergebnis-Speicherung:** `ok_diagnostik_ergebnis` (localStorage, JSON `{themenfeld: {correct, total, score, moduleId, moduleTitel}}`), `ok_diagnostik_datum`. Level-Schwellen: `<40%` Anfänger, `40–75%` Fortgeschritten, `>75%` Erfahren (`diagnostikLevelName()`).
- **Lernpfad-Empfehlung:** Themenfelder nach Einstufungs-Score aufsteigend sortiert (größter Nachholbedarf zuerst), zusätzlich `themenfeldCurrentScore()` als „aktuell gemeistert"-Vergleichswert (rekonstruiert **alle** Fragen mit demselben `themenfeld`-Tag über alle Module hinweg, nicht nur die 2 ursprünglichen Diagnostik-Fragen — bildet den tatsächlichen aktuellen Lernstand ab, nicht nur den Diagnostik-Schnappschuss).
- **Fällige Wiederholungen:** `getDueQuestions()` nutzt das seit Phase 1 bestehende SM-2-`nextReview`-Feld (war bis Phase 5 nirgends in der UI nutzbar). Neuer Quiz-Modus im Quiz-Tab (`startDueReviewQuiz()`), `STATE.quiz.moduleId = 'wiederholung'` als Sonderwert (kein echtes Modul).
- **Pro-Modul „nur offene Fragen" (seit 2026-08-15, v2.4):** `startQuiz(moduleId, opts)` filtert automatisch auf noch nicht gemeisterte Fragen (`moduleQuizStats()`, gleiche Mastery-Definition wie überall: `ease >= 2.0 && streakCorrect >= 2`), sobald im Modul schon mindestens eine (aber nicht alle) gemeistert ist — sind alle gemeistert, läuft die volle Fragenliste erneut (bewusst kein Leerlauf). Unterscheidet sich von „Fällige Wiederholungen" oben: dort ist die Auswahl **datumsbasiert** (`nextReview`) über alle Module hinweg, hier **sofort** nutzbar pro einzelnem Modul unabhängig vom SM-2-Intervall. Quiz-Auswahlliste zeigt „X von Y noch offen" statt nur der Gesamtzahl, Quiz-Header markiert eine gefilterte Runde als „Wiederholung (nur offene Fragen)".
- **Erzwungen alle Fragen üben (seit 2026-08-15, v2.6):** `startQuiz(moduleId, {erzwingeAlle: true})` überschreibt den automatischen Filter. UI: sobald `offenCount>0 && offenCount<total`, zeigt die Quiz-Auswahlliste unter dem Modul-Titel einen zweiten, kleineren Button „Alle X Fragen üben" (`[data-quiz-module-all]`). Struktur dafür geändert: die Modul-Zeile ist jetzt `<div class="card module-card-row">` mit einem inneren `<button class="module-card-tap">` (Titel/Beschreibung/Chevron) **und** dem separaten „Alle Fragen"-Button als Geschwister-Element — bewusst **kein** verschachteltes `<button>` in `<button>` (ungültiges HTML), s. `.module-card-row`/`.module-card-tap`/`.quiz-all-link`-CSS.
- **Zurück-Button im laufenden Quiz (seit 2026-08-15, v2.6):** Vorher gab es keinen Ausstieg aus einem gestarteten Quiz außer komplettem Durchspielen. `renderQuiz()` zeigt jetzt oben einen `.back-link`-Button (`[data-quiz-exit]`) während einer laufenden Runde, setzt `STATE.quiz = null`. Einzelne Antworten sind zu dem Zeitpunkt bereits per `recordAnswer()` persistiert (kein Datenverlust, nur die verbleibenden Fragen der Runde entfallen). **Pitfall dabei behoben:** Der `setTimeout(...,1200)` in `answerQuiz()`, der nach jeder Antwort automatisch zur nächsten Frage weiterschaltet, griff sonst auch nach einem zwischenzeitlichen Exit noch auf `STATE.quiz.idx` zu (`STATE.quiz` war da schon `null` → Crash) — jetzt mit `if (!STATE.quiz) return;` am Anfang des Timeout-Callbacks abgesichert. Diese Absicherung gilt generell für jeden `setTimeout`/`setInterval`, der auf State zugreift, der zwischenzeitlich per Nutzerinteraktion gelöscht werden kann.
- **UI-Ort:** Einstufungstest lebt **innerhalb des Fortschritt-Tabs** (kein eigener Bottom-Tab), umgeschaltet über `STATE.einstufung` (analog zu `STATE.quiz`, aber komplett getrennter State/Render-Pfad `renderEinstufungstest()`/`answerEinstufung()`).
- **„Gemeistert"-Kriterium wird jetzt in der UI erklärt** (Josef-Fund 2026-08-15, s. Pitfall unten): Text bei der „X/Y Fragen gemeistert"-Karte im Fortschritt-Tab.

## Lese-/Quiz-Fortschritts-Visualisierung in den Modul-Listen (2026-08-15, v2.3)

- **Lernen-Tab:** dünner Fortschrittsbalken (Akzent-Gradient) am unteren Rand jeder Modul-Bubble, zeigt den **Lese-Fortschritt** (nicht den Quiz-Fortschritt). Datenquelle: neuer localStorage-Key `ok_read` (`{moduleId: [abschnittId, ...]}`), befüllt von `setupReadTracking()` — ein `IntersectionObserver` (threshold 0.4) pro `.section-block` in der Moduldetailansicht, wird in `wireEvents()` bei jedem Render neu aufgesetzt (vorheriger Observer wird vorher `disconnect()`ed, sonst laufen mehrere parallel). `moduleReadStats(m)` liefert `{count, total, pct}` für `renderLernen()`.
- **Quiz-Tab:** Badge oben rechts in jeder Modul-Bubble statt Balken (`quizModuleBadge()`, nutzt `ok_progress`/`getProgress()`): grüner Haken-Kreis (`--green`) wenn **alle** Fragen des Moduls gemeistert sind (Mastery-Kriterium seit v2.8, s.u.), grauer Punkt wenn Fragen begonnen aber offen, kein Badge wenn noch nichts beantwortet.
- CSS: `.module-card-progress-track/-fill` (Balken), `.module-badge`/`-done`/`-open` (Badge) — `.module-card` braucht dafür `position: relative; overflow: hidden` (war bereits vorhanden).
- Als neuer BKM-Standard für alle künftigen Lern-Apps dokumentiert: `PKA/BKM/Lern-App-Standards.md` „Fortschritts-Visualisierung in Modul-/Quiz-Listen".
- **Modul-Navigation am Ende der Moduldetailseite** (`renderModuleDetail()`, seit v2.5): Footer-Zeile mit „zurück"-Link (gleiche Optik wie oben, jetzt über `[data-back-to-modules]` statt fixer ID, da zweimal auf der Seite) und „weiter: {nächstes Modul}"-Link (`[data-next-module]`, springt direkt ins nächste Modul in `MODULES`-Reihenfolge, `main.scrollTo({top:0})` danach). Kein Link beim letzten Modul (`MODULES[idx+1]` ist `undefined`).

## Mastery-Kriterium vereinfacht + „Alle Fragen üben"-Button immer sichtbar (seit 2026-08-15, v2.8)

- **Mastery-Kriterium geändert:** War `ease >= 2.0 && streakCorrect >= 2` (2× richtig in Folge), ist jetzt `streakCorrect >= 1` (einmal richtig genügt). Josef-Wunsch: „Abgeschlossen bei einmal korrekte Fragendurchlauf". Bei einer späteren falschen Antwort setzt `recordAnswer()` `streakCorrect` wieder auf 0 zurück → Frage gilt dann wieder als offen (kein Sonderfall nötig, folgt automatisch aus der bestehenden SM-2-Logik). `ease`/`interval`/`nextReview` bleiben unverändert für die Intervall-Berechnung der „Fälligen Wiederholungen" — die Mastery-Schwelle ist davon unabhängig. Betroffen: `themenfeldCurrentScore()`, `quizModuleBadge()`, `moduleQuizStats()`, `startQuiz()`, `moduleProgressStats()`, `renderFortschritt()` (6 Stellen, alle mit derselben Bedingung).
- **„Alle X Fragen üben"-Button** (`data-quiz-module-all`) war bisher nur bei teilweise gemeisterten Modulen sichtbar (redundant zum automatischen Nur-offene-Filter in `startQuiz()`, der ebenfalls nur bei Teil-Mastery greift). Jetzt immer sichtbar (`zeigeAlleBtn = s.total > 0`) — Josef-Wunsch: die Wahl zwischen „nur offene" (Standard-Tap auf die Modulzeile) und „alle" soll immer beim Nutzer liegen, nicht vom Fortschritt abhängen.
- Erklärtext im Fortschritt-Tab („Als gemeistert zählt...") entsprechend angepasst.

## nginx-Präfix (`/orgkompass`) — wichtige Architekturentscheidung

Alle Flask-Routen sind selbst mit `/orgkompass`-Präfix registriert (`@app.route(f"{PREFIX}/...")`), nginx proxied **ohne Pfad-Stripping** (`proxy_pass http://127.0.0.1:5007/orgkompass/;`). Grund: OrgKompass hat Login/Redirects (`redirect(f"{PREFIX}/login")`) — würde nginx den Präfix strippen (wie bei `/newsletter/`, das keine Auth hat), würden Flask-Redirects mit absolutem Pfad (`/login`) auf die Domain-Root statt auf `/orgkompass/login` zeigen. Gleiches Muster wie `sentiment-scanner`. Betroffen: alle `@app.route()`, alle `redirect()`, plus 3 Frontend-Stellen mit absoluten Pfaden (`login.html` Form-Action, `app.js` `fetch()` zu `/api/ask`/`/api/ask-history`, Logout-Link).

## Design-System

Überwiegend Weiß, hellgraue Symbole/Linien/Rahmen, monochromes Farbschema (kein Farbakzent außer Quiz-Feedback Grün/Gelb/Rot — Pflicht lt. `PWA-Standards.md`). Bottom-Tab-Bar fix mit 6 Tabs (Lernen/Glossar/Frage/Notizen/Quiz/Fortschritt, Reihenfolge seit 2026-08-14). Icon-Hintergrund Graphit `#2c2c2e` mit weißem Kompass (Lucide `compass`). Seit 2026-08-14 zusätzlich Elevation/Tiefe: `--shadow-sm/md/lg`-Tokens, Gradient-Buttons (`--accent` → `--accent-soft`), Karten mit Schatten, Tab-Bar-Active-Pill (Josef-Wunsch „mehr Stil und Hochglanz" — Ergebnis von Josef noch nicht als voll gelungen bewertet, aber bewusst erstmal so belassen; Redesign-Verfeinerung ist ein offener Punkt für eine künftige Session). `--text` seit 2026-08-14 auf `#3a3a3d` (Anthrazit statt hartes Schwarz `#1c1c1e`, Josef-Wunsch aus PKA-Todo #277). Alle fixen/absoluten UI-Elemente (Header, `#tab-bar`, `#back-top`, Info-Sheet) nutzen `env(safe-area-inset-left/right)` zusätzlich zu `-top/-bottom` für Querformat-Notch-Sicherheit.

## Tab-Wechsel setzt Drill-down-State zurück (seit 2026-08-15, v2.6)

`switchTab()` setzt bei jedem Tab-Button-Klick **alle** Drill-down-States zurück (`STATE.activeModuleId = null`, `STATE.quiz = null`, `STATE.einstufung = null`), nicht nur `STATE.quiz` wie ursprünglich. **Bug vorher:** Tippen auf den Quiz-Tab-Button setzte zuverlässig auf die Quiz-Übersicht zurück, tippen auf den Lernen-Tab-Button dagegen nicht — eine offene Moduldetailseite blieb bestehen, weil `STATE.activeModuleId` nicht mit zurückgesetzt wurde (Josef-Fund). **Regel für jeden Tab mit eigenem Drill-down-State:** Tippen auf einen Tab-Button (auch den bereits aktiven) muss immer zur Übersicht/Wurzel dieses Tabs zurückführen, nie im Detail-State hängen bleiben. Gilt nicht für Navigations-Helper, die bewusst direkt in einen Detail-State springen sollen (`jumpToAbschnitt()` von der Suche, „Quiz zu diesem Modul starten"-Button aus der Moduldetailseite) — die rufen `switchTab()` bewusst nicht auf, sondern setzen State manuell. **Als Standard-Kandidat für `PKA/BKM/PWA-Standards.md` vermerkt** (noch nicht dort dokumentiert, kein Rollout in andere Apps in dieser Session).

## Dark-/Hell-Modus-Umschalter (seit 2026-08-15, v2.7)

Bisher rein `@media (prefers-color-scheme: dark)`-gesteuert (folgt nur Systemeinstellung). Jetzt zusätzlich manuell überschreibbar über einen Schalter im Info-Sheet („Dunkelmodus").

- **CSS:** `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` (System-Dark greift, außer explizit auf Hell gestellt) **plus** `:root[data-theme="dark"] {...}` (explizite Dark-Wahl, unabhängig vom System) — beide Blöcke identisch befüllt, bewusste Duplizierung statt Verschachtelung für Klarheit.
- **Persistenz:** `localStorage`-Key `ok_theme` (`'light'`/`'dark'`/nicht gesetzt = folgt System).
- **Kein Flackern beim Laden:** Inline-`<script>` direkt vor `</head>` (nach dem `<style>`-Block) liest `ok_theme` synchron und setzt `data-theme` auf `<html>` **bevor** der Body gerendert wird — ohne das würde beim Laden kurz das Systemtheme aufblitzen, bevor `app.js` (ganz am Seitenende geladen) die gespeicherte Wahl anwendet.
- **`theme-color`-Meta-Tag:** Vorher zwei separate `<meta name="theme-color">`-Tags mit `media`-Attribut (folgten nur System) — jetzt ein einzelnes Tag mit `id="theme-color-meta"`, das sowohl vom Anti-Flacker-Script beim Laden als auch von `applyTheme()` bei jedem Umschalten aktiv gesetzt wird. Sonst hätte die iOS-Statusleiste/Browser-Chrome-Farbe nicht zur manuell gewählten Theme gepasst.
- **JS:** `getStoredTheme()`/`systemPrefersDark()`/`applyTheme(theme)`/`setupThemeToggle()` in `app.js`, Toggle-Button ist ein reiner CSS-Switch (`.theme-switch`/`.theme-switch-knob`, `role="switch"`/`aria-checked`), kein natives `<input type="checkbox">` (einfacher an das bestehende Design-System anzupassen).
- **Noch kein projektübergreifender Standard** — nur in OrgKompass umgesetzt, kein bestehendes Muster in `PKA/BKM/PWA-Standards.md` dafür vorhanden.

## Icon-Erstellung

**Methode A** (nicht Methode B/cairosvg wie ursprünglich geplant) — bewusste Vereinfachung: `qlmanage -t -s 1024 -o /tmp icon.svg` + `sips -z <size> <size>` lokal, PNGs werden ins Repo committed und statisch ausgeliefert. Kein Laufzeit-Icon-Generierungscode im Backend nötig (weniger Fehlerquellen, kein PermissionError-Risiko). Bei Icon-Änderung: `icon.svg` bearbeiten, PNGs neu generieren, SW-Cache-Namen hochzählen.

## SW-Cache-Name

`orgkompass-v27` (in `static/sw.js`, Stand 2026-08-15) — **Korrektur einer früheren Fehlannahme in dieser Datei:** hochzählen bei Änderung an Icons/Manifest/sw.js **UND bei jeder Änderung an bereits gecachten Dateien** (`index.html`, `app.js`, `login.html`, `content-*.js`) — diese stehen alle im `SHELL`-Array und werden für Nicht-HTML-Assets **cache-first** ausgeliefert (`sw.js`-Fetch-Handler). Nur bei **neuen** Dateien (die vorher noch nicht im Cache waren) ist kein Bump nötig. Reine Content-*Ergänzungen* (neues Modul) brauchen trotzdem einen Bump, weil `sw.js` selbst sich ändert (neuer SHELL-Eintrag).

⚠️ **Kritischer Pitfall (gefunden 2026-08-15): `activate`-Handler muss `self.clients.claim()` aufrufen.** Ohne das übernimmt ein neu aktivierter Service-Worker zwar den Cache-Inhalt, aber **nicht die Kontrolle über bereits offene Tabs/die installierte PWA-Instanz** — bestehende Sessions liefen trotz korrektem Deploy + Cache-Bump weiter mit einer älteren `app.js`, bis die App komplett geschlossen und neu geöffnet wurde (und selbst dann nicht garantiert sofort, je nach Plattform-Update-Timing). Führte dazu, dass Josef mehrere frisch deployte Features (Fortschrittsbalken, Quiz-Badges) zunächst gar nicht sah, obwohl der Server korrekt aktualisiert war. Fix seit v22: `self.clients.claim()` im `activate`-Listener. **War bereits in `PKA/BKM/PWA-Standards.md`(Zeile ~75) als Standard dokumentiert** — Vollcheck aller 20 anderen `sw.js`-Dateien im Dropbox/Developer-Baum (2026-08-15) zeigte, dass ausschließlich OrgKompass beim Übernehmen des Musters davon abgewichen war, alle anderen Apps hatten `clients.claim()` bereits korrekt. Kein projektübergreifender Rollout nötig, nur OrgKompass selbst betroffen.

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
- **`manifest.json` `start_url` muss auf eine echte Route zeigen:** `"./index.html"` war falsch — es gibt keine `/orgkompass/index.html`-Route, Flask liefert den `index.html`-Inhalt nur unter `/orgkompass/` selbst aus. Führte zu „not found" beim „Zum Homescreen hinzufügen". Bei jeder neuen App/jedem neuen Präfix-Setup: `start_url` gegen die tatsächlich existierenden Routen prüfen, nicht blind `./index.html` annehmen.
- **Safari-Standard-Button-Farbe bei `<button>`-Elementen ohne explizites `color`:** `.module-card-title` hatte keine eigene Textfarbe und erschien blau statt dunkel, weil `.module-card` ein `<button>` ist und Safari dafür eine Standardfarbe (System-Blau) einsetzt, wenn `color` nicht explizit gesetzt ist — Vererbung von `body`/`.card` reicht nicht. **Regel für jedes neue Button-Element:** `color` immer explizit setzen (nicht auf Vererbung verlassen), sonst kann je nach Browser/Plattform ein ungewolltes Blau durchschlagen.
- **Telegram-Secrets-Keys heißen `TOKEN`/`CHAT_ID`, nicht `TELEGRAM_TOKEN`/`TELEGRAM_CHAT_ID`:** `check_erinnerungen.py` schlug zunächst fehl, weil die falschen Key-Namen angenommen wurden — siehe `PKA/BKM/Telegram-Integration.md` (dort präzisiert) und ADR-007.
- **Antwortposition-Bias bei Multiple-Choice-Content:** Beim Erstellen aller 154 Fragen (Phase 2/3) lag die richtige Antwort unbewusst zu 93,5 % auf Position 1 oder 2, Position 4 war kein einziges Mal die Lösung (Josef fiel das beim Einstufungstest auf: „Lösung ist immer der zweite Button"). Nachträglich per Skript korrigiert (balancierte Neuzuteilung + semantische Verifikation aller 154 Fragen, dass der Lösungstext exakt erhalten blieb). **Regel für jedes neue Modul/jede neue Frage:** Position der richtigen Antwort bewusst variieren (alle 4 Positionen etwa gleich häufig), nicht der Reihenfolge folgen, in der einem die Optionen einfallen — dieser Bias entsteht leicht unbewusst.
- **„Gemeistert"-Zähler wirkte wie ein Bug, war aber korrekt:** Josef hatte 14/14 bzw. 15/15 Fragen eines Themenblocks einmal richtig beantwortet, das Fortschritt-Dashboard zeigte trotzdem nur 13/14 bzw. 2/15 „gemeistert" (2026-08-15). Ursache: `moduleProgressStats()`/`renderFortschritt()` zählen nur bei `ease >= 2.0 && streakCorrect >= 2` (2× richtig **in Folge**) als gemeistert — korrekt nach SM-2-Logik, aber nirgends in der UI erklärt. Zusätzlich zählen Antworten aus dem Einstufungstest (`answerEinstufung()`) in denselben `ok_progress`-Store hinein, was die 2/15 erklärte (2 Diagnostik-Fragen aus dem Block waren dort schon einmal richtig beantwortet worden). Fix: Erklärtext direkt bei der „X/Y gemeistert"-Karte ergänzt (v2.3). **Regel:** Jede Mastery-/Fortschritts-Definition, die von „einmal richtig = fertig" abweicht, muss in der UI selbst erklärt werden, nicht nur im Code.

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
