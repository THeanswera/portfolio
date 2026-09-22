/* =====================================================
   ТехРемонт — фильтр каталога услуг
   Работает без перезагрузки: показывает карточки выбранной
   категории и обновляет счётчик. Без JS видны все услуги.
   ===================================================== */
(function () {
  "use strict";

  var catalog = document.querySelector("[data-catalog]");
  if (!catalog) return;

  var buttons = Array.prototype.slice.call(
    catalog.querySelectorAll("[data-filter]"),
  );
  var cards = Array.prototype.slice.call(
    catalog.querySelectorAll("[data-category]"),
  );
  var counter = catalog.querySelector("[data-catalog-count]");
  var empty = catalog.querySelector("[data-catalog-empty]");
  var filtersBox = catalog.querySelector(".filters");

  if (!buttons.length || !cards.length) return;

  var categories = cards.map(function (card) {
    return card.getAttribute("data-category");
  });

  /* Счётчики в кнопках фильтров */
  buttons.forEach(function (button) {
    var value = button.getAttribute("data-filter");
    var badge = button.querySelector("[data-filter-count]");
    if (!badge) return;
    var count =
      value === "all"
        ? cards.length
        : categories.filter(function (category) {
            return category === value;
          }).length;
    badge.textContent = count;
  });

  function apply(value) {
    var shown = 0;
    var revealed = [];

    cards.forEach(function (card) {
      var match =
        value === "all" || card.getAttribute("data-category") === value;
      card.hidden = !match;
      if (match) {
        shown += 1;
        revealed.push(card);
      }
    });

    if (counter) {
      counter.textContent =
        "Показано " + shown + " из " + cards.length + " услуг";
    }

    if (empty) empty.hidden = shown !== 0;

    /* Новые карточки тоже получают анимацию появления */
    var needAnimation = revealed.filter(function (card) {
      return !card.classList.contains("reveal--visible");
    });
    if (needAnimation.length && window.techremontReveal) {
      window.techremontReveal.register(catalog);
    }
  }

  function select(button) {
    buttons.forEach(function (other) {
      other.setAttribute("aria-pressed", other === button ? "true" : "false");
    });
    apply(button.getAttribute("data-filter"));
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      select(button);
    });
  });

  /* Управление стрелками внутри группы фильтров */
  if (filtersBox) {
    filtersBox.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      var index = buttons.indexOf(document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      var next = event.key === "ArrowRight" ? index + 1 : index - 1;
      if (next < 0) next = buttons.length - 1;
      if (next >= buttons.length) next = 0;
      buttons[next].focus();
      select(buttons[next]);
    });
  }

  var initial =
    buttons.filter(function (button) {
      return button.getAttribute("aria-pressed") === "true";
    })[0] || buttons[0];

  select(initial);
})();
