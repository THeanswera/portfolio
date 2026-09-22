/* =====================================================
   ТехРемонт — шапка, мобильное меню, аккордеоны
   ===================================================== */
(function () {
  "use strict";

  var header = document.querySelector(".header");
  var burger = document.querySelector(".burger");
  var mobileMenu = document.querySelector(".mobile-menu");
  var DESKTOP = window.matchMedia("(min-width: 861px)");

  /* ---------- Тень шапки при прокрутке ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("header--scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Мобильное меню ---------- */
  if (burger && mobileMenu) {
    var setInert = function (state) {
      if ("inert" in HTMLElement.prototype) {
        mobileMenu.inert = state;
      }
    };

    var closeMenu = function (returnFocus) {
      mobileMenu.classList.remove("mobile-menu--open");
      burger.classList.remove("burger--open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
      document.body.classList.remove("no-scroll");
      setInert(true);
      if (returnFocus) burger.focus();
    };

    var openMenu = function () {
      mobileMenu.classList.add("mobile-menu--open");
      burger.classList.add("burger--open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Закрыть меню");
      document.body.classList.add("no-scroll");
      setInert(false);
      var first = mobileMenu.querySelector("a, button");
      if (first) first.focus();
    };

    setInert(true);

    burger.addEventListener("click", function () {
      if (mobileMenu.classList.contains("mobile-menu--open")) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        mobileMenu.classList.contains("mobile-menu--open")
      ) {
        closeMenu(true);
      }
    });

    /* Фокус не должен «уезжать» за пределы открытого меню */
    mobileMenu.addEventListener("keydown", function (event) {
      if (
        event.key !== "Tab" ||
        !mobileMenu.classList.contains("mobile-menu--open")
      )
        return;
      var focusable = mobileMenu.querySelectorAll(
        "a[href], button:not([disabled])",
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var onBreakpoint = function (event) {
      if (event.matches) closeMenu(false);
    };
    if (typeof DESKTOP.addEventListener === "function") {
      DESKTOP.addEventListener("change", onBreakpoint);
    } else if (typeof DESKTOP.addListener === "function") {
      DESKTOP.addListener(onBreakpoint);
    }
  }

  /* ---------- Плавная прокрутка к якорям с учётом шапки ---------- */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var href = anchor.getAttribute("href") || "";
      var hashAt = href.indexOf("#");
      if (hashAt === -1) return;

      var id = href.slice(hashAt + 1);
      if (!id) return;

      var target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      /* Отступ = высота фиксированной шапки вместе с плашкой демо-режима */
      var headerBlock = document.querySelector(".header");
      var offset = (headerBlock ? headerBlock.getBoundingClientRect().height : 110) + 16;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: top < 0 ? 0 : top,
        behavior: prefersReduced.matches ? "auto" : "smooth",
      });

      if (history.replaceState) history.replaceState(null, "", "#" + id);

      /* Фокус переносим к цели — важно для клавиатуры и скринридеров */
      if (!target.hasAttribute("tabindex"))
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Предвыбор направления из ссылки каталога ---------- */
  var select = document.querySelector(
    'form[data-demo-form] select[name="service"]',
  );
  if (select && window.location.search) {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("service");
    if (wanted) {
      var hasOption = Array.prototype.some.call(
        select.options,
        function (option) {
          return option.value === wanted;
        },
      );
      if (hasOption) select.value = wanted;
    }
  }

  /* ---------- Аккордеон: только один открытый блок ---------- */
  document.querySelectorAll("[data-accordion]").forEach(function (group) {
    var items = group.querySelectorAll("details");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* ---------- Ссылки-заглушки (соцсети демо-макета) ----------
     Никакой навигации: у макета нет реальных аккаунтов. */
  document.querySelectorAll("[data-placeholder-link]").forEach(function (link) {
    link.setAttribute("aria-disabled", "true");
    link.setAttribute(
      "title",
      "Ссылка откроется в новой вкладке",
    );
    link.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });
})();
