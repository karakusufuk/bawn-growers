/* Bars animate when they first come into view. Nothing is hidden at rest, nothing moves except the bar itself. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // run fn once, the first time `el` is at least 25 % visible (immediately with reduced motion or without IntersectionObserver)
  function onView(el, fn){
    if (reduce.matches || !('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function(es){ if (es.some(function(e){ return e.isIntersecting; })) { io.disconnect(); fn(); } }, {threshold: 0.25});
    io.observe(el);
  }
  // after the next paint, so a width set from 0 actually transitions
  function afterPaint(fn){ requestAnimationFrame(function(){ requestAnimationFrame(fn); }); }
  window.Bawn.onView = onView; window.Bawn.afterPaint = afterPaint;
  // bars that carry a data-w width (farm room clocks)
  document.querySelectorAll('[data-bars]').forEach(function(box){
    onView(box, function(){ afterPaint(function(){ box.querySelectorAll('i[data-w]').forEach(function(i){ i.style.width = i.dataset.w + '%'; }); }); });
  });
})();
