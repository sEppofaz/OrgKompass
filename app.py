import functools
import hmac
import secrets
from pathlib import Path

from flask import Flask, request, redirect, session, send_from_directory

from app_secrets import load_secrets

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


if __name__ == "__main__":
    app.run(debug=True, port=5007)
