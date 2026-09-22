/* =====================================================
   ТехРемонт — появление блоков при прокрутке
   Прогрессивное улучшение: если .reveal не активирован,
   содержимое видно полностью.
   ===================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (prefersReduced.matches || !("IntersectionObserver" in window)) return;

  var CARD_SELECTOR = [
    ".card",
    ".media-card",
    ".step",
    ".catalog-card",
    ".accordion__item",
  ].join(", ");

  var BLOCK_SELECTOR = [
    ".section__head",
    ".split__content",
    ".split__media",
    ".table-wrap",
    ".form-card",
    ".cta > .container",
    ".request__inner",
    ".hero__content",
    ".hero__media",
    ".page-hero > .container",
    ".map-card",
    ".notice",
  ].join(", ");

  var SELECTOR = CARD_SELECTOR + ", " + BLOCK_SELECTOR;

  root.setAttribute("data-reveal", "on");

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target);
        window.setTimeout(function () {
          entry.target.style.transitionDelay = "";
        }, 900);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  /**
   * Страховка: что бы ни случилось с наблюдателем (печать, скриншот всей
   * страницы, старый браузер), через пару секунд содержимое показывается.
   * Пустых участков на странице быть не должно.
   */
  function revealEverything() {
    document
      .querySelectorAll(".reveal:not(.reveal--visible)")
      .forEach(function (element) {
        element.classList.add("reveal--visible");
      });
  }

  window.setTimeout(revealEverything, 1200);
  window.addEventListener("load", revealEverything);
  window.addEventListener("beforeprint", revealEverything);

  function register(scope) {
    var host = scope || document;

    host.querySelectorAll(CARD_SELECTOR).forEach(function (card) {
      var parent = card.parentElement;
      if (!parent) return;

      var siblings = Array.prototype.slice.call(
        parent.querySelectorAll(CARD_SELECTOR),
      );
      var index = siblings.indexOf(card);
      if (index > 0)
        card.style.transitionDelay = Math.min(index * 70, 280) + "ms";
    });

    host.querySelectorAll(SELECTOR).forEach(function (element) {
      if (element.classList.contains("reveal")) {
        if (!element.classList.contains("reveal--visible"))
          observer.observe(element);
        return;
      }
      element.classList.add("reveal");
      observer.observe(element);
    });
  }

  register(document);

  /* Каталог после фильтрации показывает скрытые карточки — их тоже анимируем */
  window.techremontReveal = { register: register };
})();
