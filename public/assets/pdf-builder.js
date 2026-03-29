(function () {
  const ROOT_SELECTOR = "[data-pdf-builder]";
  const STORAGE_KEY = "socatlas-pdf-sections";
  const MODE_STORAGE_KEY = "socatlas-pdf-mode";

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function readSavedSelection(sections) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return sections.map((section) => section.slug);
      }

      const saved = JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.length) {
        return sections.map((section) => section.slug);
      }

      const valid = new Set(sections.map((section) => section.slug));
      const selected = saved.filter((slug) => valid.has(slug));
      return selected.length ? selected : sections.map((section) => section.slug);
    } catch {
      return sections.map((section) => section.slug);
    }
  }

  function saveSelection(selected) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      // Ignore storage issues in private mode.
    }
  }

  function readSavedMode() {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      return saved === "paper" ? "paper" : "color";
    } catch {
      return "color";
    }
  }

  function saveMode(mode) {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage issues in private mode.
    }
  }

  function render(root, sections) {
    const selected = new Set(readSavedSelection(sections));
    const selectedMode = readSavedMode();
    const options = sections
      .map(
        (section) => `
          <label class="pdf-builder__option">
            <input type="checkbox" value="${escapeHtml(section.slug)}" ${
              selected.has(section.slug) ? "checked" : ""
            }>
            <span class="pdf-builder__option-title">${escapeHtml(section.title)}</span>
            <span class="pdf-builder__option-meta">${pluralize(section.count, "topic", "topics")}</span>
          </label>
        `
      )
      .join("");

    root.innerHTML = `
      <p class="pdf-builder__eyebrow">Custom PDF</p>
      <h2 class="pdf-builder__title">Choose exactly what to download</h2>
      <p class="pdf-builder__intro">
        Pick the SOCAtlas sections you want in the PDF. Keep everything checked for the full guide,
        or trim it down to just networking, alerts, attacks, or the exact areas you want to revise.
      </p>
      <div class="pdf-builder__modes" role="radiogroup" aria-label="PDF style">
        <label class="pdf-builder__mode">
          <input type="radio" name="pdf-mode" value="color" ${selectedMode === "color" ? "checked" : ""}>
          <span class="pdf-builder__mode-title">Color PDF</span>
          <span class="pdf-builder__mode-meta">Keeps accents, highlights, and richer visual styling.</span>
        </label>
        <label class="pdf-builder__mode">
          <input type="radio" name="pdf-mode" value="paper" ${selectedMode === "paper" ? "checked" : ""}>
          <span class="pdf-builder__mode-title">Paper-friendly</span>
          <span class="pdf-builder__mode-meta">Uses cleaner black-and-white print styling to save ink.</span>
        </label>
      </div>
      <p class="pdf-builder__summary" data-pdf-summary></p>
      <div class="pdf-builder__grid">
        ${options}
      </div>
      <div class="pdf-builder__actions">
        <button type="button" class="pdf-builder__utility" data-pdf-select-all>Select all</button>
        <button type="button" class="pdf-builder__utility" data-pdf-clear-all>Clear all</button>
        <a class="md-button pdf-builder__action" href="complete-guide.html" target="_blank" rel="noopener" data-pdf-preview>
          Preview selection
        </a>
        <a class="md-button md-button--primary pdf-builder__action" href="complete-guide.html?download=1" target="_blank" rel="noopener" data-pdf-download>
          Download selected PDF
        </a>
      </div>
      <p class="pdf-builder__empty" data-pdf-empty hidden>Select at least one section to build a PDF.</p>
    `;

    const checkboxes = Array.from(root.querySelectorAll('input[type="checkbox"]'));
    const modes = Array.from(root.querySelectorAll('input[name="pdf-mode"]'));
    const summary = root.querySelector("[data-pdf-summary]");
    const empty = root.querySelector("[data-pdf-empty]");
    const preview = root.querySelector("[data-pdf-preview]");
    const download = root.querySelector("[data-pdf-download]");
    const previewBase = preview.getAttribute("href") || "complete-guide.html";

    const update = () => {
      const selectedValues = checkboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      const mode = modes.find((input) => input.checked)?.value || "color";
      const selectedSet = new Set(selectedValues);
      const selectedSections = sections.filter((section) => selectedSet.has(section.slug));
      const topicCount = selectedSections.reduce((sum, section) => sum + section.count, 0);
      const params = new URLSearchParams();

      if (selectedValues.length) {
        params.set("sections", selectedValues.join(","));
      }

      params.set("mode", mode);

      preview.href = `${previewBase}?${params.toString()}`;

      params.set("download", "1");
      download.href = `${previewBase}?${params.toString()}`;

      summary.textContent = selectedValues.length
        ? `${pluralize(selectedValues.length, "section", "sections")} selected • ${pluralize(topicCount, "topic", "topics")} included • ${mode === "paper" ? "Paper-friendly" : "Color PDF"}`
        : "No sections selected yet";

      const disabled = selectedValues.length === 0;
      preview.toggleAttribute("aria-disabled", disabled);
      download.toggleAttribute("aria-disabled", disabled);
      preview.style.pointerEvents = disabled ? "none" : "";
      download.style.pointerEvents = disabled ? "none" : "";
      preview.style.opacity = disabled ? "0.55" : "";
      download.style.opacity = disabled ? "0.55" : "";
      empty.hidden = !disabled;
      saveSelection(selectedValues);
      saveMode(mode);
    };

    root.querySelector("[data-pdf-select-all]").addEventListener("click", () => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      update();
    });

    root.querySelector("[data-pdf-clear-all]").addEventListener("click", () => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      update();
    });

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", update);
    });

    modes.forEach((input) => {
      input.addEventListener("change", update);
    });

    update();
  }

  async function init(root) {
    const configPath = root.dataset.config || "assets/pdf-sections.json";

    try {
      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${configPath}`);
      }

      const sections = await response.json();
      if (!Array.isArray(sections) || !sections.length) {
        throw new Error("No PDF sections found");
      }

      render(root, sections);
    } catch (error) {
      root.innerHTML = `
        <p class="pdf-builder__eyebrow">Custom PDF</p>
        <h2 class="pdf-builder__title">Choose exactly what to download</h2>
        <p class="pdf-builder__empty">The custom PDF selector could not load right now. Open the full guide and print it from there.</p>
      `;
      console.error(error);
    }
  }

  function start() {
    document.querySelectorAll(ROOT_SELECTOR).forEach((root) => init(root));
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(() => start());
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
