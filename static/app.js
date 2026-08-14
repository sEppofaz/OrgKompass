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

/* ---------- State ---------- */

const STATE = {
  tab: 'lernen',
  activeModuleId: null,
  quiz: null, // { moduleId, questions, idx, score }
};

/* ---------- Navigation ---------- */

const TABS = [
  { id: 'lernen', label: 'Lernen', icon: 'book-open' },
  { id: 'quiz', label: 'Quiz', icon: 'list-checks' },
  { id: 'glossar', label: 'Glossar', icon: 'library' },
  { id: 'frage', label: 'Frage', icon: 'message-circle' },
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
  STATE.quiz = null;
  renderTabBar();
  render();
  document.getElementById('main').scrollTo(0, 0);
}

/* ---------- Rendering: Lernen ---------- */

function renderLernen() {
  if (STATE.activeModuleId) {
    return renderModuleDetail(STATE.activeModuleId);
  }
  const items = MODULES.map((m) => `
    <button class="card module-card" data-module="${m.id}">
      <div>
        <div class="module-card-title">${m.bonus ? '⭐ ' : ''}${m.titel}</div>
        <div class="module-card-desc">${m.kurzbeschreibung || ''}</div>
      </div>
      ${icon('chevron-right', 20)}
    </button>
  `).join('');
  return `<h1 class="page-title">Module</h1><div class="card-list">${items}</div>`;
}

function renderModuleDetail(moduleId) {
  const m = MODULES.find((x) => x.id === moduleId);
  if (!m) return '<p>Modul nicht gefunden.</p>';
  const sections = m.abschnitte.map((a) => `
    <div class="section-block">
      <div class="markdown">${renderMarkdown(a.inhalt_markdown)}</div>
      ${a.diagramm && DIAGRAMS[a.diagramm] ? `<div class="diagram">${DIAGRAMS[a.diagramm]()}</div>` : ''}
    </div>
  `).join('');
  return `
    <button class="back-link" id="back-to-modules">${icon('chevron-right', 16)} zurück</button>
    <h1 class="page-title">${m.titel}</h1>
    ${sections}
    <button class="btn-primary" id="start-quiz-from-module">Quiz zu diesem Modul starten</button>
  `;
}

/* ---------- Rendering: Quiz ---------- */

function renderQuiz() {
  if (!STATE.quiz) {
    const items = MODULES.map((m) => `
      <button class="card module-card" data-quiz-module="${m.id}">
        <div class="module-card-title">${m.titel}</div>
        <span class="muted">${m.fragen.length} Fragen</span>
      </button>
    `).join('');
    return `<h1 class="page-title">Quiz auswählen</h1><div class="card-list">${items}</div>`;
  }
  const q = STATE.quiz.questions[STATE.quiz.idx];
  if (!q) return renderQuizResults();
  const options = q.optionen.map((opt, i) => `
    <button class="quiz-option" data-idx="${i}">${opt}</button>
  `).join('');
  return `
    <div class="quiz-progress">Frage ${STATE.quiz.idx + 1} / ${STATE.quiz.questions.length}</div>
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

function startQuiz(moduleId) {
  const m = MODULES.find((x) => x.id === moduleId);
  if (!m) return;
  STATE.quiz = { moduleId, questions: m.fragen.filter((q) => q.typ === 'multiple-choice'), idx: 0, score: 0 };
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
    STATE.quiz.idx += 1;
    render();
  }, 1200);
}

/* ---------- Rendering: Glossar ---------- */

function renderGlossar() {
  return `
    <h1 class="page-title">Glossar</h1>
    <div class="search-wrap">
      <input type="search" id="glossar-search" class="search-input" placeholder="Begriff suchen…" autocomplete="off">
      <button class="search-clear" id="glossar-search-clear" style="display:none">${icon('x', 16)}</button>
    </div>
    <div id="glossar-list" class="card-list"></div>
  `;
}

function renderGlossarList(filter = '') {
  const list = document.getElementById('glossar-list');
  if (!list) return;
  const f = filter.trim().toLowerCase();
  const items = GLOSSARY
    .filter((g) => !f || g.term.toLowerCase().includes(f) || g.kurz.toLowerCase().includes(f))
    .sort((a, b) => a.term.localeCompare(b.term, 'de'));
  list.innerHTML = items.map((g) => `
    <div class="card glossary-card">
      <div class="module-card-title">${g.term}</div>
      <div class="module-card-desc">${g.kurz}</div>
    </div>
  `).join('') || '<p class="muted">Keine Treffer.</p>';
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
    const cost = c.cost_usd.toFixed(4);
    el.textContent = `Heute genutzt: $${cost} von $${c.warn_usd.toFixed(2)} (${c.calls} Frage${c.calls === 1 ? '' : 'n'})${c.hard_killed ? ' — Tageslimit erreicht' : ''}`;
  } catch {
    el.textContent = '';
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

/* ---------- Rendering: Fortschritt ---------- */

function renderFortschritt() {
  const xp = getXp();
  const level = levelForXp(xp);
  const streak = getStreak();
  const progress = getProgress();
  const totalQuestions = MODULES.reduce((sum, m) => sum + m.fragen.length, 0);
  const mastered = Object.values(progress).filter((e) => e.ease >= 2.0 && e.streakCorrect >= 2).length;
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
    </div>
    <p class="muted">Lernzielanalyse (Einstufungstest + Themenfeld-Dashboard) folgt in Phase 5.</p>
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
  else if (STATE.tab === 'quiz') html = renderQuiz();
  else if (STATE.tab === 'glossar') html = renderGlossar();
  else if (STATE.tab === 'frage') html = renderFrage();
  else if (STATE.tab === 'fortschritt') html = renderFortschritt();
  main.innerHTML = html;
  wireEvents();
}

function wireEvents() {
  document.querySelectorAll('[data-module]').forEach((el) =>
    el.addEventListener('click', () => { STATE.activeModuleId = el.dataset.module; render(); })
  );
  const back = document.getElementById('back-to-modules');
  if (back) back.addEventListener('click', () => { STATE.activeModuleId = null; render(); });

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
  document.querySelectorAll('.quiz-option').forEach((el, i) =>
    el.addEventListener('click', () => answerQuiz(i))
  );
  const quizDone = document.getElementById('quiz-done');
  if (quizDone) quizDone.addEventListener('click', () => { STATE.quiz = null; render(); });

  const glossarSearch = document.getElementById('glossar-search');
  if (glossarSearch) {
    renderGlossarList('');
    const clearBtn = document.getElementById('glossar-search-clear');
    glossarSearch.addEventListener('input', () => {
      renderGlossarList(glossarSearch.value);
      clearBtn.style.display = glossarSearch.value ? 'block' : 'none';
    });
    clearBtn.addEventListener('click', () => {
      glossarSearch.value = '';
      renderGlossarList('');
      clearBtn.style.display = 'none';
      glossarSearch.focus();
    });
  }

  const frageSend = document.getElementById('frage-send');
  if (frageSend) frageSend.addEventListener('click', handleFrageSend);
  const frageInput = document.getElementById('frage-input');
  if (frageInput) frageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleFrageSend(); });
  if (document.getElementById('frage-verlauf')) { loadFrageVerlauf(); loadFrageKosten(); }
}

/* ---------- Info-Sheet ---------- */

function setupInfoSheet() {
  const overlay = document.getElementById('info-overlay');
  document.getElementById('info-btn').addEventListener('click', () => overlay.classList.add('open'));
  document.getElementById('info-close').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { window.location.href = '/orgkompass/logout'; });
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
