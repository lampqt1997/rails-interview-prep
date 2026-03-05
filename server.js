// File: server.js
'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ROOT = process.cwd();
const QUESTIONS_FILE = path.join(ROOT, 'question_bank.md');
const ANSWERS_DIR = path.join(ROOT, 'answers');

if (!fs.existsSync(ANSWERS_DIR)) fs.mkdirSync(ANSWERS_DIR);

/** parse question_bank.md */
function parseQuestions() {
    const raw = fs.existsSync(QUESTIONS_FILE) ? fs.readFileSync(QUESTIONS_FILE, 'utf8') : '';
    const lines = raw.split(/\r?\n/);
    const qs = [];
    for (const line of lines) {
        const m = line.match(/^\s*-\s+(.*\S.*)$/);
        if (m) qs.push(m[1].trim());
    }
    return qs;
}

function formatTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2,'0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function validAnswerFilename(name) {
    return /^answer_[0-9]{8}_[0-9]{6}\.md$/.test(name);
}

app.get('/questions', (req, res) => {
    res.json({ questions: parseQuestions() });
});

// create a new session file
app.post('/start', (req, res) => {
    const ts = formatTimestamp();
    const filename = `answer_${ts}.md`;
    const filepath = path.join(ANSWERS_DIR, filename);
    const header = `# Answers — session ${ts}\n\nStarted at: ${new Date().toISOString()}\n\n---\n\n`;
    try {
        fs.writeFileSync(filepath, header, { flag: 'wx' });
        res.json({ filename });
    } catch (err) {
        res.status(500).json({ error: 'failed to create session' });
    }
});

// append a single QA entry (existing behavior)
app.post('/commit', (req, res) => {
    const { filename, index, question, answer } = req.body || {};
    if (!filename || typeof index !== 'number' || !question) {
        return res.status(400).json({ error: 'missing fields' });
    }
    if (!validAnswerFilename(filename)) return res.status(400).json({ error: 'invalid filename' });
    const filepath = path.join(ANSWERS_DIR, filename);
    const entry = `## Q${index + 1}: ${question}\n\nAnswer:\n\n${answer || '_(no answer)_'}\n\n---\n\n`;
    try {
        fs.appendFileSync(filepath, entry, 'utf8');
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'failed to write file' });
    }
});

// commit all entries for the session in one shot
app.post('/commit_all', (req, res) => {
    const { filename, questions, answers } = req.body || {};
    if (!filename || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'missing fields' });
    }
    if (!validAnswerFilename(filename)) return res.status(400).json({ error: 'invalid filename' });
    const filepath = path.join(ANSWERS_DIR, filename);
    try {
        const parts = [];
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const a = (answers && answers.hasOwnProperty(i) ? answers[i] : '') || '_(no answer)_';
            parts.push(`## Q${i + 1}: ${q}\n\nAnswer:\n\n${a}\n\n---\n\n`);
        }
        fs.appendFileSync(filepath, parts.join(''), 'utf8');
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'failed to write file' });
    }
});

// list available session files
app.get('/sessions', (req, res) => {
    try {
        const files = fs.readdirSync(ANSWERS_DIR)
            .filter(f => validAnswerFilename(f))
            .map(f => {
                const st = fs.statSync(path.join(ANSWERS_DIR, f));
                return { filename: f, mtime: st.mtime.toISOString() };
            })
            .sort((a,b) => b.mtime.localeCompare(a.mtime));
        res.json({ sessions: files });
    } catch (err) {
        res.status(500).json({ error: 'failed to list sessions' });
    }
});

// load a session file and parse Q/A entries
app.get('/session/:filename', (req, res) => {
    const filename = req.params.filename;
    if (!validAnswerFilename(filename)) return res.status(400).json({ error: 'invalid filename' });
    const filepath = path.join(ANSWERS_DIR, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'not found' });
    try {
        const raw = fs.readFileSync(filepath, 'utf8');
        const lines = raw.split(/\r?\n/);
        const entries = [];
        let current = null;
        let collectingAnswer = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const qMatch = line.match(/^##\s*Q\s*(\d+):\s*(.*)$/);
            if (qMatch) {
                if (current) entries.push(current);
                current = { index: Number(qMatch[1]) - 1, question: qMatch[2].trim(), answer: '' };
                collectingAnswer = false;
                continue;
            }
            if (current) {
                if (/^---\s*$/.test(line)) {
                    collectingAnswer = false;
                    // finalize current (trim trailing newline)
                    current.answer = current.answer.replace(/\n+$/,'');
                    continue;
                }
                if (/^Answer:\s*$/.test(line)) {
                    collectingAnswer = true;
                    continue;
                }
                if (collectingAnswer) {
                    current.answer += (current.answer ? '\n' : '') + line;
                }
            }
        }
        if (current) entries.push(current);
        res.json({ entries });
    } catch (err) {
        res.status(500).json({ error: 'failed to read session' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});


// File: public/index.html
const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Question Practice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial; max-width: 1100px; margin: 2rem auto; padding: 0 1rem; display: flex; gap: 1rem; }
    #left { flex: 1 1 60%; }
    #right { flex: 1 1 35%; border-left: 1px solid #eee; padding-left: 1rem; }
    .question { margin-bottom: 1rem; font-weight: 600; }
    textarea { width: 100%; height: 160px; margin-bottom: 0.5rem; font-size: 14px; }
    button { padding: 0.45rem 0.9rem; margin-right: 0.5rem; }
    .meta { color: #555; margin-bottom: 1rem; }
    ul { padding-left: 1rem; }
    li.session { cursor: pointer; color: #0366d6; margin-bottom: 0.3rem; }
    li.qitem { cursor: pointer; margin-bottom: 0.25rem; }
    .small { font-size: 12px; color: #666; }
    .selected { background: #f0f8ff; }
  </style>
</head>
<body>
  <div id="left">
    <h1>Practice — question_bank</h1>
    <div class="meta">Session: <span id="session">not started</span></div>

    <div id="container">
      <div id="qidx" class="question">Loading questions...</div>
      <div id="text" style="white-space:pre-wrap; margin-bottom:1rem;"></div>
      <textarea id="answer" placeholder="Write your answer here..."></textarea>
      <div style="margin-bottom:1rem;">
        <button id="commit">Commit</button>
        <button id="commitAll">Commit all</button>
        <button id="skip">Skip</button>
        <button id="prev">Prev</button>
        <button id="next">Next</button>
      </div>
    </div>
  </div>

  <div id="right">
    <h3>Available sessions</h3>
    <div id="sessionsWrap"><em>Loading...</em></div>

    <hr/>

    <h3>Session questions</h3>
    <div id="loadedInfo" class="small">No loaded session</div>
    <ul id="sessionQuestions"></ul>
    <div style="margin-top:0.5rem;">
      <button id="startFromLoaded">Start new run from loaded session</button>
    </div>

    <hr/>

    <h3>Active question list</h3>
    <ul id="activeList"></ul>
  </div>

  <script>
    let questions = [];
    let idx = 0;
    let filename = null;
    let answers = {}; // map idx -> text

    // data from previously loaded session (entries with index/question/answer)
    let loadedSession = null;

    function el(id) { return document.getElementById(id); }

    async function fetchJSON(url, opts) {
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error('Network error ' + res.status);
      return res.json();
    }

    async function loadQuestions() {
      try {
        const json = await fetchJSON('/questions');
        questions = json.questions || [];
        if (!questions.length) {
          el('qidx').textContent = 'No questions found in question_bank.md';
          renderActiveList();
          return;
        }
        render();
        renderActiveList();
      } catch (e) {
        el('qidx').textContent = 'Failed to load questions';
      }
      loadSessions();
    }

    async function loadSessions() {
      try {
        const json = await fetchJSON('/sessions');
        const wrap = el('sessionsWrap');
        wrap.innerHTML = '';
        if (!json.sessions || !json.sessions.length) {
          wrap.innerHTML = '<div class="small">No sessions yet</div>';
          return;
        }
        const ul = document.createElement('ul');
        json.sessions.forEach(s => {
          const li = document.createElement('li');
          li.className = 'session';
          li.textContent = s.filename + ' ';
          const meta = document.createElement('span');
          meta.className = 'small';
          meta.textContent = '(' + s.mtime + ')';
          li.appendChild(meta);
          li.addEventListener('click', () => loadSessionFile(s.filename, li));
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      } catch (e) {
        el('sessionsWrap').textContent = 'Failed to list sessions';
      }
    }

    async function loadSessionFile(fname, liEl) {
      // visual selection
      Array.from(document.querySelectorAll('li.session')).forEach(x => x.classList.remove('selected'));
      if (liEl) liEl.classList.add('selected');

      try {
        const json = await fetchJSON('/session/' + encodeURIComponent(fname));
        loadedSession = { filename: fname, entries: json.entries || [] };
        el('loadedInfo').textContent = 'Loaded ' + fname;
        renderSessionQuestions();
      } catch (e) {
        el('loadedInfo').textContent = 'Failed to load session';
        loadedSession = null;
        renderSessionQuestions();
      }
    }

    function renderSessionQuestions() {
      const ul = el('sessionQuestions');
      ul.innerHTML = '';
      if (!loadedSession) {
        ul.innerHTML = '<li class="small">No loaded session</li>';
        return;
      }
      loadedSession.entries.forEach((ent, i) => {
        const li = document.createElement('li');
        li.className = 'qitem';
        li.textContent = (ent.index + 1) + '. ' + ent.question;
        li.addEventListener('click', () => {
          // when clicking a session question, load it into main UI (do not change active questions unless started)
          // save current textarea to answers map
          saveCurrentAnswer();
          // show question and prefill answer if present
          el('qidx').textContent = 'Loaded question from ' + loadedSession.filename + ' — ' + (ent.index + 1);
          el('text').textContent = ent.question;
          el('answer').value = ent.answer || '';
        });
        ul.appendChild(li);
      });
    }

    function renderActiveList() {
      const ul = el('activeList');
      ul.innerHTML = '';
      if (!questions.length) {
        ul.innerHTML = '<li class="small">No active questions</li>';
        return;
      }
      questions.forEach((q, i) => {
        const li = document.createElement('li');
        li.className = 'qitem';
        li.textContent = (i + 1) + '. ' + q;
        li.addEventListener('click', () => {
          saveCurrentAnswer();
          idx = i;
          render();
        });
        ul.appendChild(li);
      });
    }

    async function startSession() {
      try {
        const json = await fetchJSON('/start', { method: 'POST', headers: {'Content-Type':'application/json'} });
        filename = json.filename;
        el('session').textContent = filename;
      } catch (e) {
        alert('Failed to start session');
      }
    }

    function render() {
      if (!questions.length) {
        el('qidx').textContent = 'No questions loaded';
        el('text').textContent = '';
        el('answer').value = '';
        return;
      }
      el('qidx').textContent = 'Question ' + (idx + 1) + ' / ' + questions.length;
      el('text').textContent = questions[idx];
      el('answer').value = answers.hasOwnProperty(idx) ? answers[idx] : '';
    }

    function saveCurrentAnswer() {
      if (!questions.length) return;
      const v = el('answer').value;
      if (v && v.trim().length) answers[idx] = v;
      else if (answers.hasOwnProperty(idx) && (!v || !v.trim())) delete answers[idx];
    }

    async function commitAnswer() {
      if (!filename) {
        alert('Session not started');
        return;
      }
      saveCurrentAnswer();
      const payload = { filename, index: idx, question: questions[idx], answer: answers[idx] || '' };
      try {
        const json = await fetchJSON('/commit', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (json.ok) {
          if (idx < questions.length - 1) idx++;
          render();
        } else {
          alert('Failed to save: ' + (json.error || 'unknown'));
        }
      } catch (e) {
        alert('Failed to save');
      }
    }

    async function commitAll() {
      if (!filename) {
        alert('Session not started');
        return;
      }
      saveCurrentAnswer();
      try {
        const payload = { filename, questions, answers };
        const json = await fetchJSON('/commit_all', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (json.ok) {
          alert('All answers appended to ' + filename);
        } else {
          alert('Failed to commit all: ' + (json.error || 'unknown'));
        }
      } catch (e) {
        alert('Failed to commit all');
      }
    }

    document.getElementById('commit').addEventListener('click', commitAnswer);
    document.getElementById('commitAll').addEventListener('click', commitAll);
    document.getElementById('skip').addEventListener('click', () => { if (idx < questions.length -1) { saveCurrentAnswer(); idx++; render(); } });
    document.getElementById('next').addEventListener('click', () => { if (idx < questions.length -1) { saveCurrentAnswer(); idx++; render(); } });
    document.getElementById('prev').addEventListener('click', () => { if (idx > 0) { saveCurrentAnswer(); idx--; render(); } });

    // start a run from the currently loaded session: create new answer file and populate active questions & answers
    document.getElementById('startFromLoaded').addEventListener('click', async () => {
      if (!loadedSession) { alert('No session loaded'); return; }
      try {
        const json = await fetchJSON('/start', { method: 'POST', headers: {'Content-Type':'application/json'} });
        filename = json.filename;
        el('session').textContent = filename;
        // set active questions to loaded session's questions (preserve order)
        questions = loadedSession.entries.map(e => e.question);
        answers = {};
        loadedSession.entries.forEach(e => {
          if (e.answer && e.answer.trim()) answers[e.index] = e.answer;
        });
        idx = 0;
        render();
        renderActiveList();
      } catch (e) {
        alert('Failed to start new run from session');
      }
    });

    // init
    loadQuestions();
  </script>
</body>
</html>`;

// javascript
// ensure public dir exists and write index.html if missing or empty
const pubPath = path.join(ROOT, 'public');
if (!fs.existsSync(pubPath)) fs.mkdirSync(pubPath, { recursive: true });

const indexPath = path.join(pubPath, 'index.html');

try {
    let shouldWrite = false;
    if (!fs.existsSync(indexPath)) {
        shouldWrite = true;
    } else {
        const st = fs.statSync(indexPath);
        if (st.size === 0) shouldWrite = true;
    }

    if (shouldWrite) {
        fs.writeFileSync(indexPath, html, 'utf8');
        console.log('Created/updated `public/index.html`');
    } else {
        console.log('`public/index.html` exists and is non-empty; not overwriting.');
    }
} catch (err) {
    console.error('Failed to ensure `public/index.html`:', err);
}