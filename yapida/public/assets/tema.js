/* Dipanggil di <head> sebelum halaman digambar: tema pilihan pembaca (atau tema perangkat) tanpa kedip. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var t = localStorage.getItem('yp-tema');
    if (!t && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) t = 'malam';
    if (t === 'malam') d.setAttribute('data-tema', 'malam');
  } catch (e) { /* penyimpanan diblokir: tema siang */ }
})();
