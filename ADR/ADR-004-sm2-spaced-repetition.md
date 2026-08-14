# ADR-004: SM-2-artiges Spaced-Repetition zusätzlich zum Fehlerzähler

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Der Vokabeltrainer nutzt für „schwierige Wörter" nur einen einfachen Fehlerzähler (`errors[key]`) ohne echtes Intervall-Scheduling. OrgKompass soll explizit eine „Lernzielanalyse" bieten — ein reiner Fehlerzähler zeigt zwar an, was oft falsch beantwortet wurde, aber nicht, wann eine Wiederholung sinnvoll wäre.

## Entscheidung

Zusätzlich zum einfachen Tracking (`seen`, `correct`) wird ein leichtgewichtiges SM-2-artiges Intervall-Modell pro Frage geführt: `interval` (Tage bis zur nächsten Wiederholung) und `ease` (Leichtigkeitsfaktor), die sich nach jeder Antwort anpassen. Ein Quiz-Modus „Fällige Wiederholungen" filtert Fragen mit `nextReview <= heute`.

## Begründung

- Der explizite Anspruch „Lernzielanalyse" (vom Nutzer in dieser Session gefordert) rechtfertigt den Mehraufwand gegenüber dem einfacheren Vokabeltrainer-Ansatz.
- SM-2 ist ein etabliertes, einfach zu implementierendes Spaced-Repetition-Modell (bekannt aus Anki u. ä.) — kein Over-Engineering, aber auch kein reiner Fehlerzähler.

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Nur Fehlerzähler wie im Vokabeltrainer | Reicht für die geforderte Lernzielanalyse nicht aus — zeigt nur „was oft falsch war", nicht „wann wiederholen" |
| Vollständiges SM-2 (mit Qualitätsskala 0–5 statt nur richtig/falsch) | Für eine Multiple-Choice-App mit binärem Feedback (richtig/falsch) unnötig komplex — die vereinfachte Variante mit binärem Input ist für den Anwendungsfall ausreichend |

## Gilt unter

Gilt für das aktuelle Multiple-Choice-Format. Bei Einführung von Freitext-Antworten mit graduellem Feedback (z. B. „teilweise richtig") müsste das Modell erweitert werden.

## Konsequenzen

- Zusätzliches State-Feld pro Frage (`ok_progress` in `localStorage`), etwas höhere Komplexität als beim Vokabeltrainer-Vorbild.
- Ermöglicht den in Phase 5 geplanten „Fällige Wiederholungen"-Modus und ein aussagekräftigeres Fortschritts-Dashboard.
