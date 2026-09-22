/* =====================================================
   ТехРемонт — формы заявок.
   Клиентская валидация, понятные состояния ошибок и сообщение
   после успешной отправки.
   ===================================================== */
(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/;
  var NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]*$/;
  var DIGITS_RE = /\D/g;

  /* ---------- Утилиты ---------- */

  function digits(value) {
    return String(value).replace(DIGITS_RE, "");
  }

  function isPhoneValid(value) {
    var d = digits(value);
    if (d.length === 11) return /^[78]/.test(d);
    if (d.length === 10) return /^[9]/.test(d);
    return false;
  }

  /**
   * Приводит ввод к виду +7 (999) 123-45-67.
   * Маска не «съедает» уже введённый номер: если цифр больше,
   * чем допускает формат, значение остаётся в наборе пользователя.
   */
  function formatPhone(value) {
    var d = digits(value);
    if (!d) return "";

    if (d[0] === "8") d = "7" + d.slice(1);
    if (d.length === 11 && d[0] !== "7") return value;
    if (d.length > 11) return value;
    if (d[0] !== "7") d = "7" + d;

    var out = "+7";
    if (d.length > 1) out += " (" + d.slice(1, 4);
    if (d.length >= 5) out += ") " + d.slice(4, 7);
    if (d.length >= 8) out += "-" + d.slice(7, 9);
    if (d.length >= 10) out += "-" + d.slice(9, 11);
    return out;
  }

  function fieldOf(input) {
    return input.closest(".form__field") || input.closest(".form__consent");
  }

  /* ---------- Проверки полей ---------- */

  function checkField(input) {
    var value = (input.value || "").trim();
    var required = input.hasAttribute("required");

    if (input.type === "checkbox") {
      if (required && !input.checked) {
        return "Без согласия на обработку данных мы не можем принять заявку.";
      }
      return "";
    }

    if (!value) {
      return required ? "Заполните это поле." : "";
    }

    if (input.type === "tel" || input.name === "phone") {
      if (!isPhoneValid(value)) {
        return "Укажите телефон в формате +7 (999) 123-45-67.";
      }
    }

    if (input.name === "name" || input.name === "contact") {
      if (value.length < 2) {
        return "Слишком короткое значение — минимум 2 символа.";
      }
      if (input.name === "name" && !NAME_RE.test(value)) {
        return "Имя может содержать только буквы, пробел и дефис.";
      }
    }

    if (input.type === "email" && !EMAIL_RE.test(value)) {
      return "Проверьте адрес электронной почты.";
    }

    return "";
  }

  function setState(input, message) {
    var wrap = fieldOf(input);
    if (!wrap) return;

    var errorNode = wrap.querySelector(".form__error");
    var isCheckbox = input.type === "checkbox";
    var hasValue = isCheckbox
      ? input.checked
      : Boolean((input.value || "").trim());

    wrap.classList.toggle("form__field--invalid", Boolean(message));
    wrap.classList.toggle("form__field--valid", !message && hasValue);

    input.setAttribute("aria-invalid", message ? "true" : "false");

    if (errorNode) {
      errorNode.textContent = message || "";
      errorNode.hidden = !message;
    }
  }

  /* ---------- Общая сводка ошибок ---------- */

  function clearSummary(form) {
    var box = form.querySelector(".form__status");
    if (box) {
      box.className = "form__status";
      box.innerHTML = "";
      box.setAttribute("hidden", "");
    }
  }

  function showSummary(form, title, text, modifier) {
    var box = form.querySelector(".form__status");
    if (!box) return;
    box.className =
      "form__status form__status--" + modifier + " form__status--visible";
    box.removeAttribute("hidden");
    box.setAttribute("role", modifier === "error" ? "alert" : "status");
    box.innerHTML =
      '<span class="form__status-icon" aria-hidden="true">' +
      (modifier === "success" ? "✓" : "!") +
      "</span>" +
      '<span><span class="form__status-title">' +
      title +
      "</span>" +
      text +
      "</span>";
  }

  /* ---------- Обработка формы ---------- */

  function initForm(form) {
    var fields = Array.prototype.slice
      .call(
        form.querySelectorAll('input:not([type="hidden"]), textarea, select'),
      )
      .filter(function (el) {
        return !el.disabled && el.type !== "submit" && el.type !== "button";
      });

    var submitBtn = form.querySelector('[type="submit"]');
    var summaryTitle =
      form.getAttribute("data-summary-title") || "Проверьте заполнение формы";

    /* Живая валидация */
    fields.forEach(function (input) {
      if (input.type === "checkbox") {
        input.addEventListener("change", function () {
          setState(input, input.checked ? "" : checkField(input));
        });
        return;
      }

      input.addEventListener("blur", function () {
        if (!input.value.trim() && !input.hasAttribute("required")) {
          setState(input, "");
          return;
        }
        setState(input, checkField(input));
      });

      input.addEventListener("input", function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.classList.contains("form__field--invalid")) {
          setState(input, checkField(input));
        }
      });
    });

    /* Маска телефона: аккуратно, не мешая удалению */
    var phone = form.querySelector('input[type="tel"]');
    if (phone) {
      phone.addEventListener("input", function () {
        var d = digits(phone.value);
        if (d.length > 11) d = d.slice(0, 11);
        if (d.length > 3) {
          phone.value = formatPhone(d);
        }
      });

      phone.addEventListener("focus", function () {
        if (!phone.value.trim()) phone.value = "+7 (";
      });

      phone.addEventListener("blur", function () {
        if (digits(phone.value).length <= 1) phone.value = "";
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearSummary(form);

      var firstInvalid = null;

      fields.forEach(function (input) {
        var message = checkField(input);
        setState(input, message);
        if (message && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        showSummary(
          form,
          summaryTitle + ". ",
          "Отмеченные поля нужно исправить — подсказка указана рядом с каждым из них.",
          "error",
        );
        firstInvalid.focus();
        if (typeof firstInvalid.scrollIntoView === "function") {
          firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        return;
      }
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      name = name.trim().split(/\s+/)[0] || "спасибо";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-disabled", "true");
      }

      showSummary(
        form,
        "Заявка заполнена верно, " + name + ". ",
        "Заявка принята. Мастер свяжется с вами в течение 15 минут, чтобы уточнить детали и время визита. " +
          'Срочный вопрос — <a href="tel:+78005553535">+7 (800) 555-35-35</a>.',
        "success",
      );

      form.reset();
      fields.forEach(function (input) {
        var wrap = fieldOf(input);
        if (wrap)
          wrap.classList.remove("form__field--valid", "form__field--invalid");
        input.setAttribute("aria-invalid", "false");
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-disabled");
      }

      var box = form.querySelector(".form__status");
      if (box && typeof box.focus === "function") {
        box.setAttribute("tabindex", "-1");
        box.focus();
      }
    });
  }

  function init() {
    document.querySelectorAll("form[data-demo-form]").forEach(initForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
