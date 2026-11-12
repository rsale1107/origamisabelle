(function () {
  'use strict';
  var EMAIL = 'origamisabelle@gmail.com';

  /* ---- menu mobile ---- */
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
  }

  /* ---- photos : si la version réduite ne répond pas, on prend l'original ---- */
  [].forEach.call(document.querySelectorAll('img[data-orig]'), function (img) {
    img.addEventListener('error', function () {
      var o = img.getAttribute('data-orig');
      if (o && img.src !== o) img.src = o;
    });
  });

  /* ---- filtres de la galerie ---- */
  var chips = document.querySelectorAll('.chip[data-f]');
  [].forEach.call(chips, function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      [].forEach.call(chips, function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      [].forEach.call(document.querySelectorAll('.gi'), function (g) {
        var cat = g.getAttribute('data-cat');
        g.hidden = !(f === 'all' || cat === f || (f === 'art' && cat === 'expo'));
      });
    });
  });

  /* ---- visionneuse ---- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), list = [], idx = 0, last = null;
    function visible() { return [].filter.call(document.querySelectorAll('.gbtn'), function (b) { return !b.closest('[hidden]'); }); }
    function show(i) {
      idx = (i + list.length) % list.length;
      var b = list[idx];
      lbImg.onerror = function () { var o = b.getAttribute('data-orig'); if (o && lbImg.src !== o) lbImg.src = o; };
      lbImg.src = b.getAttribute('data-full');
      lbImg.alt = (b.querySelector('img') || {}).alt || '';
      lbCap.textContent = (b.getAttribute('data-cap') || '') + '  ·  ' + (idx + 1) + ' / ' + list.length;
    }
    function open(b) { list = visible(); last = b; lb.hidden = false; document.body.style.overflow = 'hidden'; show(list.indexOf(b)); lb.querySelector('.lb-close').focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ''; lbImg.src = ''; if (last) last.focus(); }
    document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.gbtn'); if (b) open(b); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, {passive: true});
    lb.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ---- copier l'adresse ---- */
  [].forEach.call(document.querySelectorAll('[data-copy]'), function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy'), lbl = b.textContent;
      var done = function () { b.textContent = 'Adresse copiée'; setTimeout(function () { b.textContent = lbl; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {});
    });
  });

  /* ---- formulaire : prépare l'e-mail dans la messagerie du visiteur ---- */
  var f = document.getElementById('contactForm');
  if (f) {
    var sent = document.getElementById('sent'), err = document.getElementById('err');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (id) { return document.getElementById(id).value.trim(); };
      var ok = ['prenom', 'nom', 'email', 'message'].every(function (id) { return val(id) !== ''; });
      if (!ok || val('email').indexOf('@') < 1) { err.hidden = false; return; }
      err.hidden = true;
      var objet = document.getElementById('objet').value;
      var corps = val('message') + '\n\n' + val('prenom') + ' ' + val('nom') + '\n' + val('email');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(objet + ' – site Origamisabelle') + '&body=' + encodeURIComponent(corps);
      f.hidden = true; sent.hidden = false;
    });
  }
})();
