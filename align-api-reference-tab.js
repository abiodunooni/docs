/*
 * Pushes the API Reference tab to the far right of the tab bar, separating it
 * from the product tabs.
 *
 * Done in JS rather than CSS because the tab bar's structure is not fixed:
 * `.nav-tabs-item` may be the anchor itself or a wrapper, and the container is
 * not reliably a flex row. This resolves the real structure at runtime, so it
 * keeps working if either changes.
 */

(function () {
  "use strict";

  var TAB_PATH = "/api-reference";
  var MIN_WIDTH = 768; // below this the tab bar scrolls, so leave it alone
  var lastTarget = null;

  function hrefOf(el) {
    var href = el.getAttribute("href");
    if (!href) {
      var anchor = el.querySelector("a[href]");
      href = anchor && anchor.getAttribute("href");
    }
    return href || "";
  }

  function isApiReferenceTab(el) {
    var href = hrefOf(el).split("?")[0].split("#")[0];
    return href === TAB_PATH || href.indexOf(TAB_PATH + "/") === 0;
  }

  function align() {
    var tabs = document.querySelectorAll(".nav-tabs-item");
    if (tabs.length < 2) return;

    var target = null;
    for (var i = 0; i < tabs.length; i++) {
      if (isApiReferenceTab(tabs[i])) {
        target = tabs[i];
        break;
      }
    }
    if (!target) return;

    // Walk up until we find the element that holds every tab.
    var container = target.parentElement;
    while (
      container &&
      container.querySelectorAll(".nav-tabs-item").length < tabs.length
    ) {
      container = container.parentElement;
    }
    if (!container) return;

    // The margin belongs on whichever ancestor is a direct child of that
    // container, which is not necessarily the .nav-tabs-item itself.
    var row = target;
    while (row.parentElement && row.parentElement !== container) {
      row = row.parentElement;
    }
    if (row.parentElement !== container) return;

    if (window.innerWidth < MIN_WIDTH) {
      row.style.marginLeft = "";
      lastTarget = null;
      return;
    }

    // margin-left: auto only pushes within a flex or grid row.
    var display = window.getComputedStyle(container).display;
    if (display.indexOf("flex") === -1 && display.indexOf("grid") === -1) {
      container.style.display = "flex";
      container.style.alignItems = "center";
    }

    if (row.style.marginLeft !== "auto") {
      row.style.marginLeft = "auto";
    }
    lastTarget = row;
  }

  var pending = false;

  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      align();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  window.addEventListener("resize", schedule);

  // The docs are a single-page app, so the tab bar is re-rendered on
  // navigation. Re-apply whenever it is replaced.
  var observer = new MutationObserver(function () {
    if (!lastTarget || !lastTarget.isConnected) schedule();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
