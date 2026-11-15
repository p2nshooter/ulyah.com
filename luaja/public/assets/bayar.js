/* LUAJA — paket (total per mata uang) dan tombol PayPal pada tagihan. Kredensial rahasia tidak pernah ada di peramban:
 * order dibuat dan pembayaran ditangkap oleh server. */
(function () {
  'use strict';
  var d = document;
  var fmt = function (v, cur) {
    if (cur === 'USD') return 'US$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (cur === 'JPY') return '¥' + Math.round(v).toLocaleString('ja-JP');
    return 'Rp' + Math.round(v).toLocaleString('id-ID');
  };

  /* paket: total mengikuti bahasa, kategori dan mata uang */
  var f = d.querySelector('[data-buy]');
  if (f) {
    var paint = function () {
      var n = f.querySelectorAll('input[name=bahasa]:checked').length;
      var cur = (f.querySelector('input[name=mata_uang]:checked') || {}).value || 'IDR';
      f.querySelectorAll('input[name=kategori]').forEach(function (r) {
        var lbl = f.querySelector('[data-tier-price="' + r.value + '"]');
        if (lbl) lbl.textContent = fmt(r.getAttribute('data-one-' + cur), cur) + '/bahasa · ' + fmt(r.getAttribute('data-three-' + cur), cur) + ' tiga bahasa';
      });
      var sel = f.querySelector('input[name=kategori]:checked');
      var one = Number(sel.getAttribute('data-one-' + cur)), three = Number(sel.getAttribute('data-three-' + cur));
      f.querySelector('[data-total]').textContent = fmt(n >= 3 ? three : one * n, cur);
    };
    f.addEventListener('change', paint); paint();
  }

  /* tagihan: PayPal Smart Buttons */
  var box = d.querySelector('[data-paypal]');
  if (box) {
    var inv = box.getAttribute('data-paypal'), msg = box.querySelector('[data-paypal-msg]');
    var say = function (t) { msg.textContent = t; };
    var s = d.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(box.getAttribute('data-client')) + '&currency=' + encodeURIComponent(box.getAttribute('data-currency')) + '&intent=capture&components=buttons';
    s.onerror = function () { say('PayPal tidak dapat dimuat. Periksa koneksi atau gunakan transfer bank.'); };
    s.onload = function () {
      window.paypal.Buttons({
        style: { layout: 'vertical', shape: 'pill', label: 'pay' },
        createOrder: function () {
          return fetch('/api/paypal/order/' + encodeURIComponent(inv), { method: 'POST' }).then(function (r) { return r.json(); }).then(function (j) { if (!j.id) throw new Error(j.error || 'Order gagal dibuat'); return j.id; });
        },
        onApprove: function (data) {
          say('Memproses pembayaran…');
          return fetch('/api/paypal/capture/' + encodeURIComponent(inv), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderId: data.orderID }) })
            .then(function (r) { return r.json(); })
            .then(function (j) { if (!j.ok) throw new Error(j.error || 'Pembayaran belum selesai'); say('Pembayaran berhasil — langganan aktif.'); location.reload(); });
        },
        onCancel: function () { say('Pembayaran dibatalkan.'); },
        onError: function (err) { say((err && err.message) || 'Terjadi kesalahan PayPal. Coba lagi.'); },
      }).render(box.querySelector('[data-paypal-buttons]'));
    };
    d.head.appendChild(s);
  }
})();
