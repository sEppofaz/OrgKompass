# ADR-003: Content als separate JS-Dateien statt Single-File-Pattern

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Der bestehende Vokabeltrainer nutzt ein Single-File-Pattern (eine `index.html` mit allem Inline-HTML/CSS/JS, ~2900 Zeilen). OrgKompass hat mit 12 Modulen × 12–15 Fragen × ~6 Glossareinträgen × Diagrammen deutlich mehr Inhalt — als eine Datei wäre das kaum noch wartbar.

## Entscheidung

Content wird in separate Dateien pro Modul aufgeteilt (`content-modul-01-grundlagen.js` … `content-modul-12-agile-new-work.js`), plus `content-core.js`, `content-glossar.js`, `content-diagramme.js`. App-Shell (`index.html`) und Logik (`app.js`) bleiben getrennt von den Inhalten. Kein Build-Step — alle Dateien werden als klassische `<script>`-Tags eingebunden.

## Begründung

- Bessere Wartbarkeit: einzelne Module können unabhängig bearbeitet werden, ohne eine riesige Datei zu durchsuchen.
- Ermöglicht die geplante Umsetzungsreihenfolge (ein Modul pro Arbeitssession in Phase 2/3), ohne Merge-Konflikte oder Kontext-Explosion in einer einzigen Datei.
- Kein Build-Step beibehalten (Vokabeltrainer-Prinzip) — einfacher zu deployen, keine zusätzliche Toolchain.

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Single-File wie Vokabeltrainer | Bei diesem Content-Umfang unübersichtlich und schwer wartbar |
| Build-Step (z. B. Bundler, JSON-Import) | Zusätzliche Komplexität (Build-Toolchain, Deployment-Schritt) für einen Vorteil, der auch ohne Build-Step erreichbar ist |

## Gilt unter

Gilt für die aktuelle Content-Größenordnung. Bei deutlich mehr Modulen könnte ein Build-Step (Bundling) relevant werden, um Ladezeiten zu optimieren.

## Konsequenzen

- Pflicht-Pitfall: jede neue Content-Datei muss an zwei Stellen eingetragen werden — `<script>`-Tag in `index.html` und `SHELL`-Array in `sw.js` (siehe `CLAUDE.md`), sonst fehlt sie offline.
- Mehr Dateien im Repo, aber klar benannt und pro Modul isoliert.
