import functools
import hmac
import re
import secrets
import time
from datetime import datetime
from pathlib import Path

import anthropic
import dropbox
from flask import Flask, jsonify, request, redirect, session, send_from_directory

import costs
import notizen_store
from app_secrets import load_secrets

DROPBOX_VERLAUF_PATH = "/Apps/Claude/OrgKompass/fragen-verlauf.md"

CLAUDE_MODEL = "claude-haiku-4-5-20251001"
CLAUDE_SYSTEM_PROMPT = (
    "Du bist der Frage-Assistent der Lern-App OrgKompass für Organisationsberatung "
    "(Reorganisation, Strukturgestaltung, Funktionsbewertung, Change Management, "
    "Analyse-Methoden, internationale und agile Organisationsformen). "
    "Beantworte ausschließlich Fragen zu diesen Themen, fachlich fundiert und "
    "praxisnah für einen Organisationsberater. Bei fachfremden Fragen freundlich "
    "darauf hinweisen, dass du nur zu Organisationsberatung antwortest. "
    "Antworte auf Deutsch, prägnant (max. ca. 300 Wörter), formatiert mit "
    "Markdown (## Überschriften, **fett**, - Listen) - kein anderes Markdown."
)

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
SESSION_KEY_FILE = BASE_DIR / ".session_key"

PREFIX = "/orgkompass"

app = Flask(__name__, static_folder=None)


def _get_or_create_session_key() -> str:
    if SESSION_KEY_FILE.exists():
        return SESSION_KEY_FILE.read_text().strip()
    key = secrets.token_hex(32)
    SESSION_KEY_FILE.write_text(key)
    SESSION_KEY_FILE.chmod(0o600)
    return key


app.secret_key = _get_or_create_session_key()
app.permanent_session_lifetime = 60 * 60 * 24 * 30  # 30 Tage


def _check_password(password: str) -> bool:
    real = load_secrets().get("ORGKOMPASS_PASSWORD", "")
    return bool(real) and hmac.compare_digest(password, real)


def _dropbox_client() -> "dropbox.Dropbox | None":
    secrets_data = load_secrets()
    key = secrets_data.get("DROPBOX_APP_KEY", "")
    app_secret = secrets_data.get("DROPBOX_APP_SECRET", "")
    token = secrets_data.get("DROPBOX_REFRESH_TOKEN", "")
    if not (key and app_secret and token):
        return None
    return dropbox.Dropbox(oauth2_refresh_token=token, app_key=key, app_secret=app_secret)


def _save_qa_to_dropbox(question: str, answer: str) -> None:
    dbx = _dropbox_client()
    if dbx is None:
        return
    try:
        _, res = dbx.files_download(DROPBOX_VERLAUF_PATH)
        existing = res.content.decode("utf-8")
    except dropbox.exceptions.ApiError:
        existing = ""
    entry = (
        f"## {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        f"**Frage:** {question}\n\n"
        f"**Antwort:** {answer}\n\n---\n\n"
    )
    dbx.files_upload((existing + entry).encode("utf-8"), DROPBOX_VERLAUF_PATH,
                      mode=dropbox.files.WriteMode.overwrite)


def login_required(view):
    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("authenticated"):
            return redirect(f"{PREFIX}/login")
        return view(*args, **kwargs)
    return wrapped


# --- Öffentliche Routen (PWA-Installation vor Login möglich) ---

@app.route(f"{PREFIX}/manifest.json")
def manifest():
    return send_from_directory(STATIC_DIR, "manifest.json")


@app.route(f"{PREFIX}/sw.js")
def service_worker():
    return send_from_directory(STATIC_DIR, "sw.js")


@app.route(f"{PREFIX}/icon-192.png")
@app.route(f"{PREFIX}/icon-512.png")
@app.route(f"{PREFIX}/apple-touch-icon.png")
def icons():
    filename = request.path.rsplit("/", 1)[-1]
    return send_from_directory(STATIC_DIR, filename)


@app.route(f"{PREFIX}/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if _check_password(request.form.get("password", "")):
            session.permanent = True
            session["authenticated"] = True
            return redirect(f"{PREFIX}/")
        return redirect(f"{PREFIX}/login?error=1")
    return send_from_directory(STATIC_DIR, "login.html")


@app.route(f"{PREFIX}/logout")
def logout():
    session.clear()
    return redirect(f"{PREFIX}/login")


# --- Geschützte Routen ---

@app.route(f"{PREFIX}/")
@login_required
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route(f"{PREFIX}/app.js")
@login_required
def app_js():
    return send_from_directory(STATIC_DIR, "app.js")


@app.route(f"{PREFIX}/content/<path:filename>")
@login_required
def content(filename):
    return send_from_directory(STATIC_DIR / "content", filename)


@app.route(f"{PREFIX}/api/costs")
@login_required
def costs_today():
    return jsonify(costs.today_summary())


@app.route(f"{PREFIX}/api/ask-history")
@login_required
def ask_history():
    dbx = _dropbox_client()
    if dbx is None:
        return jsonify({"history": []})
    try:
        _, res = dbx.files_download(DROPBOX_VERLAUF_PATH)
        content = res.content.decode("utf-8")
    except dropbox.exceptions.ApiError:
        content = ""
    entries = []
    for block in content.split("\n---\n"):
        block = block.strip()
        if not block:
            continue
        m = re.match(
            r"^## (?P<ts>.+?)\n\n\*\*Frage:\*\* (?P<question>.+?)\n\n\*\*Antwort:\*\* (?P<answer>.+)$",
            block, re.DOTALL,
        )
        if m:
            entries.append({
                "ts": m.group("ts").strip(),
                "question": m.group("question").strip(),
                "answer": m.group("answer").strip(),
            })
    entries.reverse()
    return jsonify({"history": entries})


@app.route(f"{PREFIX}/api/notizen", methods=["GET", "POST"])
@login_required
def notizen():
    if request.method == "GET":
        return jsonify({"notizen": notizen_store.list_notizen()})

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Kein Text übermittelt."}), 400
    if len(text) > 2000:
        return jsonify({"error": "Text zu lang (max. 2000 Zeichen)."}), 400
    ist_todo = bool(data.get("ist_todo"))
    erinnerung = data.get("erinnerung") or None
    neue = notizen_store.create_notiz(text, ist_todo, erinnerung)
    return jsonify(neue), 201


@app.route(f"{PREFIX}/api/notizen/<notiz_id>", methods=["PUT", "DELETE"])
@login_required
def notiz_detail(notiz_id):
    if request.method == "DELETE":
        deleted = notizen_store.delete_notiz(notiz_id)
        if not deleted:
            return jsonify({"error": "Notiz nicht gefunden."}), 404
        return jsonify({"ok": True})

    data = request.get_json(silent=True) or {}
    fields = {}
    if "erledigt" in data:
        fields["erledigt"] = bool(data["erledigt"])
    if "text" in data:
        text = (data.get("text") or "").strip()
        if not text or len(text) > 2000:
            return jsonify({"error": "Ungültiger Text."}), 400
        fields["text"] = text
    if "erinnerung" in data:
        fields["erinnerung"] = data.get("erinnerung") or None
        fields["erinnerung_gesendet"] = False
    updated = notizen_store.update_notiz(notiz_id, **fields)
    if updated is None:
        return jsonify({"error": "Notiz nicht gefunden."}), 404
    return jsonify(updated)


@app.route(f"{PREFIX}/api/ask", methods=["POST"])
@login_required
def ask():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "Keine Frage übermittelt."}), 400
    if len(question) > 2000:
        return jsonify({"error": "Frage zu lang (max. 2000 Zeichen)."}), 400

    if costs.is_hard_killed_today():
        return jsonify({"error": "Tages-Kostenlimit für die Frage-Funktion erreicht. Bitte morgen erneut versuchen."}), 429

    api_key = load_secrets().get("CLAUDE_API_KEY", "")
    if not api_key:
        return jsonify({"error": "Frage-Funktion ist aktuell nicht konfiguriert."}), 503

    client = anthropic.Anthropic(api_key=api_key)
    message = None
    for attempt in range(1, 4):
        try:
            message = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=1500,
                system=CLAUDE_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": question}],
            )
            break
        except anthropic.APIStatusError as e:
            if e.status_code == 529 and attempt < 3:
                time.sleep(attempt * 15)
            else:
                return jsonify({"error": "Claude-API aktuell überlastet. Bitte später erneut versuchen."}), 502
        except anthropic.APIError:
            return jsonify({"error": "Claude-API aktuell nicht erreichbar. Bitte später erneut versuchen."}), 502

    answer = message.content[0].text
    result = costs.record_call(
        CLAUDE_MODEL, message.usage.input_tokens, message.usage.output_tokens, context="orgkompass:ask"
    )
    if result["hard_kill"]:
        print(f"[orgkompass] Tages-Hard-Kill erreicht: {result['day_total_usd']:.4f} USD")
    elif result["warn_1usd"]:
        print(f"[orgkompass] Tages-Warnschwelle erreicht: {result['day_total_usd']:.4f} USD")

    try:
        _save_qa_to_dropbox(question, answer)
    except Exception as e:
        print(f"[orgkompass] Dropbox-Speicherung fehlgeschlagen: {e}")

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True, port=5007)
