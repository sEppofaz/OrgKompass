import json
import sys
import urllib.request
from datetime import datetime

from app_secrets import load_secrets
from notizen_store import list_notizen, update_notiz


def send_telegram(token: str, chat_id: str, text: str) -> None:
    data = json.dumps({"chat_id": chat_id, "text": text}).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    urllib.request.urlopen(req)


def main():
    secrets_data = load_secrets()
    token = secrets_data.get("TELEGRAM_TOKEN", "")
    chat_id = secrets_data.get("TELEGRAM_CHAT_ID", "")
    if not (token and chat_id):
        print("TELEGRAM_TOKEN/TELEGRAM_CHAT_ID nicht konfiguriert.", file=sys.stderr)
        return

    now = datetime.now().isoformat(timespec="minutes")
    faellig = [
        n for n in list_notizen()
        if n.get("erinnerung") and not n.get("erinnerung_gesendet")
        and not n.get("erledigt") and n["erinnerung"] <= now
    ]

    for n in faellig:
        text = f"🔔 OrgKompass-Erinnerung: {n['text']}"
        try:
            send_telegram(token, chat_id, text)
            update_notiz(n["id"], erinnerung_gesendet=True)
        except Exception as e:
            print(f"Fehler beim Senden fuer Notiz {n['id']}: {e}", file=sys.stderr)

    print(f"{len(faellig)} Erinnerung(en) geprueft/gesendet.")


if __name__ == "__main__":
    main()
