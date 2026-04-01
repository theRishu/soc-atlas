(function () {
  const ROOT_SELECTOR = "[data-pdf-builder]";
  const STORAGE_KEY = "socatlas-pdf-sections";
  const MODE_STORAGE_KEY = "socatlas-pdf-mode";
  const IMAGE_STORAGE_KEY = "socatlas-pdf-images";
  const ROOT_HASH = "#pdf-builder";
  const RECOMMENDED_PRESET_ID = "interview-core";
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

  function getDefaultSelection(sections) {
    const preset = PRESETS.find((item) => item.id === RECOMMENDED_PRESET_ID);
    if (!preset) {
      return sections.map((section) => section.slug);
    }

    const defaults = resolvePresetSlugs(sections, preset);
    return defaults.length ? defaults : sections.map((section) => section.slug);
  }

  function readSavedSelection(sections) {
    try {
      const fallback = getDefaultSelection(sections);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return fallback;
      }

      const saved = JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.length) {
        return fallback;
      }

      const valid = new Set(sections.map((section) => section.slug));
      const selected = saved.filter((slug) => valid.has(slug));
      return selected.length ? selected : fallback;
    } catch {
      return getDefaultSelection(sections);
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

  function readSavedImages() {
    try {
      return localStorage.getItem(IMAGE_STORAGE_KEY) !== "0";
    } catch {
      return true;
    }
  }

  function saveImages(includeImages) {
    try {
      localStorage.setItem(IMAGE_STORAGE_KEY, includeImages ? "1" : "0");
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
          ${preset.id === RECOMMENDED_PRESET_ID ? '<span class="pdf-builder__preset-badge">Recommended</span>' : ""}
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

  function setBuilderVisibility(root, open) {
    const wasHidden = root.hidden;
    root.hidden = !open;

    if (open && wasHidden) {
      requestAnimationFrame(() => {
        root.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
  }

  function closeBuilder(root) {
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    setBuilderVisibility(root, false);

    const trigger = document.querySelector('a[href="#pdf-builder"]');
    if (trigger) {
      trigger.focus();
      trigger.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function bindVisibility(root) {
    if (typeof root.__pdfBuilderCleanup === "function") {
      root.__pdfBuilderCleanup();
    }

    const sync = () => {
      setBuilderVisibility(root, window.location.hash === ROOT_HASH);
    };

    sync();
    window.addEventListener("hashchange", sync);
    root.__pdfBuilderCleanup = () => {
      window.removeEventListener("hashchange", sync);
      delete root.__pdfBuilderCleanup;
    };
  }

  function render(root, sections) {
    const selected = new Set(readSavedSelection(sections));
    const selectedMode = readSavedMode();
    const includeImages = readSavedImages();
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
        <div class="pdf-builder__header-main">
          <div>
            <p class="pdf-builder__eyebrow">Download PDF</p>
            <h2 class="pdf-builder__title">Build Your SOCAtlas PDF</h2>
            <p class="pdf-builder__intro">
              Interview Core is loaded first so most users can download fast. Change sections only if
              you want a more focused pack, then choose <strong>Color PDF</strong> or
              <strong>Paper-friendly</strong>.
            </p>
          </div>
          <button type="button" class="pdf-builder__close" data-pdf-close>Hide options</button>
        </div>
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

      <div class="pdf-builder__settings">
        <label class="pdf-builder__mode pdf-builder__mode--toggle">
          <input type="checkbox" data-pdf-images ${includeImages ? "checked" : ""}>
          <span class="pdf-builder__mode-title">Include images and diagrams</span>
          <span class="pdf-builder__mode-meta">Turn this off for a lighter text-first PDF that is faster to scan and print.</span>
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
          <div class="pdf-builder__stat">
            <span class="pdf-builder__stat-label">Images</span>
            <strong class="pdf-builder__stat-value" data-pdf-images-label>Included</strong>
          </div>
        </div>
        <p class="pdf-builder__summary" data-pdf-summary></p>
        <div class="pdf-builder__next" data-pdf-next></div>
        <div class="pdf-builder__badges" data-pdf-selection></div>
      </div>

      <div class="pdf-builder__section-header">
        <div>
          <p class="pdf-builder__section-eyebrow">Custom Sections</p>
          <h3 class="pdf-builder__section-title">Choose What To Include</h3>
        </div>
        <label class="pdf-builder__filter">
          <span class="pdf-builder__filter-label">Find a section</span>
          <input type="search" placeholder="Filter sections like networking, alerts, or quick points" data-pdf-filter>
        </label>
      </div>

      <div class="pdf-builder__grid">
        ${options}
      </div>
      <p class="pdf-builder__filter-empty" data-pdf-filter-empty hidden>No matching sections for that filter yet.</p>

      <div class="pdf-builder__actions">
        <div class="pdf-builder__actions-main">
          <a class="md-button pdf-builder__action" href="complete-guide.html" target="_blank" rel="noopener" data-pdf-preview>
            Preview selection
          </a>
          <a class="md-button md-button--primary pdf-builder__action" href="complete-guide.html?download=1" target="_blank" rel="noopener" data-pdf-download>
            Open Save as PDF
          </a>
        </div>
        <div class="pdf-builder__actions-secondary">
          <button type="button" class="pdf-builder__utility" data-pdf-select-all>Select all</button>
          <button type="button" class="pdf-builder__utility" data-pdf-clear-all>Clear all</button>
          <button type="button" class="pdf-builder__utility" data-pdf-copy>Copy preview link</button>
        </div>
      </div>

      <p class="pdf-builder__hint">Tip: keep <strong>Background graphics</strong> on for Color PDF, and turn it off in Chrome for the cleanest Paper-friendly export.</p>
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
    const imagesLabelNode = root.querySelector("[data-pdf-images-label]");
    const nextNode = root.querySelector("[data-pdf-next]");
    const empty = root.querySelector("[data-pdf-empty]");
    const preview = root.querySelector("[data-pdf-preview]");
    const download = root.querySelector("[data-pdf-download]");
    const copyButton = root.querySelector("[data-pdf-copy]");
    const imagesToggle = root.querySelector("[data-pdf-images]");
    const filterInput = root.querySelector("[data-pdf-filter]");
    const filterEmpty = root.querySelector("[data-pdf-filter-empty]");
    const previewBase = preview.getAttribute("href") || "complete-guide.html";
    const copyButtonLabel = "Copy preview link";
    const closeButton = root.querySelector("[data-pdf-close]");

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

    const applyFilter = () => {
      const term = (filterInput.value || "").trim().toLowerCase();
      let visibleCount = 0;

      checkboxes.forEach((checkbox) => {
        const option = checkbox.closest(".pdf-builder__option");
        if (!option) {
          return;
        }

        const matches = !term || option.textContent.toLowerCase().includes(term);
        option.hidden = !matches;
        if (matches) {
          visibleCount += 1;
        }
      });

      filterEmpty.hidden = visibleCount !== 0;
    };

    const update = () => {
      const selectedValues = checkboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      const mode = modes.find((input) => input.checked)?.value || "color";
      const images = imagesToggle.checked;
      const selectedSet = new Set(selectedValues);
      const selectedSections = sections.filter((section) => selectedSet.has(section.slug));
      const topicCount = selectedSections.reduce((sum, section) => sum + section.count, 0);
      const params = new URLSearchParams();
      const currentModeLabel = mode === "paper" ? "Paper-friendly" : "Color PDF";
      const imagesLabel = images ? "with images" : "text only";

      if (selectedValues.length) {
        params.set("sections", selectedValues.join(","));
      }

      params.set("mode", mode);

      if (!images) {
        params.set("images", "0");
      }

      preview.href = `${previewBase}?${params.toString()}`;

      params.set("download", "1");
      download.href = `${previewBase}?${params.toString()}`;

      sectionCount.textContent = String(selectedValues.length);
      topicCountNode.textContent = String(topicCount);
      modeLabel.textContent = currentModeLabel;
      imagesLabelNode.textContent = images ? "Included" : "Text only";

      summary.textContent = selectedValues.length
        ? `${pluralize(selectedValues.length, "section", "sections")} selected for a ${currentModeLabel.toLowerCase()} export, ${imagesLabel}.`
        : "No sections selected yet.";

      nextNode.textContent = mode === "paper"
        ? "Next: Chrome opens print preview. Choose Save as PDF and turn Background graphics off for the cleanest printer-friendly export."
        : "Next: Chrome opens print preview. Choose Save as PDF and keep Background graphics on for the best-looking color export.";

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
      applyFilter();
      saveSelection(selectedValues);
      saveMode(mode);
      saveImages(images);
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

    closeButton.addEventListener("click", () => {
      closeBuilder(root);
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

    imagesToggle.addEventListener("change", update);
    filterInput.addEventListener("input", applyFilter);

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
        <p class="pdf-builder__eyebrow">Download PDF</p>
        <h2 class="pdf-builder__title">Build your SOCAtlas PDF</h2>
        <p class="pdf-builder__empty">The PDF options could not load right now. Refresh the page and try again.</p>
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
