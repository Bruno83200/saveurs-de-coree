/* ==========================================================================
   Saveurs de Corée — site.js
   Aucune dépendance externe. 100 % compatible GitHub Pages.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1. Réglages du restaurant — un seul endroit à modifier
     --------------------------------------------------------------------- */
  var SITE = {
    name: "Saveurs de Corée",
    phone: "+33783334997",
    phoneDisplay: "07 83 33 49 97",
    orderUrl: "https://saveurs-de-coree.onataste.fr/menu/",
    instagram: "https://www.instagram.com/saveursdecoree/",
    // Horaires d'ouverture (0 = dimanche … 6 = samedi)
    hours: {
      0: [], // dimanche : fermé
      1: [[11 * 60, 14 * 60], [18 * 60, 21 * 60]],
      2: [[11 * 60, 14 * 60], [18 * 60, 21 * 60]],
      3: [[11 * 60, 14 * 60], [18 * 60, 21 * 60]],
      4: [[11 * 60, 14 * 60], [18 * 60, 21 * 60]],
      5: [[11 * 60, 14 * 60], [18 * 60, 21 * 60]],
      6: [[11 * 60, 14 * 60], [18 * 60, 21 * 60]]
    }
  };
  window.SDC = SITE;

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     2. Détection de l'appareil → html[data-layout="mobile"|"desktop"]
        Combine largeur d'écran, densité de pixels et type de pointeur.
     --------------------------------------------------------------------- */
  var wideQuery = window.matchMedia("(max-width: 900px)");
  var coarseQuery = window.matchMedia("(pointer: coarse)");
  var hoverQuery = window.matchMedia("(hover: none)");

  function detectLayout() {
    var w = window.innerWidth || root.clientWidth;
    if (w <= 900) return "mobile";
    // Tablette tactile en portrait : on garde la mise en page mobile
    if (coarseQuery.matches && hoverQuery.matches && w <= 1100) return "mobile";
    return "desktop";
  }

  function applyLayout(force) {
    var next = detectLayout();
    if (!force && root.dataset.layout === next) return;
    root.dataset.layout = next;
    // hauteur réelle de l'en-tête → variable CSS utile au défilement des ancres
    var header = document.querySelector(".site-header");
    if (header) {
      document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    }
    document.dispatchEvent(new CustomEvent("layoutchange", { detail: { layout: next } }));
  }

  applyLayout(true);

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { applyLayout(); }, 140);
  });
  window.addEventListener("orientationchange", function () {
    setTimeout(function () { applyLayout(); }, 220);
  });
  [wideQuery, coarseQuery, hoverQuery].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener("change", function () { applyLayout(); });
    else if (mq.addListener) mq.addListener(function () { applyLayout(); });
  });

  /* ---------------------------------------------------------------------
     3. Liens dynamiques (téléphone, commande, Instagram)
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-order]").forEach(function (el) {
    el.setAttribute("href", SITE.orderUrl);
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll("[data-tel]").forEach(function (el) {
    el.setAttribute("href", "tel:" + SITE.phone);
  });
  document.querySelectorAll("[data-instagram]").forEach(function (el) {
    el.setAttribute("href", SITE.instagram);
  });
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------------------
     4. En-tête : ombre au défilement
     --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     5. Tiroir de navigation (mobile)
     --------------------------------------------------------------------- */
  var drawer = document.querySelector("[data-drawer]");
  var openBtn = document.querySelector("[data-drawer-open]");
  var closeBtns = document.querySelectorAll("[data-drawer-close]");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.removeAttribute("aria-hidden");
    drawer.removeAttribute("hidden");
    document.body.classList.add("drawer-open");
    document.body.style.overflow = "hidden";
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    var first = drawer.querySelector("a, button");
    if (first) first.focus({ preventScroll: true });
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    document.body.style.overflow = "";
    if (openBtn) {
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.focus({ preventScroll: true });
    }
  }

  if (openBtn) openBtn.addEventListener("click", openDrawer);
  closeBtns.forEach(function (b) { b.addEventListener("click", closeDrawer); });
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeDrawer();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("drawer-open")) closeDrawer();
  });

  /* ---------------------------------------------------------------------
     6. Statut ouvert / fermé (heure de Paris) + jour courant
     --------------------------------------------------------------------- */
  function parisNow() {
    try {
      var fmt = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      var parts = fmt.formatToParts(new Date());
      var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
      var days = { dim: 0, lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6 };
      var wd = (get("weekday") || "").toLowerCase().slice(0, 3);
      return { day: days[wd], minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function openState() {
    var now = parisNow();
    var today = SITE.hours[now.day] || [];
    for (var i = 0; i < today.length; i++) {
      if (now.minutes >= today[i][0] && now.minutes < today[i][1]) {
        return { open: true, until: today[i][1] };
      }
    }
    // prochaine ouverture ?
    for (var d = 0; d < 8; d++) {
      var day = (now.day + d) % 7;
      var slots = SITE.hours[day] || [];
      for (var j = 0; j < slots.length; j++) {
        var start = slots[j][0];
        if (d === 0 && start <= now.minutes) continue;
        return { open: false, nextDay: d, nextStart: start };
      }
    }
    return { open: false };
  }

  function hhmm(mins) {
    return String(Math.floor(mins / 60)).padStart(2, "0") + "h" + String(mins % 60).padStart(2, "0");
  }

  var statusEls = document.querySelectorAll("[data-status]");
  if (statusEls.length) {
    var state = openState();
    statusEls.forEach(function (el) {
      el.dataset.state = state.open ? "open" : "closed";
      if (state.open) {
        el.textContent = "Ouvert · jusqu'à " + hhmm(state.until);
      } else if (typeof state.nextDay === "number") {
        var label = state.nextDay === 0 ? "aujourd'hui" : state.nextDay === 1 ? "demain" : "cette semaine";
        el.textContent = "Fermé · ouvre " + label + " à " + hhmm(state.nextStart);
      } else {
        el.textContent = "Fermé";
      }
    });
  }

  // Surligne la ligne du jour dans les tableaux d'horaires
  var todayIdx = parisNow().day;
  document.querySelectorAll("[data-day]").forEach(function (row) {
    if (parseInt(row.dataset.day, 10) === todayIdx) row.classList.add("is-today");
  });

  /* ---------------------------------------------------------------------
     7. Carte : catégorie active au défilement + défilement doux
     --------------------------------------------------------------------- */
  var menuNav = document.querySelector("[data-menu-nav]");
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-menu-group]"));

  if (menuNav && groups.length) {
    var links = Array.prototype.slice.call(menuNav.querySelectorAll("a"));
    var setActive = function (id) {
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
      });
    };

    // Surlignage déterministe : dernière section dont le haut est passé sous la barre
    var headerEl = document.querySelector(".site-header");
    var spyLock = 0;

    function updateActive() {
      if (Date.now() < spyLock) return;
      var offset = (headerEl ? headerEl.offsetHeight : 0) + (menuNav.offsetHeight || 0) + 24;
      var current = groups[0].id;
      groups.forEach(function (g) {
        if (g.getBoundingClientRect().top - offset <= 0) current = g.id;
      });
      setActive(current);
    }

    var raf = null;
    window.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; updateActive(); });
    }, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        setActive(id);
        spyLock = Date.now() + 900;
        var offset = (document.querySelector(".site-header") || {}).offsetHeight || 0;
        var navH = menuNav.offsetHeight || 0;
        var top = target.getBoundingClientRect().top + window.scrollY - offset - navH + 12;
        window.scrollTo({ top: top, behavior: reducedMotion ? "auto" : "smooth" });
        history.replaceState(null, "", "#" + id);
        // recentre le bouton actif dans la barre
        a.parentElement.scrollTo({
          left: a.offsetLeft - a.parentElement.clientWidth / 2 + a.offsetWidth / 2,
          behavior: reducedMotion ? "auto" : "smooth"
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     8. Apparition au défilement
     --------------------------------------------------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealNow(el) {
    el.classList.add("is-visible");
  }

  if (reveals.length && !reducedMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          revealNow(en.target);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -2% 0px", threshold: 0.01 });
    reveals.forEach(function (el) { io.observe(el); });

    // Ce qui est déjà à l'écran au chargement s'affiche tout de suite
    var firstPaint = function () {
      var limit = window.innerHeight * 0.99;
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < limit) revealNow(el);
      });
    };
    firstPaint();
    window.addEventListener("load", firstPaint);
    setTimeout(firstPaint, 260);
  } else {
    reveals.forEach(revealNow);
  }

  /* ---------------------------------------------------------------------
     9. Petites retouches : année, hauteur d'en-tête après chargement
     --------------------------------------------------------------------- */
  window.addEventListener("load", function () { applyLayout(); });
})();
