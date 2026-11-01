/* Rex's Rooter Plumbing — vanilla JS widgets (no dependencies) */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  // Real business number from the current site. Texting uses the same number until the client confirms a text-capable line.
  var PHONE = "+18059292278";
  var isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  function smsLink(body) {
    // iOS uses "&body=", Android uses "?body="
    return "sms:" + PHONE + (isApple ? "&" : "?") + "body=" + encodeURIComponent(body);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    function setNav(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    }
    toggle.addEventListener("click", function () { setNav(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setNav(false); toggle.focus(); }
    });
  }

  /* ---------- Text links (generic) ---------- */
  document.querySelectorAll("[data-sms]").forEach(function (a) {
    a.setAttribute("href", smsLink(a.getAttribute("data-sms") || "Hi Rex's Rooter, I need help with a plumbing issue."));
  });

  /* ---------- Problem picker ---------- */
  document.querySelectorAll("[data-issue]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var issue = btn.getAttribute("data-issue");
      var msg = issue === "other"
        ? "Hi Rex's Rooter, I have a plumbing problem: "
        : "Hi Rex's Rooter, I need help with a " + issue + ". My address/city is: ";
      window.location.href = smsLink(msg);
    });
  });

  /* ---------- 24/7 status badge ---------- */
  // The current site advertises 24/7 emergency service and lists no regular hours.
  // If the client supplies office hours, fill HOURS (0 = Sunday) and the badge switches to live Open/Closed.
  var HOURS = null; // e.g. {1:[8,17],2:[8,17],3:[8,17],4:[8,17],5:[8,17]}
  document.querySelectorAll("[data-status]").forEach(function (el) {
    var label = el.querySelector(".label");
    if (!HOURS) { label.textContent = "24/7 Emergency Service"; return; }
    var now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    var h = HOURS[now.getDay()], t = now.getHours() + now.getMinutes() / 60;
    label.textContent = h && t >= h[0] && t < h[1] ? "Open Now" : "Office Closed · Emergency line 24/7";
  });

  /* ---------- Service area checker ---------- */
  var form = document.getElementById("area-form");
  if (form) {
    // Cities named on the current site
    var NAMED = ["paso robles", "atascadero", "nipomo", "arroyo grande", "templeton"];
    // The site says "Serving all of San Luis Obispo County" and the trucks add SB County: other communities & ZIP codes
    var COUNTY = ["san luis obispo", "slo", "grover beach", "pismo beach", "shell beach", "oceano", "avila beach", "morro bay",
      "los osos", "baywood park", "cayucos", "cambria", "harmony", "san simeon", "santa margarita", "creston", "shandon",
      "san miguel", "halcyon", "callender", "california valley", "cholame", "edna",
      // Santa Barbara County (vehicles read "SLO County / SB County")
      "santa maria", "orcutt", "guadalupe", "lompoc", "vandenberg", "los alamos", "los olivos", "buellton", "solvang", "santa ynez",
      "ballard", "casmalia", "sisquoc", "new cuyama", "cuyama", "goleta", "santa barbara", "isla vista", "carpinteria", "montecito", "summerland"];
    var ZIPS = { "93446": "Paso Robles", "93447": "Paso Robles", "93422": "Atascadero", "93423": "Atascadero", "93444": "Nipomo",
      "93420": "Arroyo Grande", "93421": "Arroyo Grande", "93465": "Templeton",
      "93401": "San Luis Obispo", "93402": "Los Osos", "93403": "San Luis Obispo", "93405": "San Luis Obispo", "93406": "San Luis Obispo",
      "93407": "San Luis Obispo", "93408": "San Luis Obispo", "93410": "San Luis Obispo", "93412": "Los Osos", "93424": "Avila Beach",
      "93428": "Cambria", "93430": "Cayucos", "93432": "Creston", "93433": "Grover Beach", "93435": "Harmony", "93442": "Morro Bay",
      "93443": "Morro Bay", "93445": "Oceano", "93448": "Pismo Beach", "93449": "Pismo Beach", "93451": "San Miguel",
      "93452": "San Simeon", "93453": "Santa Margarita", "93461": "Shandon", "93483": "Grover Beach",
      "93454": "Santa Maria", "93455": "Santa Maria", "93456": "Santa Maria", "93458": "Santa Maria", "93457": "Orcutt", "93434": "Guadalupe", "93436": "Lompoc", "93437": "Vandenberg", "93438": "Lompoc", "93440": "Los Alamos", "93441": "Los Olivos", "93427": "Buellton", "93463": "Solvang", "93464": "Solvang", "93460": "Santa Ynez", "93429": "Casmalia", "93254": "New Cuyama", "93117": "Goleta", "93118": "Goleta", "93013": "Carpinteria", "93014": "Carpinteria", "93067": "Summerland", "93108": "Montecito", "93101": "Santa Barbara", "93102": "Santa Barbara", "93103": "Santa Barbara", "93105": "Santa Barbara", "93106": "Santa Barbara", "93107": "Santa Barbara", "93109": "Santa Barbara", "93110": "Santa Barbara", "93111": "Santa Barbara", "93116": "Santa Barbara", "93120": "Santa Barbara", "93121": "Santa Barbara", "93130": "Santa Barbara", "93140": "Santa Barbara", "93150": "Santa Barbara", "93160": "Santa Barbara", "93190": "Santa Barbara" };
    var input = document.getElementById("area-input");
    var out = document.getElementById("area-result");
    var callBtn = '<a class="btn btn--red btn--block" href="tel:' + PHONE + '">' +
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1z"/></svg>' +
      'Call (805) 929-2278</a>';
    function title(s) { return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim().toLowerCase().replace(/,?\s*(ca|california)\.?$/, "").replace(/\s+/g, " ");
      if (!q) { input.focus(); return; }
      var city = null;
      if (/^\d{5}$/.test(q)) city = ZIPS[q] ? ZIPS[q].toLowerCase() : null;
      else if (NAMED.concat(COUNTY).indexOf(q) > -1) city = q === "slo" ? "san luis obispo" : q;
      out.className = "checker-result";
      if (city) {
        out.classList.add("is-yes");
        out.innerHTML = "<span>&#10003; Yes! Rex&rsquo;s Rooter serves " + title(city) + ". Call now and we&rsquo;ll get a plumber out to you.</span>" + callBtn;
      } else {
        out.classList.add("is-maybe");
        out.innerHTML = "<span>We serve all of San Luis Obispo and Santa Barbara Counties. We didn&rsquo;t recognize that location. Give us a call and we&rsquo;ll tell you right away if we can help.</span>" + callBtn;
      }
      out.focus();
    });
  }

  /* ---------- Review carousel ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector("[data-prev]"), next = root.querySelector("[data-next]");
    var dots = root.querySelector(".carousel-dots");
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Go to review " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dots.appendChild(b);
    });
    function step() { return slides[0].getBoundingClientRect().width + 16; }
    function current() { return Math.round(track.scrollLeft / step()); }
    function go(i) { track.scrollTo({ left: i * step(), behavior: "smooth" }); }
    function update() {
      var i = current(), max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
      Array.prototype.forEach.call(dots.children, function (d, j) { d.setAttribute("aria-current", j === i ? "true" : "false"); });
    }
    prev.addEventListener("click", function () { go(current() - 1); });
    next.addEventListener("click", function () { go(current() + 1); });
    var raf; track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = false;
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
