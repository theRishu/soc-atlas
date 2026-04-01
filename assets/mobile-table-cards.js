(function () {
  const TABLE_SELECTOR = ".md-typeset table:not([class])";

  function getHeaders(table) {
    return Array.from(table.querySelectorAll("thead th")).map((cell) =>
      cell.textContent.trim()
    );
  }

  function detectKind(headers) {
    if (
      headers.length === 3 &&
      /point|concept/i.test(headers[0]) &&
      /interview/i.test(headers[1]) &&
      /example|tool|reference/i.test(headers[2])
    ) {
      return "quick";
    }

    return "standard";
  }

  function enhanceTable(table) {
    if (table.dataset.mobileCardsReady === "true") {
      return;
    }

    const headers = getHeaders(table);
    if (!headers.length) {
      return;
    }

    table.dataset.mobileCards = "true";
    table.dataset.tableKind = detectKind(headers);

    Array.from(table.querySelectorAll("tbody tr")).forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (!cell.dataset.label) {
          cell.dataset.label = headers[index] || "Details";
        }
      });
    });

    table.dataset.mobileCardsReady = "true";
  }

  function init(root) {
    root.querySelectorAll(TABLE_SELECTOR).forEach(enhanceTable);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(() => init(document));
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(document));
  } else {
    init(document);
  }
})();
