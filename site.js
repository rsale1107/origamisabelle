/* Origamisabelle — scripts communs à toutes les pages — v1.9 (13 nov. 2026) */
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

  /* ---- formulaire de contact : envoi direct à EMAIL (service gratuit FormSubmit, sans compte).
     Au tout premier message, FormSubmit envoie un e-mail d'activation à EMAIL : cliquer une fois sur
     le lien reçu. La messagerie du visiteur ne s'ouvre jamais. L'envoi ne fonctionne que sur le site
     publié (pas dans l'aperçu de l'éditeur). ---- */
  var f = document.getElementById('contactForm');
  if (f) {
    var sent = document.getElementById('sent'), err = document.getElementById('err'), btn = f.querySelector('button[type="submit"]');
    var val = function (id) { return document.getElementById(id).value.trim(); };
    var showErr = function (t) { err.textContent = t; err.hidden = false; };
    var enLigne = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    var echec = function () {
      err.innerHTML = "Le message n'a pas pu être envoyé. Écrivez directement à <a href=\"mailto:" + EMAIL + "\" style=\"color:inherit\">" + EMAIL + '</a>.';
      err.hidden = false;
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = ['prenom', 'nom', 'email', 'message'].every(function (id) { return val(id) !== ''; });
      if (!ok || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) { showErr('Merci de remplir tous les champs, avec un e-mail valide.'); return; }
      err.hidden = true;
      var objet = document.getElementById('objet').value;
      if (!enLigne) { showErr("Aperçu : l'envoi ne fonctionne que sur le site publié. Aucun message n'a été envoyé."); return; }
      if (!window.fetch) { echec(); return; }
      btn.disabled = true; var lib = btn.textContent; btn.textContent = 'Envoi en cours…';
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: objet + ' – site Origamisabelle',
          _replyto: val('email'), _template: 'table', _captcha: 'false',
          'Prénom': val('prenom'), 'Nom': val('nom'), 'E-mail': val('email'), 'Demande': objet, 'Message': val('message')
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && String(j.success) !== 'false'; }); })
        .then(function (envoye) {
          btn.disabled = false; btn.textContent = lib;
          if (envoye) { f.hidden = true; sent.hidden = false; sent.setAttribute('tabindex', '-1'); sent.focus(); }
          else echec();
        })
        .catch(function () { btn.disabled = false; btn.textContent = lib; echec(); });
    });
  }

  /* ---- arrivée depuis « Demander un devis » ou « atelier » : choisir l'objet et montrer le formulaire ---- */
  var cf = document.getElementById('contactForm');
  if (cf) {
    var pick = function () {
      var h = location.hash.replace('#', ''), sel = document.getElementById('objet');
      if (!sel || (h !== 'devis' && h !== 'atelier')) return;
      [].forEach.call(sel.options, function (o, i) { if (o.text.toLowerCase().indexOf(h) >= 0) sel.selectedIndex = i; });
      cf.scrollIntoView({block: 'start'});
      var first = document.getElementById('prenom'); if (first) setTimeout(function () { first.focus({preventScroll: true}); }, 300);
    };
    pick(); window.addEventListener('hashchange', pick);
  }
})();
