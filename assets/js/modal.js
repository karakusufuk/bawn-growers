/* "Concept site" modal: opened by the final action buttons (nothing is ever sent anywhere).
   Closes with Close, Esc, or a click on the backdrop. No timer. */
(function(){
  var box = null, opener = null;
  function close(){
    if (!box) return;
    document.removeEventListener('keydown', onKey, true);
    box.remove(); box = null;
    if (opener && opener.focus) opener.focus();
  }
  function onKey(e){
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab' || !box) return;
    var f = box.querySelectorAll('a[href],button'); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open(trigger, text){
    close(); opener = trigger || null;
    box = document.createElement('div'); box.className = 'modal-back';
    box.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">'
      + '<h2 id="modal-title">Concept site by Ufuk Karakuş</h2>'
      + '<p>In a live build, ' + text + '</p>'
      + '<div class="btns"><a class="btn dark" href="' + Bawn.CASE_STUDY_URL + '" target="_blank" rel="noopener">See how it works →</a>'
      + '<button class="btn line" type="button" data-close>Close</button></div></div>';
    box.addEventListener('click', function(e){ if (e.target === box || e.target.closest('[data-close]')) close(); });
    document.body.appendChild(box);
    document.addEventListener('keydown', onKey, true);
    box.querySelector('[data-close]').focus();
  }
  window.Bawn.modal = {open: open, close: close};
})();
