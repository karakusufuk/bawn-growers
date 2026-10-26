/* Shared header and footer. Runs as a blocking script at the top of <body>, so the header is in place before first paint. */
(function(){
  var page = document.body.dataset.page;
  var nav = [['products.html','Products','products'],['farm.html','The farm','farm'],['quality.html','Quality','quality'],['customers.html','Who we supply','customers'],['contact.html','Contact','contact']];
  var lock = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="7" width="11" height="7.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  var skip = '<a class="skip" href="#main">Skip to content</a>';
  var header = '<header class="site"><div class="wrap">'
    + '<a class="brand" href="index.html" aria-label="Bawn Growers home"><img src="assets/logo/mark-beige.svg" alt="" width="29" height="38"><span>bawn growers</span></a>'
    + '<nav class="main" aria-label="Main">' + nav.map(function(n){return '<a href="'+n[0]+'"'+(page===n[2]?' aria-current="page"':'')+'>'+n[1]+'</a>'}).join('') + '</nav>'
    + '<a class="b2b" href="panel.html"'+(page==='panel'?' aria-current="page"':'')+'>'+lock+'<span>Customer login</span></a>'
    + '</div></header>';
  var footer = '<footer class="site"><div class="wrap"><div class="grid">'
    + '<div class="flogo"><img src="assets/logo/mark-beige.svg" alt="Bawn Growers" width="43" height="56"><p>Fresh and specialty mushrooms from Bawn, Co. Monaghan, for retail and foodservice distribution.</p></div>'
    + '<div><p class="fh">Range</p><ul><li><a href="products.html#white">Classics</a></li><li><a href="products.html#king">Specialty</a></li><li><a href="products.html#packaging">Packaging</a></li></ul></div>'
    + '<div><p class="fh">Company</p><ul><li><a href="farm.html">The farm</a></li><li><a href="quality.html">Quality</a></li><li><a href="customers.html">Who we supply</a></li></ul></div>'
    + '<div><p class="fh">Trade</p><ul><li><a href="panel.html">Customer login</a></li><li><a href="contact.html">Open an account</a></li><li><a href="contact.html">Contact</a></li></ul></div>'
    + '</div><div class="base"><span>© 2026 Bawn Growers Ltd</span><span class="tnum">Orders desk 01 234 5214</span></div><div class="demo"><span>Portfolio demo, not a real business.</span><span>Designed by Ufuk Karakuş</span></div></div></footer>';
  document.currentScript.insertAdjacentHTML('beforebegin', skip + header);
  // the footer is placed by a second blocking script right after </main>
  window.BawnLayout = { footer: function(){ document.currentScript.insertAdjacentHTML('beforebegin', footer); } };
  // every page opens at the very top, unless the link points at a real section (e.g. #packaging)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('load', function(){
    var h = location.hash.slice(1);
    if (!h || !document.getElementById(h)) window.scrollTo(0, 0);
  });
})();
