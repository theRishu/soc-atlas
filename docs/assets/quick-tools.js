(function() {
  /* --- SOCAtlas Universal Progress Tracker --- */
  
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

  // --- 1. QUICK PATH LOGIC (Tables) ---
  function initQuickPath() {
    const content = document.querySelector('.md-content__inner');
    if (!content || !window.location.pathname.includes('/quick/')) return;

    const statsContainer = document.createElement('div');
    statsContainer.className = 'quick-stats-card';
    statsContainer.innerHTML = `
      <div class="quick-stats-main">
        <div class="quick-stats-info">
          <span class="quick-stats-label">Quick Path Mastery</span>
          <h2 class="quick-stats-value" id="quick-path-pct">0%</h2>
        </div>
        <div class="quick-stats-progress-bg">
          <div class="quick-stats-progress-fill" id="quick-path-bar" style="width: 0%"></div>
        </div>
      </div>
      <div class="quick-stats-meta">
        <span id="quick-path-count">0 of 0 points mastered</span>
        <button id="quick-clear-page" class="quick-stats-btn">Reset Page</button>
      </div>
    `;
    
    const firstTable = content.querySelector('table');
    content.insertBefore(statsContainer, firstTable || content.firstChild);

    // Search wrap
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'quick-search-wrapper';
    searchWrapper.innerHTML = `
      <input type="text" id="quick-page-search" placeholder="Filter these points..." class="quick-search-input">
      <span class="quick-search-icon">🔍</span>
    `;
    content.insertBefore(searchWrapper, statsContainer);

    const tables = content.querySelectorAll('table');
    const stored = getStorage(QUICK_PATH_KEY);
    let totalOnPage = 0;

    tables.forEach((table, tIdx) => {
      const thead = table.querySelector('thead tr');
      if (thead) {
        const th = document.createElement('th');
        th.innerHTML = 'Done';
        th.style.width = '60px';
        thead.insertBefore(th, thead.firstChild);
      }

      table.querySelectorAll('tbody tr').forEach((row, rIdx) => {
        const pointMatch = row.cells[0]?.textContent.match(/^(\d+)/);
        const pid = pointMatch ? pointMatch[1] : `p-${window.location.pathname}-${tIdx}-${rIdx}`;
        
        const td = document.createElement('td');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'quick-point-check';
        cb.checked = !!stored[pid];
        if (cb.checked) row.classList.add('point-mastered');

        cb.addEventListener('change', () => {
          const fresh = getStorage(QUICK_PATH_KEY);
          if (cb.checked) {
            fresh[pid] = true;
            row.classList.add('point-mastered');
          } else {
            delete fresh[pid];
            row.classList.remove('point-mastered');
          }
          setStorage(QUICK_PATH_KEY, fresh);
          updatePageStats();
        });

        td.appendChild(cb);
        row.insertBefore(td, row.firstChild);
        totalOnPage++;
      });
    });

    function updatePageStats() {
      const fresh = getStorage(QUICK_PATH_KEY);
      const checks = document.querySelectorAll('.quick-point-check');
      const onPageMastered = Array.from(checks).filter(c => c.checked).length;
      const pct = Math.round((onPageMastered / totalOnPage) * 100) || 0;
      
      document.getElementById('quick-path-pct').textContent = pct + '%';
      document.getElementById('quick-path-bar').style.width = pct + '%';
      document.getElementById('quick-path-count').textContent = `${onPageMastered} of ${totalOnPage} points mastered on this page`;
    }

    // Search
    document.getElementById('quick-page-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      tables.forEach(t => {
        t.querySelectorAll('tbody tr').forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    });

    document.getElementById('quick-clear-page').addEventListener('click', () => {
      if (confirm('Clear progress for this page?')) {
        const fresh = getStorage(QUICK_PATH_KEY);
        document.querySelectorAll('.quick-point-check').forEach(c => {
          c.checked = false;
          c.closest('tr').classList.remove('point-mastered');
          const pm = c.closest('tr').cells[1]?.textContent.match(/^(\d+)/);
          const pid = pm ? pm[1] : null;
          if (pid) delete fresh[pid];
        });
        setStorage(QUICK_PATH_KEY, fresh);
        updatePageStats();
      }
    });

    updatePageStats();
  }

  // --- 2. GUIDED PATH LOGIC (Individual Pages) ---
  function initGuidedPath() {
    const content = document.querySelector('.md-content__inner');
    const path = window.location.pathname;
    if (!content || path === '/' || path.includes('/quick/') || path.includes('index.html')) return;

    const footerId = 'guided-completion-footer';
    if (document.getElementById(footerId)) return;

    const stored = getStorage(GUIDED_PATH_KEY);
    const isDone = !!stored[path];

    const footer = document.createElement('div');
    footer.id = footerId;
    footer.className = 'guided-footer-card';
    footer.innerHTML = `
      <div class="guided-footer-text">
        <h3>Finished this topic?</h3>
        <p>Mark it as complete to track your progress through the Guided Path.</p>
      </div>
      <button class="md-button ${isDone ? '' : 'md-button--primary'} guided-toggle-btn">
        ${isDone ? '✓ Completed' : 'Mark as Complete'}
      </button>
    `;

    content.appendChild(footer);

    footer.querySelector('button').addEventListener('click', function() {
      const fresh = getStorage(GUIDED_PATH_KEY);
      const isNowDone = !fresh[path];
      if (isNowDone) fresh[path] = true; else delete fresh[path];
      setStorage(GUIDED_PATH_KEY, fresh);
      
      this.textContent = isNowDone ? '✓ Completed' : 'Mark as Complete';
      this.classList.toggle('md-button--primary', !isNowDone);
    });
  }

  // --- 3. HOMEPAGE DASHBOARD ---
  function initDashboard() {
    const path = window.location.pathname;
    const isHome = path === '/' || path.includes('index.html');
    if (!isHome) return;

    const dashId = 'socatlas-mastery-dashboard';
    let container = document.getElementById(dashId);
    if (!container) {
      container = document.createElement('div');
      container.id = dashId;
      const hero = document.querySelector('.hero-actions') || document.querySelector('h1');
      if (hero) hero.insertAdjacentElement('afterend', container);
    }

    const quickTotal = 1200;
    const guideTotal = 40; // Approx total pages in guide excluding home/quick
    
    const quickMastered = Object.keys(getStorage(QUICK_PATH_KEY)).length;
    const guideMastered = Object.keys(getStorage(GUIDED_PATH_KEY)).length;
    
    const qPct = Math.min(100, Math.round((quickMastered / quickTotal) * 100));
    const gPct = Math.min(100, Math.round((guideMastered / guideTotal) * 100));

    container.innerHTML = `
      <div class="mastery-dashboard">
        <div class="mastery-card">
          <div class="mastery-card-header">
            <span class="mastery-badge">Path 1</span>
            <h3>Guided Mastery</h3>
          </div>
          <div class="mastery-stats">
            <span class="mastery-pct">${gPct}%</span>
            <div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${gPct}%"></div></div>
            <span class="mastery-meta">${guideMastered} of ${guideTotal} topics complete</span>
          </div>
        </div>
        <div class="mastery-card">
          <div class="mastery-card-header">
            <span class="mastery-badge">Path 2</span>
            <h3>Quick Revision Mastery</h3>
          </div>
          <div class="mastery-stats">
            <span class="mastery-pct">${qPct}%</span>
            <div class="mastery-bar-bg" style="--bar-color: #0abf53"><div class="mastery-bar-fill" style="width: ${qPct}%; background: #0abf53"></div></div>
            <span class="mastery-meta">${quickMastered} of ${quickTotal} points mastered</span>
          </div>
        </div>
      </div>
    `;
  }

  function start() {
    initQuickPath();
    initGuidedPath();
    initDashboard();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(() => start());
  } else {
    start();
  }
})();

