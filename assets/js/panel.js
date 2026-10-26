/* B2B customer panel (demo, no real login): cutoff bar, plan from shelf date, order table, DC stock, capacity. */
(function(){
  var S = Bawn.schedule, NOW = Bawn.NOW, el = function(id){ return document.getElementById(id); };
  var WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  /* ---------- 1. cutoff bar: today 06:00 → 14:00, time left to the earliest shelf day still open ---------- */
  (function(){
    var open = S.at(NOW, 6, 0), cut = S.at(NOW, 14, 0);
    var firstOpen = null;
    for (var i = 1; i < 30 && !firstOpen; i++){ var d = S.addDays(S.dayStart(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()), i); if (S.plan(d, NOW).ok) firstOpen = d; }
    var left = Math.max(0, Math.round((S.plan(firstOpen, NOW).cutoff - NOW) / 60000));
    el('cuttxt').textContent = Math.floor(left / 60) + ' h ' + (left % 60) + ' min left for ' + WEEKDAYS[firstOpen.getUTCDay()] + ' shelf';
    var f = Math.min(1, Math.max(0, (NOW - open) / (cut - open)));
    Bawn.afterPaint(function(){ el('cutbar').style.width = (f * 100) + '%'; });
  })();

  /* ---------- 3. plan from shelf date ---------- */
  var sel = el('shelfsel'), today = S.dayStart(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate());
  var pdays = []; for (var j = 1; j <= 11; j++) pdays.push(S.addDays(today, j));
  sel.innerHTML = pdays.map(function(d, i){ var ok = S.plan(d, NOW).ok; return '<option value="'+i+'"'+(ok ? '' : ' disabled')+'>'+S.dayName(d)+(ok ? '' : ' · too late')+'</option>'; }).join('');
  sel.value = String(pdays.findIndex(function(d){ return d.getUTCDay() === 4 && S.plan(d, NOW).ok; }));   // first open Thursday
  function renderPlan(){
    var pl = S.plan(pdays[+sel.value], NOW), st = S.steps(pl), box = el('psteps');
    box.innerHTML = st.map(function(s){
      var hol = s.label === 'At your DC' && pl.skipped.length;
      return '<div class="bstep'+(hol ? ' hol' : '')+'"><b>'+s.label+'</b><div class="t"><i></i></div><span class="tnum">'+S.fmt(s.at)+'</span></div>';
    }).join('');
    Bawn.afterPaint(function(){ box.querySelectorAll('.t i').forEach(function(i, k){ i.style.width = (100 - st[k].width + 6) + '%'; }); });   // bars grow towards the shelf date
    el('pwarn').textContent = pl.skipped.length ? 'Your DC is closed on '+S.list(pl.skipped)+'. Delivery moved to '+S.fmt(pl.dc)+'.' : 'Order by '+S.fmt(pl.cutoff)+' to make this shelf date.';
  }
  sel.addEventListener('change', renderPlan);
  renderPlan();

  /* ---------- 5. order table ---------- */
  // p: product, k: pack index, q: usual cases, pr: promised cases this week, u: cases already ordered this week
  var USUAL = [{p:'white',k:0,q:120,pr:600,u:340},{p:'white',k:1,q:80,pr:360,u:180},{p:'chestnut',k:0,q:90,pr:420,u:250},{p:'baby',k:0,q:40,pr:200,u:120},{p:'porto',k:0,q:30,pr:150,u:60},{p:'king',k:0,q:16,pr:60,u:20},{p:'shimeji',k:0,q:12,pr:50,u:18}];
  var PER_PALLET = 90;
  var lines = USUAL.map(function(l){ return {p:l.p, k:l.k, q:l.q, pr:l.pr, u:l.u}; });
  var body = el('olines');
  body.innerHTML = lines.map(function(l, i){
    var pr = Bawn.product(l.p), k = pr.packs[l.k];
    return '<tr><td>'+Bawn.esc(pr.name)+'</td><td>'+k[0]+(k[2] > 1 ? ' × '+k[2] : '')+'</td>'
      + '<td><label class="sr" for="q'+i+'">Cases of '+Bawn.esc(pr.name)+' '+k[0]+'</label><input id="q'+i+'" type="number" inputmode="numeric" min="0" step="1" value="'+l.q+'" data-i="'+i+'"></td>'
      + '<td><div class="pbar"><div class="t"><i></i></div><small></small></div></td><td class="lt"></td></tr>';
  }).join('');
  var rows = [].slice.call(body.querySelectorAll('tr'));
  function cents(l){ var k = Bawn.product(l.p).packs[l.k]; return Math.round(k[1] * 100) * k[2] * l.q; }
  function money(c){ return Bawn.euro(c / 100); }
  function update(){
    var total = 0, cases = 0;
    lines.forEach(function(l, i){
      var r = rows[i], used = l.u + l.q, over = used - l.pr, c = cents(l);
      total += c; cases += l.q;
      var bar = r.querySelector('.pbar .t i'); bar.style.width = Math.min(100, used / l.pr * 100) + '%'; bar.classList.toggle('over', over > 0);
      var small = r.querySelector('.pbar small'); small.textContent = used + ' of ' + l.pr + ' cases' + (over > 0 ? ' · ' + over + ' over promise' : ''); small.classList.toggle('over', over > 0);
      r.querySelector('.lt').textContent = money(c);
    });
    el('ototal').textContent = money(total);
    el('ocount').textContent = cases + ' cases · ' + Math.ceil(cases / PER_PALLET) + ' pallets';
    return {total: total, cases: cases, over: lines.some(function(l){ return l.u + l.q > l.pr; })};
  }
  function clearMsg(){ el('oplaced').textContent = ''; }
  body.addEventListener('input', function(e){
    var i = e.target.dataset.i; if (i == null) return;
    var n = parseInt(e.target.value, 10); lines[i].q = isNaN(n) || n < 0 ? 0 : n;
    update(); clearMsg();
  });
  body.addEventListener('change', function(e){   // tidy what the field shows once the user leaves it
    var i = e.target.dataset.i; if (i != null) e.target.value = lines[i].q;
  });
  el('resetorder').addEventListener('click', function(){
    USUAL.forEach(function(l, i){ lines[i].q = l.q; body.querySelector('input[data-i="'+i+'"]').value = l.q; });
    update(); clearMsg();
  });
  el('placeorder').addEventListener('click', function(){
    var s = update();
    el('oplaced').textContent = !s.cases ? 'Add at least one case to place an order.'
      : s.over ? 'Some lines go over your promised quantity. We will confirm the extra cases by 12:00 or call you.'
      : 'Order 48131 placed. Confirmation sent to orders@loughfoods.example.';
  });
  update();
  // final action → concept-site modal, in addition to the inline message
  el('placeorder').addEventListener('click', function(){
    var s = update();
    if (s.cases) Bawn.modal.open(el('placeorder'), 'this would send your order of '+s.cases+' cases ('+money(s.total)+') to the orders desk and email you a confirmation.');
  });
  // promised bars fill when the card comes into view (they start empty until then)
  var fresh = rows.map(function(r){ return r.querySelector('.pbar .t i'); }), widths = fresh.map(function(b){ return b.style.width; });
  fresh.forEach(function(b){ b.style.width = '0'; });
  Bawn.onView(body, function(){ Bawn.afterPaint(function(){ fresh.forEach(function(b, i){ b.style.width = widths[i]; }); }); });

  /* ---------- 6. stock in the customer's DC: bars anchored right that drain backwards ---------- */
  var BATCHES = [['BG-2643-07','White 250 g',5,7],['BG-2643-19','Chestnut 250 g',6,8],['BG-2642-11','White 400 g',2,7],['BG-2641-03','Portobello 250 g',1,6],['BG-2643-28','King oyster 150 g',8,10]];
  var bbox = el('batches');
  bbox.innerHTML = BATCHES.map(function(b){
    var f = b[2] / b[3], cls = f > 0.5 ? 'ok' : f > 0.25 ? 'warn' : 'bad';
    return '<div class="bt tnum"><b>'+b[0]+'</b><span class="what">'+b[1]+'</span><div class="t"><i class="'+cls+'" data-w="'+(f * 100)+'" style="width:100%"></i></div><span>'+b[2]+(b[2] === 1 ? ' day' : ' days')+'</span></div>';
  }).join('');
  Bawn.onView(bbox, function(){ Bawn.afterPaint(function(){ bbox.querySelectorAll('i[data-w]').forEach(function(i){ i.style.width = i.dataset.w + '%'; }); }); });

  /* ---------- 7. harvest capacity ---------- */
  var CAP = [['Wk 44',94],['Wk 45',86],['Wk 46',61],['Wk 47',38]], cbox = el('cap');
  cbox.innerHTML = CAP.map(function(c){ return '<div class="wk'+(c[1] > 80 ? ' hot' : '')+'"><b>'+c[0]+'</b><div class="t"><i data-h="'+c[1]+'"></i></div><span class="tnum">'+c[1]+'% promised</span></div>'; }).join('');
  Bawn.onView(cbox, function(){ Bawn.afterPaint(function(){ cbox.querySelectorAll('i[data-h]').forEach(function(i){ i.style.height = i.dataset.h + '%'; }); }); });
})();
