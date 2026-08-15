/* OrgKompass — App-Shell, Gamification, Quiz-Engine (Phase 1 Grundgerüst) */

const ICON_PATHS = {
  'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  'library': '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  'bar-chart-3': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  'edit-3': '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
};

function icon(name, size = 20) {
  const path = ICON_PATHS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/* ---------- Gamification ---------- */

const LEVELS = [
  { min: 0, name: 'Neuling' },
  { min: 100, name: 'Beobachter' },
  { min: 300, name: 'Analyst' },
  { min: 700, name: 'Berater' },
  { min: 1300, name: 'Change Agent' },
  { min: 2200, name: 'Strukturexperte' },
  { min: 3500, name: 'Senior Berater' },
  { min: 5500, name: 'Vorstandsberater' },
  { min: 8500, name: 'Organisationsarchitekt' },
  { min: 13000, name: 'Meister der Reorganisation' },
];

function levelForXp(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) current = l;
  }
  return current;
}

function getXp() { return parseInt(localStorage.getItem('ok_xp') || '0', 10); }
function setXp(v) { localStorage.setItem('ok_xp', String(v)); }

function todayStr() { return new Date().toISOString().slice(0, 10); }

function streakMult(streak) {
  if (streak >= 7) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

function getStreak() { return parseInt(localStorage.getItem('ok_streak') || '0', 10); }

function computeAndApplyBonus(baseXp) {
  const last = localStorage.getItem('ok_quiz_date');
  const today = todayStr();
  let streak = getStreak();

  if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = last === yesterday ? streak + 1 : 1;
    localStorage.setItem('ok_streak', String(streak));
    localStorage.setItem('ok_quiz_date', today);
  }

  const mult = streakMult(streak);
  const xpBefore = getXp();
  const levelBefore = levelForXp(xpBefore);
  const xpAfter = xpBefore + Math.round(baseXp * mult);
  setXp(xpAfter);
  const levelAfter = levelForXp(xpAfter);

  return { xpGained: xpAfter - xpBefore, streak, levelUp: levelAfter.name !== levelBefore.name, level: levelAfter };
}

function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#8a8a8e', '#a0a0a5', '#2c2c2e', '#c7c7cc'];
  const pieces = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    vy: 2 + Math.random() * 3,
    vx: -1 + Math.random() * 2,
    size: 4 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let frame = 0;
  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    frame++;
    if (frame < 90) requestAnimationFrame(step);
    else canvas.remove();
  }
  step();
}

/* ---------- SM-2-artiges Spaced Repetition ---------- */

function getProgress() {
  try { return JSON.parse(localStorage.getItem('ok_progress') || '{}'); }
  catch { return {}; }
}
function saveProgress(p) { localStorage.setItem('ok_progress', JSON.stringify(p)); }

function recordAnswer(questionId, correct) {
  const progress = getProgress();
  const entry = progress[questionId] || { seen: 0, correct: 0, streakCorrect: 0, interval: 1, ease: 2.3 };
  entry.seen += 1;
  entry.lastResult = correct;
  if (correct) {
    entry.correct += 1;
    entry.streakCorrect += 1;
    entry.interval = Math.max(1, Math.round(entry.interval * entry.ease));
    entry.ease = Math.min(2.8, entry.ease + 0.1);
  } else {
    entry.streakCorrect = 0;
    entry.interval = 1;
    entry.ease = Math.max(1.3, entry.ease - 0.2);
  }
  const next = new Date();
  next.setDate(next.getDate() + entry.interval);
  entry.nextReview = next.toISOString().slice(0, 10);
  progress[questionId] = entry;
  saveProgress(progress);
  return entry;
}

/* ---------- Lese-Fortschritt (Abschnitte, per Scroll-Sichtbarkeit) ---------- */

function getReadProgress() {
  try { return JSON.parse(localStorage.getItem('ok_read') || '{}'); }
  catch { return {}; }
}
function markAbschnittGelesen(moduleId, abschnittId) {
  const read = getReadProgress();
  const gelesen = read[moduleId] || [];
  if (!gelesen.includes(abschnittId)) {
    gelesen.push(abschnittId);
    read[moduleId] = gelesen;
    localStorage.setItem('ok_read', JSON.stringify(read));
  }
}
function moduleReadStats(m) {
  const gelesen = getReadProgress()[m.id] || [];
  const total = m.abschnitte.length;
  const count = m.abschnitte.filter((a) => gelesen.includes(a.id)).length;
  return { count, total, pct: total ? Math.round((count / total) * 100) : 0 };
}

let readObserver = null;
function setupReadTracking(moduleId) {
  if (readObserver) readObserver.disconnect();
  const blocks = document.querySelectorAll('.section-block');
  if (!blocks.length) return;
  readObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) markAbschnittGelesen(moduleId, entry.target.id.replace('abschnitt-', ''));
    });
  }, { root: document.getElementById('main'), threshold: 0.4 });
  blocks.forEach((b) => readObserver.observe(b));
}

/* ---------- Einstufungstest ---------- */

const DIAGNOSTIK_LEVELS = [
  { max: 0.4, name: 'Anfänger' },
  { max: 0.75, name: 'Fortgeschritten' },
  { max: Infinity, name: 'Erfahren' },
];

function diagnostikLevelName(score) {
  for (const l of DIAGNOSTIK_LEVELS) if (score < l.max) return l.name;
  return 'Erfahren';
}

function getDiagnostikFragen() {
  return MODULES.filter((m) => !m.bonus).flatMap((m) =>
    m.fragen.filter((q) => q.diagnostik).map((q) => ({ ...q, moduleId: m.id, moduleTitel: m.titel }))
  );
}

function getDiagnostikErgebnis() {
  try { return JSON.parse(localStorage.getItem('ok_diagnostik_ergebnis') || 'null'); }
  catch { return null; }
}

function computeThemenfeldErgebnis(answers) {
  const byThemenfeld = {};
  answers.forEach(({ themenfeld, correct, moduleId, moduleTitel }) => {
    const t = byThemenfeld[themenfeld] || { correct: 0, total: 0, moduleId, moduleTitel };
    t.total += 1;
    if (correct) t.correct += 1;
    byThemenfeld[themenfeld] = t;
  });
  Object.values(byThemenfeld).forEach((t) => { t.score = t.correct / t.total; });
  return byThemenfeld;
}

function themenfeldCurrentScore(themenfeld) {
  const progress = getProgress();
  const qs = MODULES.flatMap((m) => m.fragen.filter((q) => q.themenfeld === themenfeld));
  if (!qs.length) return null;
  const mastered = qs.filter((q) => {
    const e = progress[q.id];
    return e && e.ease >= 2.0 && e.streakCorrect >= 2;
  }).length;
  return mastered / qs.length;
}

/* ---------- Fällige Wiederholungen ---------- */

function getDueQuestions() {
  const progress = getProgress();
  const today = todayStr();
  const due = [];
  MODULES.forEach((m) => m.fragen.forEach((q) => {
    const e = progress[q.id];
    if (e && e.nextReview && e.nextReview <= today) due.push({ ...q, moduleId: m.id });
  }));
  return due;
}

/* ---------- State ---------- */

const STATE = {
  tab: 'lernen',
  activeModuleId: null,
  quiz: null, // { moduleId, questions, idx, score }
  einstufung: null, // { questions, idx, answers, saved, bonus }
};

/* ---------- Navigation ---------- */

const TABS = [
  { id: 'lernen', label: 'Lernen', icon: 'book-open' },
  { id: 'glossar', label: 'Glossar', icon: 'library' },
  { id: 'frage', label: 'Frage', icon: 'message-circle' },
  { id: 'notizen', label: 'Notizen', icon: 'edit-3' },
  { id: 'quiz', label: 'Quiz', icon: 'list-checks' },
  { id: 'fortschritt', label: 'Fortschritt', icon: 'bar-chart-3' },
];

function renderTabBar() {
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = TABS.map(
    (t) => `<button class="tab-btn${STATE.tab === t.id ? ' active' : ''}" data-tab="${t.id}">
      ${icon(t.icon, 22)}<span>${t.label}</span>
    </button>`
  ).join('');
  bar.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  STATE.tab = tabId;
  STATE.activeModuleId = null;
  STATE.quiz = null;
  STATE.einstufung = null;
  renderTabBar();
  render();
  document.getElementById('main').scrollTo(0, 0);
}

/* ---------- Rendering: Lernen ---------- */

function renderLernen() {
  if (STATE.activeModuleId) {
    return renderModuleDetail(STATE.activeModuleId);
  }
  const items = MODULES.map((m) => {
    const s = moduleReadStats(m);
    return `
    <button class="card module-card" data-module="${m.id}">
      <div>
        <div class="module-card-title">${m.bonus ? '⭐ ' : ''}${m.titel}</div>
        <div class="module-card-desc">${m.kurzbeschreibung || ''}</div>
      </div>
      ${icon('chevron-right', 20)}
      <div class="module-card-progress-track"><div class="module-card-progress-fill" style="width:${s.pct}%"></div></div>
    </button>
  `;
  }).join('');
  return `<h1 class="page-title">Module</h1><div class="card-list">${items}</div>`;
}

function renderModuleDetail(moduleId) {
  const m = MODULES.find((x) => x.id === moduleId);
  if (!m) return '<p>Modul nicht gefunden.</p>';
  const idx = MODULES.findIndex((x) => x.id === moduleId);
  const next = MODULES[idx + 1];
  const sections = m.abschnitte.map((a) => `
    <div class="section-block" id="abschnitt-${a.id}">
      <div class="markdown">${renderMarkdown(a.inhalt_markdown)}</div>
      ${a.diagramm && DIAGRAMS[a.diagramm] ? `<div class="diagram">${DIAGRAMS[a.diagramm]()}</div>` : ''}
    </div>
  `).join('');
  return `
    <button class="back-link" data-back-to-modules>${icon('chevron-right', 16)} zurück</button>
    <h1 class="page-title">${m.titel}</h1>
    ${sections}
    <button class="btn-primary" id="start-quiz-from-module">Quiz zu diesem Modul starten</button>
    <div class="module-nav-footer">
      <button class="back-link" data-back-to-modules>${icon('chevron-right', 16)} zurück</button>
      ${next ? `<button class="back-link module-nav-next" data-next-module="${next.id}">weiter: ${next.titel} ${icon('chevron-right', 16)}</button>` : ''}
    </div>
  `;
}

function jumpToAbschnitt(moduleId, abschnittId) {
  STATE.tab = 'lernen';
  STATE.activeModuleId = moduleId;
  renderTabBar();
  render();
  requestAnimationFrame(() => {
    const el = document.getElementById(`abschnitt-${abschnittId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ---------- Rendering: Notizen ---------- */

function renderNotizen() {
  return `
    <h1 class="page-title">Notizen</h1>
    <p class="muted">Eigene Gedanken festhalten — optional als To-Do markieren oder eine Telegram-Erinnerung setzen.</p>
    <div class="notiz-form">
      <textarea id="notiz-text" class="search-input" placeholder="Neue Notiz…" rows="2" style="resize:vertical"></textarea>
      <div class="notiz-form-row">
        <label class="notiz-todo-toggle"><input type="checkbox" id="notiz-todo"> Als To-Do markieren</label>
        <input type="datetime-local" id="notiz-erinnerung" class="notiz-datetime">
      </div>
      <div id="notiz-error" class="muted" style="font-size:.8rem;display:none"></div>
      <button class="btn-primary" id="notiz-add">Notiz speichern</button>
    </div>
    <div id="notizen-liste" style="margin-top:20px"><p class="muted">Lädt…</p></div>
  `;
}

function formatErinnerung(iso) {
  const [datum, zeit] = iso.split('T');
  const [y, m, d] = datum.split('-');
  return `${d}.${m}.${y}${zeit ? ', ' + zeit : ''}`;
}

async function loadNotizen() {
  const liste = document.getElementById('notizen-liste');
  if (!liste) return;
  try {
    const res = await fetch('/orgkompass/api/notizen');
    const data = await res.json();
    const items = data.notizen || [];
    if (!items.length) {
      liste.innerHTML = '<p class="muted">Noch keine Notizen.</p>';
      return;
    }
    liste.innerHTML = items.map((n) => `
      <div class="card notiz-item${n.erledigt ? ' notiz-erledigt' : ''}">
        <div class="notiz-item-row">
          ${n.ist_todo ? `<button class="notiz-check${n.erledigt ? ' checked' : ''}" data-notiz-toggle="${n.id}" data-checked="${n.erledigt}" aria-label="Erledigt umschalten"></button>` : ''}
          <div class="notiz-item-text">${escapeHtml(n.text)}</div>
          <button class="notiz-delete" data-notiz-delete="${n.id}" aria-label="Löschen">${icon('trash-2', 16)}</button>
        </div>
        ${n.erinnerung ? `<div class="notiz-item-meta">${icon('bell', 12)} ${escapeHtml(formatErinnerung(n.erinnerung))}${n.erinnerung_gesendet ? ' · gesendet' : ''}</div>` : ''}
      </div>
    `).join('');
    liste.querySelectorAll('[data-notiz-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => toggleNotizErledigt(btn.dataset.notizToggle, btn.dataset.checked !== 'true'));
    });
    liste.querySelectorAll('[data-notiz-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteNotiz(btn.dataset.notizDelete));
    });
  } catch {
    liste.innerHTML = '<p class="muted">Notizen konnten nicht geladen werden.</p>';
  }
}

async function addNotiz() {
  const textEl = document.getElementById('notiz-text');
  const todoEl = document.getElementById('notiz-todo');
  const erinnerungEl = document.getElementById('notiz-erinnerung');
  const errorEl = document.getElementById('notiz-error');
  const text = textEl.value.trim();
  errorEl.style.display = 'none';
  if (!text) return;
  try {
    const res = await fetch('/orgkompass/api/notizen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ist_todo: todoEl.checked, erinnerung: erinnerungEl.value || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      errorEl.textContent = data.error || 'Notiz konnte nicht gespeichert werden.';
      errorEl.style.display = 'block';
      return;
    }
    textEl.value = '';
    todoEl.checked = false;
    erinnerungEl.value = '';
    loadNotizen();
  } catch {
    errorEl.textContent = 'Verbindungsfehler — bitte erneut versuchen.';
    errorEl.style.display = 'block';
  }
}

async function toggleNotizErledigt(id, newState) {
  await fetch(`/orgkompass/api/notizen/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ erledigt: newState }),
  });
  loadNotizen();
}

async function deleteNotiz(id) {
  await fetch(`/orgkompass/api/notizen/${id}`, { method: 'DELETE' });
  loadNotizen();
}

/* ---------- Rendering: Quiz ---------- */

function quizModuleBadge(m) {
  const progress = getProgress();
  let started = false;
  const allMastered = m.fragen.every((q) => {
    const e = progress[q.id];
    if (e && e.seen > 0) started = true;
    return e && e.ease >= 2.0 && e.streakCorrect >= 2;
  });
  if (allMastered) return '<span class="module-badge module-badge-done" aria-label="Alle Fragen gemeistert"></span>';
  if (started) return '<span class="module-badge module-badge-open" aria-label="Fragen noch offen"></span>';
  return '';
}

function renderQuiz() {
  if (!STATE.quiz) {
    const dueCount = getDueQuestions().length;
    const dueEntry = dueCount ? `
      <button class="card module-card" id="start-due-review">
        <div>
          <div class="module-card-title">${icon('flame', 16)} Fällige Wiederholungen</div>
          <div class="module-card-desc">${dueCount} Frage${dueCount === 1 ? '' : 'n'} bereit</div>
        </div>
        ${icon('chevron-right', 20)}
      </button>
    ` : '';
    const items = MODULES.map((m) => {
      const s = moduleQuizStats(m);
      let desc;
      if (s.offenCount === 0) desc = `${s.total} Fragen · alle gemeistert`;
      else if (s.offenCount === s.total) desc = `${s.total} Fragen`;
      else desc = `${s.offenCount} von ${s.total} noch offen`;
      const zeigeAlleBtn = s.offenCount > 0 && s.offenCount < s.total;
      return `
      <div class="card module-card-row">
        <button class="module-card-tap" data-quiz-module="${m.id}">
          <div>
            <div class="module-card-title">${m.titel}</div>
            <div class="module-card-desc">${desc}</div>
          </div>
          ${icon('chevron-right', 20)}
        </button>
        ${quizModuleBadge(m)}
        ${zeigeAlleBtn ? `<button class="quiz-all-link" data-quiz-module-all="${m.id}">Alle ${s.total} Fragen üben</button>` : ''}
      </div>
    `;
    }).join('');
    return `<h1 class="page-title">Quiz auswählen</h1><div class="card-list">${dueEntry}${items}</div>`;
  }
  const q = STATE.quiz.questions[STATE.quiz.idx];
  if (!q) return renderQuizResults();
  const options = q.optionen.map((opt, i) => `
    <button class="quiz-option" data-idx="${i}">${opt}</button>
  `).join('');
  return `
    <button class="back-link" data-quiz-exit>${icon('chevron-right', 16)} zurück</button>
    <div class="quiz-progress">${STATE.quiz.nurOffene ? 'Wiederholung (nur offene Fragen) — ' : ''}Frage ${STATE.quiz.idx + 1} / ${STATE.quiz.questions.length}</div>
    <h2 class="quiz-question">${q.frage}</h2>
    <div class="quiz-options">${options}</div>
  `;
}

function renderQuizResults() {
  const { score, questions } = STATE.quiz;
  const baseXp = score * 10 + (questions.length - score) * 2;
  const bonus = computeAndApplyBonus(baseXp);
  if (bonus.levelUp) triggerConfetti();
  const streakEl = `${icon('flame', 18)} ${bonus.streak} Tage Streak`;
  return `
    <h1 class="page-title">Ergebnis</h1>
    <p class="quiz-result-score">${score} / ${questions.length} richtig</p>
    <p class="quiz-result-xp">+${bonus.xpGained} XP ${bonus.levelUp ? `— Level Up: ${bonus.level.name}!` : ''}</p>
    <p class="muted">${streakEl}</p>
    <button class="btn-primary" id="quiz-done">Fertig</button>
  `;
}

function moduleQuizStats(m) {
  const progress = getProgress();
  const alle = m.fragen.filter((q) => q.typ === 'multiple-choice');
  const offen = alle.filter((q) => {
    const e = progress[q.id];
    return !(e && e.ease >= 2.0 && e.streakCorrect >= 2);
  });
  return { total: alle.length, offenCount: offen.length };
}

function startQuiz(moduleId, opts = {}) {
  const m = MODULES.find((x) => x.id === moduleId);
  if (!m) return;
  const progress = getProgress();
  const alle = m.fragen.filter((q) => q.typ === 'multiple-choice');
  const offen = alle.filter((q) => {
    const e = progress[q.id];
    return !(e && e.ease >= 2.0 && e.streakCorrect >= 2);
  });
  const nurOffene = !opts.erzwingeAlle && offen.length > 0 && offen.length < alle.length;
  STATE.quiz = { moduleId, questions: nurOffene ? offen : alle, idx: 0, score: 0, nurOffene };
  render();
}

function startDueReviewQuiz() {
  const due = getDueQuestions();
  if (!due.length) return;
  STATE.quiz = { moduleId: 'wiederholung', questions: due, idx: 0, score: 0 };
  render();
}

function answerQuiz(optionIdx) {
  const q = STATE.quiz.questions[STATE.quiz.idx];
  const correct = optionIdx === q.loesung_index;
  if (correct) STATE.quiz.score += 1;
  recordAnswer(q.id, correct);

  const buttons = document.querySelectorAll('.quiz-option');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.loesung_index) b.classList.add('correct');
    else if (i === optionIdx) b.classList.add('incorrect');
  });

  setTimeout(() => {
    if (!STATE.quiz) return;
    STATE.quiz.idx += 1;
    render();
  }, 1200);
}

/* ---------- Volltextsuche (Glossar + Modul-Abschnitte) ---------- */

let SEARCH_INDEX = null;

function stripMarkdown(md) {
  return (md || '').replace(/[#*_`>-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildSearchIndex() {
  const idx = [];
  GLOSSARY.forEach((g) => {
    const plain = stripMarkdown(g.erklaerung_markdown);
    idx.push({
      type: 'glossar', title: g.term, snippet: g.kurz,
      searchText: `${g.term} ${g.kurz} ${plain}`.toLowerCase(), ref: g,
    });
  });
  MODULES.forEach((m) => {
    m.abschnitte.forEach((a) => {
      const plain = stripMarkdown(a.inhalt_markdown);
      idx.push({
        type: 'modul', title: a.titel, snippet: plain.slice(0, 130) + (plain.length > 130 ? '…' : ''),
        searchText: `${a.titel} ${plain}`.toLowerCase(),
        moduleId: m.id, moduleTitel: m.titel, abschnittId: a.id,
      });
    });
  });
  SEARCH_INDEX = idx;
}

function computeSuggestions(term) {
  const seen = new Set(), out = [];
  for (const entry of SEARCH_INDEX) {
    const key = entry.title.toLowerCase();
    if (key.includes(term) && !seen.has(key)) { seen.add(key); out.push(entry.title); }
  }
  return out.sort((a, b) => a.localeCompare(b, 'de')).slice(0, 8);
}

let suggestionIndex = -1;

function updateSuggestionsBox() {
  const input = document.getElementById('glossar-search');
  const box = document.getElementById('glossar-suggestions');
  if (!input || !box) return;
  const term = input.value.trim().toLowerCase();
  suggestionIndex = -1;
  if (document.activeElement !== input || term.length < 2) { box.style.display = 'none'; box.innerHTML = ''; return; }
  const suggestions = computeSuggestions(term);
  if (!suggestions.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
  box.innerHTML = suggestions.map((v) => `<div class="suggestion-item" data-value="${escapeHtml(v)}">${escapeHtml(v)}</div>`).join('');
  box.style.display = 'block';
}

function pickSuggestion(value) {
  const input = document.getElementById('glossar-search');
  const clearBtn = document.getElementById('glossar-search-clear');
  input.value = value;
  renderGlossarResults(value);
  clearBtn.style.display = 'block';
  document.getElementById('glossar-suggestions').style.display = 'none';
}

/* ---------- Rendering: Glossar & Suche ---------- */

function renderGlossar() {
  return `
    <h1 class="page-title">Glossar &amp; Suche</h1>
    <p class="muted">Durchsucht Glossar und Modulinhalte.</p>
    <div class="search-wrap">
      <input type="search" id="glossar-search" class="search-input" placeholder="Begriff oder Thema suchen…" autocomplete="off">
      <button class="search-clear" id="glossar-search-clear" style="display:none">${icon('x', 16)}</button>
      <div id="glossar-suggestions" class="suggestions"></div>
    </div>
    <div id="glossar-results"></div>
  `;
}

function renderGlossarResults(filter = '') {
  const results = document.getElementById('glossar-results');
  if (!results) return;
  const f = filter.trim().toLowerCase();

  if (!f) {
    const items = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, 'de'));
    results.innerHTML = `<div class="card-list">${items.map((g) => `
      <div class="card glossary-card">
        <div class="module-card-title">${g.term}</div>
        <div class="module-card-desc">${g.kurz}</div>
      </div>
    `).join('')}</div>`;
    return;
  }

  const matches = SEARCH_INDEX.filter((e) => e.searchText.includes(f));
  const glossarMatches = matches.filter((e) => e.type === 'glossar');
  const modulMatches = matches.filter((e) => e.type === 'modul');

  if (!matches.length) {
    results.innerHTML = '<p class="muted">Keine Treffer.</p>';
    return;
  }

  let html = '';
  if (glossarMatches.length) {
    html += `<h2 class="page-title" style="font-size:1rem;margin:8px 0 10px">Glossar (${glossarMatches.length})</h2>
      <div class="card-list">${glossarMatches.map((e) => `
        <div class="card glossary-card">
          <div class="module-card-title">${e.title}</div>
          <div class="module-card-desc">${e.snippet}</div>
        </div>
      `).join('')}</div>`;
  }
  if (modulMatches.length) {
    html += `<h2 class="page-title" style="font-size:1rem;margin:20px 0 10px">Module (${modulMatches.length})</h2>
      <div class="card-list">${modulMatches.map((e) => `
        <button class="card module-card" data-jump-module="${e.moduleId}" data-jump-abschnitt="${e.abschnittId}">
          <div>
            <div class="module-card-title">${e.title}</div>
            <div class="module-card-desc">${e.moduleTitel} — ${e.snippet}</div>
          </div>
          ${icon('chevron-right', 20)}
        </button>
      `).join('')}</div>`;
  }
  results.innerHTML = html;
}

/* ---------- Rendering: Frage stellen ---------- */

function renderFrage() {
  return `
    <h1 class="page-title">Frage stellen</h1>
    <p class="muted">Stelle eine Frage zur Organisationsberatung — die Antwort kommt von Claude.</p>
    <div id="frage-antwort" class="markdown frage-antwort"></div>
    <div class="frage-input-wrap">
      <input type="text" id="frage-input" class="search-input" placeholder="Deine Frage…" autocomplete="off">
      <button class="btn-icon" id="frage-send">${icon('send', 20)}</button>
    </div>
    <div id="frage-kosten" class="muted" style="font-size:.78rem;margin-top:8px"></div>
    <h2 class="page-title" style="font-size:1.05rem;margin-top:24px">Bisherige Fragen</h2>
    <div id="frage-verlauf" class="markdown"><p class="muted">Lädt…</p></div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function loadFrageKosten() {
  const el = document.getElementById('frage-kosten');
  if (!el) return;
  try {
    const res = await fetch('/orgkompass/api/costs');
    const c = await res.json();
    const heute = `Heute: $${c.cost_usd.toFixed(4)} von $${c.warn_usd.toFixed(2)} (${c.calls} Frage${c.calls === 1 ? '' : 'n'})${c.hard_killed ? ' — Tageslimit erreicht' : ''}`;
    const rest = `Monat: $${c.month_usd.toFixed(4)} · Jahr: $${c.year_usd.toFixed(4)} · Gesamt: $${c.total_usd.toFixed(4)}`;
    el.innerHTML = `<div>${heute}</div><div>${rest}</div>`;
  } catch {
    el.innerHTML = '';
  }
}

async function loadFrageVerlauf() {
  const verlauf = document.getElementById('frage-verlauf');
  if (!verlauf) return;
  try {
    const res = await fetch('/orgkompass/api/ask-history');
    const data = await res.json();
    const items = data.history || [];
    if (!items.length) {
      verlauf.innerHTML = '<p class="muted">Noch keine gespeicherten Fragen.</p>';
      return;
    }
    verlauf.innerHTML = items.map((item, i) => `
      <div class="verlauf-item">
        <button class="verlauf-frage" data-idx="${i}">
          ${icon('chevron-right', 16)}
          <span class="verlauf-frage-text">${escapeHtml(item.question)}</span>
        </button>
        <div class="verlauf-meta">${escapeHtml(item.ts)}</div>
        <div class="verlauf-antwort markdown" id="verlauf-antwort-${i}">${renderMarkdown(item.answer)}</div>
      </div>
    `).join('');
    verlauf.querySelectorAll('.verlauf-frage').forEach((btn) => {
      btn.addEventListener('click', () => {
        const body = document.getElementById(`verlauf-antwort-${btn.dataset.idx}`);
        const willOpen = !body.classList.contains('open');
        body.classList.toggle('open', willOpen);
        btn.classList.toggle('open', willOpen);
      });
    });
  } catch {
    verlauf.innerHTML = '<p class="muted">Verlauf konnte nicht geladen werden.</p>';
  }
}

async function handleFrageSend() {
  const input = document.getElementById('frage-input');
  const sendBtn = document.getElementById('frage-send');
  const antwort = document.getElementById('frage-antwort');
  const question = input.value.trim();
  if (!question) return;

  input.disabled = true;
  sendBtn.disabled = true;
  antwort.innerHTML = '<p class="muted">Claude denkt nach…</p>';

  try {
    const res = await fetch('/orgkompass/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok) {
      antwort.innerHTML = `<p class="muted">${data.error || 'Unerwarteter Fehler.'}</p>`;
    } else {
      antwort.innerHTML = renderMarkdown(data.answer);
      input.value = '';
      loadFrageVerlauf();
      loadFrageKosten();
    }
  } catch {
    antwort.innerHTML = '<p class="muted">Verbindungsfehler — bitte erneut versuchen.</p>';
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
  }
}

/* ---------- Rendering: Einstufungstest ---------- */

function startEinstufungstest() {
  STATE.einstufung = { questions: getDiagnostikFragen(), idx: 0, answers: [], saved: false };
  render();
}

function renderEinstufungstest() {
  const { questions, idx } = STATE.einstufung;
  const q = questions[idx];
  if (!q) return renderEinstufungResult();
  const options = q.optionen.map((opt, i) => `<button class="quiz-option" data-idx="${i}">${opt}</button>`).join('');
  return `
    <div class="quiz-progress">Einstufungstest — Frage ${idx + 1} / ${questions.length}</div>
    <h2 class="quiz-question">${q.frage}</h2>
    <div class="quiz-options">${options}</div>
  `;
}

function answerEinstufung(optionIdx) {
  const { questions, idx } = STATE.einstufung;
  const q = questions[idx];
  const correct = optionIdx === q.loesung_index;
  recordAnswer(q.id, correct);
  STATE.einstufung.answers.push({ themenfeld: q.themenfeld, correct, moduleId: q.moduleId, moduleTitel: q.moduleTitel });

  const buttons = document.querySelectorAll('.quiz-option');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.loesung_index) b.classList.add('correct');
    else if (i === optionIdx) b.classList.add('incorrect');
  });

  setTimeout(() => {
    STATE.einstufung.idx += 1;
    render();
  }, 1200);
}

function renderEinstufungResult() {
  const { answers, questions } = STATE.einstufung;
  if (!STATE.einstufung.saved) {
    const ergebnis = computeThemenfeldErgebnis(answers);
    localStorage.setItem('ok_diagnostik_ergebnis', JSON.stringify(ergebnis));
    localStorage.setItem('ok_diagnostik_datum', todayStr());
    const score = answers.filter((a) => a.correct).length;
    const bonus = computeAndApplyBonus(score * 10 + (questions.length - score) * 2);
    if (bonus.levelUp) triggerConfetti();
    STATE.einstufung.saved = true;
    STATE.einstufung.bonus = bonus;
  }
  const score = answers.filter((a) => a.correct).length;
  return `
    <h1 class="page-title">Einstufungstest — Ergebnis</h1>
    <p class="quiz-result-score">${score} / ${questions.length} richtig</p>
    <p class="quiz-result-xp">+${STATE.einstufung.bonus.xpGained} XP${STATE.einstufung.bonus.levelUp ? ` — Level Up: ${STATE.einstufung.bonus.level.name}!` : ''}</p>
    <button class="btn-primary" id="einstufung-done">Zum Fortschritts-Dashboard</button>
  `;
}

/* ---------- Rendering: Fortschritt ---------- */

function moduleProgressStats(m) {
  const progress = getProgress();
  const total = m.fragen.length;
  const mastered = m.fragen.filter((q) => {
    const e = progress[q.id];
    return e && e.ease >= 2.0 && e.streakCorrect >= 2;
  }).length;
  return { total, mastered, pct: total ? Math.round((mastered / total) * 100) : 0 };
}

function renderFortschritt() {
  const xp = getXp();
  const level = levelForXp(xp);
  const streak = getStreak();
  const progress = getProgress();
  const totalQuestions = MODULES.reduce((sum, m) => sum + m.fragen.length, 0);
  const mastered = Object.values(progress).filter((e) => e.ease >= 2.0 && e.streakCorrect >= 2).length;
  const dueCount = getDueQuestions().length;
  const diagnostik = getDiagnostikErgebnis();

  const moduleBars = MODULES.map((m) => {
    const s = moduleProgressStats(m);
    return `
      <div class="progress-row">
        <div class="progress-row-label">${m.bonus ? '⭐ ' : ''}${m.titel}</div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${s.pct}%"></div></div>
        <div class="progress-row-value">${s.mastered}/${s.total}</div>
      </div>
    `;
  }).join('');

  let diagnostikBlock;
  if (!diagnostik) {
    diagnostikBlock = `
      <h2 class="page-title" style="font-size:1.05rem;margin-top:24px">Einstufungstest</h2>
      <div class="card">
        <div class="module-card-desc">20 Fragen (2 je Kernmodul), ca. 8–10 Minuten — zeigt deinen Lernpfad je Themenfeld, sortiert nach Nachholbedarf.</div>
        <button class="btn-primary" id="start-einstufungstest">Einstufungstest starten</button>
      </div>
    `;
  } else {
    const rows = Object.entries(diagnostik)
      .map(([themenfeld, t]) => ({ themenfeld, ...t, current: themenfeldCurrentScore(themenfeld) }))
      .sort((a, b) => a.score - b.score);
    diagnostikBlock = `
      <h2 class="page-title" style="font-size:1.05rem;margin-top:24px">Lernpfad-Empfehlung</h2>
      <p class="muted" style="margin-top:-10px;margin-bottom:12px">Nach Einstufung sortiert — größter Nachholbedarf zuerst.</p>
      <div class="card-list">
        ${rows.map((r) => `
          <div class="card">
            <div class="module-card-title">${r.moduleTitel}</div>
            <div class="module-card-desc">Einstufung: ${diagnostikLevelName(r.score)} (${Math.round(r.score * 100)}%)${r.current !== null ? ` · aktuell gemeistert: ${Math.round(r.current * 100)}%` : ''}</div>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" id="start-einstufungstest">Einstufungstest wiederholen</button>
    `;
  }

  return `
    <h1 class="page-title">Fortschritt</h1>
    <div class="card">
      <div class="module-card-title">${level.name}</div>
      <div class="module-card-desc">${xp} XP</div>
    </div>
    <div class="card">
      <div class="module-card-title">${icon('flame', 18)} ${streak} Tage Streak</div>
    </div>
    <div class="card">
      <div class="module-card-title">${mastered} / ${totalQuestions} Fragen gemeistert</div>
      <div class="module-card-desc">Als „gemeistert" zählt eine Frage erst, wenn sie 2× hintereinander richtig beantwortet wurde (auch aus dem Einstufungstest) — einmal richtig reicht noch nicht.</div>
    </div>
    ${dueCount ? `
    <div class="card">
      <div class="module-card-title">${dueCount} Wiederholung${dueCount === 1 ? '' : 'en'} fällig</div>
      <div class="module-card-desc">Im Quiz-Tab unter „Fällige Wiederholungen"</div>
    </div>` : ''}
    <h2 class="page-title" style="font-size:1.05rem;margin-top:24px">Fortschritt je Modul</h2>
    <div class="progress-list">${moduleBars}</div>
    ${diagnostikBlock}
  `;
}

/* ---------- Markdown (leichtgewichtig) ---------- */

function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html.split(/\n{2,}/).map((block) => {
    if (/^<h[23]>|^<ul>/.test(block.trim())) return block;
    return `<p>${block.trim()}</p>`;
  }).join('');
  return html;
}

/* ---------- Main render dispatch ---------- */

function render() {
  const main = document.getElementById('main');
  let html = '';
  if (STATE.tab === 'lernen') html = renderLernen();
  else if (STATE.tab === 'notizen') html = renderNotizen();
  else if (STATE.tab === 'quiz') html = renderQuiz();
  else if (STATE.tab === 'glossar') html = renderGlossar();
  else if (STATE.tab === 'frage') html = renderFrage();
  else if (STATE.tab === 'fortschritt') html = STATE.einstufung ? renderEinstufungstest() : renderFortschritt();
  main.innerHTML = html;
  wireEvents();
}

function wireEvents() {
  document.querySelectorAll('[data-module]').forEach((el) =>
    el.addEventListener('click', () => { STATE.activeModuleId = el.dataset.module; render(); })
  );
  document.querySelectorAll('[data-back-to-modules]').forEach((el) =>
    el.addEventListener('click', () => { STATE.activeModuleId = null; render(); })
  );
  document.querySelectorAll('[data-next-module]').forEach((el) =>
    el.addEventListener('click', () => {
      STATE.activeModuleId = el.dataset.nextModule;
      render();
      document.getElementById('main').scrollTo({ top: 0 });
    })
  );
  if (STATE.tab === 'lernen' && STATE.activeModuleId) setupReadTracking(STATE.activeModuleId);

  const startFromModule = document.getElementById('start-quiz-from-module');
  if (startFromModule) startFromModule.addEventListener('click', () => {
    const id = STATE.activeModuleId;
    STATE.tab = 'quiz';
    STATE.activeModuleId = null;
    renderTabBar();
    startQuiz(id);
  });

  document.querySelectorAll('[data-quiz-module]').forEach((el) =>
    el.addEventListener('click', () => startQuiz(el.dataset.quizModule))
  );
  document.querySelectorAll('[data-quiz-module-all]').forEach((el) =>
    el.addEventListener('click', () => startQuiz(el.dataset.quizModuleAll, { erzwingeAlle: true }))
  );
  document.querySelectorAll('[data-quiz-exit]').forEach((el) =>
    el.addEventListener('click', () => { STATE.quiz = null; render(); })
  );
  const dueReviewBtn = document.getElementById('start-due-review');
  if (dueReviewBtn) dueReviewBtn.addEventListener('click', startDueReviewQuiz);
  document.querySelectorAll('.quiz-option').forEach((el, i) =>
    el.addEventListener('click', () => (STATE.einstufung ? answerEinstufung(i) : answerQuiz(i)))
  );
  const quizDone = document.getElementById('quiz-done');
  if (quizDone) quizDone.addEventListener('click', () => { STATE.quiz = null; render(); });

  const startEinstufung = document.getElementById('start-einstufungstest');
  if (startEinstufung) startEinstufung.addEventListener('click', startEinstufungstest);
  const einstufungDone = document.getElementById('einstufung-done');
  if (einstufungDone) einstufungDone.addEventListener('click', () => { STATE.einstufung = null; render(); });

  const glossarSearch = document.getElementById('glossar-search');
  if (glossarSearch) {
    if (!SEARCH_INDEX) buildSearchIndex();
    renderGlossarResults('');
    const clearBtn = document.getElementById('glossar-search-clear');
    const suggestBox = document.getElementById('glossar-suggestions');
    glossarSearch.addEventListener('input', () => {
      renderGlossarResults(glossarSearch.value);
      clearBtn.style.display = glossarSearch.value ? 'block' : 'none';
      updateSuggestionsBox();
    });
    glossarSearch.addEventListener('focus', updateSuggestionsBox);
    glossarSearch.addEventListener('blur', () => setTimeout(() => { suggestBox.style.display = 'none'; }, 150));
    glossarSearch.addEventListener('keydown', (e) => {
      const items = [...suggestBox.querySelectorAll('.suggestion-item')];
      if (!items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); suggestionIndex = Math.min(suggestionIndex + 1, items.length - 1); items.forEach((it, i) => it.classList.toggle('active', i === suggestionIndex)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); suggestionIndex = Math.max(suggestionIndex - 1, 0); items.forEach((it, i) => it.classList.toggle('active', i === suggestionIndex)); }
      else if (e.key === 'Enter' && suggestionIndex >= 0) { e.preventDefault(); pickSuggestion(items[suggestionIndex].dataset.value); }
      else if (e.key === 'Escape') { suggestBox.style.display = 'none'; }
    });
    suggestBox.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.suggestion-item');
      if (item) pickSuggestion(item.dataset.value);
    });
    clearBtn.addEventListener('click', () => {
      glossarSearch.value = '';
      renderGlossarResults('');
      clearBtn.style.display = 'none';
      suggestBox.style.display = 'none';
      glossarSearch.focus();
    });
  }
  document.querySelectorAll('[data-jump-module]').forEach((el) =>
    el.addEventListener('click', () => jumpToAbschnitt(el.dataset.jumpModule, el.dataset.jumpAbschnitt))
  );

  const frageSend = document.getElementById('frage-send');
  if (frageSend) frageSend.addEventListener('click', handleFrageSend);
  const frageInput = document.getElementById('frage-input');
  if (frageInput) frageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleFrageSend(); });
  if (document.getElementById('frage-verlauf')) { loadFrageVerlauf(); loadFrageKosten(); }

  const notizAdd = document.getElementById('notiz-add');
  if (notizAdd) notizAdd.addEventListener('click', addNotiz);
  if (document.getElementById('notizen-liste')) loadNotizen();
}

/* ---------- Info-Sheet ---------- */

function setupInfoSheet() {
  const overlay = document.getElementById('info-overlay');
  document.getElementById('info-btn').addEventListener('click', () => overlay.classList.add('open'));
  document.getElementById('info-close').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { window.location.href = '/orgkompass/logout'; });
  setupThemeToggle();
}

/* ---------- Dark/Hell-Modus-Umschalter ---------- */

function getStoredTheme() {
  try { return localStorage.getItem('ok_theme'); } catch { return null; }
}
function systemPrefersDark() {
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
  const dark = theme === 'light' ? false : theme === 'dark' ? true : systemPrefersDark();
  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.setAttribute('content', dark ? '#1c1c1e' : '#ffffff');
}
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const effective = getStoredTheme() || (systemPrefersDark() ? 'dark' : 'light');
  btn.setAttribute('aria-checked', effective === 'dark' ? 'true' : 'false');
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-checked') === 'true' ? 'light' : 'dark';
    btn.setAttribute('aria-checked', next === 'dark' ? 'true' : 'false');
    try { localStorage.setItem('ok_theme', next); } catch {}
    applyTheme(next);
  });
}

/* ---------- Scroll-to-Top ---------- */

function setupScrollToTop() {
  const btn = document.getElementById('back-top');
  btn.innerHTML = icon('arrow-up', 20);
  const main = document.getElementById('main');
  main.addEventListener('scroll', () => {
    btn.classList.toggle('visible', main.scrollTop > 300);
  });
  btn.addEventListener('click', () => main.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Pull-to-Refresh ---------- */

function setupPullToRefresh() {
  const main = document.getElementById('main');
  const indicator = document.getElementById('ptr-indicator');
  let startY = 0, pulling = false;

  main.addEventListener('touchstart', (e) => {
    if (main.scrollTop === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });

  main.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0 && main.scrollTop === 0) {
      indicator.style.opacity = Math.min(diff / 80, 1);
      indicator.style.transform = `translateY(${Math.min(diff, 80)}px)`;
    }
  }, { passive: true });

  main.addEventListener('touchend', (e) => {
    if (!pulling) return;
    pulling = false;
    const diff = e.changedTouches[0].clientY - startY;
    indicator.style.opacity = 0;
    indicator.style.transform = 'translateY(0)';
    if (diff > 80) {
      STATE.activeModuleId = null;
      STATE.quiz = null;
      STATE.einstufung = null;
      render();
    }
  });
}

/* ---------- Init ---------- */

function init() {
  renderTabBar();
  render();
  setupInfoSheet();
  setupScrollToTop();
  setupPullToRefresh();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
