(function() {
  /* --- SOCAtlas Pure Documentation Engine (v8.0 - Absolute Zero UI) --- */
  
  // All Progress Stats, Dashboards, Mastery Locks, and Ticks have been nuked.
  // The system only handles silent "Auto-Next" navigation on manual scroll to bottom.

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
            // No progress marking, no ticks, no stats. Just move to next page.
            setTimeout(() => {
                const next = document.querySelector('.md-footer__link--next');
                if (next) next.click();
            }, 1000);
        }
    };
  }

  function start() { try { initStealthNext(); } catch (e) {} }
  if (typeof window.document$ !== "undefined") window.document$.subscribe(start);
  else document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
