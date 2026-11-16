/* =========================================================
   サイト共通スクリプト
   - スマホメニュー / スクロールで現れる動き / タブの切り替え
   - フォーム（入力 → 確認 → 送信 → 完了）
   送信先は assets/js/config.js の formEndpoint で設定します。
   ========================================================= */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};
  var KEY = 'site-form-draft';

  /* ---------- スマホメニュー ---------- */
  var hb = document.querySelector('.hamburger');
  var menu = document.querySelector('.sp-menu');
  if (hb && menu) {
    hb.setAttribute('aria-expanded', 'false');
    hb.setAttribute('aria-controls', 'sp-menu');
    menu.id = 'sp-menu';
    hb.addEventListener('click', function () {
      var open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      hb.classList.toggle('open', open);
      hb.setAttribute('aria-expanded', String(open));
      hb.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
  }

  /* ---------- タブ（見た目の切り替え） ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.tabs span');
    if (!t) return;
    var all = t.parentNode.querySelectorAll('span');
    for (var i = 0; i < all.length; i++) all[i].classList.toggle('on', all[i] === t);
  });

  /* ---------- スクロールで現れる動き ---------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var targets = document.querySelectorAll('main .sec-head, main .card, main .banner, main .matrix, main .tiers, main .steps, main .timeline, main .stat, main .box, main .tbl-wrap');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    for (var r = 0; r < targets.length; r++) { targets[r].classList.add('rv'); io.observe(targets[r]); }
  }

  /* ---------- フォーム共通 ---------- */
  function send(fd) {
    if (!CFG.formEndpoint) {
      /* 送信先が未設定のときは送信せずに完了画面へ進む（公開前に必ず設定してください） */
      if (window.console) console.warn('SITE_CONFIG.formEndpoint が未設定のため、送信は行われていません。');
      return Promise.resolve();
    }
    return fetch(CFG.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); });
  }
  function showError(el, msg) {
    if (!el) { alert(msg); return; }
    el.textContent = msg;
    el.hidden = false;
  }
  function busy(btn, on) {
    if (!btn) return;
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
    btn.disabled = !!on;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function store(v) {
    try {
      if (v === undefined) return JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (v === null) sessionStorage.removeItem(KEY); else sessionStorage.setItem(KEY, JSON.stringify(v));
    } catch (e) { return null; }
    return null;
  }
  function readFile(file) {
    return new Promise(function (ok, ng) {
      var fr = new FileReader();
      fr.onload = function () { ok({ name: file.name, type: file.type, data: fr.result }); };
      fr.onerror = ng;
      fr.readAsDataURL(file);
    });
  }
  function dataURLtoBlob(d) {
    var p = d.split(','), bin = atob(p[1]), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: p[0].replace(/^data:|;base64$/g, '') });
  }
  var MAX = 3 * 1024 * 1024;

  /* ファイル名の表示 */
  document.addEventListener('change', function (e) {
    var f = e.target;
    if (f.type !== 'file') return;
    var lab = f.parentNode.querySelector('[data-file-label]');
    if (!lab) return;
    if (!lab.dataset.def) lab.dataset.def = lab.textContent;
    var file = f.files && f.files[0];
    if (file && file.size > MAX) { alert('ファイルは3MBまでです。'); f.value = ''; file = null; }
    lab.textContent = file ? '選択中：' + file.name : lab.dataset.def;
  });

  var forms = document.querySelectorAll('form[data-form]');
  Array.prototype.forEach.call(forms, function (form) {
    var err = form.querySelector('.form-error');
    var btn = form.querySelector('button[type="submit"]');

    /* 確認画面から戻ってきたときは入力内容を復元 */
    var draft = store();
    if (draft && draft.back === location.pathname) {
      draft.fields.forEach(function (f) {
        var els = form.elements[f[0]];
        if (!els) return;
        if (els.length !== undefined && !els.tagName) {
          Array.prototype.forEach.call(els, function (el) {
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = f[1].split('、').indexOf(el.value) > -1;
          });
        } else if (els.type === 'checkbox' || els.type === 'radio') {
          els.checked = f[1].split('、').indexOf(els.value) > -1;
        } else if (els.type !== 'file' && els.type !== 'hidden') {
          els.value = f[1];
        }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) err.hidden = true;
      var ok = true;
      Array.prototype.forEach.call(form.querySelectorAll('[data-required-group]'), function (g) {
        var hit = g.querySelector('input:checked');
        g.closest('.field').classList.toggle('is-error', !hit);
        if (!hit) ok = false;
      });
      if (!form.checkValidity() || !ok) {
        form.reportValidity();
        showError(err, '未入力・未選択の必須項目があります。');
        return;
      }
      var fd = new FormData(form);
      if (form.dataset.confirm) {
        /* 確認画面へ：入力内容を一時保存 */
        var fields = [], seen = {}, file = null;
        Array.prototype.forEach.call(form.elements, function (el) {
          if (!el.name || el.disabled || el.type === 'submit') return;
          if (el.type === 'file') { if (el.files[0]) file = el.files[0]; return; }
          if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
          if (seen[el.name] !== undefined) { fields[seen[el.name]][1] += '、' + el.value; return; }
          seen[el.name] = fields.length;
          fields.push([el.name, el.value]);
        });
        var save = function (f) {
          store({ kind: form.dataset.form, back: location.pathname, fields: fields, file: f || null });
          location.href = form.dataset.next;
        };
        if (file) readFile(file).then(save, function () { save(null); }); else save(null);
        return;
      }
      busy(btn, true);
      send(fd).then(function () {
        location.href = form.dataset.next;
      }, function () {
        busy(btn, false);
        showError(err, '送信できませんでした。時間をおいて再度お試しください。');
      });
    });
  });

  /* ---------- 確認画面 ---------- */
  var table = document.querySelector('[data-confirm-table]');
  if (table) {
    var d = store();
    var sendBtn = document.querySelector('[data-confirm-send]');
    var back = document.querySelector('[data-confirm-back]');
    var cerr = document.querySelector('.form-error');
    if (!d) {
      table.innerHTML = '<tr><td>入力内容が見つかりませんでした。お手数ですが、もう一度フォームからご入力ください。</td></tr>';
      if (sendBtn) sendBtn.style.display = 'none';
    } else {
      var rows = d.fields.filter(function (f) { return f[0] !== 'フォーム種別'; }).map(function (f) {
        return '<tr><th>' + esc(f[0]) + '</th><td>' + (esc(f[1]) || '―') + '</td></tr>';
      });
      if (d.file) rows.push('<tr><th>添付ファイル</th><td>' + esc(d.file.name) + '</td></tr>');
      table.innerHTML = '<tr><th>お問い合わせ種別</th><td>' + esc(d.kind) + '</td></tr>' + rows.join('');
      if (back) back.setAttribute('href', d.back);
      if (sendBtn) {
        sendBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var href = sendBtn.getAttribute('href');
          var fd = new FormData();
          d.fields.forEach(function (f) { fd.append(f[0], f[1]); });
          if (d.file) fd.append('添付ファイル', dataURLtoBlob(d.file.data), d.file.name);
          busy(sendBtn, true);
          send(fd).then(function () {
            store(null);
            location.href = href;
          }, function () {
            busy(sendBtn, false);
            showError(cerr, '送信できませんでした。時間をおいて再度お試しください。');
          });
        });
      }
    }
  }
})();
