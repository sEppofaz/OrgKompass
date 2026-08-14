import fcntl
import json
import os
import secrets
import tempfile
import threading
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NOTIZEN_PATH = os.path.join(BASE_DIR, "notizen.json")
_lock = threading.Lock()


def _ensure_file():
    if not os.path.exists(NOTIZEN_PATH):
        with open(NOTIZEN_PATH, "w") as f:
            json.dump({"notizen": []}, f)


def _update(mutator_fn):
    """mutator_fn bekommt die aktuelle Liste, gibt die neue zurueck."""
    _ensure_file()
    with _lock:
        with open(NOTIZEN_PATH, "r+") as f:
            fcntl.flock(f, fcntl.LOCK_EX)
            try:
                current = json.load(f)
                current.setdefault("notizen", [])
                current["notizen"] = mutator_fn(current["notizen"])

                dir_ = os.path.dirname(NOTIZEN_PATH)
                fd, tmp_path = tempfile.mkstemp(dir=dir_)
                with os.fdopen(fd, "w") as tmp:
                    json.dump(current, tmp, ensure_ascii=False, indent=2)
                os.replace(tmp_path, NOTIZEN_PATH)

                return current
            finally:
                fcntl.flock(f, fcntl.LOCK_UN)


def list_notizen():
    _ensure_file()
    with open(NOTIZEN_PATH) as f:
        data = json.load(f)
    return data.get("notizen", [])


def create_notiz(text: str, ist_todo: bool, erinnerung: str | None) -> dict:
    neue = {
        "id": secrets.token_hex(8),
        "text": text,
        "ist_todo": ist_todo,
        "erledigt": False,
        "erinnerung": erinnerung,
        "erinnerung_gesendet": False,
        "erstellt": datetime.now().isoformat(timespec="seconds"),
    }

    def mutate(notizen):
        return [neue] + notizen

    _update(mutate)
    return neue


def update_notiz(notiz_id: str, **fields) -> dict | None:
    result = {"found": None}

    def mutate(notizen):
        for n in notizen:
            if n["id"] == notiz_id:
                n.update(fields)
                result["found"] = n
        return notizen

    _update(mutate)
    return result["found"]


def delete_notiz(notiz_id: str) -> bool:
    result = {"deleted": False}

    def mutate(notizen):
        new_list = [n for n in notizen if n["id"] != notiz_id]
        result["deleted"] = len(new_list) != len(notizen)
        return new_list

    _update(mutate)
    return result["deleted"]
