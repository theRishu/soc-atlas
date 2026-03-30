(function() {
  /* --- SOCAtlas Pure Stealth Advance (v6.0 - No Autoscroll) --- */
  
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
        clean = clean.replace(/^\/socatlas\//, '/').replace(/^\//, '').replace(/\.html$|\.md$/g, '').replace(/\/$/, '');
        return clean || 'home';
    } catch (e) { return 'none'; }
  }

  // --- Manual Scroll -> Auto-Next Navigation ---
  function initManualAdvance() {
    const pathId = getPathId(window.location.pathname);
    if (pathId === 'home' || pathId === 'none' || window.location.pathname.includes('/quick/')) return;

    window.onscroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            // Mark as done
            const fr = getStorage(GUIDED_PATH_KEY);
            if (!fr[pathId]) { fr[pathId] = true; setStorage(GUIDED_PATH_KEY, fr); updateSidebar(); }
            
            // Auto-next navigation (but no screen movement)
            setTimeout(() => {
                const next = document.querySelector('.md-footer__link--next');
                if (next) next.click();
            }, 1500); // Small delay to let user see the end
        }
    };
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

  function initDashboard() {
    const isHome = getPathId(window.location.pathname) === 'home'; if (!isHome) return;
    if (document.getElementById('socatlas-mastery-dashboard')) return;
    const content = document.querySelector('.md-content__inner'); if (!content) return;
    const container = document.createElement('div'); container.id = 'socatlas-mastery-dashboard';
    const hero = document.querySelector('.hero-actions') || content.querySelector('h1') || content.firstChild;
    if (hero) hero.insertAdjacentElement('afterend', container);
    const qCount = Object.keys(getStorage(QUICK_PATH_KEY)).length; const gCount = Object.keys(getStorage(GUIDED_PATH_KEY)).length;
    container.innerHTML = `
      <div class="mastery-dashboard">
        <div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge">Progress</span><h3>Curriculum Mastery</h3></div><div class="mastery-stats"><span class="mastery-pct">${Math.round(gCount/40*100)}%</span><div class="mastery-bar-bg"><div class="mastery-bar-fill" style="width: ${Math.round(gCount/40*100)}%"></div></div></div></div>
        <div class="mastery-card"><div class="mastery-card-header"><span class="mastery-badge" style="background:#d1fae5;color:#065f46">Revision</span><h3>Knowledge Points</h3></div><div class="mastery-stats"><span class="mastery-pct">${Math.round(qCount/1200*100)}%</span><div class="mastery-bar-bg" style="background:#f0fdf4"><div class="mastery-bar-fill" style="width: ${Math.round(qCount/1200*100)}%;background:#10b981"></div></div></div></div>
      </div>`;
  }

  function start() { try { initManualAdvance(); initDashboard(); updateSidebar(); } catch (e) {} }
  if (typeof window.document$ !== "undefined") window.document$.subscribe(start);
  else document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(start, 500);
})();
