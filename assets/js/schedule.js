/* Backward schedule: from the day the mushrooms must be on shelf, count back to the order cutoff.
   All Date values are wall-clock Dublin time stored in UTC fields (see data.js). */
(function(root){
  var HOLIDAYS = ['2026-10-26','2026-12-25','2026-12-26','2027-01-01'];   // customer DC closed (Sundays are closed too)
  var DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var pad = function(n){ return String(n).padStart(2,'0'); };

  function key(d){ return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate()); }
  function at(d, h, m){ return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m||0)); }
  function addDays(d, n){ return new Date(d.getTime() + n*864e5); }
  function addHours(d, h){ return new Date(d.getTime() + h*36e5); }
  function dayStart(y, m, d){ return new Date(Date.UTC(y, m, d)); }
  function isClosed(d){ return d.getUTCDay() === 0 || HOLIDAYS.indexOf(key(d)) >= 0; }
  function dayName(d){ return DN[d.getUTCDay()]+' '+d.getUTCDate()+' '+MN[d.getUTCMonth()]; }                 // "Thu 29 Oct"
  function fmt(d){ return dayName(d)+' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes()); }                      // "Thu 29 Oct 08:00"

  // plan(shelfDay, now) → every step time, the closed days that forced a move, and whether the cutoff is still ahead
  function plan(shelfDay, now){
    var shelf = at(shelfDay, 8, 0);                              // on shelf 08:00
    var dc = at(addDays(shelfDay, -1), 4, 30), skipped = [];     // at the customer's DC 04:30 the day before …
    while (isClosed(dc)) { skipped.push(new Date(dc.getTime())); dc = addDays(dc, -1); }   // … or the last open day before that
    var dispatch = addHours(dc, -6.5), pack = addHours(dispatch, -9);
    var harvest = at(pack, 5, 0);                                // picked at 05:00 on the packing day
    var cutoff = at(addDays(harvest, -1), 14, 0);                // order in by 14:00 the day before
    skipped.reverse();
    return {shelf: shelf, dc: dc, dispatch: dispatch, pack: pack, harvest: harvest, cutoff: cutoff, skipped: skipped, ok: cutoff.getTime() > now.getTime()};
  }
  // six rows, earliest first. width = share of the way from the cutoff to the shelf, at least 6 %
  function steps(pl){
    var span = pl.shelf - pl.cutoff;
    return [['Order cutoff', pl.cutoff, 'Your order in'], ['Harvest', pl.harvest, 'Picked from the rooms'], ['Packed', pl.pack, 'Chilled to 2 °C'],
            ['Dispatched', pl.dispatch, 'Leaves Bawn'], ['At your DC', pl.dc, 'Receiving window'], ['On shelf', pl.shelf, 'In your stores']]
      .map(function(r){ return {label: r[0], at: r[1], sub: r[2], width: Math.max(6, (pl.shelf - r[1]) / span * 100)}; });
  }
  function list(days){ var n = days.map(dayName); return n.length > 1 ? n.slice(0, -1).join(', ')+' and '+n[n.length-1] : n[0]; }
  // "Your DC is closed on Sun 1 Nov, so delivery moves a day earlier."
  function closedNote(pl){
    if (!pl.skipped.length) return '';
    return 'Your DC is closed on '+list(pl.skipped)+', so delivery moves '+(pl.skipped.length === 1 ? 'a day' : pl.skipped.length+' days')+' earlier.';
  }

  var api = {HOLIDAYS: HOLIDAYS, key: key, at: at, addDays: addDays, dayStart: dayStart, isClosed: isClosed, dayName: dayName, fmt: fmt, plan: plan, steps: steps, closedNote: closedNote, list: list};
  if (root.Bawn) root.Bawn.schedule = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
