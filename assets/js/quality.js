/* Quality page: batch tracing (journey bar, details, temperature chart). */
(function(){
  // batch data, from the approved board
  var T = {
    'BG-2643-07': {room:'Room 07', h:'Sat 24 Oct 05:40', p:'Sat 24 Oct 10:15 · Line 2', d:'Sat 24 Oct 21:30 · Truck 161-MN-4410', r:'Sun 25 Oct 04:52 · Ballymount DC', stage:4, t:[14,9,4,2.4,2.1,2.3,2.6,2.2,2.4,3.1,2.8]},
    'BG-2643-19': {room:'Room 19', h:'Sun 25 Oct 05:10', p:'Sun 25 Oct 09:50 · Line 1', d:'Sun 25 Oct 22:00 · Truck 161-MN-4412', r:'In transit', stage:3, t:[15,10,5,2.6,2.2,2.0,2.4,2.5]},
    'BG-2644-23': {room:'Room 23', h:'Mon 26 Oct 05:20', p:'Packing now · Line 3', d:'Planned 21:30', r:'Planned Tue 04:40', stage:1, t:[14,11,7]}
  };
  var LIMIT = 4, TOP = 16;                        // °C: product limit after chilling, top of the chart scale
  var W = 600, H = 132, L = 38, R = 12, PT = 14, PB = 14;   // chart box inside the viewBox
  var el = function(id){ return document.getElementById(id); };
  var yOf = function(v){ return PT + (1 - v / TOP) * (H - PT - PB); };
  var xOf = function(i, n){ return L + i / Math.max(10, n - 1) * (W - L - R); };   // 11 readings span the full width; fewer readings stop short

  function grid(){
    return [0, 8, 16].map(function(v){
      return '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yOf(v)+'" y2="'+yOf(v)+'" stroke="currentColor" stroke-opacity=".14" stroke-width="1"/>'
        + '<text x="'+(L-8)+'" y="'+(yOf(v)+4)+'" text-anchor="end" font-size="12" fill="currentColor" fill-opacity=".7">'+v+'</text>';
    }).join('');
  }
  function chart(t){
    var pts = t.map(function(v, i){ return [xOf(i, t.length), yOf(v)]; }), y4 = yOf(LIMIT);
    el('tempsvg').innerHTML = grid()
      + '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y4+'" y2="'+y4+'" stroke="#c48a2c" stroke-dasharray="4 5" stroke-width="1.2"/>'
      + '<text x="'+(W-R)+'" y="'+(y4-7)+'" text-anchor="end" font-size="12" fill="#4c5568">4 °C limit</text>'
      + '<path d="M'+pts.map(function(p){ return p[0].toFixed(1)+' '+p[1].toFixed(1); }).join(' L')+'" fill="none" stroke="#0f1f3d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
      + pts.map(function(p){ return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.5" fill="#0f1f3d"/>'; }).join('');
  }

  function trace(code){
    var r = T[code.trim().toUpperCase()], bars = document.querySelectorAll('#jbar i'), rows = el('jrows');
    if (!r) {
      rows.innerHTML = '<div class="jrow none"><b>No batch found</b><span>Check the code on the case label. It starts with BG and has two groups of numbers.</span></div>';
      bars.forEach(function(b){ b.style.setProperty('--w', '0%'); });
      el('tempsvg').innerHTML = grid(); el('tempmax').textContent = '';
      return;
    }
    bars.forEach(function(b, i){ b.style.setProperty('--w', i < r.stage ? '100%' : '0%'); });
    rows.innerHTML = [['Harvested', r.room+' · '+r.h], ['Packed', r.p], ['Dispatched', r.d], ['Delivered', r.r]]
      .map(function(x){ return '<div class="jrow"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join('');
    chart(r.t);
    var after = r.t.slice(3);
    el('tempmax').textContent = after.length ? 'Max after chilling '+Math.max.apply(null, after).toFixed(1)+' °C' : 'Chilling';
  }
  el('traceform').addEventListener('submit', function(e){ e.preventDefault(); trace(el('batch').value); });
  trace(el('batch').value);
})();
