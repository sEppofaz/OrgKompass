# ADR-007: Notizen-Erinnerungen via bestehendem Telegram-Bot statt Web-Push

**Datum:** 2026-08-14
**Status:** aktiv
**Projekt:** OrgKompass

## Problem

PKA-Todo #277 (Josef) forderte einen Notizen-Tab mit optionaler Erinnerungsfunktion. Für eine Erinnerung, die auch feuert, wenn die App/das Handy gerade nicht offen ist, braucht es einen serverseitigen Mechanismus. Zwei grundsätzlich unterschiedliche Wege standen zur Wahl.

## Entscheidung

Erinnerungen laufen über den bereits bestehenden, projektübergreifend genutzten Telegram-Bot (Haupt-Bot, `TOKEN`/`CHAT_ID` in `secrets.env`). Ein systemd-Timer (`orgkompass-erinnerungen.timer`, alle 15 Minuten) prüft fällige, noch nicht gesendete Erinnerungen in `notizen.json` und verschickt eine `sendMessage`-Nachricht.

## Begründung

Auf Nachfrage entschied sich Josef explizit für „wie immer, Erinnerung per Telegram" — das ist bereits der etablierte projektübergreifende Kanal für zeitgesteuerte Hinweise (Netatmo-Alert, Kosten-Warnschwellen anderer Projekte, etc.), Josef sieht Telegram-Nachrichten zuverlässig auch ohne die jeweilige App offen zu haben. Der bestehende Bot-Token wird mitgenutzt (kein neues Secret nötig), analog zum bereits etablierten Muster der Dropbox-Zugangs-Wiederverwendung (ADR-006).

## Verworfen

| Alternative | Warum verworfen |
|---|---|
| Web-Push-Benachrichtigungen (Service-Worker-Push, Browser-Berechtigung) | Deutlich höherer technischer Aufwand (VAPID-Keys, Push-Subscription-Verwaltung), auf iOS nur zuverlässig, wenn die PWA zum Homescreen hinzugefügt wurde — Josef hat genau diesen Homescreen-Install-Weg gerade erst zum Laufen gebracht (s. Nachbesserungen weiter oben), zusätzliche Fragilität wäre unnötig gewesen |
| Reine In-App-Fälligkeits-Anzeige ohne aktive Benachrichtigung | Von Claude als einfachste Option vorgeschlagen, von Josef explizit abgelehnt zugunsten von Telegram — er möchte aktiv benachrichtigt werden, nicht nur beim zufälligen nächsten App-Öffnen etwas sehen |
| Eigener neuer Telegram-Bot nur für OrgKompass | Kein Vorteil gegenüber Mitnutzung des Haupt-Bots erkennbar, hätte nur zusätzlichen Setup-Aufwand (neuer Bot bei @BotFather, neues Secret) ohne funktionalen Mehrwert bedeutet |

## Gilt unter

Setzt voraus, dass `TOKEN`/`CHAT_ID` in `/etc/pka/secrets.env` weiterhin für den Haupt-Bot gepflegt werden (projektübergreifende Abhängigkeit — bei einem Bot-Token-Wechsel sind alle mitnutzenden Projekte betroffen, nicht nur OrgKompass).

## Konsequenzen

- Notizen mit Erinnerung müssen **serverseitig** gespeichert werden (`notizen.json`), nicht nur in `localStorage` wie Fortschritt/SM-2 — der Cronjob braucht unabhängigen Zugriff, unabhängig davon ob der Client online ist.
- Neue Schreibkonkurrenz auf `notizen.json` (Flask-CRUD + Cronjob-Skript) — Atomic-Write-Pattern (Lock+Tempfile+Rename) ist dadurch Pflicht, nicht optional (`notizen_store.py`).
- Erinnerungsgenauigkeit ist auf ±15 Minuten begrenzt (Timer-Intervall) — für den Anwendungsfall (persönliche Notizen, kein zeitkritisches System) ausreichend.
- **Nebenbefund während der Umsetzung:** Die tatsächlichen `secrets.env`-Variablennamen sind `TOKEN`/`CHAT_ID`, nicht `TELEGRAM_TOKEN`/`TELEGRAM_CHAT_ID` wie im `PKA/BKM/Telegram-Integration.md` zunächst angenommen (das BKM beschreibt offenbar die Python-internen Variablennamen nach dem Einlesen, nicht die Datei-Keys selbst) — BKM entsprechend präzisiert.
