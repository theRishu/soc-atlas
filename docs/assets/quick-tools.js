(function() {
  /* --- SOCAtlas Ultra-Premium Success Engine (v2.0 - Splash & UI Fix) --- */
  
  const STORAGE_PREFIX = 'socatlas-progress-';
  const QUICK_PATH_KEY = 'quick-points';
  const GUIDED_PATH_KEY = 'guided-pages';

  function getStorage(key) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key); return data ? JSON.parse(data) : {};
    } catch { return {}; }
  }

  function setStorage(key, data) {
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data)); } catch {}
  }

  function getPathId(p) {
    if (!p) return 'none';
    try {
        let clean = p.split('#')[0].split('?')[0]; if (clean.includes('://')) clean = new URL(clean).pathname;
        clean = clean.replace(/^\/socatlas\//, '/').replace(/\.html$|\.md$/g, '').replace(/\/$/, '').replace(/^\//, '');
        return clean || 'home';
    } catch (e) { return 'none'; }
  }

  // --- Splash Screen ---
  function initSplash() {
    const isHome = getPathId(window.location.pathname) === 'home';
    if (!isHome || sessionStorage.getItem('socatlas-splash-seen')) return;

    const overlay = document.createElement('div');
    overlay.id = 'soc-splash-overlay';
    overlay.innerHTML = `
      <div class="soc-splash-card">
        <img src="https://socatlas.vercel.app/assets/logo.png" width="80" style="margin-bottom:1.5rem">
        <h1>Welcome to SOCAtlas</h1>
        <p>Choose your training path to begin your automated mastery session.</p>
        <div class="soc-splash-options">
          <div class="soc-splash-btn" onclick="window.location.href='/fundamentals/introduction.html';sessionStorage.setItem('socatlas-flow-enabled','true');">
            <div class="btn-icon">🛣️</div>
            <div class="btn-text"><h3>Guided Roadmap</h3><span>Step-by-step training with auto-flow</span></div>
          </div>
          <div class="soc-splash-btn btn-secondary" onclick="window.location.href='/quick/basics.html';sessionStorage.setItem('socatlas-flow-enabled','true');">
            <div class="btn-icon">⚡</div>
            <div class="btn-text"><h3>Quick Revision</h3><span>Sprint through 1200 high-yield points</span></div>
          </div>
        </div>
        <button class="soc-splash-dismiss" onclick="document.getElementById('soc-splash-overlay').remove();sessionStorage.setItem('socatlas-splash-seen','true')">I'll explore first</button>
      </div>
    `;
    document.body.appendChild(overlay);
    sessionStorage.setItem('socatlas-splash-seen', 'true');
  }

  // --- Progress Bar (Stripe-style) ---
  function initProgressBar() {
    if (document.getElementById('soc-mastery-loader')) return;
    const bar = document.createElement('div'); bar.id = 'soc-mastery-loader';
    bar.style = 'position:fixed;top:0;left:0;height:4px;background:#0abf53;z-index:10000;width:0%;transition:width 1s linear;';
    document.body.appendChild(bar);
  }

  function updateSidebar() {
    const stored = getStorage(GUIDED_PATH_KEY);
    document.querySelectorAll('.md-nav__link').forEach(link => {
      const href = link.getAttribute('href'); if (!href) return;
      const id = getPathId(new URL(href, window.location.href).pathname);
      const ex = link.querySelector('.nav-check'); if (ex) ex.remove();
      if (stored[id]) {
        const c = document.createElement('span'); c.className = 'nav-check'; c.innerHTML = ' ✓'; c.style.color = '#0abf53'; link.appendChild(c);
      }
    });
  }

  // --- Guided Path Logic ---
  function initGuidedPath() {
    const content = document.querySelector('.md-content__inner');
    const pathId = getPathId(window.location.pathname);
    if (!content || window.location.pathname.includes('/quick/')) return;
    
    initProgressBar();
    updateSidebar();
    if (document.getElementById('guided-ctrl-top')) return;

    const stored = getStorage(GUIDED_PATH_KEY);
    const isDone = !!stored[pathId];
    const words = content.innerText.split(/\s+/).length || 50;
    const baseSeconds = Math.max(10, Math.min(300, Math.round(words / 200 * 60)));
    let waitSeconds = isDone ? 0 : (pathId === 'home' ? 5 : baseSeconds);

    function createPanel(pos) {
        const p = document.createElement('div'); p.id = `guided-ctrl-${pos}`; p.className = `guided-footer-card guided-${pos}-panel`;
        p.innerHTML = `<div class="guided-footer-left"><h3>Study Mastery</h3><p id="note-${pos}"></p></div><div class="guided-footer-right"><div class="flow-pill"><button class="flow-play-btn"><span class="icon">▶</span></button><input type="range" class="speed-slider" min="1" max="5" value="1" step="0.5"><span class="speed-val">1x</span></div><button class="md-button guided-toggle-btn" ${waitSeconds > 0 ? 'disabled' : ''}></button></div>`;
        return p;
    }

    const h1 = content.querySelector('h1');
    if (h1) h1.insertAdjacentElement('afterend', createPanel('top'));
    content.appendChild(createPanel('bottom'));

    const els = {
        play: document.querySelectorAll('.flow-play-btn'),
        speed: document.querySelectorAll('.speed-slider'),
        speedTxt: document.querySelectorAll('.speed-val'),
        btns: document.querySelectorAll('.guided-toggle-btn'),
        notes: document.querySelectorAll('[id^="note-"]'),
        loader: document.getElementById('soc-mastery-loader')
    };

    let scrollInterval; let timerInterval;
    const getS = () => parseFloat(localStorage.getItem('socatlas-flow-speed') || '1');
    const isF = () => localStorage.getItem('socatlas-flow-enabled') === 'true' || sessionStorage.getItem('socatlas-flow-enabled') === 'true';

    function runFlow() {
        clearInterval(scrollInterval); if (isDone || !isF()) return;
        scrollInterval = setInterval(() => { window.scrollBy(0, 1); if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) clearInterval(scrollInterval); }, Math.max(8, 50 - (getS() * 8)));
    }

    const maxWait = waitSeconds;
    function sync() {
        const d = !!getStorage(GUIDED_PATH_KEY)[pathId]; const s = getS();
        els.play.forEach(b => { b.classList.toggle('active', isF()); b.querySelector('.icon').textContent = isF() ? '⏸' : '▶'; });
        els.btns.forEach(b => { b.textContent = d ? 'Topic Mastered' : (waitSeconds > 0 ? `Unlocking (${Math.ceil(waitSeconds)}s)` : 'Certify Mastery'); b.disabled = (waitSeconds > 0 && !d); });
        els.notes.forEach(n => n.textContent = d ? 'Certification active.' : (waitSeconds > 0 ? (isF() ? `Autoflowing... ${getS()}x` : 'Analyze content...') : 'Ready.'));
        if (maxWait > 0 && !d) els.loader.style.width = Math.min(100, Math.round(((maxWait - waitSeconds) / maxWait) * 100)) + '%'; else els.loader.style.width = '0%';
    }

    if (waitSeconds > 0 && !isDone) {
        timerInterval = setInterval(() => {
            waitSeconds -= (isF() ? getS() : 1);
            if (waitSeconds <= 0) {
                waitSeconds = 0; clearInterval(timerInterval); clearInterval(scrollInterval);
                if (isF()) { els.btns[0].click(); setTimeout(() => { const next = document.querySelector('.md-footer__link--next'); if (next) next.click(); }, 1500); }
            }
            sync();
        }, 1000);
    }
    els.play.forEach(b => b.onclick = () => { const n = !isF(); localStorage.setItem('socatlas-flow-enabled', n); sessionStorage.setItem('socatlas-flow-enabled', n); runFlow(); sync(); });
    els.speed.forEach(s => s.oninput = (e) => { localStorage.setItem('socatlas-flow-speed', e.target.value); els.speed.forEach(x => x.value = e.target.value); els.speedTxt.forEach(x => x.textContent = e.target.value + 'x'); if (isF()) runFlow(); sync(); });
    els.btns.forEach(b => b.onclick = () => { const fr = getStorage(GUIDED_PATH_KEY); if (!fr[pathId]) fr[pathId] = true; else delete fr[pathId]; setStorage(GUIDED_PATH_KEY, fr); sync(); updateSidebar(); if (typeof initDashboard === 'function') initDashboard(); });
    if (isF() && !isDone) runFlow();
    sync();
  }

  // --- Quick revision ---
  function initQuickPath() {
    if (!window.location.pathname.includes('/quick/')) return;
    if (document.getElementById('quick-stats-container')) return;
    const content = document.querySelector('.md-content__inner');
    const container = document.createElement('div'); container.id = 'quick-stats-container'; container.className = 'quick-stats-card';
    container.innerHTML = `<div class="quick-stats-main"><div class="quick-stats-info"><span class="quick-stats-label">Revision Mastery</span><h2 class="quick-stats-value" id="quick-path-pct">0%</h2></div><div class="quick-stats-progress-bg"><div class="quick-stats-progress-fill" id="quick-path-bar" style="width: 0%"></div></div><div class="quick-stats-controls"><button class="flow-play-btn" id="quick-auto-master"><span class="icon">▶</span></button></div></div><div class="quick-stats-meta"><span id="quick-path-count">0 points</span><button id="quick-clear-page" class="quick-stats-btn">Reset</button></div>`;
    content.insertBefore(container, content.querySelector('table') || content.firstChild);
    const tables = document.querySelectorAll('.md-content__inner table'); const stored = getStorage(QUICK_PATH_KEY); let total = 0; const rows = [];
    tables.forEach((table, tIdx) => {
      const head = table.querySelector('thead tr'); if (head) { const th = document.createElement('th'); th.innerHTML = 'Done'; head.insertBefore(th, head.firstChild); }
      table.querySelectorAll('tbody tr').forEach((row, rIdx) => {
        const pid = row.cells[0]?.textContent.match(/^(\d+)/)?.[1] || `p-${rIdx}`;
        const td = document.createElement('td'); const cb = document.createElement('input'); cb.type = 'checkbox';
        cb.className = 'quick-point-check'; cb.checked = !!stored[pid]; if (cb.checked) row.classList.add('point-mastered');
        cb.onchange = () => { const fr = getStorage(QUICK_PATH_KEY); if (cb.checked) { fr[pid] = true; row.classList.add('point-mastered'); } else { delete fr[pid]; row.classList.remove('point-mastered'); } setStorage(QUICK_PATH_KEY, fr); updateStats(); };
        td.appendChild(cb); row.insertBefore(td, row.firstChild); total++; rows.push({cb: cb, row: row});
      });
    });
    let qIntv; function updateStats() { const m = Array.from(document.querySelectorAll('.quick-point-check')).filter(c => c.checked).length; document.getElementById('quick-path-pct').textContent = Math.round(m/total*100) + '%'; document.getElementById('quick-path-bar').style.width = Math.round(m/total*100) + '%'; document.getElementById('quick-path-count').textContent = `${m} of ${total} mastered`; }
    const qBtn = document.getElementById('quick-auto-master'); let qAuto = sessionStorage.getItem('socatlas-flow-enabled') === 'true'; if (qAuto) { qBtn.classList.add('active'); qBtn.querySelector('.icon').textContent = '⏸'; runQ(); }
    qBtn.onclick = () => { qAuto = !qAuto; qBtn.classList.toggle('active', qAuto); qBtn.querySelector('.icon').textContent = qAuto ? '⏸' : '▶'; if (qAuto) runQ(); else clearInterval(qIntv); };
    function runQ() { clearInterval(qIntv); qIntv = setInterval(() => { const next = rows.find(i => !i.cb.checked); if (!next) { clearInterval(qIntv); return; } next.cb.click(); next.row.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 2000); }
    updateStats();
  }

  function initDashboard() {
    const isHome = getPathId(window.location.pathname) === 'home'; if (!isHome) return;
    if (document.getElementById('socatlas-mastery-dashboard')) return;
    const content = document.querySelector('.md-content__inner'); if (!content) return;
    const container = document.createElement('div'); container.id = 'socatlas-mastery-dashboard';
    const hero = document.querySelector('.hero-actions') || content.querySelector('h1') || content.firstChild;
    if (hero) hero.insertAdjacentElement('afterend', container);
    const qCount = Object.keys(getStorage(QUICK_PATH_KEY)).length; const gCount = Object.keys(getStorage(GUIDED_PATH_KEY)).length;
    container.innerHTML = `<div class="mastery-dashboard"><div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge">Courses</span><h3>Curriculum</h3></div><div class="mastery-stats"><span class="mastery-pct">${Math.round(gCount/40*100)}%</span><div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${Math.round(gCount/40*100)}%"></div></div></div></div><div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge" style="background:#d1fae5;color:#065f46">Revision</span><h3>Knowledge</h3></div><div class="mastery-stats"><span class="mastery-pct">${Math.round(qCount/1200*100)}%</span><div class="mastery-bar-bg" style="background:#f0fdf4"><div class="mastery-bar-fill" style="width: ${Math.round(qCount/1200*100)}%;background:#10b981"></div></div></div></div></div>`;
  }

  function start() { try { initSplash(); initQuickPath(); initGuidedPath(); initDashboard(); } catch (e) {} }
  if (typeof window.document$ !== "undefined") window.document$.subscribe(start);
  else document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(start, 500); setTimeout(start, 1500);
})();
