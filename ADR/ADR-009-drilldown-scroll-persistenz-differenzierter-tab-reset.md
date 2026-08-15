# ADR-009: Differenzierter Tab-Reset + localStorage-Persistenz für Modul-Scroll-Position

**Datum:** 2026-08-15
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Seit v2.6 setzte `switchTab()` bei **jedem** Tab-Button-Klick den gesamten Drill-down-State zurück (`STATE.activeModuleId = null`, Scroll auf 0) — eingeführt, um einen Bug zu fixen, bei dem erneutes Antippen des bereits aktiven Lernen-Tabs nicht zur Modulübersicht zurückführte. Nebenwirkung, von Josef am 2026-08-15 gemeldet: Scrollte man in einem Modul und wechselte zu einem anderen Tab (z. B. Notizen) oder verließ die App, ging die Lese-Position verloren — man landete beim Zurückkehren immer am Modulanfang statt an der zuletzt gelesenen Stelle. `STATE` lebt zudem nur im Speicher und übersteht keinen App-Neustart.

## Entscheidung

1. `switchTab()` setzt `STATE.activeModuleId` nur noch zurück, wenn der **bereits aktive** Lernen-Tab erneut angetippt wird (Home-Geste). Ein Wechsel zu einem anderen Tab lässt den Modul-Zustand unangetastet.
2. Neuer `localStorage`-Key `ok_module_state` (`{moduleId, scrollTop}`) speichert die Scroll-Position rAF-gedrosselt bei jedem Scroll im offenen Modul und stellt sie sowohl beim Zurückwechseln zu Lernen als auch nach einem echten App-Neustart (`init()`) wieder her.
3. Laufende Quiz-/Einstufungstest-Sessions (`STATE.quiz`/`STATE.einstufung`) bleiben von dieser Änderung ausgenommen — die werden weiterhin bei jedem Tab-Wechsel verworfen (kurzlebige Eingabe-Session, kein lesender Drill-down-State).

## Begründung

Die ursprüngliche Blanket-Reset-Regel loste zwei unterschiedliche Fälle nicht auf: „bewusst zur Übersicht zurück" (erneutes Antippen des aktiven Tabs) und „kurz zu einem anderen Tab und zurück" (z. B. Notiz machen, dann weiterlesen). Nur der erste Fall sollte einen Reset auslösen. Reines In-Memory-Halten des States hätte das Tab-Wechsel-Problem gelöst, aber nicht das App-Neustart-Problem (iOS/Safari PWAs werden im Hintergrund häufig aus dem Speicher geworfen) — daher zusätzlich `localStorage`-Persistenz.

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Blanket-Reset beibehalten, nur Scroll-Position separat cachen (State selbst bleibt bei jedem Tab-Wechsel `null`) | Hätte das Kernproblem nicht gelöst — ohne erhaltenes `activeModuleId` weiß `switchTab()` beim Zurückwechseln gar nicht, dass es ein Modul zum Wiederherstellen gibt; man würde auf der Übersicht landen statt im Modul. |
| Persistenz auch für Quiz/Einstufungstest | Für eine kurzlebige, aktive Eingabe-Session (Multiple-Choice-Beantwortung) ergibt ein automatisches Wiedereinsteigen nach Tab-Wechsel/App-Neustart wenig Sinn und wurde nicht gewünscht — Abbruch beim Verlassen ist hier das erwartete Verhalten. |
| Persistenz pro Modul (Verlauf mehrerer zuletzt besuchter Module) | Unnötige Komplexität für den tatsächlichen Bedarf („wo bin ich zuletzt rausgegangen") — ein einzelner Eintrag reicht. |

## Gilt unter

Gilt für den Lernen-Tab/Moduldetailseite als einzigen lesenden, scrollbaren Drill-down-State der App. Falls künftig weitere Tabs einen vergleichbaren Drill-down-State bekommen (z. B. eine lange Glossar-Detailansicht), müsste die gleiche Differenzierung dort repliziert werden — aktuell nicht generisch über alle Tabs implementiert, sondern spezifisch für `activeModuleId`.

## Konsequenzen

**Positiv:** Löst den gemeldeten UX-Bug vollständig, auch über App-Neustarts hinweg. Das Muster ist als allgemeiner Standard in `PKA/BKM/PWA-Standards.md` („Tab-Wechsel setzt Drill-down-State zurück" + neuer Abschnitt „Drill-down-Scroll-Position persistieren") und in `PKA/BKM/Lern-App-Standards.md` dokumentiert — künftige Apps mit vergleichbarem Drill-down bekommen es direkt mit, ohne denselben Fund erneut machen zu müssen.
**Negativ:** Etwas mehr Zustandslogik in `switchTab()`/`init()` (Unterscheidung Home-Tap vs. Tab-Wechsel), ein zusätzlicher `localStorage`-Key zu pflegen. Kein Rollout in andere bestehende Apps in dieser Session (kein akuter Bedarf gemeldet).
