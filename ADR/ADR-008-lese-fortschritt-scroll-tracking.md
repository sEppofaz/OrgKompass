# ADR-008: Granulares Lese-Fortschritt-Tracking je Abschnitt (Scroll)

**Datum:** 2026-08-15
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

Josef wünschte sich einen Fortschrittsbalken am unteren Rand jeder Modul-Bubble im Lernen-Tab, der zeigt, wie weit der Lerntext eines Moduls bereits gelesen wurde. Bisher gab es dafür keinerlei Tracking — nur der Quiz-Fortschritt (`ok_progress`, SM-2) war vorhanden.

## Entscheidung

Neuer eigenständiger localStorage-Key `ok_read` (`{moduleId: [abschnittId, ...]}`), befüllt über einen `IntersectionObserver` (threshold 0.4) pro `.section-block` in der Moduldetailansicht. Ein Abschnitt gilt als „gelesen", sobald er zu mind. 40 % im sichtbaren Bereich war — kein Zeit- oder Scroll-Geschwindigkeits-Threshold. `moduleReadStats(m)` liefert `{count, total, pct}` für die Balken-Breite in der Modul-Liste.

## Begründung

Josef hat sich in dieser Session explizit für die granulare Variante entschieden (statt der einfacheren Alternativen), obwohl sie mehr Code erfordert — der Fortschrittsbalken soll den tatsächlichen Leseanteil zeigen, nicht nur ein binäres „geöffnet/nicht geöffnet".

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Modul-Öffnung = 100 % gelesen (einfaches Boolean je Modul) | Zu grob — ein einmal angetipptes, aber sofort wieder verlassenes Modul hätte fälschlich als „fertig gelesen" gegolten. |
| Bestehenden Quiz-Fortschritt (`ok_progress`/mastered) für den Lese-Balken wiederverwenden, kein neues Tracking | Hätte den Balken inhaltlich zur Dopplung des Quiz-Fortschritts gemacht (der im Quiz-Tab bereits als Badge sichtbar ist) statt einer eigenständigen Aussage über den Lernstoff selbst — Josef wollte ausdrücklich beide Signale getrennt sehen. |

## Gilt unter

Setzt voraus, dass jeder Abschnitt einen stabilen `id`-Wert hat (bereits durch die Volltextsuche-Funktion als `id="abschnitt-{id}"` etabliert, s. `CLAUDE.md` „Volltextsuche"). Wird ein Modul inhaltlich neu strukturiert (Abschnitte umbenannt/zusammengelegt), verlieren betroffene Nutzer optisch etwas Lese-Fortschritt — kein Datenverlust, nur eine neu zu lesende Abschnitts-ID.

## Konsequenzen

- Positiv: Fortschrittsbalken bildet echten Leseanteil ab, nicht nur ein grobes Ja/Nein.
- Positiv: Kein neuer Server-/API-Aufwand — rein clientseitig wie das bestehende `ok_progress`-Muster.
- Negativ: Ein Observer pro offener Moduldetailseite muss bei jedem Render sauber `disconnect()`et werden (s. Pitfall-Hinweis in `CLAUDE.md`), sonst laufen mehrere Observer parallel.
- Negativ: Kein Cross-Device-Sync (wie beim gesamten übrigen Fortschritt/SM-2-Store auch) — rein lokal im Browser.
