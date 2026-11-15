/* yapida.sch.id — halaman cetak: lembar A4 diskalakan agar pas di layar (dan di bingkai pratinjau portal), tombol cetak. */
(function () {
  'use strict';
  var d = document;
  var pratinjau = d.body.classList.contains('muat');
  function pas() {
    var lembar = d.querySelectorAll('.lembar');
    for (var i = 0; i < lembar.length; i += 1) {
      var l = lembar[i], w = l.offsetWidth, h = l.offsetHeight;
      if (!w || !h) continue;
      var sw = (window.innerWidth - (pratinjau ? 0 : 32)) / w, sh = (window.innerHeight - (pratinjau ? 0 : 96)) / h;
      var s = pratinjau ? Math.min(sw, sh) : Math.min(1, sw);
      l.style.transform = 'scale(' + s + ')';
      l.style.marginBottom = (h * (s - 1)) + 'px';
    }
  }
  function polos() {
    var lembar = d.querySelectorAll('.lembar');
    for (var i = 0; i < lembar.length; i += 1) { lembar[i].style.transform = ''; lembar[i].style.marginBottom = ''; }
  }
  pas();
  window.addEventListener('resize', pas);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(pas);
  window.addEventListener('beforeprint', polos);
  window.addEventListener('afterprint', pas);
  var tombol = d.querySelectorAll('[data-cetak]');
  for (var j = 0; j < tombol.length; j += 1) tombol[j].addEventListener('click', function () { polos(); window.print(); });
})();
