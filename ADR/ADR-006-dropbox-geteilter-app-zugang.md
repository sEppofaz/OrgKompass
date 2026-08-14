# ADR-006: Frage-Verlauf nutzt bestehenden geteilten Dropbox-App-Zugang

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Josef wollte nach einem ersten Live-Test der Frage-Funktion (Phase 6) den Frage-Verlauf geräteübergreifend speichern können, um ihn später nachzuschlagen. Etablierte Muster im Projektbestand (Life-Doku, Newsletter-Digest/Podcast, Kargl-Rechnungen) verwenden dafür jeweils eine **eigene, projektspezifische Dropbox-App** mit eigenem Key/Secret/Refresh-Token (App-Folder- oder Vollzugriff-Scope je nach Projekt).

## Entscheidung

Kein neuer Dropbox-App-Aufwand. OrgKompass nutzt den bereits vorhandenen, **projektübergreifend geteilten** Dropbox-Zugang (`DROPBOX_APP_KEY`/`DROPBOX_APP_SECRET`/`DROPBOX_REFRESH_TOKEN`, ohne Präfix), der schon von Newsletter Digest, Vereinskalender und `rename-webhook` verwendet wird, und schreibt in einen eigenen Pfad (`/Apps/Claude/OrgKompass/fragen-verlauf.md`).

## Begründung

Bei der Umsetzung wurde geprüft, welche Dropbox-Variablennamen in `secrets.env` bereits existieren (nur Namen, keine Werte gelesen — Sicherheitsregel). Ergebnis: Neben projektspezifischen Zugängen (`DROPBOX_INVOICE_*` für Kargl) existiert bereits ein generischer, mehrfach genutzter Zugang mit **Vollzugriff auf Josefs Dropbox** (Pfade wie `/Apps/Claude/{Projekt}/...`, spiegelt die lokale Ordnerstruktur). Diesen für einen weiteren, sehr kleinen Anwendungsfall (ein Markdown-Log) wiederzuverwenden erspart Josef den kompletten OAuth-Einrichtungsaufwand (Dropbox-App im Developer Portal anlegen, Auth-Code generieren, Refresh-Token-Austausch — jeweils Werte, die aus Sicherheitsgründen nie im Chat sichtbar werden dürfen und daher vollständig von Josef selbst am Terminal ausgeführt werden müssten).

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Eigene neue Dropbox-App für OrgKompass (Standard-Muster anderer Projekte) | Deutlich höherer Einrichtungsaufwand (Developer-Portal-Schritt + OAuth-Flow, den Josef komplett selbst am Terminal ausführen müsste) für einen einzelnen, kleinen Anwendungsfall — steht in keinem Verhältnis zum Nutzen |
| Kein Dropbox, nur `localStorage` | Verworfen auf Josefs expliziten Wunsch — geräteübergreifender Zugriff war der Kernpunkt der Anfrage |

## Gilt unter

Gilt, solange der geteilte Dropbox-Zugang für alle mitnutzenden Projekte ausreichend Speicherplatz/Rate-Limits bietet und keines der Projekte eigene, widersprüchliche Schreibrechte auf denselben Pfad braucht (Kollisionsrisiko: alle Projekte, die den geteilten Zugang nutzen, müssen ihre Dropbox-Pfade eindeutig unter `/Apps/Claude/{Projektname}/` halten). Bei Bedarf an feingranularerem Scope (z. B. wenn OrgKompass später zusätzliche, sensiblere Dropbox-Operationen bräuchte) sollte dieser Punkt neu bewertet werden.

## Konsequenzen

- Kein neues Secret für OrgKompass nötig — schnellere Umsetzung.
- Download-Anhängen-Upload-Muster (kein natives Append in der Dropbox-API) bedeutet: Bei sehr hohem Frage-Volumen würde die Datei bei jedem Call komplett neu heruntergeladen/hochgeladen — für den erwarteten geringen Umfang (passwortgeschützte App, kleiner Nutzerkreis) unproblematisch, bei starkem Wachstum ggf. auf Batch- oder Append-fähiges Format umstellen.
- Speicherung ist best-effort (try/except um den gesamten Dropbox-Aufruf) — ein Dropbox-Ausfall darf die eigentliche Antwort an den Nutzer nie blockieren.
