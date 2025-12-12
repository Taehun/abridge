// Make card-like containers clickable without using inline onclick handlers.
// Uses event delegation so it keeps working after SPA navigation replaces <main>.
// - Click anywhere on the card navigates to data-href
// - Clicking links/buttons/inputs inside the card uses their native behavior
// - Keyboard: Enter/Space navigates when the card is focused

(function () {
  "use strict";

  function is_modified_click(event) {
    return (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (typeof event.button === "number" && event.button !== 0)
    );
  }

  function should_ignore_target(target) {
    if (!target || typeof target.closest !== "function") return false;
    return Boolean(
      target.closest(
        "a, button, input, textarea, select, option, label, summary, details",
      ),
    );
  }

  function navigate_to_card_href(card) {
    var href = card.getAttribute("data-href");
    if (!href) return;
    window.location.assign(href);
  }

  document.addEventListener("click", function (event) {
    var card = event.target?.closest?.(".js-clickable-card[data-href]");
    if (!card) return;
    if (is_modified_click(event)) return;
    if (should_ignore_target(event.target)) return;
    navigate_to_card_href(card);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    var card = event.target?.closest?.(".js-clickable-card[data-href]");
    if (!card) return;
    if (should_ignore_target(event.target)) return;
    event.preventDefault();
    navigate_to_card_href(card);
  });
})();


