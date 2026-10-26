/* Products page: detail view, catalogue strip, XP pack-size bar. Switching product swaps content in place (nothing moves). */
(function(){
  var P = Bawn.PRODUCTS, cur = P[0];
  var el = function(id){ return document.getElementById(id); };
  var xp = XPBar(el('xp'), function(i){ showPack(i); });

  // catalogue strip
  el('cat').innerHTML = P.map(function(p){
    return '<button type="button" class="mini" data-id="'+p.id+'" aria-pressed="false"><div class="ph"><img src="'+p.img+'" alt="" width="400" height="400" loading="lazy"></div><span>'+Bawn.esc(p.name)+'</span></button>';
  }).join('');
  el('cat').addEventListener('click', function(e){
    var b = e.target.closest('.mini'); if (!b) return;
    show(b.dataset.id);
    try { history.replaceState(null, '', '#' + b.dataset.id); } catch(err) {}
  });
  // warm the cache once the page has loaded, so swapping product never flashes
  window.addEventListener('load', function(){ setTimeout(function(){ P.forEach(function(p){ var i = new Image(); i.src = p.img; }); }, 400); });

  function showPack(i){
    var k = cur.packs[i];
    el('d-price').textContent = Bawn.euro(k[1]);
    el('d-case').textContent = k[2] === 1 ? 'Loose' : k[2] + ' packs';
    el('d-cprice').textContent = Bawn.euro(k[1] * k[2]);
  }

  function show(id){
    cur = Bawn.product(id) || P[0];
    var img = el('d-img'); img.src = cur.img; img.alt = cur.alt;
    el('d-name').textContent = cur.name;
    el('d-lede').textContent = cur.lede;
    el('d-group').textContent = cur.group === 'classic' ? 'Classic' : 'Specialty';
    el('d-tag').classList.toggle('ex', cur.group === 'specialty');
    el('d-life').textContent = cur.life + ' days';
    el('d-lifebar').style.width = (cur.life / 12 * 100) + '%';
    document.querySelectorAll('.mini').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.id === cur.id ? 'true' : 'false'); });
    xp.setSizes(cur.packs.map(function(k){ return k[0]; }));
    showPack(0);
  }

  function fromHash(){ show(location.hash.slice(1)); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
