(function() {
  /* --- SOCAtlas Absolute Purge Engine (v9.0 - Final) --- */
  
  // 1. CLEAR ALL PREVIOUS PROGRESS TO KILL TICKS FOREVER
  localStorage.removeItem('socatlas-progress-guided-pages');
  localStorage.removeItem('socatlas-progress-quick-points');
  localStorage.removeItem('socatlas-flow-enabled');
  localStorage.clear(); // Nuclear option

  console.log("SOCAtlas: Zero UI Mode Engaged. All progress data purged.");

  function getPathId(p) {
    if (!p) return 'none';
    try {
        let clean = p.split('#')[0].split('?')[0]; if (clean.includes('://')) clean = new URL(clean).pathname;
        clean = clean.replace(/^\/socatlas\//, '/').replace(/^\//, '').replace(/\.html$|\.md$/g, '').replace(/\/$/, '');
        return clean || 'home';
    } catch (e) { return 'none'; }
  }

  function initStealthNext() {
    const pId = getPathId(window.location.pathname);
    if (pId === 'home' || pId === 'none' || window.location.pathname.includes('/quick/')) return;
    window.onscroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            setTimeout(() => {
                const next = document.querySelector('.md-footer__link--next');
                if (next) next.click();
            }, 1000);
        }
    };
  }

  function start() { 
    try { 
        initStealthNext(); 
        // Force-remove any existing tick elements just in case
        document.querySelectorAll('.nav-check, .nav-checkmark, [class*="check"]').forEach(el => el.remove());
    } catch (e) {} 
  }
  
  if (typeof window.document$ !== "undefined") window.document$.subscribe(start);
  else document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(start, 500);
})();
