
    (function () {
      /* ── Canvas Ink Reveal ── */
      var hero = document.getElementById("hero");
      var canvas = document.getElementById("heroMask");
      if (!hero || !canvas) return;

      var canHover = window.matchMedia("(hover: hover)").matches;
      if (!canHover) return;

      var ctx = canvas.getContext("2d");
      if (!ctx) return;

      var MASK = "252, 250, 248";
      var R_START = 8;
      var R_END = 128;
      var R_VARY = 0.45;
      var LIFETIME = 520;
      var STAMP_STEP = 12;
      var MAX_STAMPS = 160;
      var DPR = Math.min(window.devicePixelRatio || 1, 2);

      var w = 0, h = 0;

      function resize() {
        var rect = hero.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgb(" + MASK + ")";
        ctx.fillRect(0, 0, w, h);
      }
      resize();
      window.addEventListener("resize", resize);

      var stamps = [];
      var lastX = null, lastY = null;

      function addStamp(x, y) {
        if (stamps.length >= MAX_STAMPS) stamps.shift();
        stamps.push({
          x: x, y: y,
          born: performance.now(),
          seed: Math.random() * Math.PI * 2,
          rmax: R_END * (1 - R_VARY + Math.random() * R_VARY)
        });
      }

      function stampAlong(x, y) {
        if (lastX === null) {
          addStamp(x, y);
        } else {
          var dx = x - lastX;
          var dy = y - lastY;
          var dist = Math.hypot(dx, dy);
          var steps = Math.max(1, Math.ceil(dist / STAMP_STEP));
          for (var i = 1; i <= steps; i++) {
            addStamp(lastX + (dx * i) / steps, lastY + (dy * i) / steps);
          }
        }
        lastX = x;
        lastY = y;
      }

      function carveInk(x, y, r, alpha, seed) {
        var g = ctx.createRadialGradient(x, y, r * 0.25, x, y, r);
        g.addColorStop(0, "rgba(0, 0, 0, " + (0.95 * alpha) + ")");
        g.addColorStop(0.55, "rgba(0, 0, 0, " + (0.88 * alpha) + ")");
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        var segs = 32;
        for (var i = 0; i <= segs; i++) {
          var a = (i / segs) * Math.PI * 2;
          var wob = 0.78 +
            0.14 * Math.sin(a * 3 + seed) +
            0.08 * Math.sin(a * 7 + seed * 2.1) +
            0.05 * Math.sin(a * 13 + seed * 0.7);
          var rr = r * wob;
          var px = x + Math.cos(a) * rr;
          var py = y + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }

      var running = false;

      function loop() {
        var now = performance.now();

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgb(" + MASK + ")";
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = "destination-out";
        for (var i = stamps.length - 1; i >= 0; i--) {
          var t = (now - stamps[i].born) / LIFETIME;
          if (t >= 1) {
            stamps.splice(i, 1);
            continue;
          }
          var ease = 1 - Math.pow(1 - t, 3);
          var r = R_START + (stamps[i].rmax - R_START) * ease;
          var alpha = 1 - t * t;
          carveInk(stamps[i].x, stamps[i].y, r, alpha, stamps[i].seed);
        }

        if (stamps.length) {
          requestAnimationFrame(loop);
        } else {
          running = false;
        }
      }

      function start() {
        if (!running) {
          running = true;
          requestAnimationFrame(loop);
        }
      }

      hero.addEventListener("mouseenter", function (e) {
        var rect = hero.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        stampAlong(lastX, lastY);
        start();
      });

      hero.addEventListener("mousemove", function (e) {
        var rect = hero.getBoundingClientRect();
        stampAlong(e.clientX - rect.left, e.clientY - rect.top);
        start();
      });

      hero.addEventListener("mouseleave", function () {
        lastX = null;
        lastY = null;
      });
    })();

    (function () {
      /* ── Subtitle Typewriter ── */
      var sub = document.getElementById("heroSubtitle");
      if (!sub) return;
      if (window.matchMedia("(max-width: 700px)").matches) return;

      var original = sub.textContent.trim();

      function type() {
        sub.style.whiteSpace = "nowrap";
        sub.textContent = original;
        var fullW = sub.getBoundingClientRect().width;
        if (fullW > 0) sub.style.width = Math.ceil(fullW) + "px";
        sub.textContent = "";
        sub.classList.add("is-typing");

        var chars = [];
        for (var i = 0; i < original.length; i++) {
          var s = document.createElement("span");
          s.className = "char";
          s.textContent = original[i];
          sub.appendChild(s);
          chars.push(s);
        }
        var caret = document.createElement("span");
        caret.className = "type-caret";
        caret.setAttribute("aria-hidden", "true");
        sub.appendChild(caret);

        var DELAY = 55;
        var START = 350;
        chars.forEach(function (c, i) {
          setTimeout(function () { c.classList.add("is-typed"); }, START + i * DELAY);
        });
        setTimeout(function () { sub.classList.add("is-done"); }, START + chars.length * DELAY + 150);
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(type);
      } else {
        type();
      }
	    })();

	    /* ── Lightbox Modal ── */
	    function openModal(src) {
	      var modal = document.getElementById("certModal");
	      var img = document.getElementById("modalImg");
	      img.src = src;
	      modal.classList.add("is-open");
	      document.body.style.overflow = "hidden";
	    }

	    function closeModal() {
	      var modal = document.getElementById("certModal");
	      modal.classList.remove("is-open");
	      document.body.style.overflow = "";
	    }

	    document.addEventListener("DOMContentLoaded", function() {
	      var modal = document.getElementById("certModal");
	      var closeBtn = document.getElementById("modalClose");
	      var overlay = document.getElementById("modalOverlay");
	      if (closeBtn) closeBtn.addEventListener("click", closeModal);
	      if (overlay) overlay.addEventListener("click", closeModal);
	      document.addEventListener("keydown", function(e) {
	        if (e.key === "Escape") closeModal();
	      });
	    });
	  

/* ── Cert card click handling (replacing inline onclick) ── */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.cert-card[data-src]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(this.getAttribute('data-src'));
    });
  });
});