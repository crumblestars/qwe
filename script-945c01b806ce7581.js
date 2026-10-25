
/* Digital Concepts — Interaktionen
   Kein Framework, keine externen Abhängigkeiten. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* --- Jahr im Footer --------------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* --- Navigation: kompakter beim Scrollen ------------------------------ */
  var nav = $(".nav");
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle("is-stuck", window.scrollY > 24);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobiles Menü ----------------------------------------------------- */
  var burger = $(".burger");
  var menu = $(".menu");
  if (burger && menu) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      if (open) {
        $$(".menu-list a", menu).forEach(function (a, i) {
          a.style.animationDelay = (60 + i * 45) + "ms";
        });
        var first = $(".menu-list a", menu);
        if (first) first.focus({ preventScroll: true });
      } else {
        burger.focus({ preventScroll: true });
      }
    };
    burger.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000 && document.body.classList.contains("menu-open")) setMenu(false);
    });
  }

  /* --- Sprachumschalter ------------------------------------------------- */
  var lang = $(".lang");
  if (lang) {
    var langBtn = $(".lang-btn", lang);
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = lang.classList.toggle("is-open");
      langBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function () {
      lang.classList.remove("is-open");
      langBtn.setAttribute("aria-expanded", "false");
    });
  }

  /* --- Reveals beim Scrollen ------------------------------------------- */
  var revealables = $$(".r");
  if (revealables.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* --- Hero-Mockup: sehr dezente Parallaxe ------------------------------ */
  var stage = $("[data-parallax]");
  if (stage && !reduce && window.matchMedia("(min-width: 900px)").matches) {
    var raf = false;
    var move = function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        var rect = stage.getBoundingClientRect();
        var p = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1);
        var mock = $(".mock", stage);
        var phone = $(".mock-phone", stage);
        if (mock) mock.style.transform = "translateY(" + (-14 * p).toFixed(2) + "px)";
        if (phone) phone.style.transform = "translateY(" + (22 * p).toFixed(2) + "px)";
        raf = false;
      });
    };
    window.addEventListener("scroll", move, { passive: true });
    move();
  }

  /* --- Leistungs-Index: Vorschau wechseln ------------------------------- */
  var svcRows = $$("[data-svc]");
  if (svcRows.length) {
    var setSvc = function (key) {
      svcRows.forEach(function (r) { r.classList.toggle("is-active", r.dataset.svc === key); });
      $$("[data-svc-preview]").forEach(function (p) {
        var on = p.dataset.svcPreview === key;
        p.hidden = !on;
      });
    };
    svcRows.forEach(function (row) {
      row.addEventListener("mouseenter", function () { setSvc(row.dataset.svc); });
      row.addEventListener("focus", function () { setSvc(row.dataset.svc); });
    });
    setSvc(svcRows[0].dataset.svc);
  }

  /* --- Vorher / Nachher-Vergleich --------------------------------------- */
  var ba = $("[data-compare]");
  if (ba) {
    var after = $(".ba-after", ba);
    var handle = $(".ba-handle", ba);
    var value = 50;

    var sync = function () {
      after.style.width = value + "%";
      handle.style.left = value + "%";
      handle.setAttribute("aria-valuenow", Math.round(value));
    };
    var sizePanes = function () {
      ba.style.setProperty("--ba-w", ba.clientWidth + "px");
    };
    var setFromX = function (clientX) {
      var rect = ba.getBoundingClientRect();
      value = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98);
      sync();
    };

    var dragging = false;
    var down = function (e) {
      dragging = true;
      ba.setPointerCapture && e.pointerId != null && handle.setPointerCapture(e.pointerId);
      setFromX(e.clientX);
    };
    handle.addEventListener("pointerdown", down);
    ba.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".ba-handle")) return;
      setFromX(e.clientX);
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      e.preventDefault();
      setFromX(e.clientX);
    });
    window.addEventListener("pointerup", function () { dragging = false; });

    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft") { value = Math.max(2, value - step); sync(); e.preventDefault(); }
      if (e.key === "ArrowRight") { value = Math.min(98, value + step); sync(); e.preventDefault(); }
      if (e.key === "Home") { value = 2; sync(); e.preventDefault(); }
      if (e.key === "End") { value = 98; sync(); e.preventDefault(); }
    });

    window.addEventListener("resize", sizePanes);
    sizePanes();
    sync();
  }

  /* --- FAQ / Akkordeon --------------------------------------------------- */
  $$(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* --- Kontaktformular --------------------------------------------------- */
  var form = $("[data-form]");
  if (form) {
    var ENDPOINT = form.getAttribute("action");
    var MAILTO = "info@digital-concepts.ch";

    var status = $(".form-status", form);
    var success = $("[data-success]");

    var showError = function (field, on) {
      var wrap = field.closest(".field") || field.closest(".consent");
      if (wrap) wrap.classList.toggle("has-error", on);
    };

    var validate = function () {
      var ok = true;
      $$("[required]", form).forEach(function (el) {
        var valid = el.type === "checkbox" ? el.checked : el.value.trim() !== "" && el.checkValidity();
        showError(el, !valid);
        if (!valid && ok) { ok = false; el.focus({ preventScroll: false }); }
      });
      return ok;
    };

    $$("[required]", form).forEach(function (el) {
      el.addEventListener("input", function () { showError(el, false); });
      el.addEventListener("change", function () { showError(el, false); });
    });

    var finish = function () {
      form.hidden = true;
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus({ preventScroll: false });
      }
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        if (status) status.textContent = window.dcMessage("required");
        return;
      }
      if (form.dataset.sending === "true") return;
      var data = new FormData(form);
      var dial = $("#contact-country-code", form), phone = $("#contact-phone", form);
      if (phone && phone.value.trim()) data.set("Telefonnummer vollständig", phone.value.trim().startsWith("+") ? phone.value.trim() : dial.value + " " + phone.value.trim());
      data.set("Sprache", document.documentElement.lang);

      if (!ENDPOINT) {
        var lines = [];
        data.forEach(function (v, k) { if (k !== "consent") lines.push(k + ": " + v); });
        window.location.href = "mailto:" + MAILTO +
          "?subject=" + encodeURIComponent("Projektanfrage über digital-concepts.ch") +
          "&body=" + encodeURIComponent(lines.join("\n"));
        finish();
        return;
      }

      form.dataset.sending = "true";
      var submitButton = $("button[type=submit]", form);
      submitButton.disabled = true;
      if (status) status.textContent = window.dcMessage("sending");
      var requestController = new AbortController();
      var requestTimeout = setTimeout(function () { requestController.abort(); }, 15000);
      fetch(ENDPOINT, { signal: requestController.signal, method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json().then(function (result) {
            if (result.success !== true && result.success !== "true") throw new Error("Submission rejected");
            if (status) status.textContent = "";
            finish();
          });
        })
        .catch(function () {
          if (status) {
            status.textContent = window.dcMessage("error") + " " + MAILTO + ".";
          }
        }).finally(function () {
          clearTimeout(requestTimeout);
          form.dataset.sending = "false";
          submitButton.disabled = false;
        });
    });
  }
})();

