function clearHomepageTabHighlight() {
  const isHomepage =
    document.documentElement.getAttribute("data-current-path") === "/";

  if (!isHomepage) {
    return;
  }

  document
    .querySelectorAll(
      ".nav-tabs-item[data-active], mobile-nav-tabs-item[data-active]"
    )
    .forEach((tab) => {
      tab.removeAttribute("data-active");
    });
}

clearHomepageTabHighlight();

const observer = new MutationObserver(clearHomepageTabHighlight);

observer.observe(document.documentElement, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ["data-active", "data-current-path"]
});
