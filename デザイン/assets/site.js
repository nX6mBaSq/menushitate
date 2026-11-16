/* =========================================================
   デザイン共通スクリプト（v1.0）
   - [data-wf="header|footer|cta|hero"] を共通パーツに置き換える
   - [data-to="P07"] のリンク先をページIDから解決する
   - 画像枠 .ph を内容に応じたイラスト／写真枠に置き換える
   - .icon の文字ラベルを線画アイコンに置き換える
   - 確認用パネル（PC/SP・公開フェーズ・設計メモ）を表示する
   ========================================================= */
(function () {
  'use strict';

  var script = document.currentScript;
  var R = script.getAttribute('data-root') || '';

  /* ページID → [パス, ページ名, 親ページID, 説明] */
  var PAGES = {
    P01: ['01_集客・信頼形成/P01_top.html', 'トップ'],
    P02: ['01_集客・信頼形成/P02_about.html', '私たちについて'],
    P03: ['01_集客・信頼形成/P03_company.html', '会社概要', 'P02'],
    P04: ['01_集客・信頼形成/P04_method.html', 'メソッド解説'],
    P05: ['01_集客・信頼形成/P05_quality.html', '制作ポリシー'],
    P06: ['02_サービス・料金/P06_service.html', 'サービス一覧'],
    P07: ['02_サービス・料金/P07_menu-engineering.html', '戦略メニュー刷新', 'P06', 'POS分析×メニューエンジニアリング'],
    P08: ['02_サービス・料金/P08_hybrid-ui.html', 'ハイブリッドUI設計', 'P06', '紙メニュー×モバイルオーダー'],
    P09: ['02_サービス・料金/P09_subscription.html', '月額伴走プラン', 'P06', '季節メニュー・販促物を定額で'],
    P10: ['02_サービス・料金/P10_growth.html', 'グロース顧問', 'P06', 'POS分析・MEO・LINE運用'],
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
    return '<a href="' + u(id) + '" data-id="' + id + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + (label || PAGES[id][1]) + '</a>';
  }
  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { /* 保存できない環境では何もしない */ }
    return null;
  }

  var html = document.documentElement;
  var body = document.body;
  var d = body.dataset;
  var narrow = window.innerWidth < 760;
  var state = {
    phase: store('dv-phase') || '1',
    view: narrow ? 'sp' : (store('dv-view') || 'pc'),
    notes: store('dv-notes') || 'off'
  };
  /* URLパラメータでも切り替え可能（例：?view=sp&phase=2&notes=on） */
  (location.search.slice(1).split('&')).forEach(function (kv) {
    var pr = kv.split('=');
    if (pr[0] in state && pr[1]) state[pr[0]] = decodeURIComponent(pr[1]);
  });

  /* ---------- 色・アイコン ---------- */
  var C = {
    paper: '#f7f2e9', paper2: '#efe7d8', card: '#fffdf8', ink: '#1f1c17', ink2: '#5d564b', ink3: '#8e8578',
    line: '#ddd2bf', line2: '#c9bba3', cv: '#c8402a', cvSoft: '#f7e3da', gold: '#b8892e', goldSoft: '#f3e7cc', green: '#22302a'
  };
  var SERIF = "'Shippori Mincho B1',serif";
  var NUM = "Fraunces,Georgia,serif";
  var SANS = "'Zen Kaku Gothic New',sans-serif";

  function ico(p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  var ICONS = {
    up: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    mega: '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="2.5"/><path d="M3 7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7"/><path d="M9 16.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4c0-1.4-2.7-2.5-6-2.5"/>',
    pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h20M9 6c0-1 1-1.5 1-2.5M14 6c0-1 1-1.5 1-2.5"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 11v9h14v-9M10 20v-5h4v5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    band: '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 12h10"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    loop: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
    bars: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    hash: '<path d="M5 9h15M4 15h15M10 3L8 21M16 3l-2 18"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'
  };
  var ICON_MAP = {
    '値上げ': 'tag', 'MO': 'phone', '画面': 'phone', '販促': 'mega', 'POS': 'receipt', 'CSV': 'file',
    '写真': 'camera', '実写': 'camera', '原価': 'coins', '厨房': 'pot', '仲介': 'store', '営業': 'users',
    '多言語': 'globe', '帯': 'band', '画像': 'image', '表示': 'alert', '完了': 'check', 'LINE': 'chat',
    'MEO': 'pin', '一覧': 'list', '伴走': 'loop', '分析': 'bars', '制作': 'pen', '数字': 'up', '追加': 'plus'
  };

  /* ---------- 共通パーツ ---------- */
  var LOGO_MARK =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="11" fill="' + C.ink + '"/>' +
    '<path d="M11 28h18" stroke="' + C.line2 + '" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1.5 3"/>' +
    '<rect x="11" y="18" width="4" height="7" rx="1" fill="' + C.paper + '"/><rect x="18" y="14" width="4" height="11" rx="1" fill="' + C.paper + '"/>' +
    '<rect x="25" y="10" width="4" height="15" rx="1" fill="' + C.cv + '"/></svg>';
  function logo() {
    return '<a class="logo" href="' + u('P01') + '" aria-label="トップへ">' + LOGO_MARK +
      '<span class="lg-t"><b>Menu Logic</b><small>飲食店専門 メニュー戦略デザイン</small></span></a>';
  }

  var T = {
    header: function () {
      var dd = '';
      ['P07', 'P08', 'P09', 'P10'].forEach(function (id) {
        dd += '<a href="' + u(id) + '">' + PAGES[id][1] + '<small>' + PAGES[id][3] + '</small></a>';
      });
      return '<div class="s-hdr"><header class="s-header">' + logo() +
        '<nav class="gnav" aria-label="グローバルナビ">' +
          a('P04', 'メソッド') +
          '<div class="dd">' + a('P06', 'サービス ▾') + '<div class="dd-menu">' + dd + '</div></div>' +
          a('P11', '料金') +
          a('P12', '導入事例', 'from-p2') +
          a('P23', 'モニター募集', 'only-p1') +
          a('P16', 'コラム', 'from-p2') +
        '</nav>' +
        '<div class="hdr-cta"><a class="btn sm" href="' + u('P21') + '">資料DL</a>' +
        '<a class="btn sm cv" href="' + u('P24') + '">無料相談する</a></div>' +
        '<button class="hamburger" type="button" aria-label="メニューを開く"><i></i><i></i><i></i></button>' +
      '</header>' +
      '<nav class="sp-menu" aria-label="スマホメニュー">' +
        a('P04', 'メソッド') + a('P06', 'サービス') + a('P11', '料金') +
        a('P12', '導入事例', 'from-p2') + a('P23', 'モニター募集', 'only-p1') + a('P16', 'コラム', 'from-p2') +
        a('P14', 'ご依頼の流れ') + a('P15', 'よくある質問') + a('P02', '私たちについて') +
        '<div class="btns"><a class="btn cv block" href="' + u('P24') + '">無料相談する</a>' +
        '<a class="btn block" href="' + u('P21') + '">資料をダウンロード</a></div>' +
      '</nav></div>';
    },

    footer: function () {
      return '<footer class="s-footer"><div class="f-top"><div>' + logo() +
        '<p class="f-desc">POSデータと行動経済学で、客単価と粗利率を引き上げるメニューを設計します。料理写真は100%実写。オンラインで全国対応。</p></div>' +
        '<div class="grid g4">' +
        '<div><b>Service<small>サービス</small></b>' + a('P07') + a('P08') + a('P09') + a('P10') + a('P11') + '</div>' +
        '<div><b>Company<small>会社情報</small></b>' + a('P02') + a('P03') + a('P05') + a('P19', null, 'from-p2') + '</div>' +
        '<div><b>Resources<small>お役立ち</small></b>' + a('P16', null, 'from-p2') + a('P21') + a('P15') + a('P14') + '</div>' +
        '<div><b>Partners<small>募集</small></b>' + a('P23', null, 'only-p1') + a('P27', null, 'from-p2') + a('P29', null, 'from-p3') + '</div>' +
        '</div></div><div class="foot-bottom">' + a('P30') + a('P31') +
        '<span class="copy">© 20XX Menu Logic（仮）</span></div></footer>' +
        '<div class="sp-cta"><a class="btn" href="' + u('P21') + '">資料DL</a>' +
        '<a class="btn cv" href="' + u('P24') + '">無料相談する</a></div>';
    },

    cta: function () {
      return '<section class="sec cta-sec"><span class="sec-label">共通CTA</span><div class="narrow">' +
        '<p class="eyebrow c">Contact</p>' +
        '<h2 class="h2">そのメニュー、<br>「利益を生む仕組み」に変えませんか？</h2>' +
        '<p class="lead">現在のメニューとPOSデータの状況をお聞かせください。オンラインで全国対応します。</p>' +
        '<div class="btns center"><a class="btn cv lg" href="' + u('P24') + '">無料相談する</a>' +
        '<a class="btn lg" href="' + u('P21') + '">資料をダウンロード</a></div>' +
        '<ul class="cta-points"><li>相談は無料・30分ほど</li><li>オンラインで全国対応</li><li>無理な営業はしません</li></ul>' +
        '<p class="monitor-link only-p1"><span class="tag cv">募集中</span>立ち上げ記念 ' + a('P23', 'モニター店舗を募集中（3〜5店舗限定） →') + '</p>' +
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
      return '<section class="hero"><nav class="crumb" aria-label="パンくず">' + crumbs.join('<span aria-hidden="true">/</span>') + '</nav>' +
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

  /* パンくず区切りを統一 */
  var crumbsEl = document.querySelectorAll('.crumb');
  for (var cb = 0; cb < crumbsEl.length; cb++) crumbsEl[cb].innerHTML = crumbsEl[cb].innerHTML.replace(/\s*＞\s*/g, '<span aria-hidden="true">/</span>');

  /* 現在地のナビを強調 */
  if (d.id) {
    var cur = [d.id, PAGES[d.id] && PAGES[d.id][2]];
    var navs = document.querySelectorAll('.gnav a[data-id]');
    for (var n = 0; n < navs.length; n++) if (cur.indexOf(navs[n].getAttribute('data-id')) > -1) navs[n].classList.add('cur');
  }

  /* ---------- イラスト（画像枠の置き換え） ---------- */
  var uid = 0;
  function svg(vb, body, mode) {
    return '<svg class="art" viewBox="' + vb + '" preserveAspectRatio="xMidYMid ' + (mode || 'meet') + '" aria-hidden="true">' + body + '</svg>';
  }
  function txt(x, y, s, size, fill, font, anchor, weight, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill + '" font-family="' + (font || SANS) + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + (weight ? ' font-weight="' + weight + '"' : '') + (extra || '') + '>' + s + '</text>';
  }
  function rect(x, y, w, h, fill, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  /* 料理写真の代わりの色面（実写が入る場所） */
  function food(x, y, w, h, rx) {
    var id = 'f' + (++uid);
    return '<defs><radialGradient id="' + id + '" cx=".35" cy=".35" r=".9"><stop offset="0" stop-color="#e9b77a"/><stop offset=".45" stop-color="#9a5a32"/><stop offset="1" stop-color="#2e2018"/></radialGradient></defs>' +
      rect(x, y, w, h, 'url(#' + id + ')', rx) +
      '<ellipse cx="' + (x + w * .52) + '" cy="' + (y + h * .56) + '" rx="' + (w * .3) + '" ry="' + (h * .28) + '" fill="#f4ede1" opacity=".9"/>' +
      '<ellipse cx="' + (x + w * .52) + '" cy="' + (y + h * .54) + '" rx="' + (w * .19) + '" ry="' + (h * .17) + '" fill="#b5532f"/>' +
      '<ellipse cx="' + (x + w * .47) + '" cy="' + (y + h * .5) + '" rx="' + (w * .07) + '" ry="' + (h * .05) + '" fill="#e8a25c" opacity=".9"/>';
  }
  function leader(x1, x2, y) {
    return '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + C.line2 + '" stroke-width="1" stroke-dasharray="1 3"/>';
  }
  /* メニュー表（after=設計済み／before=全商品が同じ大きさ／sticker=値札シール） */
  function menuDoc(x, y, w, h, kind) {
    var s = rect(x, y, w, h, C.card, 6, ' stroke="' + C.line + '"');
    s += '<filter id="sh' + (++uid) + '"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity=".14"/></filter>';
    s = '<g filter="url(#sh' + uid + ')">' + s + '</g>';
    var cx = x + w / 2, pad = w * .09;
    s += txt(cx, y + h * .085, 'GRAND MENU', Math.max(9, w * .055), C.ink, NUM, 'middle', 700, ' letter-spacing="2"');
    s += '<line x1="' + (cx - w * .12) + '" x2="' + (cx + w * .12) + '" y1="' + (y + h * .11) + '" y2="' + (y + h * .11) + '" stroke="' + C.gold + '"/>';
    var i, ry, nameW;
    if (kind === 'after') {
      var fy = y + h * .14, fh = h * .3;
      s += food(x + pad, fy, w - pad * 2, fh, 4);
      s += '<circle cx="' + (x + w - pad - 2) + '" cy="' + (fy + 4) + '" r="' + (w * .07) + '" fill="' + C.cv + '"/>' +
        txt(x + w - pad - 2, fy + 4 + w * .022, '推し', w * .045, '#fff', SANS, 'middle', 700);
      s += txt(x + pad, fy + fh + h * .06, '名物 炭火つくね', w * .052, C.ink, SERIF, null, 700);
      s += txt(x + w - pad, fy + fh + h * .06, '¥980', w * .055, C.cv, NUM, 'end', 700);
      for (i = 0; i < 4; i++) {
        ry = fy + fh + h * .13 + i * h * .065;
        nameW = w * (.28 + (i % 3) * .06);
        s += rect(x + pad, ry - 5, nameW, 5, C.ink2, 2, ' opacity=".55"') + leader(x + pad + nameW + 4, x + w - pad - w * .16, ry - 2) +
          txt(x + w - pad, ry, ['¥680', '¥780', '¥580', '¥880'][i], w * .042, C.ink2, NUM, 'end', 500);
      }
      var ty = y + h * .82, tw = (w - pad * 2 - 8) / 3;
      for (i = 0; i < 3; i++) {
        var mid = i === 1;
        s += rect(x + pad + i * (tw + 4), ty - (mid ? 6 : 0), tw, h * .11 + (mid ? 6 : 0), mid ? C.ink : C.paper2, 3);
        s += txt(x + pad + i * (tw + 4) + tw / 2, ty + h * .07, ['梅', '竹', '松'][i], w * .045, mid ? '#fff' : C.ink2, SERIF, 'middle', 700);
      }
    } else {
      for (i = 0; i < 11; i++) {
        ry = y + h * .2 + i * h * .068;
        nameW = w * (.3 + (i * 7 % 4) * .05);
        s += rect(x + pad, ry - 5, nameW, 5, C.ink3, 2, ' opacity=".5"') +
          txt(x + w - pad, ry, '¥' + (580 + (i * 37 % 5) * 100), w * .042, C.ink3, NUM, 'end', 500);
        if (kind === 'sticker') s += rect(x + w - pad - w * .17, ry - 9, w * .19, 12, '#f2d16b', 1, ' opacity=".92" transform="rotate(' + ((i % 3) - 1) * 3 + ' ' + (x + w - pad) + ' ' + ry + ')"');
      }
    }
    return s;
  }
  function phoneDoc(x, y, w, h) {
    var s = '<filter id="sh' + (++uid) + '"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-opacity=".22"/></filter>' +
      '<g filter="url(#sh' + uid + ')">' + rect(x, y, w, h, '#1d1a16', w * .16) + '</g>' +
      rect(x + w * .05, y + w * .05, w * .9, h - w * .1, C.card, w * .12);
    var ix = x + w * .11, iw = w * .78;
    s += rect(x + w * .38, y + w * .08, w * .24, w * .05, '#1d1a16', 3);
    s += food(ix, y + h * .1, iw, h * .26, 6);
    s += rect(ix + 4, y + h * .1 + 4, w * .3, w * .1, C.cv, 3) + txt(ix + 4 + w * .15, y + h * .1 + 4 + w * .075, '人気No.1', w * .06, '#fff', SANS, 'middle', 700);
    for (var i = 0; i < 4; i++) {
      var ry = y + h * .41 + i * h * .1;
      s += food(ix, ry, w * .18, w * .18, 4) + rect(ix + w * .24, ry + 3, w * .3, 4, C.ink2, 2, ' opacity=".6"') +
        txt(ix + w * .24, ry + w * .16, '¥' + (680 + i * 100), w * .065, C.ink2, NUM, null, 700) +
        '<circle cx="' + (ix + iw - w * .06) + '" cy="' + (ry + w * .09) + '" r="' + (w * .055) + '" fill="' + (i === 1 ? C.cv : C.paper2) + '"/>' +
        txt(ix + iw - w * .06, ry + w * .115, '+', w * .07, i === 1 ? '#fff' : C.ink2, SANS, 'middle', 700);
    }
    s += rect(ix, y + h * .82, iw, h * .08, C.cv, h * .04) + txt(x + w / 2, y + h * .872, '＋150円でデザートセット', w * .055, '#fff', SANS, 'middle', 700);
    return s;
  }
  function matrixDoc(x, y, w, h, small) {
    var gx = x + w * .12, gy = y + h * .08, gw = w * .82, gh = h * .74, s = '';
    s += rect(gx, gy, gw / 2 - 2, gh / 2 - 2, C.card, 4) + rect(gx + gw / 2 + 2, gy, gw / 2 - 2, gh / 2 - 2, C.cv, 4) +
      rect(gx, gy + gh / 2 + 2, gw / 2 - 2, gh / 2 - 2, C.card, 4) + rect(gx + gw / 2 + 2, gy + gh / 2 + 2, gw / 2 - 2, gh / 2 - 2, C.card, 4);
    var fs = Math.max(9, w * .04);
    s += txt(gx + 10, gy + fs + 6, 'パズル', fs, C.ink, SERIF, null, 700) + txt(gx + gw / 2 + 12, gy + fs + 6, 'スター', fs, '#fff', SERIF, null, 700) +
      txt(gx + 10, gy + gh / 2 + fs + 8, 'ドッグ', fs, C.ink, SERIF, null, 700) + txt(gx + gw / 2 + 12, gy + gh / 2 + fs + 8, 'プラウホース', fs, C.ink, SERIF, null, 700);
    var pts = [[.15, .3, 0], [.3, .22, 0], [.62, .12, 1], [.75, .3, 1], [.86, .2, 1], [.68, .4, 1], [.2, .7, 0], [.35, .85, 0], [.6, .66, 0], [.82, .8, 0], [.92, .62, 0], [.7, .9, 0]];
    pts.forEach(function (p) {
      s += '<circle cx="' + (gx + gw * p[0]) + '" cy="' + (gy + gh * (p[1] * .9 + .08)) + '" r="' + (small ? 3 : 4.5) + '" fill="' + (p[2] ? '#fff' : C.gold) + '"' + (p[2] ? '' : ' opacity=".8"') + '/>';
    });
    s += txt(gx + gw / 2, y + h * .96, '人気度 →', fs * .85, C.ink3, SANS, 'middle') +
      txt(x + w * .05, gy + gh / 2, '利益率 →', fs * .85, C.ink3, SANS, 'middle', null, ' transform="rotate(-90 ' + (x + w * .05) + ' ' + (gy + gh / 2) + ')"');
    return s;
  }
  function chartDoc(x, y, w, h, opt) {
    var s = rect(x, y, w, h, C.card, 8, ' stroke="' + C.line + '"');
    var px = x + w * .08, py = y + h * .2, pw = w * .86, ph = h * .62, i;
    s += txt(px, y + h * .11, (opt && opt.title) || '客単価の推移', Math.max(9, w * .032), C.ink, SANS, null, 700);
    s += txt(x + w - w * .06, y + h * .11, '+12.4%', Math.max(10, w * .045), C.cv, NUM, 'end', 700);
    for (i = 0; i <= 3; i++) s += '<line x1="' + px + '" x2="' + (px + pw) + '" y1="' + (py + ph * i / 3) + '" y2="' + (py + ph * i / 3) + '" stroke="' + C.line + '" stroke-width=".8"/>';
    var bars = [.35, .4, .38, .42, .55, .62, .66, .7, .74, .78, .8, .86];
    var bw = pw / bars.length;
    bars.forEach(function (b, k) { s += rect(px + k * bw + bw * .22, py + ph * (1 - b * .8), bw * .56, ph * b * .8, k >= 4 ? C.goldSoft : C.paper2, 2); });
    var line = [.42, .44, .4, .45, .58, .64, .66, .72, .74, .79, .82, .88];
    var d2 = line.map(function (v, k) { return (k ? 'L' : 'M') + (px + k * bw + bw / 2).toFixed(1) + ' ' + (py + ph * (1 - v)).toFixed(1); }).join(' ');
    s += '<line x1="' + (px + bw * 4) + '" x2="' + (px + bw * 4) + '" y1="' + (py - 6) + '" y2="' + (py + ph) + '" stroke="' + C.ink3 + '" stroke-dasharray="3 3"/>' +
      txt(px + bw * 4 + 4, py - 2, '改定', Math.max(8, w * .026), C.ink3);
    s += '<path d="' + d2 + '" fill="none" stroke="' + C.cv + '" stroke-width="2.2" stroke-linejoin="round"/>';
    line.forEach(function (v, k) { if (k === 11) s += '<circle cx="' + (px + k * bw + bw / 2) + '" cy="' + (py + ph * (1 - v)) + '" r="4" fill="' + C.cv + '"/>'; });
    for (i = 0; i < 12; i += 2) s += txt(px + i * bw + bw / 2, py + ph + h * .09, (i + 1) + '月', Math.max(7, w * .022), C.ink3, SANS, 'middle');
    return s;
  }
  function calDoc(x, y, w, h) {
    var s = '', cw = w / 12, ev = { 1: '新年会', 3: '歓送迎会', 6: '夏メニュー', 8: '秋の味覚', 10: '忘年会', 11: '年末' };
    for (var i = 0; i < 12; i++) {
      s += rect(x + i * cw + 1.5, y, cw - 3, h, C.card, 4);
      s += txt(x + i * cw + cw / 2, y + h * .16, i + 1, Math.max(9, cw * .4), C.ink, NUM, 'middle', 700);
      if (ev[i]) {
        s += rect(x + (i - 1 >= 0 ? i - 1 : i) * cw + 4, y + h * .58, cw * 2 - 8, h * .14, C.cvSoft, 3) +
          rect(x + i * cw + 3, y + h * .3, cw - 6, h * .2, C.cv, 3);
      }
    }
    s += txt(x, y + h + 16, '■ 提案（2〜3ヶ月前）', 10, C.cv) + txt(x + 130, y + h + 16, '■ 販促実施', 10, C.ink3);
    return s;
  }
  function coverDoc(x, y, w, h, n) {
    var cols = [C.green, C.cv, C.ink, '#6b4a2f'], col = cols[(n || 0) % cols.length];
    var s = '<filter id="sh' + (++uid) + '"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".2"/></filter>' +
      '<g filter="url(#sh' + uid + ')">' + rect(x, y, w, h, col, 4) + '</g>';
    s += rect(x, y + h * .64, w, h * .36, 'rgba(255,255,255,.08)');
    s += txt(x + w * .12, y + h * .2, 'GUIDE', w * .1, '#e3c27c', NUM, null, 500, ' font-style="italic" letter-spacing="1"');
    s += rect(x + w * .12, y + h * .28, w * .7, h * .04, '#fff', 2, ' opacity=".9"') + rect(x + w * .12, y + h * .36, w * .5, h * .04, '#fff', 2, ' opacity=".9"');
    s += '<line x1="' + (x + w * .12) + '" x2="' + (x + w * .32) + '" y1="' + (y + h * .48) + '" y2="' + (y + h * .48) + '" stroke="#e3c27c" stroke-width="1.5"/>';
    for (var i = 0; i < 3; i++) s += rect(x + w * .12, y + h * (.72 + i * .07), w * (.6 - i * .12), h * .025, '#fff', 1, ' opacity=".35"');
    return s;
  }
  function eyecatch(n, label) {
    var pal = [[C.green, '#e3c27c'], ['#efe0c9', C.cv], [C.cv, '#fff3e6'], ['#2b2620', '#d9b56a'], ['#dfe3d6', C.green], ['#f3e7cc', C.ink]];
    var p = pal[n % pal.length], s = rect(0, 0, 400, 240, p[0]);
    var shapes = [
      '<circle cx="300" cy="120" r="80" fill="none" stroke="' + p[1] + '" stroke-width="1.5" opacity=".6"/><circle cx="300" cy="120" r="46" fill="' + p[1] + '" opacity=".85"/>',
      '<rect x="230" y="40" width="120" height="160" rx="6" fill="' + p[1] + '" opacity=".9"/><path d="M250 80h80M250 104h60M250 128h70M250 152h50" stroke="' + p[0] + '" stroke-width="5" stroke-linecap="round"/>',
      '<path d="M220 190 L270 140 L305 165 L370 70" fill="none" stroke="' + p[1] + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="370" cy="70" r="11" fill="' + p[1] + '"/>',
      '<rect x="235" y="110" width="26" height="80" rx="3" fill="' + p[1] + '" opacity=".5"/><rect x="275" y="80" width="26" height="110" rx="3" fill="' + p[1] + '" opacity=".75"/><rect x="315" y="50" width="26" height="140" rx="3" fill="' + p[1] + '"/>',
      '<rect x="255" y="34" width="96" height="172" rx="16" fill="none" stroke="' + p[1] + '" stroke-width="5"/><circle cx="303" cy="110" r="26" fill="' + p[1] + '" opacity=".8"/>',
      '<path d="M240 60h110v120H240z" fill="none" stroke="' + p[1] + '" stroke-width="3"/><path d="M240 100h110M276 60v120M313 60v120M240 140h110" stroke="' + p[1] + '" stroke-width="2" opacity=".6"/><rect x="277" y="101" width="35" height="38" fill="' + p[1] + '"/>'
    ];
    s += shapes[n % shapes.length];
    s += txt(36, 70, 'Column', 15, p[1], NUM, null, 500, ' font-style="italic" letter-spacing="2"');
    s += txt(36, 160, ('0' + (n + 1)).slice(-2), 74, p[1], NUM, null, 500, ' opacity=".9"');
    return svg('0 0 400 240', s, 'slice');
  }

  function capHTML(t, iconKey) {
    return '<span class="cap">' + ico(ICONS[iconKey || 'camera']) + t + '</span>';
  }
  function plain(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }

  var phs = document.querySelectorAll('.ph');
  var eyeN = 0, svcN = 0, coverN = 0;
  for (var p = 0; p < phs.length; p++) {
    var el = phs[p];
    var span = el.querySelector('span');
    var raw = span ? span.innerHTML : '';
    var t = plain(el);
    var first = raw.split(/<br\s*\/?>/)[0].replace(/<[^>]+>/g, '');
    var out = null, cls = '';

    if (el.closest('.phone')) { cls = 'photo'; out = ''; }
    else if (/メインビジュアル/.test(t) && /メニュー表/.test(t)) {
      cls = 'photo';
      out = capHTML('料理の実写写真＋制作したメニュー表の実物') +
        svg('0 0 400 380', menuDoc(70, 40, 180, 270, 'after') + phoneDoc(232, 120, 104, 214) +
          '<g transform="translate(236 36)">' + rect(0, 0, 150, 52, C.card, 12) + txt(14, 21, '客単価（設計目標）', 10, C.ink3) + txt(14, 43, '+10〜15%', 20, C.cv, NUM, null, 700) + '</g>');
    }
    else if (/キービジュアル/.test(t)) {
      cls = 'photo cool';
      out = capHTML('刷新後のメニュー表（実物写真）＋分析レポート') +
        svg('0 0 400 340', '<g>' + rect(200, 60, 170, 200, C.card, 8) + matrixDoc(204, 70, 162, 180, true) + '</g>' + menuDoc(40, 30, 175, 270, 'after'));
    }
    else if (/改定後|構成・写真|スター商品/.test(t)) out = svg('0 0 400 340', menuDoc(120, 20, 170, 300, 'after'));
    else if (/改定前|全商品が同じ/.test(t)) out = svg('0 0 400 340', menuDoc(120, 20, 170, 300, 'before'));
    else if (/シール/.test(t)) out = svg('0 0 400 240', menuDoc(140, 14, 120, 212, 'sticker'));
    else if (/Before\/After/.test(t)) {
      out = svg('0 0 400 240', menuDoc(44, 22, 128, 196, 'before') + menuDoc(228, 22, 128, 196, 'after') +
        '<path d="M184 120h30" stroke="' + C.ink2 + '" stroke-width="1.5" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + C.ink2 + '"/></marker></defs>' +
        rect(44, 8, 46, 16, C.ink3, 8) + txt(67, 20, 'BEFORE', 8, '#fff', NUM, 'middle', 700) + rect(228, 8, 42, 16, C.cv, 8) + txt(249, 20, 'AFTER', 8, '#fff', NUM, 'middle', 700));
    }
    else if (/4象限/.test(t)) out = svg('0 0 400 240', matrixDoc(70, 10, 260, 220, true));
    else if (/紙メニュー＋スマホ|紙メニュー.*スマホ/.test(t)) out = svg('0 0 400 240', menuDoc(110, 18, 120, 204, 'after') + phoneDoc(215, 50, 82, 170));
    else if (/カレンダー/.test(t)) out = svg('0 0 400 240', calDoc(20, 40, 360, 150));
    else if (/グラフ|月次レポート/.test(t)) out = svg('0 0 400 260', chartDoc(16, 16, 368, 228, { title: /注文数/.test(t) && !/客単価/.test(t) ? '注文数の推移' : '客単価・注文数の推移' }));
    else if (/^スマホ画面$|^画面$/.test(t)) out = svg('0 0 400 200', phoneDoc(160, 8, 80, 184));
    else if (/^メニュー$/.test(t)) out = svg('0 0 400 200', menuDoc(150, 10, 100, 180, 'after'));
    else if (/^レポート$/.test(t)) out = svg('0 0 400 200', chartDoc(70, 20, 260, 160, { title: '分析レポート' }));
    else if (/印刷物/.test(t)) out = svg('0 0 400 200', '<g transform="rotate(-6 200 100)">' + menuDoc(170, 22, 96, 160, 'before') + '</g><g transform="rotate(4 200 100)">' + menuDoc(150, 16, 100, 168, 'after') + '</g>');
    else if (/表紙/.test(t)) out = svg('0 0 120 160', coverDoc(12, 10, 96, 140, coverN++));
    else if (/アイキャッチ/.test(t)) out = eyecatch(eyeN++, t);
    else if (/サービスイメージ/.test(t)) {
      var k = svcN++;
      out = [
        svg('0 0 400 220', menuDoc(110, 14, 110, 192, 'after') + '<g>' + rect(200, 50, 120, 130, C.card, 8) + matrixDoc(202, 56, 116, 116, true) + '</g>'),
        svg('0 0 400 220', menuDoc(120, 18, 110, 186, 'after') + phoneDoc(210, 40, 80, 166)),
        svg('0 0 400 220', calDoc(30, 40, 340, 130)),
        svg('0 0 400 220', chartDoc(40, 14, 320, 192, { title: '月次POS分析' }))
      ][k % 4];
    }
    else if (/関係図/.test(t)) {
      var node = function (cx, cy, label, sub, dark) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="46" fill="' + (dark ? C.ink : C.card) + '"' + (dark ? '' : ' stroke="' + C.line2 + '"') + '/>' +
          txt(cx, cy - 2, label, 13, dark ? '#fff' : C.ink, SERIF, 'middle', 700) + txt(cx, cy + 16, sub, 9, dark ? '#e3c27c' : C.ink3, SANS, 'middle');
      };
      var arr = function (x1, y1, x2, y2, l, lx, ly) {
        return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + C.cv + '" stroke-width="1.6" marker-end="url(#ar2)"/>' + txt(lx, ly, l, 10, C.cv, SANS, 'middle', 700);
      };
      out = svg('0 0 400 300', '<defs><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + C.cv + '"/></marker></defs>' +
        arr(130, 96, 168, 186, '紹介', 128, 150) + arr(250, 210, 284, 112, '定着率UP', 300, 168) + '<line x1="254" y1="238" x2="150" y2="238" stroke="'+C.cv+'" stroke-width="1.6" marker-end="url(#ar2)"/>' +
        txt(200, 262, '紹介料', 10, C.cv, SANS, 'middle', 700) +
        node(96, 70, 'パートナー', 'POS・厨房機器など') + node(200, 212, 'Menu Logic', 'メニュー設計', true) + node(304, 70, '飲食店', '導入店舗'));
    }
    else if (/AIで生成/.test(t)) { cls = 'photo'; out = capHTML('AIで生成した料理画像', 'alert') + '<svg class="art" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet"><g transform="translate(330 30) rotate(12)">' + '<circle r="26" fill="none" stroke="#ff8e7a" stroke-width="3"/>' + txt(0, 7, 'NG', 18, '#ff8e7a', NUM, 'middle', 700) + '</g></svg>'; }
    else if (/AI生成の背景/.test(t)) { cls = 'photo cool'; out = capHTML('実写の料理＋AI生成の背景テクスチャ') + '<svg class="art" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet"><g transform="translate(330 30) rotate(-8)"><circle r="26" fill="none" stroke="#bfe3c6" stroke-width="3"/>' + txt(0, 7, 'OK', 18, '#bfe3c6', NUM, 'middle', 700) + '</g></svg>'; }
    else if (/大判メニュー|卓上POP/.test(t)) {
      out = svg('0 0 400 220', '<g>' + rect(70, 20, 110, 180, C.green, 4) + food(80, 30, 90, 70, 2) + txt(125, 125, '季節限定', 13, '#fff', SERIF, 'middle', 700) + txt(125, 150, '¥1,480', 14, '#e3c27c', NUM, 'middle', 700) + '</g>' +
        menuDoc(196, 30, 92, 160, 'after') + '<path d="M300 190 L322 110 L344 190z" fill="' + C.cv + '"/>' + txt(322, 172, 'POP', 10, '#fff', NUM, 'middle', 700));
    }
    else if (/おすすめバナー/.test(t)) { cls = 'photo'; out = '<span class="cap" style="background:' + C.cv + '">本日のおすすめ ＋150円でセットに</span>'; }
    else if (/テンプレート画面|ブランドキット/.test(t)) {
      var sw = '';
      [C.ink, C.cv, C.gold, C.green, C.paper2].forEach(function (c, k) { sw += rect(40 + k * 34, 172, 26, 26, c, 13); });
      out = svg('0 0 400 260', rect(24, 20, 352, 220, C.card, 10, ' stroke="' + C.line + '"') + rect(24, 20, 352, 26, C.paper2, 10) +
        '<circle cx="42" cy="33" r="4" fill="' + C.cv + '"/><circle cx="56" cy="33" r="4" fill="' + C.gold + '"/><circle cx="70" cy="33" r="4" fill="' + C.line2 + '"/>' +
        txt(40, 76, 'Brand Kit', 18, C.ink, NUM, null, 700) + txt(40, 100, 'Aa 見出し明朝 / 本文ゴシック', 11, C.ink2) + txt(40, 160, 'COLOR', 9, C.ink3, NUM, null, 700, ' letter-spacing="2"') + sw +
        menuDoc(236, 58, 70, 120, 'after') + phoneDoc(312, 70, 48, 104));
    }
    else if (/ロゴ|^(スマレジ|Airレジ|POS\+|ダイニー|Funfo)$/.test(t)) {
      cls = 'logo-tile' + (/ロゴ/.test(t) ? ' dim' : '');
      out = '<span>' + (/ロゴ/.test(t) ? 'LOGO' : t) + '</span>';
    }
    else if (/^その他$/.test(t)) { cls = 'logo-tile dim'; out = '<span>CSV出力できればOK</span>'; }
    else if (/代表|オーナー/.test(t)) { cls = 'photo portrait'; out = capHTML(first); }
    else if (/^写真$/.test(t)) { cls = 'photo portrait'; out = ''; }
    else {
      /* 実写写真が入る枠 */
      cls = 'photo' + (/打ち合わせ|風景|外観|店内|作業/.test(t) ? ' cool' : '');
      out = capHTML(first === '画像' || first === '事例画像' ? '実写写真' : first.replace(/（実写）/, ''));
    }

    if (out !== null) {
      if (cls) el.className += ' ' + cls;
      el.innerHTML = out;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', t);
    }
  }

  /* ---------- アイコン ---------- */
  var icons = document.querySelectorAll('.icon');
  for (var q = 0; q < icons.length; q++) {
    var key = ICON_MAP[plain(icons[q])];
    if (key) { icons[q].setAttribute('aria-label', plain(icons[q])); icons[q].innerHTML = ico(ICONS[key]); }
    else if (/^\d+$/.test(plain(icons[q]))) icons[q].style.fontFamily = NUM, icons[q].style.fontSize = '20px', icons[q].style.fontStyle = 'italic';
  }

  /* ---------- 確認用パネル ---------- */
  if (d.id) {
    var name = PAGES[d.id] ? PAGES[d.id][1] : '';
    document.title = name + '｜Menu Logic（デザイン ' + d.id + '）';
    var panel = document.createElement('div');
    panel.className = 'dv-panel' + (store('dv-min') === '1' ? ' min' : '');
    panel.innerHTML =
      '<a href="' + R + 'index.html">← 一覧</a>' +
      '<span class="dv-id">' + d.id + ' ' + name + '</span>' +
      '<div class="dv-grp"><span>表示</span><button data-set="view:pc">PC</button><button data-set="view:sp">SP</button></div>' +
      '<div class="dv-grp"><span>フェーズ</span><button data-set="phase:1">1</button><button data-set="phase:2">2</button><button data-set="phase:3">3</button></div>' +
      '<div class="dv-grp"><span>設計メモ</span><button data-set="notes:on">ON</button><button data-set="notes:off">OFF</button></div>' +
      '<button class="dv-min" type="button" title="パネルをたたむ">–</button>';
    body.appendChild(panel);
  }

  function apply() {
    html.setAttribute('data-phase', state.phase);
    html.classList.toggle('sp', state.view === 'sp');
    html.classList.toggle('notes', state.notes === 'on');
    var bs = document.querySelectorAll('[data-set]');
    for (var n2 = 0; n2 < bs.length; n2++) {
      var pr = bs[n2].getAttribute('data-set').split(':');
      bs[n2].classList.toggle('on', state[pr[0]] === pr[1]);
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set]');
    if (b) {
      var pr = b.getAttribute('data-set').split(':');
      state[pr[0]] = pr[1];
      store('dv-' + pr[0], pr[1]);
      apply();
      return;
    }
    if (e.target.closest('.dv-min')) {
      var pn = e.target.closest('.dv-panel');
      pn.classList.toggle('min');
      store('dv-min', pn.classList.contains('min') ? '1' : '0');
      return;
    }
    var hb = e.target.closest('.hamburger');
    if (hb) {
      var m = document.querySelector('.sp-menu');
      if (m) m.classList.toggle('open');
      hb.classList.toggle('open');
      return;
    }
    /* 選択肢・タブの見た目だけの切り替え */
    var ch = e.target.closest('.choices span');
    if (ch && !e.target.closest('a')) {
      var group = ch.parentNode;
      if (!group.classList.contains('cb')) {
        var sib = group.querySelectorAll('span');
        for (var s2 = 0; s2 < sib.length; s2++) if (sib[s2] !== ch) sib[s2].classList.remove('on');
      }
      ch.classList.toggle('on');
      return;
    }
    var tb = e.target.closest('.tabs span');
    if (tb) {
      var ts = tb.parentNode.querySelectorAll('span');
      for (var s3 = 0; s3 < ts.length; s3++) ts[s3].classList.toggle('on', ts[s3] === tb);
    }
  });

  /* ---------- スクロールで現れる動き ---------- */
  if ('IntersectionObserver' in window) {
    var targets = document.querySelectorAll('main .sec-head, main .card, main .banner, main .matrix, main .tiers, main .steps, main .timeline, main .stat, main .box, main .tbl-wrap');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    for (var r = 0; r < targets.length; r++) { targets[r].classList.add('rv'); io.observe(targets[r]); }
  }

  apply();
})();
