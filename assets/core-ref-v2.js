(function() {
  /* --- SOCAtlas Pure Documentation Engine (v10.0 - Stealth Mode) --- */
  
  // 1. CLEAR ALL PREVIOUS PROGRESS DATA (Nuclear Cache Bust)
  localStorage.clear();
  console.log("SOCAtlas: Manual Reference Mode Active.");

  const DOMAIN_QUESTIONS = {
    'fundamentals': "What is the primary difference between Hashing and Encryption in a SOC environment?",
    'networking': "Explain the 3-way handshake and how an attacker might abuse it for a DOS attack.",
    'threats': "If you see a successful login followed by rapid data exfiltration, what MITRE TTPs are likely active?",
    'attack': "How does a Cross-Site Request Forgery (CSRF) differ from a Cross-Site Scripting (XSS) attack?",
    'defense': "Describe the 'Containment' phase of Incident Response. What are the risks of performing it too early?",
    'governance': "What is the difference between a False Positive and a False Negative in the context of SIEM tuning?",
    'alerts': "During a Malware alert triage, what are the top 3 indicators of compromise (IOCs) you check first?",
    'career': "How do you stay updated with the latest cybersecurity threats and zero-day vulnerabilities?"
  };

  function getPathId(p) {
    if (!p) return 'none';
    try {
        let clean = p.split('#')[0].split('?')[0]; if (clean.includes('://')) clean = new URL(clean).pathname;
        clean = clean.replace(/^\/socatlas\//, '/').replace(/^\//, '').replace(/\.html$|\.md$/g, '').replace(/\/$/, '');
        return clean || 'home';
    } catch (e) { return 'none'; }
  }

  function injectKnowledgeCheck() {
    const path = window.location.pathname;
    const pathId = getPathId(path);
    if (pathId === 'home' || pathId === 'none' || path.includes('/quick/') || path.includes('/interviews/')) return;

    const content = document.querySelector('.md-content__inner');
    if (!content || document.getElementById('soc-knowledge-check')) return;

    let domain = 'fundamentals';
    for (const d in DOMAIN_QUESTIONS) { if (path.includes(d)) { domain = d; break; } }
    const question = DOMAIN_QUESTIONS[domain];

    const card = document.createElement('div');
    card.id = 'soc-knowledge-check';
    card.innerHTML = `
      <div class="knowledge-check-card">
        <div class="card-badge">🎯 Interview Challenge</div>
        <h3>Knowledge Check</h3>
        <p class="challenge-q">"${question}"</p>
      </div>
    `;
    content.appendChild(card);
  }

  function start() { try { injectKnowledgeCheck(); } catch (e) {} }
  if (typeof window.document$ !== "undefined") window.document$.subscribe(start);
  else document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(start, 500);
})();
