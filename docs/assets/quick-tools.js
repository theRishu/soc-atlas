(function() {
  /* --- SOCAtlas Universal Progress & Locking System (Top/Bottom Controls) --- */
  
  const STORAGE_PREFIX = 'socatlas-progress-';
  const QUICK_PATH_KEY = 'quick-points';
  const GUIDED_PATH_KEY = 'guided-pages';

  function getStorage(key) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  }

  function setStorage(key, data) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch {}
  }

  function getPathId(p) {
    if (!p) return 'none';
    try {
        let clean = p.split('#')[0].split('?')[0];
        if (clean.includes('://')) clean = new URL(clean).pathname;
        let parts = clean.split('/').filter(Boolean);
        if (parts[0] === 'socatlas') parts.shift();
        clean = parts.join('/');
        clean = clean.replace(/\.html$|\.md$/g, '').replace(/\/index$/, '');
        return clean || 'home';
    } catch (e) {
        return 'none';
    }
  }

  // --- 1. QUICK PATH (OMITTED FOR BREVITY - ALREADY STABLE) ---
  function initQuickPath() {
    const content = document.querySelector('.md-content__inner');
    if (!content || !window.location.pathname.includes('/quick/')) return;
    const pageId = getPathId(window.location.pathname);
    if (document.getElementById('quick-stats-container')) return;

    const statsContainer = document.createElement('div');
    statsContainer.id = 'quick-stats-container';
    statsContainer.className = 'quick-stats-card';
    statsContainer.innerHTML = `<div class="quick-stats-main"><div class="quick-stats-info"><span class="quick-stats-label">Quick Path Mastery</span><h2 class="quick-stats-value" id="quick-path-pct">0%</h2></div><div class="quick-stats-progress-bg"><div class="quick-stats-progress-fill" id="quick-path-bar" style="width: 0%"></div></div></div><div class="quick-stats-meta"><span id="quick-path-count">0 points mastered</span><button id="quick-clear-page" class="quick-stats-btn">Reset Page</button></div>`;
    const target = content.querySelector('table') || content.querySelector('h1') || content.firstChild;
    content.insertBefore(statsContainer, target);
    const tables = document.querySelectorAll('.md-content__inner table');
    const stored = getStorage(QUICK_PATH_KEY);
    let totalOnPage = 0;
    tables.forEach((table, tIdx) => {
      const thead = table.querySelector('thead tr');
      if (thead && !thead.querySelector('.check-th')) {
        const th = document.createElement('th'); th.className = 'check-th'; th.innerHTML = 'Done'; th.style.width = '60px'; thead.insertBefore(th, thead.firstChild);
      }
      table.querySelectorAll('tbody tr').forEach((row, rIdx) => {
        if (row.querySelector('.quick-point-check')) return;
        const pointMatch = row.cells[0]?.textContent.match(/^(\d+)/);
        const pid = pointMatch ? pointMatch[1] : `p-${pageId}-${tIdx}-${rIdx}`;
        const td = document.createElement('td'); const cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'quick-point-check'; cb.checked = !!stored[pid]; if (cb.checked) row.classList.add('point-mastered');
        cb.onchange = () => {
          const fresh = getStorage(QUICK_PATH_KEY);
          if (cb.checked) { fresh[pid] = true; row.classList.add('point-mastered'); } else { delete fresh[pid]; row.classList.remove('point-mastered'); }
          setStorage(QUICK_PATH_KEY, fresh); updatePageStats();
        };
        td.appendChild(cb); row.insertBefore(td, row.firstChild); totalOnPage++;
      });
    });
    function updatePageStats() {
      const checks = document.querySelectorAll('.quick-point-check');
      const onPageMastered = Array.from(checks).filter(c => c.checked).length;
      const pct = Math.round((onPageMastered / totalOnPage) * 100) || 0;
      document.getElementById('quick-path-pct').textContent = pct + '%';
      document.getElementById('quick-path-bar').style.width = pct + '%';
      document.getElementById('quick-path-count').textContent = `${onPageMastered} of ${totalOnPage} points mastered`;
    }
    const clearBtn = document.getElementById('quick-clear-page');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (!confirm('Reset progress?')) return;
        const fresh = getStorage(QUICK_PATH_KEY);
        document.querySelectorAll('.quick-point-check').forEach(c => {
          c.checked = false; c.closest('tr').classList.remove('point-mastered');
          const pm = c.closest('tr').cells[1]?.textContent.match(/^(\d+)/); const pid = pm ? pm[1] : null; if (pid) delete fresh[pid];
        });
        setStorage(QUICK_PATH_KEY, fresh); updatePageStats();
      };
    }
    updatePageStats();
  }

  // --- 2. GUIDED PATH + AUTOFLOW (Double Controls) ---
  function initGuidedPath() {
    const content = document.querySelector('.md-content__inner');
    const pathId = getPathId(window.location.pathname);
    const stored = getStorage(GUIDED_PATH_KEY);
    
    // Sidebar update
    document.querySelectorAll('.md-nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '') return;
      const absPath = new URL(href, window.location.href).pathname;
      const id = getPathId(absPath);
      const existing = link.querySelector('.nav-check');
      if (existing) existing.remove();
      if (stored[id]) {
        const check = document.createElement('span');
        check.className = 'nav-check';
        check.innerHTML = ' ✓';
        check.style.color = '#0abf53';
        link.appendChild(check);
      }
    });

    if (!content || window.location.pathname.includes('/quick/') || pathId === 'home') return;

    const isDone = !!stored[pathId];
    const wordCount = content.innerText.split(/\s+/).length || 100;
    let waitSeconds = isDone ? 0 : Math.max(5, Math.min(300, Math.round(wordCount / 200 * 60)));

    function createControlPanel(pos) {
        const id = `guided-ctrl-${pos}`;
        if (document.getElementById(id)) document.getElementById(id).remove();

        const panel = document.createElement('div');
        panel.id = id;
        panel.className = `guided-footer-card guided-${pos}-panel`;
        panel.innerHTML = `
          <div class="guided-footer-text">
            <h3>Lesson Mastery</h3>
            <p id="timer-note-${pos}"></p>
          </div>
          <div class="guided-footer-controls">
            <div class="guided-flow-settings">
              <label class="guided-flow-toggle"><input type="checkbox" class="flow-checkbox"> <span>Autoplay</span></label>
              <div class="guided-speed-wrapper">
                <input type="range" class="speed-slider" min="1" max="5" value="1" step="1">
                <span class="speed-val">1x</span>
              </div>
            </div>
            <button class="md-button guided-toggle-btn" ${waitSeconds > 0 ? 'disabled' : ''}></button>
          </div>
        `;
        return panel;
    }

    const topPanel = createControlPanel('top');
    const bottomPanel = createControlPanel('bottom');

    const h1 = content.querySelector('h1');
    if (h1) h1.insertAdjacentElement('afterend', topPanel);
    content.appendChild(bottomPanel);

    const inputs = {
        flow: document.querySelectorAll('.flow-checkbox'),
        speed: document.querySelectorAll('.speed-slider'),
        speedText: document.querySelectorAll('.speed-val'),
        btns: document.querySelectorAll('.guided-toggle-btn'),
        notes: document.querySelectorAll('[id^="timer-note-"]')
    };

    let scrollInterval;
    const flowPref = localStorage.getItem('socatlas-flow-enabled') === 'true';
    const speedPref = localStorage.getItem('socatlas-flow-speed') || '1';

    inputs.flow.forEach(c => c.checked = flowPref);
    inputs.speed.forEach(s => s.value = speedPref);
    inputs.speedText.forEach(t => t.textContent = speedPref + 'x');

    function startFlow() {
        clearInterval(scrollInterval);
        if (isDone || !localStorage.getItem('socatlas-flow-enabled')) return;
        const speed = parseInt(localStorage.getItem('socatlas-flow-speed') || '1');
        const intervalMs = Math.max(10, 60 - (speed * 10));
        scrollInterval = setInterval(() => {
            window.scrollBy(0, 1);
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) clearInterval(scrollInterval);
        }, intervalMs);
    }

    function updateAllUI() {
        const currentDone = !!getStorage(GUIDED_PATH_KEY)[pathId];
        inputs.btns.forEach(b => {
            b.textContent = currentDone ? '✓ Completed' : (waitSeconds > 0 ? `Unlocking... (${waitSeconds}s)` : 'Mark as Complete');
            b.classList.toggle('md-button--primary', !currentDone);
            b.disabled = (waitSeconds > 0 && !currentDone);
        });
        const noteText = currentDone ? 'Achievement unlocked! Ready for next lesson.' : (waitSeconds > 0 ? 'Analyzing concept mastery...' : 'Ready to mark as complete.');
        inputs.notes.forEach(n => n.textContent = noteText);
    }

    if (waitSeconds > 0) {
        const timer = setInterval(() => {
            waitSeconds--;
            if (waitSeconds <= 0) {
                clearInterval(timer); clearInterval(scrollInterval);
                inputs.btns.forEach(b => b.disabled = false);
                if (localStorage.getItem('socatlas-flow-enabled') === 'true') {
                    inputs.btns[0].click();
                    setTimeout(() => { const n = document.querySelector('.md-footer__link--next'); if (n) n.click(); }, 1500);
                }
            }
            updateAllUI();
        }, 1000);
    }

    inputs.flow.forEach(c => c.onchange = (e) => {
        const val = e.target.checked;
        localStorage.setItem('socatlas-flow-enabled', val);
        inputs.flow.forEach(other => other.checked = val);
        if (val) startFlow(); else clearInterval(scrollInterval);
    });

    inputs.speed.forEach(s => s.oninput = (e) => {
        const val = e.target.value;
        localStorage.setItem('socatlas-flow-speed', val);
        inputs.speed.forEach(other => other.value = val);
        inputs.speedText.forEach(other => other.textContent = val + 'x');
        if (localStorage.getItem('socatlas-flow-enabled') === 'true') startFlow();
    });

    inputs.btns.forEach(b => b.onclick = () => {
        const fresh = getStorage(GUIDED_PATH_KEY);
        if (!fresh[pathId]) fresh[pathId] = true; else delete fresh[pathId];
        setStorage(GUIDED_PATH_KEY, fresh);
        updateAllUI();
        initGuidedPath(); // Redraw indicators
        if (typeof initDashboard === 'function') initDashboard();
    });

    if (flowPref && !isDone) startFlow();
    updateAllUI();
  }

  // --- 3. DASHBOARD ---
  function initDashboard() {
    const isHome = getPathId(window.location.pathname) === 'home';
    if (!isHome) return;
    const dashId = 'socatlas-mastery-dashboard';
    let container = document.getElementById(dashId);
    if (!container) {
      container = document.createElement('div');
      container.id = dashId;
      const hero = document.querySelector('.hero-actions') || document.querySelector('h1');
      if (hero) hero.insertAdjacentElement('afterend', container);
    }
    if (!container) return;
    const qCount = Object.keys(getStorage(QUICK_PATH_KEY)).length;
    const gCount = Object.keys(getStorage(GUIDED_PATH_KEY)).length;
    const qPct = Math.round((qCount / 1200) * 100);
    const gPct = Math.round((gCount / 40) * 100);
    container.innerHTML = `
      <div class="mastery-dashboard">
        <div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge">Roadmap</span><h3>Global Progress</h3></div><div class="mastery-stats"><span class="mastery-pct">${gPct}%</span><div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${gPct}%"></div></div><span class="mastery-meta">${gCount} topics complete</span></div></div>
        <div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge" style="background:#d1fae5;color:#065f46">Quick pack</span><h3>Retention Progress</h3></div><div class="mastery-stats"><span class="mastery-pct">${qPct}%</span><div class="mastery-bar-bg" style="background:#f0fdf4"><div class="mastery-bar-fill" style="width: ${qPct}%;background:#10b981"></div></div><span class="mastery-meta">${qCount} points mastered</span></div></div>
      </div>
    `;
  }

  function start() { try { initQuickPath(); initGuidedPath(); initDashboard(); } catch (e) {} }
  if (typeof window.document$ !== "undefined" && window.document$ !== null) { window.document$.subscribe(start); }
  else if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})();
