import functools
import hmac
import secrets
import time
from pathlib import Path

import anthropic
from flask import Flask, jsonify, request, redirect, session, send_from_directory

import costs
from app_secrets import load_secrets

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


def login_required(view):
    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("authenticated"):
            return redirect("/login")
        return view(*args, **kwargs)
    return wrapped


# --- Öffentliche Routen (PWA-Installation vor Login möglich) ---

@app.route("/manifest.json")
def manifest():
    return send_from_directory(STATIC_DIR, "manifest.json")


@app.route("/sw.js")
def service_worker():
    return send_from_directory(STATIC_DIR, "sw.js")


@app.route("/icon-192.png")
@app.route("/icon-512.png")
@app.route("/apple-touch-icon.png")
def icons():
    filename = request.path.lstrip("/")
    return send_from_directory(STATIC_DIR, filename)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if _check_password(request.form.get("password", "")):
            session.permanent = True
            session["authenticated"] = True
            return redirect("/")
        return redirect("/login?error=1")
    return send_from_directory(STATIC_DIR, "login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


# --- Geschützte Routen ---

@app.route("/")
@login_required
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/app.js")
@login_required
def app_js():
    return send_from_directory(STATIC_DIR, "app.js")


@app.route("/content/<path:filename>")
@login_required
def content(filename):
    return send_from_directory(STATIC_DIR / "content", filename)


@app.route("/api/ask", methods=["POST"])
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

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True, port=5007)
