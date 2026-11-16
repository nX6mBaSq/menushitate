/* =========================================================
   ワイヤーフレーム共通スクリプト
   - 各ページの [data-wf="header|footer|cta|hero"] を共通パーツに置き換える
   - [data-to="P07"] のリンク先をページIDから解決する
   - 確認用ツールバー（PC/SP・注釈・公開フェーズ切替）を挿入する
   ========================================================= */
(function () {
  'use strict';

  var script = document.currentScript;
  var R = script.getAttribute('data-root') || '';

  /* ページID → [パス, ページ名, 親ページID] */
  var PAGES = {
    P01: ['01_集客・信頼形成/P01_top.html', 'トップ'],
    P02: ['01_集客・信頼形成/P02_about.html', '私たちについて'],
    P03: ['01_集客・信頼形成/P03_company.html', '会社概要', 'P02'],
    P04: ['01_集客・信頼形成/P04_method.html', 'メソッド解説'],
    P05: ['01_集客・信頼形成/P05_quality.html', '制作ポリシー'],
    P06: ['02_サービス・料金/P06_service.html', 'サービス一覧'],
    P07: ['02_サービス・料金/P07_menu-engineering.html', '戦略メニュー刷新', 'P06'],
    P08: ['02_サービス・料金/P08_hybrid-ui.html', 'ハイブリッドUI設計', 'P06'],
    P09: ['02_サービス・料金/P09_subscription.html', '月額伴走プラン', 'P06'],
    P10: ['02_サービス・料金/P10_growth.html', 'グロース顧問', 'P06'],
    P11: ['02_サービス・料金/P11_price.html', '料金プラン'],
    P12: ['03_実績・検討材料/P12_works.html', '導入事例'],
    P13: ['03_実績・検討材料/P13_works-detail.html', '事例詳細', 'P12'],
    P14: ['03_実績・検討材料/P14_flow.html', 'ご依頼の流れ'],
    P15: ['03_実績・検討材料/P15_faq.html', 'よくある質問'],
    P16: ['04_記事・情報発信/P16_column.html', 'コラム'],
    P17: ['04_記事・情報発信/P17_column-category.html', 'コラムカテゴリ', 'P16'],
    P18: ['04_記事・情報発信/P18_column-detail.html', 'コラム記事', 'P16'],
    P19: ['04_記事・情報発信/P19_news.html', 'お知らせ'],
    P20: ['04_記事・情報発信/P20_news-detail.html', 'お知らせ詳細', 'P19'],
    P21: ['05_コンバージョン/P21_download.html', '資料ダウンロード'],
    P22: ['05_コンバージョン/P22_download-thanks.html', '資料DL完了', 'P21'],
    P23: ['05_コンバージョン/P23_monitor.html', 'モニター店舗募集'],
    P24: ['05_コンバージョン/P24_contact.html', '無料相談・お問い合わせ'],
    P25: ['05_コンバージョン/P25_contact-confirm.html', '入力内容確認', 'P24'],
    P26: ['05_コンバージョン/P26_contact-thanks.html', '送信完了', 'P24'],
    P27: ['06_パートナー・採用/P27_partner.html', 'パートナー募集'],
    P28: ['06_パートナー・採用/P28_partner-contact.html', 'パートナー問い合わせ', 'P27'],
    P29: ['06_パートナー・採用/P29_recruit.html', 'デザイナー募集'],
    P30: ['07_規約・システム/P30_privacy.html', 'プライバシーポリシー'],
    P31: ['07_規約・システム/P31_terms.html', 'サイト利用規約'],
    P32: ['07_規約・システム/P32_404.html', '404']
  };

  function u(id) { return PAGES[id] ? R + PAGES[id][0] : '#'; }
  function a(id, label, cls) {
    return '<a href="' + u(id) + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + (label || PAGES[id][1]) + '</a>';
  }
  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { /* ストレージ不可の環境では保存しない */ }
    return null;
  }

  var html = document.documentElement;
  var body = document.body;
  var d = body.dataset;
  var state = {
    phase: store('wf-phase') || '1',
    view: store('wf-view') || (window.innerWidth < 760 ? 'sp' : 'pc'),
    notes: store('wf-notes') || 'on'
  };

  /* ---------- 共通パーツ ---------- */
  var T = {
    header: function () {
      return '<div class="wf-hdr"><header class="wf-header">' +
        '<a class="logo" href="' + u('P01') + '">LOGO</a>' +
        '<nav class="gnav">' +
          a('P04', 'メソッド') +
          '<div class="dd">' + a('P06', 'サービス ▾') +
            '<div class="dd-menu">' + a('P07') + a('P08') + a('P09') + a('P10') + '</div></div>' +
          a('P11', '料金') +
          a('P12', '導入事例', 'from-p2') +
          a('P23', 'モニター募集', 'only-p1') +
          a('P16', 'コラム', 'from-p2') +
        '</nav>' +
        '<div class="hdr-cta"><a class="btn sm" href="' + u('P21') + '">資料DL</a>' +
        '<a class="btn sm cv" href="' + u('P24') + '">無料相談する</a></div>' +
        '<button class="hamburger" type="button" aria-label="メニューを開く">≡</button>' +
      '</header>' +
      '<nav class="sp-menu">' +
        a('P04', 'メソッド') + a('P06', 'サービス') + a('P11', '料金') +
        a('P12', '導入事例', 'from-p2') + a('P23', 'モニター募集', 'only-p1') + a('P16', 'コラム', 'from-p2') +
        a('P14', 'ご依頼の流れ') + a('P15', 'よくある質問') + a('P02', '私たちについて') +
      '</nav></div>';
    },

    footer: function () {
      return '<footer class="wf-footer"><div class="grid g4">' +
        '<div><b>サービス</b>' + a('P07') + a('P08') + a('P09') + a('P10') + a('P11') + '</div>' +
        '<div><b>会社情報</b>' + a('P02') + a('P03') + a('P05') + a('P19', null, 'from-p2') + '</div>' +
        '<div><b>お役立ち</b>' + a('P16', null, 'from-p2') + a('P21') + a('P15') + a('P14') + '</div>' +
        '<div><b>募集</b>' + a('P23', null, 'only-p1') + a('P27', null, 'from-p2') + a('P29', null, 'from-p3') + '</div>' +
        '</div><div class="foot-bottom">' + a('P30') + a('P31') +
        '<span class="copy">© 20XX ○○○</span></div></footer>' +
        '<div class="sp-cta"><a class="btn" href="' + u('P21') + '">資料DL</a>' +
        '<a class="btn cv" href="' + u('P24') + '">無料相談</a></div>';
    },

    cta: function () {
      return '<section class="sec cta-sec"><span class="sec-label">共通CTA</span><div class="narrow">' +
        '<p class="eyebrow">CONTACT</p>' +
        '<h2 class="h2">そのメニュー、「利益を生む仕組み」に変えませんか？</h2>' +
        '<p class="lead">現在のメニューとPOSデータの状況をお聞かせください。オンラインで全国対応します。</p>' +
        '<div class="btns center"><a class="btn cv lg" href="' + u('P24') + '">無料相談する</a>' +
        '<a class="btn lg" href="' + u('P21') + '">資料をダウンロード</a></div>' +
        '<p class="monitor-link only-p1">▶ 立ち上げ記念 ' + a('P23', 'モニター店舗を募集中（3〜5店舗限定）') + '</p>' +
        '<div class="note">全ページ共通の締めCTA。メインは「無料相談」（赤）、すぐに相談しない層向けに「資料DL」（枠線）を並べる。Phase 1の間だけモニター募集への導線を表示。</div>' +
        '</div></section>';
    },

    hero: function (el) {
      var t = el.dataset;
      var id = d.id;
      var crumbs = [a('P01', 'TOP')];
      var parent = PAGES[id] && PAGES[id][2];
      if (parent) crumbs.push(a(parent));
      crumbs.push('<span>' + (t.crumb || (PAGES[id] ? PAGES[id][1] : '')) + '</span>');
      return '<section class="hero"><div class="crumb">' + crumbs.join(' ＞ ') + '</div>' +
        (t.en ? '<p class="eyebrow">' + t.en + '</p>' : '') +
        '<h1 class="h1">' + (t.title || '') + '</h1>' +
        (t.lead ? '<p class="lead" style="margin:0">' + t.lead + '</p>' : '') +
        '</section>';
    }
  };

  var slots = document.querySelectorAll('[data-wf]');
  for (var i = 0; i < slots.length; i++) {
    var fn = T[slots[i].getAttribute('data-wf')];
    if (fn) slots[i].outerHTML = fn(slots[i]);
  }
  var links = document.querySelectorAll('[data-to]');
  for (var j = 0; j < links.length; j++) links[j].setAttribute('href', u(links[j].getAttribute('data-to')));

  /* ---------- ツールバー・ページ情報 ---------- */
  if (d.id) {
    var name = PAGES[d.id] ? PAGES[d.id][1] : '';
    document.title = d.id + ' ' + name + '｜ワイヤーフレーム';

    var tb = document.createElement('div');
    tb.className = 'wf-toolbar';
    tb.innerHTML =
      '<a href="' + R + 'index.html">← 一覧</a>' +
      '<span class="t-title">' + d.id + ' ' + name + '<small>' + (d.url || '') + '</small></span>' +
      '<div class="t-grp"><span>表示</span><button data-set="view:pc">PC</button><button data-set="view:sp">SP</button></div>' +
      '<div class="t-grp"><span>注釈</span><button data-set="notes:on">ON</button><button data-set="notes:off">OFF</button></div>' +
      '<div class="t-grp"><span>公開フェーズ</span><button data-set="phase:1">1</button><button data-set="phase:2">2</button><button data-set="phase:3">3</button></div>';
    body.insertBefore(tb, body.firstChild);

    var info = document.createElement('dl');
    info.className = 'wf-info';
    var rows = [['役割', d.role], ['主CTA', d.cta], ['公開', d.pub]];
    var s = '';
    for (var k = 0; k < rows.length; k++) if (rows[k][1]) s += '<dt>' + rows[k][0] + '</dt><dd>' + rows[k][1] + '</dd>';
    info.innerHTML = s;
    if (s) body.insertBefore(info, tb.nextSibling);

    var setTb = function () { html.style.setProperty('--tb', tb.offsetHeight + 'px'); };
    setTb();
    window.addEventListener('resize', setTb);
  }

  function apply() {
    html.setAttribute('data-phase', state.phase);
    html.classList.toggle('sp', state.view === 'sp');
    html.classList.toggle('no-notes', state.notes === 'off');
    var bs = document.querySelectorAll('[data-set]');
    for (var n = 0; n < bs.length; n++) {
      var p = bs[n].getAttribute('data-set').split(':');
      bs[n].classList.toggle('on', state[p[0]] === p[1]);
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set]');
    if (b) {
      var p = b.getAttribute('data-set').split(':');
      state[p[0]] = p[1];
      store('wf-' + p[0], p[1]);
      apply();
      return;
    }
    if (e.target.closest('.hamburger')) {
      var m = document.querySelector('.sp-menu');
      if (m) m.classList.toggle('open');
    }
  });

  apply();
})();
