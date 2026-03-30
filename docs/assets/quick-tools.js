(function() {
  /* --- SOCAtlas Universal Progress & Locking System --- */
  
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

  // --- Universal Path Normalizer ---
  // Converts any URL (relative or absolute) to a unique root-relative ID
  // e.g. "/socatlas/fundamentals/introduction.html" -> "fundamentals/introduction"
  function getPathId(p) {
    if (!p) return 'none';
    let clean = p.split('#')[0].split('?')[0];
    
    // 1. Remove domain/protocol if present
    if (clean.includes('://')) clean = new URL(clean).pathname;
    
    // 2. Remove base path segment if it exists (e.g. /socatlas/)
    // This is useful for github pages or subpath deployments
    const parts = clean.split('/').filter(Boolean);
    if (parts[0] === 'socatlas') parts.shift();
    
    // 3. Clean extensions and precursors
    clean = parts.join('/');
    clean = clean.replace(/\.html$|\.md$/g, '');
    
    return clean || 'home';
  }

  // --- 1. QUICK PATH LOGIC (Tables) ---
  function initQuickPath() {
    const content = document.querySelector('.md-content__inner');
    if (!content || !window.location.pathname.includes('/quick/')) return;
    const pageId = getPathId(window.location.pathname);

    // Prevent duplicate injection
    if (document.getElementById('quick-stats-container')) return;

    const statsContainer = document.createElement('div');
    statsContainer.id = 'quick-stats-container';
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
      if (thead && !thead.querySelector('.check-th')) {
        const th = document.createElement('th');
        th.className = 'check-th';
        th.innerHTML = 'Done';
        th.style.width = '60px';
        thead.insertBefore(th, thead.firstChild);
      }

      table.querySelectorAll('tbody tr').forEach((row, rIdx) => {
        if (row.querySelector('.quick-point-check')) return;
        
        const pointMatch = row.cells[0]?.textContent.match(/^(\d+)/);
        const pid = pointMatch ? pointMatch[1] : `p-${pageId}-${tIdx}-${rIdx}`;
        
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
      const checks = document.querySelectorAll('.quick-point-check');
      const onPageMastered = Array.from(checks).filter(c => c.checked).length;
      const pct = Math.round((onPageMastered / totalOnPage) * 100) || 0;
      
      const pctEl = document.getElementById('quick-path-pct');
      const barEl = document.getElementById('quick-path-bar');
      const countEl = document.getElementById('quick-path-count');
      
      if (pctEl) pctEl.textContent = pct + '%';
      if (barEl) barEl.style.width = pct + '%';
      if (countEl) countEl.textContent = `${onPageMastered} of ${totalOnPage} points mastered on this page`;
    }

    const searchInput = document.getElementById('quick-page-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        tables.forEach(t => {
          t.querySelectorAll('tbody tr').forEach(r => {
            r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      });
    }

    const clearBtn = document.getElementById('quick-clear-page');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
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
    }

    updatePageStats();
  }

  // --- 2. GUIDED PATH LOGIC (Individual Pages) ---
  function initGuidedPath() {
    const content = document.querySelector('.md-content__inner');
    const pathId = getPathId(window.location.pathname);
    const stored = getStorage(GUIDED_PATH_KEY);
    
    // 2a. Indicators in Sidebar
    const navLinks = document.querySelectorAll('.md-nav__link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Resolve href against current location if it's relative
      let absoluteLink = new URL(href, window.location.href).pathname;
      const linkId = getPathId(absoluteLink);
      
      if (linkId === 'none' || linkId === 'home') return;
      
      const isNavDone = !!stored[linkId];
      const existing = link.querySelector('.nav-check');
      if (existing) existing.remove();

      if (isNavDone) {
        const check = document.createElement('span');
        check.className = 'nav-check';
        check.innerHTML = ' ✓';
        check.style.color = '#0abf53';
        check.style.fontWeight = '800';
        link.appendChild(check);
      }
    });

    // 2b. Page Footer (Time-Gated Mark as Complete)
    if (!content || window.location.pathname.includes('/quick/') || pathId === 'home') return;

    const footerId = 'guided-completion-footer';
    const existingFooter = document.getElementById(footerId);
    if (existingFooter) existingFooter.remove();

    const isDone = !!stored[pathId];
    
    // Estimate Reading Time (200 words per minute, min 5 sec for testing)
    const wordCount = content.innerText.split(/\s+/).length;
    const estMinutes = wordCount / 200;
    let waitSeconds = Math.max(5, Math.min(300, Math.round(estMinutes * 60)));
    
    if (isDone) waitSeconds = 0;

    const footer = document.createElement('div');
    footer.id = footerId;
    footer.className = 'guided-footer-card';
    footer.innerHTML = `
      <div class="guided-footer-text">
        <h3>Finished this topic?</h3>
        <p id="guided-timer-note">${isDone ? 'Topic mastered.' : 'Take a moment to master this concept before completing.'}</p>
      </div>
      <button class="md-button ${isDone ? '' : 'md-button--primary'} guided-toggle-btn" ${!isDone && waitSeconds > 0 ? 'disabled' : ''}>
        ${isDone ? '✓ Completed' : `Unlock in ${waitSeconds}s`}
      </button>
    `;

    content.appendChild(footer);

    const btn = footer.querySelector('button');
    if (!isDone && waitSeconds > 0) {
      let remaining = waitSeconds;
      let timer = setInterval(() => {
        remaining--;
        const timerEl = document.getElementById('guided-timer-note');
        if (remaining <= 0) {
          clearInterval(timer);
          btn.disabled = false;
          btn.textContent = 'Mark as Complete';
          if (timerEl) timerEl.textContent = 'Ready to mark as complete!';
        } else {
          btn.textContent = `Unlock in ${remaining}s`;
        }
      }, 1000);
    }

    btn.addEventListener('click', function() {
      const fresh = getStorage(GUIDED_PATH_KEY);
      const isNowDone = !fresh[pathId];
      if (isNowDone) fresh[pathId] = true; else delete fresh[pathId];
      setStorage(GUIDED_PATH_KEY, fresh);
      
      // Update sidebar and dashboard
      initGuidedPath();
      if (typeof initDashboard === 'function') initDashboard();
    });
  }

  // --- 3. HOMEPAGE DASHBOARD ---
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

    const quickTotal = 1200;
    const guideTotal = 40;
    
    const quickMastered = Object.keys(getStorage(QUICK_PATH_KEY)).length;
    const guideMastered = Object.keys(getStorage(GUIDED_PATH_KEY)).length;
    
    const qPct = Math.min(100, Math.round((quickMastered / quickTotal) * 100));
    const gPct = Math.min(100, Math.round((guideMastered / guideTotal) * 100));

    const completedEntries = Object.keys(getStorage(GUIDED_PATH_KEY));
    const recent = completedEntries.slice(-3).map(id => id.split('/').pop().replace(/_/g, ' '));

    container.innerHTML = `
      <div class="mastery-dashboard">
        <div class="mastery-card">
          <div class="mastery-card-header">
            <span class="mastery-badge">Guided Path</span>
            <h3>Progress Summary</h3>
          </div>
          <div class="mastery-stats">
            <span class="mastery-pct">${gPct}%</span>
            <div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${gPct}%"></div></div>
            <span class="mastery-meta">${guideMastered} of ${guideTotal} topics complete</span>
            ${recent.length ? `<div class="mastery-recent">Recently: ${recent.join(', ')}</div>` : ''}
          </div>
        </div>
        <div class="mastery-card">
          <div class="mastery-card-header">
            <span class="mastery-badge">Quick Points</span>
            <h3>Progress Summary</h3>
          </div>
          <div class="mastery-stats">
            <span class="mastery-pct">${qPct}%</span>
            <div class="mastery-bar-bg" style="--bar-color: #0abf53"><div class="mastery-bar-fill" style="width: ${qPct}%; background: #0abf53"></div></div>
            <span class="mastery-meta">${quickMastered} of ${quickTotal} points mastered</span>
            <div class="mastery-recent">Active revision through 12 domains</div>
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
