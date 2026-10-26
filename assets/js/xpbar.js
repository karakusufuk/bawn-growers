/* The XP bar: a bar that carries information (here: pack size).
   Fill + handle slide to the chosen size; choose by button, by clicking the track, by dragging, or with the arrow keys.
   A committed change gathers a burst of particles into the bar at the new position (this effect is used only here). */
(function(){
  var MIN_FILL = 9;   // % — the fill never goes below this, so the first stop stays visible
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function XPBar(root, onChange){
    var track = root.querySelector('.xtrack'), fill = root.querySelector('.xfill'),
        stopsBox = root.querySelector('.stops'), cv = root.querySelector('canvas'), cx = cv.getContext('2d');
    var labels = [], idx = 0, dragging = false, raf = 0;

    function stopPct(i){ return labels.length < 2 ? 100 : i / (labels.length - 1) * 100; }
    function fillPct(i){ return Math.max(stopPct(i), MIN_FILL); }
    function pctAt(e){ var r = track.getBoundingClientRect(); return Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)); }
    function nearest(p){
      var best = 0, bd = Infinity;
      labels.forEach(function(_, i){ var d = Math.abs(stopPct(i) - p); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function press(n){ stopsBox.querySelectorAll('.stop').forEach(function(b, j){ b.setAttribute('aria-pressed', j === n ? 'true' : 'false'); }); }
    function aria(){
      track.setAttribute('aria-valuemin', '1'); track.setAttribute('aria-valuemax', String(labels.length));
      track.setAttribute('aria-valuenow', String(idx + 1)); track.setAttribute('aria-valuetext', labels[idx]);
    }

    // choose a size. opts.burst: play particles; opts.silent: don't call onChange
    function select(i, opts){
      opts = opts || {};
      var changed = i !== idx;
      idx = i;
      fill.style.width = fillPct(i) + '%';
      press(i); aria();
      if (!opts.silent && onChange) onChange(i);
      if (opts.burst && changed) burst(fillPct(i));
    }

    // (re)build the size buttons for a product; resets to the first size, no particles
    function setSizes(list){
      labels = list.slice(); idx = 0;
      cancelAnimationFrame(raf); cx.clearRect(0, 0, cv.width, cv.height);
      stopsBox.innerHTML = labels.map(function(l, i){ return '<button type="button" class="stop" data-i="'+i+'">'+l+'</button>'; }).join('');
      stopsBox.querySelectorAll('.stop').forEach(function(b, i){
        b.style.left = stopPct(i) + '%';
        b.addEventListener('click', function(){ select(i, {burst:true}); });
      });
      fill.style.width = fillPct(0) + '%';
      press(0); aria();
    }

    // --- pointer: click on the track snaps to the nearest size; dragging follows the pointer, snaps on release
    track.addEventListener('pointerdown', function(e){
      dragging = true; root.classList.add('dragging'); track.setPointerCapture(e.pointerId);
      track.focus({preventScroll:true});
      fill.style.width = Math.max(pctAt(e), MIN_FILL) + '%'; press(nearest(pctAt(e)));
    });
    track.addEventListener('pointermove', function(e){
      if (!dragging) return;
      var p = pctAt(e); fill.style.width = Math.max(p, MIN_FILL) + '%'; press(nearest(p));
    });
    function release(e, cancelled){
      if (!dragging) return;
      dragging = false; root.classList.remove('dragging');
      if (cancelled) { fill.style.width = fillPct(idx) + '%'; press(idx); return; }
      var n = nearest(pctAt(e));
      if (n === idx) { fill.style.width = fillPct(idx) + '%'; press(idx); } else select(n, {burst:true});
    }
    track.addEventListener('pointerup', function(e){ release(e, false); });
    track.addEventListener('pointercancel', function(e){ release(e, true); });
    // --- keyboard
    track.addEventListener('keydown', function(e){
      var to = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') to = idx + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') to = idx - 1;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = labels.length - 1;
      if (to === null) return;
      e.preventDefault();
      select(Math.min(labels.length - 1, Math.max(0, to)), {burst:true});
    });

    // --- particles gather into the filled part of the bar, ending at the new end point
    function burst(pct){
      if (reduce.matches) return;
      var cr = cv.getBoundingClientRect(), tr = track.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(cr.width * dpr); cv.height = Math.round(cr.height * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var x0 = tr.left - cr.left, w = tr.width, ty = tr.top - cr.top + tr.height / 2, tx = x0 + w * pct / 100;
      var parts = [];
      for (var n = 0; n < 70; n++) {
        var a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 90;     // 30–120 px out, flatter vertically
        parts.push({x: tx + Math.cos(a) * d, y: ty + Math.sin(a) * d * 0.45,
                    tx: x0 + Math.random() * (tx - x0), ty: ty + (Math.random() - 0.5) * 12,
                    s: 1.6 + Math.random() * 1.6, dl: Math.random() * 0.25});
      }
      cancelAnimationFrame(raf);
      var start = performance.now(), color = getComputedStyle(fill).backgroundColor;
      (function frame(now){
        var el = (now - start) / 1000, alive = false;
        cx.clearRect(0, 0, cr.width, cr.height);
        parts.forEach(function(p){
          var t = Math.min(Math.max((el - p.dl) / 0.7, 0), 1); if (t < 1) alive = true;
          var e = 1 - Math.pow(1 - t, 3);                                       // ease-out-cubic
          cx.globalAlpha = 1 - t * 0.9; cx.fillStyle = color;
          cx.beginPath(); cx.arc(p.x + (p.tx - p.x) * e, p.y + (p.ty - p.y) * e, p.s * (1 - t * 0.5), 0, 6.2832); cx.fill();
        });
        if (alive) raf = requestAnimationFrame(frame); else cx.clearRect(0, 0, cr.width, cr.height);
      })(start);
    }

    return { setSizes: setSizes, select: select, get index(){ return idx; } };
  }
  window.XPBar = XPBar;
})();
