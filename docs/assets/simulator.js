(function() {
  const SIM_BANK_URL = '../assets/questions-bank.json';
  let questionBank = [];
  let initialized = false;

  async function loadBank() {
    if (initialized) return;
    const simEl = document.getElementById('sim-container');
    if (!simEl) return;
    
    initialized = true;
    try {
      const resp = await fetch(SIM_BANK_URL);
      if (!resp.ok) throw new Error('Bank 404');
      questionBank = await resp.json();
      initUI();
    } catch (e) {
      document.getElementById('sim-question').textContent = 'Simulator is currently unavailable (Error 404).';
    }
  }

  function initUI() {
    const revealBtn = document.getElementById('sim-reveal-btn');
    const nextBtn = document.getElementById('sim-next-btn');

    revealBtn.onclick = () => {
      document.getElementById('sim-answer-box').style.display = 'block';
      revealBtn.disabled = true;
    };
    nextBtn.onclick = () => showNext();
    showNext();
  }

  function showNext() {
    if (!questionBank.length) return;
    const item = questionBank[Math.floor(Math.random() * questionBank.length)];
    document.getElementById('sim-answer-box').style.display = 'none';
    document.getElementById('sim-question').textContent = item.concept;
    document.getElementById('sim-answer-text').textContent = item.answer;
    document.getElementById('sim-example-text').textContent = item.example;
    document.getElementById('sim-category').textContent = item.category || 'Domain';
    const idEl = document.getElementById('sim-id');
    if (idEl) idEl.textContent = '#' + String(item.id).padStart(3, '0');
    document.getElementById('sim-reveal-btn').disabled = false;
  }

  if (typeof window.document$ !== "undefined" && window.document$ !== null) {
      window.document$.subscribe(loadBank);
  } else {
      document.addEventListener('DOMContentLoaded', loadBank);
      loadBank();
  }
})();
