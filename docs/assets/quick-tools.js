(function() {
  /* --- SOCAtlas Ultra-Premium Progress & Autoflow Engine (Precision Reading) --- */
  
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

  function initProgressBar() {
    if (document.getElementById('soc-mastery-loader')) return;
    const bar = document.createElement('div'); bar.id = 'soc-mastery-loader';
    bar.style = 'position:fixed;top:0;left:0;height:4px;background:#0abf53;z-index:10000;width:0%;transition:width 0.5s linear; box-shadow: 0 0 10px rgba(10,191,83,0.5);';
    document.body.appendChild(bar);
  }

  function updateSidebar() {
    const stored = getStorage(GUIDED_PATH_KEY);
    document.querySelectorAll('.md-nav__link').forEach(link => {
      const href = link.getAttribute('href'); if (!href) return;
      const id = getPathId(new URL(href, window.location.href).pathname);
      if (id === 'none' || id === 'home') return;
      const ex = link.querySelector('.nav-check'); if (ex) ex.remove();
      if (stored[id]) {
        const c = document.createElement('span'); c.className = 'nav-check'; c.innerHTML = ' ✓'; c.style.color = '#0abf53'; c.style.fontWeight='800'; link.appendChild(c);
      }
    });
  }

  // --- 1. GUIDED PATH (ONE BY ONE) ---
  function initGuidedPath() {
    const content = document.querySelector('.md-content__inner');
    const pathId = getPathId(window.location.pathname);
    if (!content || window.location.pathname.includes('/quick/')) return;
    
    initProgressBar();
    updateSidebar();
    if (document.getElementById('guided-ctrl-top')) return;

    const stored = getStorage(GUIDED_PATH_KEY);
    const isDone = !!stored[pathId];
    
    // PRECISION READING TIME (200 WPM)
    const words = content.innerText.split(/\s+/).length || 50;
    const baseSeconds = Math.max(10, Math.min(300, Math.round(words / 200 * 60)));
    let waitSeconds = isDone ? 0 : (pathId === 'home' ? 5 : baseSeconds);

    function createPanel(pos) {
        const p = document.createElement('div'); p.id = `guided-ctrl-${pos}`; p.className = `guided-footer-card guided-${pos}-panel`;
        p.innerHTML = `<div class="guided-footer-text"><h3>Study Mastery</h3><p id="note-${pos}"></p></div><div class="guided-footer-controls"><div class="guided-flow-settings"><button class="flow-play-btn" title="Toggle Autoplay"><span class="icon">▶</span> <span class="label">Autoplay</span></button><div class="guided-speed-wrapper"><input type="range" class="speed-slider" min="1" max="5" value="1" step="0.5"><span class="speed-val">1x</span></div></div><button class="md-button guided-toggle-btn" ${waitSeconds > 0 && !isDone ? 'disabled' : ''}></button></div>`;
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

    let scrollInterval;
    let timerInterval;
    const getS = () => parseFloat(localStorage.getItem('socatlas-flow-speed') || '1');
    const isF = () => localStorage.getItem('socatlas-flow-enabled') === 'true';

    function runFlow() {
        clearInterval(scrollInterval);
        if (isDone || !isF()) return;
        scrollInterval = setInterval(() => { window.scrollBy(0, 1); if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) clearInterval(scrollInterval); }, Math.max(8, 50 - (getS() * 8)));
    }

    const maxTotalSeconds = waitSeconds;
    function sync() {
        const d = !!getStorage(GUIDED_PATH_KEY)[pathId];
        const s = getS();
        els.play.forEach(b => { b.classList.toggle('active', isF()); b.querySelector('.icon').textContent = isF() ? '⏸' : '▶'; if (d) b.style.display = 'none'; });
        els.btns.forEach(b => { 
            b.textContent = d ? '✓ Topic Mastered' : (waitSeconds > 0 ? `Unlocking... (${Math.ceil(waitSeconds)}s)` : 'Certify Lesson'); 
            b.classList.toggle('md-button--primary', !d); 
            b.disabled = (waitSeconds > 0 && !d); 
        });
        
        // DYNAMIC STATUS TEXT
        const timeAtSpeed = Math.ceil(waitSeconds / s);
        els.notes.forEach(n => {
            if (d) n.textContent = 'Topic fully mastered across all paths.';
            else if (waitSeconds > 0) {
                n.textContent = isF() ? `Autoflowing... Est. ${timeAtSpeed}s remaining at ${s}x speed.` : `Est. Reading Time: ${Math.ceil(waitSeconds)}s (200 WPM).`;
            } else n.textContent = 'Verification complete. Mastery ready to certify.';
        });

        if (maxTotalSeconds > 0 && !d) els.loader.style.width = Math.min(100, Math.round(((maxTotalSeconds - waitSeconds) / maxTotalSeconds) * 100)) + '%'; else els.loader.style.width = '0%';
    }

    if (waitSeconds > 0 && !isDone) {
        timerInterval = setInterval(() => {
            const reduction = isF() ? getS() : 1;
            waitSeconds -= reduction;
            if (waitSeconds <= 0) {
                waitSeconds = 0; clearInterval(timerInterval); clearInterval(scrollInterval);
                if (isF()) { els.btns[0].click(); setTimeout(() => { const next = document.querySelector('.md-footer__link--next'); if (next) next.click(); }, 1500); }
            }
            sync();
        }, 1000);
    }

    els.play.forEach(b => b.onclick = () => { localStorage.setItem('socatlas-flow-enabled', !isF()); runFlow(); sync(); });
    els.speed.forEach(s => s.oninput = (e) => { 
        localStorage.setItem('socatlas-flow-speed', e.target.value); 
        els.speed.forEach(x => x.value = e.target.value); 
        els.speedTxt.forEach(x => x.textContent = e.target.value + 'x'); 
        if (isF()) runFlow(); sync(); 
    });
    els.btns.forEach(b => b.onclick = () => { const fr = getStorage(GUIDED_PATH_KEY); if (!fr[pathId]) fr[pathId] = true; else delete fr[pathId]; setStorage(GUIDED_PATH_KEY, fr); sync(); updateSidebar(); if (typeof initDashboard === 'function') initDashboard(); });

    if (isF() && !isDone) runFlow();
    sync();
  }

  // --- 2. QUICK REVISION AUTO-MASTER ---
  function initQuickPath() {
    const content = document.querySelector('.md-content__inner');
    if (!content || !window.location.pathname.includes('/quick/')) return;
    if (document.getElementById('quick-stats-container')) return;
    const pageId = getPathId(window.location.pathname);
    const container = document.createElement('div');
    container.id = 'quick-stats-container'; container.className = 'quick-stats-card';
    container.innerHTML = `<div class="quick-stats-main"><div class="quick-stats-info"><span class="quick-stats-label">High-Speed Revision</span><h2 class="quick-stats-value" id="quick-path-pct">0%</h2></div><div class="quick-stats-progress-bg"><div class="quick-stats-progress-fill" id="quick-path-bar" style="width: 0%"></div></div><div class="quick-stats-controls"><button class="flow-play-btn" id="quick-auto-master"><span class="icon">▶</span> <span class="label">Auto-Master</span></button></div></div><div class="quick-stats-meta"><span id="quick-path-count">0 points complete</span><button id="quick-clear-page" class="quick-stats-btn">Reset</button></div>`;
    content.insertBefore(container, content.querySelector('table') || content.firstChild);
    const tables = document.querySelectorAll('.md-content__inner table');
    const stored = getStorage(QUICK_PATH_KEY);
    let total = 0; const allRows = [];
    tables.forEach((table, tIdx) => {
      const head = table.querySelector('thead tr');
      if (head) { const th = document.createElement('th'); th.innerHTML = 'Done'; head.insertBefore(th, head.firstChild); }
      table.querySelectorAll('tbody tr').forEach((row, rIdx) => {
        const pid = row.cells[0]?.textContent.match(/^(\d+)/)?.[1] || `p-${pageId}-${tIdx}-${rIdx}`;
        const td = document.createElement('td'); const cb = document.createElement('input'); cb.type = 'checkbox';
        cb.className = 'quick-point-check'; cb.checked = !!stored[pid]; if (cb.checked) row.classList.add('point-mastered');
        cb.onchange = () => {
          const fr = getStorage(QUICK_PATH_KEY);
          if (cb.checked) { fr[pid] = true; row.classList.add('point-mastered'); } else { delete fr[pid]; row.classList.remove('point-mastered'); }
          setStorage(QUICK_PATH_KEY, fr); updateStats();
        };
        td.appendChild(cb); row.insertBefore(td, row.firstChild); total++; allRows.push({id: pid, row: row, cb: cb});
      });
    });
    let autoIntv;
    function updateStats() {
      const mastered = Array.from(document.querySelectorAll('.quick-point-check')).filter(c => c.checked).length;
      document.getElementById('quick-path-pct').textContent = (Math.round(mastered / total * 100) || 0) + '%';
      document.getElementById('quick-path-bar').style.width = (Math.round(mastered / total * 100) || 0) + '%';
      document.getElementById('quick-path-count').textContent = `${mastered} of ${total} points complete`;
    }
    const autoBtn = document.getElementById('quick-auto-master');
    let isAuto = false;
    autoBtn.onclick = () => {
        isAuto = !isAuto;
        autoBtn.classList.toggle('active', isAuto); autoBtn.querySelector('.icon').textContent = isAuto ? '⏸' : '▶';
        if (isAuto) runAuto(); else clearInterval(autoIntv);
    };
    function runAuto() {
        clearInterval(autoIntv);
        autoIntv = setInterval(() => {
            const next = allRows.find(item => !item.cb.checked);
            if (!next) { clearInterval(autoIntv); isAuto = false; return; }
            next.cb.click(); next.row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 2000);
    }
    updateStats();
  }

  // --- 3. Dashboard ---
  function initDashboard() {
    const isHome = getPathId(window.location.pathname) === 'home'; if (!isHome) return;
    if (document.getElementById('socatlas-mastery-dashboard')) return;
    const content = document.querySelector('.md-content__inner'); if (!content) return;
    const container = document.createElement('div'); container.id = 'socatlas-mastery-dashboard';
    const hero = document.querySelector('.hero-actions') || content.querySelector('h1') || content.firstChild;
    if (hero) hero.insertAdjacentElement('afterend', container);
    const qCount = Object.keys(getStorage(QUICK_PATH_KEY)).length;
    const gCount = Object.keys(getStorage(GUIDED_PATH_KEY)).length;
    container.innerHTML = `
      <div class="mastery-dashboard">
        <div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge">Curriculum</span><h3>Roadmap Mastery</h3></div><div class="mastery-stats"><span class="mastery-pct">${Math.round(gCount/40*100)}%</span><div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${Math.round(gCount/40*100)}%"></div></div><span class="mastery-meta">${gCount} lessons complete</span></div></div>
        <div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge" style="background:#d1fae5;color:#065f46">Revision Pack</span><h3>Knowledge Velocity</h3></div><div class="mastery-stats"><span class="mastery-pct">${Math.round(qCount/1200*100)}%</span><div class="mastery-bar-bg" style="background:#f0fdf4"><div class="mastery-bar-fill" style="width: ${Math.round(qCount/1200*100)}%;background:#10b981"></div></div><span class="mastery-meta">${qCount} points complete</span></div></div>
      </div>
    `;
  }

  function start() { try { initQuickPath(); initGuidedPath(); initDashboard(); } catch (e) {} }
  if (typeof window.document$ !== "undefined") window.document$.subscribe(start);
  else document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(start, 500); setTimeout(start, 1500);
})();
