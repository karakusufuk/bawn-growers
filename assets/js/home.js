/* Home page: product rows and the shelf planner. */
(function(){
  var S = Bawn.schedule;
  function fill(id, group){
    document.getElementById(id).innerHTML = Bawn.PRODUCTS.filter(function(p){return p.group===group}).map(Bawn.card).join('');
  }
  fill('home-classics','classic');
  fill('home-exotics','specialty');

  // ---- shelf planner: seven days from Wed 28 Oct, default Thu 29 Oct
  var daysBox = document.getElementById('home-days'), tl = document.getElementById('home-tl');
  var first = S.addDays(S.dayStart(Bawn.NOW.getUTCFullYear(), Bawn.NOW.getUTCMonth(), Bawn.NOW.getUTCDate()), 2);
  var days = [0,1,2,3,4,5,6].map(function(i){ return S.addDays(first, i); });
  daysBox.innerHTML = days.map(function(d, i){
    var ok = S.plan(d, Bawn.NOW).ok;
    return '<button type="button" class="day" data-i="'+i+'" aria-pressed="false"'+(ok?'':' disabled title="The order cutoff for this day has passed"')+'><small>'+S.dayName(d).slice(0,3)+'</small><b>'+d.getUTCDate()+'</b></button>';
  }).join('');
  var started = false, current = -1;

  function show(i){
    current = i;
    daysBox.querySelectorAll('.day').forEach(function(b){ b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'); });
    var pl = S.plan(days[i], Bawn.NOW), st = S.steps(pl).reverse();           // On shelf first
    tl.innerHTML = st.map(function(s){
      return '<div class="step"><div class="lab"><b>'+s.label+'</b><span>'+s.sub+'</span></div><div class="track"><i style="width:0"></i></div><div class="when tnum">'+S.fmt(s.at)+'</div></div>';
    }).join('') + '<p class="note-line">'+S.closedNote(pl)+'</p>';
    var grow = function(){ Bawn.afterPaint(function(){ tl.querySelectorAll('.track i').forEach(function(el, j){ el.style.width = st[j].width + '%'; }); }); };
    if (started) grow(); else Bawn.onView(tl, function(){ started = true; if (current === i) grow(); });
  }
  daysBox.addEventListener('click', function(e){ var b = e.target.closest('.day'); if (b && !b.disabled) { started = true; show(+b.dataset.i); } });
  show(1);   // Thu 29 Oct
})();
