/* yapida.sch.id — beranda Portal Siswa: doa sebelum belajar diperdengarkan (Arab lalu artinya), cincin kemajuan
   beranimasi saat terlihat. Tanpa pustaka; menghormati prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document;
  var tenang = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.querySelectorAll('[data-ucap-ar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var S = window.YapidaSuara, ss = window.speechSynthesis;
      if (!S || !S.tersedia || !ss) { b.textContent = 'Suara belum didukung perangkat ini'; return; }
      window.dispatchEvent(new Event('yp:audio-lain'));
      S.siap(function () {
        ss.cancel();
        var bagian = [{ t: b.getAttribute('data-ucap-ar'), l: 'ar' }, { t: b.getAttribute('data-ucap-id'), l: 'id' }];
        var i = 0;
        var lanjut = function () {
          if (i >= bagian.length) { b.classList.remove('main'); return; }
          var p = bagian[i++], u = new SpeechSynthesisUtterance(p.t), v = S.pilihSuara(p.l, 'anak');
          u.lang = v ? v.lang : S.langUcap[p.l]; if (v) u.voice = v;
          u.rate = p.l === 'ar' ? 0.82 : 0.95; u.pitch = 1.15;
          u.onend = lanjut; u.onerror = function () { b.classList.remove('main'); };
          ss.speak(u);
        };
        b.classList.add('main');
        lanjut();
      });
    });
  });
  var cincin = d.querySelector('.sw-cincin-isi');
  if (cincin && !tenang && 'IntersectionObserver' in window) {
    var akhir = cincin.style.strokeDashoffset, penuh = cincin.style.strokeDasharray;
    cincin.style.strokeDashoffset = penuh;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(function () { cincin.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)'; cincin.style.strokeDashoffset = akhir; });
    });
    io.observe(cincin);
  }
})();
