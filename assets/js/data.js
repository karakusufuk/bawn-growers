/* Shared data and helpers. One global: Bawn. */
(function(){
  // Demo clock: every date calculation on the site uses this fixed "now": Monday 26 October 2026, 10:45 Dublin time.
  // Dates are kept as wall-clock values stored in UTC fields (read with getUTC*), so neither the viewer's time zone nor a DST change can move them.
  var NOW = new Date(Date.UTC(2026, 9, 26, 10, 45));

  // packs: [label, price per pack in euro, packs per case (1 = loose)]
  var PRODUCTS = [
    {id:'white', alt:'White mushrooms on a plain light surface',    name:'White mushroom', group:'classic',   img:'assets/img/product-white.jpg',       life:7,  lede:'Closed white caps, firm and clean. The everyday mushroom and most of what we pick.', packs:[['250 g',1.10,12],['400 g',1.65,8],['2.5 kg',8.90,1]]},
    {id:'baby', alt:'Small white baby mushrooms, one cut in half, on a plain light surface',     name:'Baby mushroom',  group:'classic',   img:'assets/img/product-baby.jpg',        life:7,  lede:'White caps picked small, before they open. Cooks whole, holds its shape.',            packs:[['250 g',1.35,12],['400 g',2.05,8],['2.5 kg',10.40,1]]},
    {id:'chestnut', alt:'Brown chestnut mushrooms, one cut open, on a plain light surface', name:'Chestnut',       group:'classic',   img:'assets/img/product-chestnut.jpg',    life:8,  lede:'Brown caps with a denser flesh and a nuttier taste. Keeps a day longer than white.', packs:[['250 g',1.30,12],['400 g',1.95,8],['2.5 kg',10.20,1]]},
    {id:'porto', alt:'A large portobello mushroom with its cap lifted to show the dark gills',    name:'Portobello',     group:'classic',   img:'assets/img/product-portobello.jpg',  life:6,  lede:'Chestnut left to open fully. Broad flat caps with dark gills, sold in twos and fours.', packs:[['250 g',1.55,12],['400 g',2.40,8],['2.5 kg',12.60,1]]},
    {id:'king', alt:'King oyster mushrooms lying in a cardboard box',     name:'King oyster',    group:'specialty', img:'assets/img/product-king-oyster.jpg', life:10, lede:'Thick white stems, small caps. Slices like scallops and keeps for ten days.',        packs:[['150 g',2.20,10],['1 kg',13.50,1]]},
    {id:'shimeji', alt:'A clear tray of shimeji mushrooms under film',  name:'Shimeji',        group:'specialty', img:'assets/img/product-shimeji.jpg',     life:12, lede:'Clusters of slender stems with small brown caps, sold joined at the base.',          packs:[['150 g',1.90,10],['1 kg',11.80,1]]},
    {id:'maitake', alt:'A specialty growing room lit by blue LED light',  name:'Maitake',        group:'specialty', img:'assets/img/product-maitake.jpg',     life:7,  lede:'Layered grey-brown fronds that crisp at the edges in a hot pan.',                    packs:[['150 g',2.60,10],['1 kg',16.20,1]]}
  ];

  function product(id){ return PRODUCTS.filter(function(p){return p.id===id})[0]; }
  function euro(n){ return '€' + n.toLocaleString('en-IE',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
  // shared product card (home rows)
  function card(p){
    return '<a class="pcard" href="products.html#'+p.id+'"><div class="ph"><img src="'+p.img+'" alt="'+esc(p.alt)+'" width="800" height="800" loading="lazy"></div>'
      + '<h3>'+esc(p.name)+'</h3><div class="meta"><span>'+p.packs.map(function(k){return k[0]}).join(' · ')+'</span><span class="tnum">from '+euro(p.packs[0][1])+'</span></div></a>';
  }

  // where "See how it works" in the concept-site modal points (single place to change)
  var CASE_STUDY_URL = 'https://ufuk.ie/work/bawn';

  window.Bawn = {CASE_STUDY_URL:CASE_STUDY_URL, NOW:NOW, PRODUCTS:PRODUCTS, product:product, euro:euro, esc:esc, card:card};
})();
