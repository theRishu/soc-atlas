(function () {
  function resetTheme() {
    try {
      localStorage.removeItem("__palette");
    } catch {
      // Ignore storage issues.
    }

    document.body.removeAttribute("data-md-color-scheme");
    document.body.removeAttribute("data-md-color-primary");
    document.body.removeAttribute("data-md-color-accent");
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(resetTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resetTheme, { once: true });
  } else {
    resetTheme();
  }
})();
