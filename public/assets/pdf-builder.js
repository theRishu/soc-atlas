(function () {
  const ROOT_SELECTOR = "[data-pdf-builder]";
  const STORAGE_KEY = "socatlas-pdf-sections";
  const MODE_STORAGE_KEY = "socatlas-pdf-mode";
  const PRESETS = [
    {
      id: "interview-core",
      label: "Interview Core",
      description: "Best all-round interview pack.",
      slugs: [
        "start-here",
        "fundamentals",
        "networking",
        "major-attacks-directory",
        "detection-defense",
        "governance-compliance",
      ],
    },
    {
      id: "soc-analyst",
      label: "SOC Analyst",
      description: "Detection, alerts, ATT&CK, and fast revision.",
      slugs: [
        "fundamentals",
        "detection-defense",
        "governance-compliance",
        "soc-alerts-scenarios",
        "1200-quick-points",
      ],
    },
    {
      id: "network-defense",
      label: "Network Defense",
      description: "Networking, attacks, and defense workflows.",
      slugs: ["networking", "major-attacks-directory", "detection-defense"],
    },
    {
      id: "starter-path",
      label: "Starter Path",
      description: "The easiest path for new learners.",
      slugs: ["start-here", "fundamentals", "networking"],
    },
    {
      id: "full-guide",
      label: "Full Guide",
      description: "Everything in one PDF.",
      slugs: "*",
    },
  ];

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

  function sameSelection(selected, target) {
    if (selected.length !== target.length) {
      return false;
    }

    const selectedSet = new Set(selected);
    return target.every((slug) => selectedSet.has(slug));
  }

  function resolvePresetSlugs(sections, preset) {
    if (preset.slugs === "*") {
      return sections.map((section) => section.slug);
    }

    const wanted = new Set(preset.slugs);
    return sections
      .filter((section) => wanted.has(section.slug))
      .map((section) => section.slug);
  }

  function buildPresetCards(sections) {
    return PRESETS.map((preset) => {
      const slugs = resolvePresetSlugs(sections, preset);
      const topicCount = sections
        .filter((section) => slugs.includes(section.slug))
        .reduce((sum, section) => sum + section.count, 0);

      return `
        <button
          type="button"
          class="pdf-builder__preset"
          data-pdf-preset="${escapeHtml(preset.id)}"
          data-pdf-preset-slugs="${escapeHtml(slugs.join(","))}"
        >
          <span class="pdf-builder__preset-title">${escapeHtml(preset.label)}</span>
          <span class="pdf-builder__preset-meta">${escapeHtml(preset.description)}</span>
          <span class="pdf-builder__preset-count">${pluralize(slugs.length, "section", "sections")} • ${pluralize(topicCount, "topic", "topics")}</span>
        </button>
      `;
    }).join("");
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }

    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  function bindVisibility(root) {
    const sync = () => {
      const open = window.location.hash === "#pdf-builder";
      root.hidden = !open;

      if (open) {
        requestAnimationFrame(() => {
          root.scrollIntoView({ block: "start", behavior: "smooth" });
        });
      }
    };

    sync();
    window.addEventListener("hashchange", sync);
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
      <div class="pdf-builder__header">
        <p class="pdf-builder__eyebrow">Download PDF</p>
        <h2 class="pdf-builder__title">Choose What Goes Into Your PDF</h2>
        <p class="pdf-builder__intro">
          Click <strong>Download as PDF</strong>, choose what you want to include, and download a real PDF file.
          Use a smart preset or hand-pick the sections, then choose color or paper-friendly output.
        </p>
      </div>

      <div class="pdf-builder__presets" data-pdf-presets>
        ${buildPresetCards(sections)}
      </div>

      <div class="pdf-builder__modes" role="radiogroup" aria-label="PDF style">
        <label class="pdf-builder__mode">
          <input type="radio" name="pdf-mode" value="color" ${selectedMode === "color" ? "checked" : ""}>
          <span class="pdf-builder__mode-title">Color PDF</span>
          <span class="pdf-builder__mode-meta">Keeps accents, highlights, and richer visual styling.</span>
        </label>
        <label class="pdf-builder__mode">
          <input type="radio" name="pdf-mode" value="paper" ${selectedMode === "paper" ? "checked" : ""}>
          <span class="pdf-builder__mode-title">Paper-friendly</span>
          <span class="pdf-builder__mode-meta">Pure black-and-white output with accent colors removed.</span>
        </label>
      </div>

      <div class="pdf-builder__summary-card">
        <div class="pdf-builder__stats">
          <div class="pdf-builder__stat">
            <span class="pdf-builder__stat-label">Sections</span>
            <strong class="pdf-builder__stat-value" data-pdf-sections-count>0</strong>
          </div>
          <div class="pdf-builder__stat">
            <span class="pdf-builder__stat-label">Topics</span>
            <strong class="pdf-builder__stat-value" data-pdf-topics-count>0</strong>
          </div>
          <div class="pdf-builder__stat">
            <span class="pdf-builder__stat-label">Output</span>
            <strong class="pdf-builder__stat-value" data-pdf-mode-label>Color PDF</strong>
          </div>
        </div>
        <p class="pdf-builder__summary" data-pdf-summary></p>
        <div class="pdf-builder__badges" data-pdf-selection></div>
      </div>

      <div class="pdf-builder__grid">
        ${options}
      </div>

      <div class="pdf-builder__actions">
        <div class="pdf-builder__actions-main">
          <a class="md-button pdf-builder__action" href="complete-guide.html" target="_blank" rel="noopener" data-pdf-preview>
            Preview selection
          </a>
          <a class="md-button md-button--primary pdf-builder__action" href="complete-guide.html?download=1" target="_blank" rel="noopener" data-pdf-download>
            Download Real PDF
          </a>
        </div>
        <div class="pdf-builder__actions-secondary">
          <button type="button" class="pdf-builder__utility" data-pdf-select-all>Select all</button>
          <button type="button" class="pdf-builder__utility" data-pdf-clear-all>Clear all</button>
          <button type="button" class="pdf-builder__utility" data-pdf-copy>Copy share link</button>
        </div>
      </div>

      <p class="pdf-builder__hint">Downloads a real PDF file. Paper-friendly removes accent colors and is tuned for clean printing.</p>
      <p class="pdf-builder__empty" data-pdf-empty hidden>Select at least one section to build a PDF.</p>
    `;

    const checkboxes = Array.from(root.querySelectorAll('input[type="checkbox"]'));
    const modes = Array.from(root.querySelectorAll('input[name="pdf-mode"]'));
    const presetButtons = Array.from(root.querySelectorAll("[data-pdf-preset]"));
    const summary = root.querySelector("[data-pdf-summary]");
    const badgeContainer = root.querySelector("[data-pdf-selection]");
    const sectionCount = root.querySelector("[data-pdf-sections-count]");
    const topicCountNode = root.querySelector("[data-pdf-topics-count]");
    const modeLabel = root.querySelector("[data-pdf-mode-label]");
    const empty = root.querySelector("[data-pdf-empty]");
    const preview = root.querySelector("[data-pdf-preview]");
    const download = root.querySelector("[data-pdf-download]");
    const copyButton = root.querySelector("[data-pdf-copy]");
    const previewBase = preview.getAttribute("href") || "complete-guide.html";
    const copyButtonLabel = "Copy share link";

    const updateSelectionStyles = () => {
      checkboxes.forEach((checkbox) => {
        checkbox.closest(".pdf-builder__option")?.toggleAttribute("data-selected", checkbox.checked);
      });

      modes.forEach((input) => {
        input.closest(".pdf-builder__mode")?.toggleAttribute("data-selected", input.checked);
      });
    };

    const updatePresets = (selectedValues) => {
      presetButtons.forEach((button) => {
        const presetSlugs = (button.dataset.pdfPresetSlugs || "")
          .split(",")
          .map((slug) => slug.trim())
          .filter(Boolean);
        const active = sameSelection(selectedValues, presetSlugs);
        button.toggleAttribute("data-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    };

    const update = () => {
      const selectedValues = checkboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      const mode = modes.find((input) => input.checked)?.value || "color";
      const selectedSet = new Set(selectedValues);
      const selectedSections = sections.filter((section) => selectedSet.has(section.slug));
      const topicCount = selectedSections.reduce((sum, section) => sum + section.count, 0);
      const params = new URLSearchParams();
      const currentModeLabel = mode === "paper" ? "Paper-friendly" : "Color PDF";

      if (selectedValues.length) {
        params.set("sections", selectedValues.join(","));
      }

      params.set("mode", mode);

      preview.href = `${previewBase}?${params.toString()}`;

      params.set("download", "1");
      download.href = `${previewBase}?${params.toString()}`;

      sectionCount.textContent = String(selectedValues.length);
      topicCountNode.textContent = String(topicCount);
      modeLabel.textContent = currentModeLabel;

      summary.textContent = selectedValues.length
        ? `${pluralize(selectedValues.length, "section", "sections")} selected for a ${currentModeLabel.toLowerCase()} export.`
        : "No sections selected yet.";

      badgeContainer.innerHTML = selectedSections.length
        ? selectedSections
            .map(
              (section) =>
                `<span class="pdf-builder__badge">${escapeHtml(section.title)}</span>`
            )
            .join("")
        : "";

      const disabled = selectedValues.length === 0;
      preview.toggleAttribute("aria-disabled", disabled);
      download.toggleAttribute("aria-disabled", disabled);
      preview.style.pointerEvents = disabled ? "none" : "";
      download.style.pointerEvents = disabled ? "none" : "";
      preview.style.opacity = disabled ? "0.55" : "";
      download.style.opacity = disabled ? "0.55" : "";
      copyButton.disabled = disabled;
      copyButton.toggleAttribute("data-disabled", disabled);
      empty.hidden = !disabled;

      updateSelectionStyles();
      updatePresets(selectedValues);
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

    copyButton.addEventListener("click", async () => {
      if (copyButton.disabled) {
        return;
      }

      try {
        await copyText(new URL(preview.href, window.location.href).href);
        copyButton.textContent = "Copied link";
        setTimeout(() => {
          copyButton.textContent = copyButtonLabel;
        }, 1600);
      } catch (error) {
        console.error(error);
        copyButton.textContent = "Copy failed";
        setTimeout(() => {
          copyButton.textContent = copyButtonLabel;
        }, 1600);
      }
    });

    presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const presetSlugs = new Set(
          (button.dataset.pdfPresetSlugs || "")
            .split(",")
            .map((slug) => slug.trim())
            .filter(Boolean)
        );

        checkboxes.forEach((checkbox) => {
          checkbox.checked = presetSlugs.has(checkbox.value);
        });

        update();
      });
    });

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", update);
    });

    modes.forEach((input) => {
      input.addEventListener("change", update);
    });

    updateSelectionStyles();
    update();
    bindVisibility(root);
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
        <h2 class="pdf-builder__title">Build the exact PDF you want</h2>
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
