# -*- coding: utf-8 -*-
"""
デザイン（../デザイン）から、サーバーにそのまま置ける静的サイト（../コーディング）を書き出す。

使い方:
    python build_coding.py            # Phase 1 で書き出し
    python build_coding.py --phase 2  # Phase 2 で書き出し

必要なもの: Google Chrome（ヘッドレスでデザインのJSを実行して静的HTMLを取り出す）, beautifulsoup4
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment

HERE = Path(__file__).resolve().parent
DESIGN = HERE.parent / 'デザイン'
OUT = HERE.parent / 'コーディング'
CHROME_CANDIDATES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
]

SITE_NAME = 'Menu Logic'
SITE_TAGLINE = '飲食店専門のメニュー戦略デザイン'

# ページID: (デザインのファイル, 公開URL（ルートからの相対・末尾/）, 公開開始フェーズ, ページ名, 説明文, noindex)
PAGES = {
    'P01': ('01_集客・信頼形成/P01_top.html', '', 1, 'トップ',
            'POSデータと行動経済学で、客単価と粗利率を引き上げるメニューを設計する飲食店専門のデザイン会社です。紙メニュー×モバイルオーダーの設計から印刷手配・販促まで一括で対応します。', False),
    'P02': ('01_集客・信頼形成/P02_about.html', 'about/', 1, '私たちについて',
            'デザイン会社ではなく、メニューで「利益」を設計するパートナー。私たちのミッションと、作業代行との違いをご紹介します。', False),
    'P03': ('01_集客・信頼形成/P03_company.html', 'about/company/', 1, '会社概要',
            '代表プロフィール、事業者情報、提携パートナーのご紹介です。', False),
    'P04': ('01_集客・信頼形成/P04_method.html', 'method/', 1, 'メソッド解説',
            'ABC分析（人気度×利益率の4象限）、アンカリング・松竹梅、端数価格、シズル感、クロスセル導線。売れるメニューの仕組みを解説します。', False),
    'P05': ('01_集客・信頼形成/P05_quality.html', 'quality/', 1, '制作ポリシー',
            '料理写真は100%実写、生成AIは背景・装飾のみ。景品表示法に配慮した制作体制と、現場で使える耐久仕様についてご説明します。', False),
    'P06': ('02_サービス・料金/P06_service.html', 'service/', 1, 'サービス一覧',
            '戦略メニュー刷新、ハイブリッドUI設計、月額伴走プラン、グロース顧問。段階的に利益を伸ばし続けるサービスの全体像です。', False),
    'P07': ('02_サービス・料金/P07_menu-engineering.html', 'service/menu-engineering/', 1, '戦略メニュー刷新',
            'POSデータの分析からメニュー設計・デザイン・印刷手配まで。値上げしても選ばれる、利益の出るメニューに作り替えます（8万〜15万円／式）。', False),
    'P08': ('02_サービス・料金/P08_hybrid-ui.html', 'service/hybrid-ui/', 1, 'ハイブリッドUI設計',
            '紙メニューは「魅せる」、モバイルオーダーは「注文を完結させる」。役割を分けて設計し、客単価と回転率を両立します。', False),
    'P09': ('02_サービス・料金/P09_subscription.html', 'service/subscription/', 1, '月額伴走プラン',
            '季節メニュー・POP・SNS画像を月額定額で制作。繁忙期の2〜3ヶ月前にこちらから販促をご提案します（月4万円／月8万円）。', False),
    'P10': ('02_サービス・料金/P10_growth.html', 'service/growth/', 1, 'グロース顧問',
            '月次のPOS詳細分析、MEO対策、LINE公式アカウント運用まで。経営に伴走する顧問プランです（月15万円〜）。', False),
    'P11': ('02_サービス・料金/P11_price.html', 'price/', 1, '料金プラン',
            '全プランの料金比較、成果報酬型オプション、修正回数、二次使用料・著作権譲渡、印刷費の考え方をまとめています。', False),
    'P12': ('03_実績・検討材料/P12_works.html', 'works/', 2, '導入事例',
            'メニュー刷新で客単価・粗利率がどう変わったか。業態・課題別に導入事例をご紹介します。', False),
    'P13': ('03_実績・検討材料/P13_works-detail.html', 'works/sample/', 2, '導入事例詳細',
            '店舗の課題、POS分析の結果、行った施策、客単価と注文数の推移をご紹介します。', False),
    'P14': ('03_実績・検討材料/P14_flow.html', 'flow/', 1, 'ご依頼の流れ',
            '無料相談からPOSデータの共有、分析、設計・制作、印刷・納品、効果測定まで。ご依頼の流れをご説明します。', False),
    'P15': ('03_実績・検討材料/P15_faq.html', 'faq/', 1, 'よくある質問',
            '対応POS、遠方対応、撮影、修正回数、データの権利、解約条件など、よくいただくご質問にお答えします。', False),
    'P16': ('04_記事・情報発信/P16_column.html', 'column/', 2, 'お役立ちコラム',
            '値上げ・価格戦略、メニューエンジニアリング、モバイルオーダー活用など、飲食店の利益を伸ばすヒントをお届けします。', False),
    'P17': ('04_記事・情報発信/P17_column-category.html', 'column/category/sample/', 2, 'コラムカテゴリ',
            'テーマ別のコラム一覧です。', False),
    'P18': ('04_記事・情報発信/P18_column-detail.html', 'column/sample/', 2, 'コラム記事',
            '値上げしても客が離れないメニューの作り方。', False),
    'P19': ('04_記事・情報発信/P19_news.html', 'news/', 2, 'お知らせ',
            '更新情報・提携のお知らせです。', False),
    'P20': ('04_記事・情報発信/P20_news-detail.html', 'news/sample/', 2, 'お知らせ詳細',
            'お知らせの詳細です。', False),
    'P21': ('05_コンバージョン/P21_download.html', 'download/', 1, '資料ダウンロード',
            'サービス資料、「値上げで客が離れないメニュー改定チェックリスト」、年間販促カレンダーのテンプレートを無料でダウンロードいただけます。', False),
    'P22': ('05_コンバージョン/P22_download-thanks.html', 'download/thanks/', 1, '資料ダウンロード完了',
            '資料のお申し込みありがとうございます。', True),
    'P23': ('05_コンバージョン/P23_monitor.html', 'monitor/', 1, 'モニター店舗募集',
            'POSデータ分析とメニュー刷新を特別条件で実施するモニター店舗を、3〜5店舗限定で募集しています。', False),
    'P24': ('05_コンバージョン/P24_contact.html', 'contact/', 1, '無料相談・お問い合わせ',
            'オンライン（30分ほど）でお店の状況をお聞きします。無理な営業はいたしません。全国対応。', False),
    'P25': ('05_コンバージョン/P25_contact-confirm.html', 'contact/confirm/', 1, '入力内容の確認',
            '入力内容をご確認ください。', True),
    'P26': ('05_コンバージョン/P26_contact-thanks.html', 'contact/thanks/', 1, '送信完了',
            'お問い合わせありがとうございます。', True),
    'P27': ('06_パートナー・採用/P27_partner.html', 'partner/', 2, 'パートナー募集',
            'POS・モバイルオーダーベンダー、厨房機器商社、店舗仲介の皆さまへ。導入後のメニュー最適化をお任せください。', False),
    'P28': ('06_パートナー・採用/P28_partner-contact.html', 'partner/contact/', 2, 'パートナー問い合わせ',
            '提携に関するお問い合わせはこちらからお願いします。', False),
    'P29': ('06_パートナー・採用/P29_recruit.html', 'recruit/', 3, 'パートナーデザイナー募集',
            '飲食店の「利益を生むデザイン」を一緒につくるデザイナーを募集しています。', False),
    'P30': ('07_規約・システム/P30_privacy.html', 'privacy/', 1, 'プライバシーポリシー',
            'POSデータなど店舗情報を含む個人情報の取り扱いについて。', False),
    'P31': ('07_規約・システム/P31_terms.html', 'terms/', 1, 'サイト利用規約',
            '当サイトのコンテンツ・資料の著作権と利用条件について。', False),
    'P32': ('07_規約・システム/P32_404.html', '404.html', 1, 'ページが見つかりません',
            'お探しのページが見つかりませんでした。', True),
}

# フォームの設定（ページID: 種別, 確認画面へ進むか, 送信後の移動先ページID）
FORMS = {
    'P21': ('資料ダウンロード', False, 'P22'),
    'P23': ('モニター店舗応募', False, 'P26'),
    'P24': ('無料相談・お問い合わせ', True, 'P25'),
    'P28': ('パートナー問い合わせ', True, 'P25'),
    'P29': ('デザイナー応募', False, 'P26'),
}

PREFS = ('北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 '
         '長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 '
         '福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県').split()
SELECT_OPTIONS = {
    '業態': ['居酒屋', 'カフェ', 'ダイニング・レストラン', 'バー', 'その他'],
    '店舗数': ['1店舗', '2〜5店舗', '6〜10店舗', '11店舗以上'],
    '所在地（都道府県）': PREFS,
    '客単価': ['〜3,000円', '3,000〜5,000円', '5,000〜8,000円', '8,000円〜'],
    'デザイン経験年数': ['1年未満', '1〜3年', '3〜5年', '5年以上'],
    '月の稼働可能時間': ['〜20時間', '20〜40時間', '40〜80時間', '80時間以上'],
}


def chrome():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    sys.exit('Chrome / Edge が見つかりません')


def dump(path, phase):
    url = path.resolve().as_uri() + f'?phase={phase}&view=pc&notes=off'
    r = subprocess.run([chrome(), '--headless=new', '--disable-gpu', '--window-size=1440,1000',
                        '--virtual-time-budget=4000', '--dump-dom', url],
                       capture_output=True, timeout=120)
    return r.stdout.decode('utf-8')


def rel(from_url, to_url):
    """公開URL同士の相対パス（ディレクトリ形式）。"""
    base = from_url if from_url.endswith('/') or from_url == '' else os.path.dirname(from_url) + '/'
    if base in ('', '/'):
        base = ''
    depth = base.count('/')
    r = '../' * depth + to_url
    return r or './'


def text(el):
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip()


def build_form(soup, page_id, box, published):
    kind, confirm, nxt = FORMS[page_id]
    me = PAGES[page_id][1]
    box.name = 'form'
    box['id'] = 'form-' + page_id.lower()
    box['data-form'] = kind
    box['data-next'] = rel(me, PAGES[nxt][1])
    if confirm:
        box['data-confirm'] = '1'
    box['method'] = 'post'
    box['novalidate'] = ''
    box['action'] = '#'
    hidden = soup.new_tag('input', attrs={'type': 'hidden', 'name': 'フォーム種別', 'value': kind})
    box.insert(0, hidden)

    n = 0
    for field in box.select('.field'):
        lbl = field.select_one('.lbl')
        label = ''
        required = False
        if lbl:
            required = bool(lbl.select_one('.req'))
            label = text(lbl).replace('必須', '').replace('任意', '').strip()
        for inp in field.select('.input'):
            n += 1
            fid = f'{box["id"]}-{n}'
            classes = inp.get('class', [])
            ph = text(inp)
            if 'sel' in classes:
                tag = soup.new_tag('select', attrs={'class': 'input sel', 'id': fid, 'name': label})
                opts = SELECT_OPTIONS.get(label) or [o for o in ph.split('／') if o]
                o0 = soup.new_tag('option', attrs={'value': ''})
                o0.string = '選択してください'
                tag.append(o0)
                for o in opts:
                    ot = soup.new_tag('option')
                    ot.string = o
                    tag.append(ot)
            elif 'ta' in classes:
                tag = soup.new_tag('textarea', attrs={'class': 'input ta', 'id': fid, 'name': label, 'rows': '5'})
                if ph:
                    tag['placeholder'] = ph
            else:
                typ, ac = 'text', None
                if 'メール' in label:
                    typ, ac = 'email', 'email'
                elif '電話' in label:
                    typ, ac = 'tel', 'tel'
                elif 'URL' in label:
                    typ, ac = 'url', 'url'
                elif label in ('お名前', 'ご担当者名'):
                    ac = 'name'
                elif '会社名' in label:
                    ac = 'organization'
                tag = soup.new_tag('input', attrs={'class': 'input', 'id': fid, 'name': label, 'type': typ})
                if ac:
                    tag['autocomplete'] = ac
                if ph:
                    tag['placeholder'] = ph
            if required:
                tag['required'] = ''
            inp.replace_with(tag)
            if lbl:
                lbl.name = 'label'
                lbl['for'] = fid
        for ch in field.select('.choices'):
            multi = 'cb' in ch.get('class', [])
            spans = ch.find_all('span', recursive=False)
            is_privacy = not lbl and 'プライバシー' in text(ch)
            name = 'プライバシーポリシーへの同意' if is_privacy else (label or 'メール配信')
            if not lbl and not is_privacy:
                name = text(ch)
            if lbl:
                n += 1
                gid = f'{box["id"]}-g{n}'
                lbl['id'] = gid
                ch['role'] = 'group'
                ch['aria-labelledby'] = gid
                if required and multi:
                    ch['data-required-group'] = ''
            for sp in spans:
                value = text(sp)
                lab = soup.new_tag('label')
                attrs = {'type': 'checkbox' if multi else 'radio', 'name': name, 'value': '同意する' if is_privacy else value}
                if (required and not multi) or is_privacy:
                    attrs['required'] = ''
                lab.append(soup.new_tag('input', attrs=attrs))
                sp.name = 'span'
                lab.append(sp)
                ch.append(lab)
            # span を label で包み直したので並び順を整える
        for fu in field.select('.fileup'):
            n += 1
            fid = f'{box["id"]}-{n}'
            fu.name = 'label'
            fu['for'] = fid
            t = text(fu)
            fu.clear()
            inp = soup.new_tag('input', attrs={'type': 'file', 'id': fid, 'name': label or '添付ファイル',
                                               'accept': 'image/*,application/pdf', 'class': 'visually-hidden'})
            sp = soup.new_tag('span', attrs={'data-file-label': ''})
            sp.string = t + '（画像・PDF、3MBまで）'
            fu.append(inp)
            fu.append(sp)
            if lbl:
                lbl.name = 'span'
    # 送信ボタン
    btn = box.select('a.btn.cv, button.btn.cv')[-1]
    b = soup.new_tag('button', attrs={'type': 'submit', 'class': btn.get('class')})
    b.string = text(btn)
    btn.replace_with(b)
    err = soup.new_tag('p', attrs={'class': 'form-error', 'role': 'alert', 'hidden': ''})
    b.insert_before(err)

    # P21：フォームの外にある資料の選択肢
    if page_id == 'P21':
        for ch in soup.select('main .card .choices.cb'):
            sp = ch.find('span', recursive=False)
            value = text(sp)
            lab = soup.new_tag('label')
            lab.append(soup.new_tag('input', attrs={'type': 'checkbox', 'name': 'ご希望の資料', 'value': value, 'form': box['id'],
                                                    'checked': ''} if 'サービス資料' in value else
                                    {'type': 'checkbox', 'name': 'ご希望の資料', 'value': value, 'form': box['id']}))
            lab.append(sp)
            ch.append(lab)


def process(page_id, html, phase, published):
    src, url, _, name, desc, noindex = PAGES[page_id]
    soup = BeautifulSoup(html, 'html.parser')

    # 確認用の要素・フェーズ外の要素を削除
    for sel in ['.dv-panel', '.note', '.sec-label', 'script']:
        for el in soup.select(sel):
            el.decompose()
    hide = ['.from-p2', '.from-p3'] if phase == 1 else (['.only-p1', '.from-p3'] if phase == 2 else ['.only-p1'])
    for sel in hide:
        for el in soup.select(sel):
            el.decompose()
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()

    # 属性の整理
    for el in soup.find_all(True):
        cls = [c for c in el.get('class', []) if c not in ('only-p1', 'from-p2', 'from-p3', 'rv', 'in')]
        if 'class' in el.attrs:
            if cls:
                el['class'] = cls
            else:
                del el['class']
        for a in ('data-to', 'data-id', 'data-url', 'data-pub', 'data-role', 'data-cta', 'data-set'):
            if a in el.attrs:
                del el[a]
    # リンクの付け替え
    missing = []
    for a in soup.find_all('a', href=True):
        h = a['href']
        m = re.search(r'(P\d\d)_[^/#?]*\.html(#.*)?$', h)
        if m:
            tid = m.group(1)
            if tid in published:
                to = PAGES[tid][1]
                a['href'] = ('/' + to if page_id == 'P32' else rel(url, to)) + (m.group(2) or '')
            else:
                missing.append((tid, text(a)))
                a['data-unpublished'] = tid
        elif h.endswith('index.html') and 'デザイン' not in h:
            pass
    # 未公開ページへのリンク：ボタンを含む小さな箱ごと外す／それ以外はテキストにする
    for a in soup.select('a[data-unpublished]'):
        box = a.find_parent(class_='box')
        if box and len(box.select('a')) == 1:
            box.decompose()
            continue
        if 'card' in a.get('class', []) or 'btn' in a.get('class', []):
            a.decompose()
        else:
            a.unwrap()

    # フォーム
    if page_id in FORMS:
        box = soup.select_one('.form-box.form')
        if box:
            build_form(soup, page_id, box, published)
    if page_id == 'P22':
        files = {'サービス資料': 'service-guide.pdf', 'チェックリスト': 'menu-checklist.pdf', 'カレンダー': 'promo-calendar.xlsx'}
        for a in soup.select('main a.btn'):
            if a.get('href'):
                continue
            for k, f in files.items():
                if k in text(a):
                    a['href'] = rel(url, 'assets/docs/' + f)
                    a['download'] = ''
    if page_id == 'P25':
        tb = soup.select_one('main table.tbl tbody')
        tb['data-confirm-table'] = ''
        tb.clear()
        btns = soup.select('main .btns a')
        btns[0]['data-confirm-back'] = ''
        btns[-1]['data-confirm-send'] = ''
        err = soup.new_tag('p', attrs={'class': 'form-error center', 'role': 'alert', 'hidden': ''})
        btns[-1].parent.insert_before(err)

    # head の作り直し
    title = f'{SITE_NAME}｜{SITE_TAGLINE}' if page_id == 'P01' else f'{name}｜{SITE_NAME}'
    root = '/' if page_id == 'P32' else rel(url, '')
    if root == './':
        root = ''
    head = soup.head
    head.clear()
    head_html = f'''
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{'<meta name="robots" content="noindex">' if noindex else ''}
<meta name="theme-color" content="#f7f2e9">
<meta property="og:type" content="{'website' if page_id == 'P01' else 'article'}">
<meta property="og:site_name" content="{SITE_NAME}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="ja_JP">
<link rel="icon" href="{root}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&amp;family=Shippori+Mincho+B1:wght@600;700;800&amp;family=Zen+Kaku+Gothic+New:wght@400;500;700&amp;display=swap">
<link rel="stylesheet" href="{root}assets/css/style.css">
<script src="{root}assets/js/config.js" defer></script>
<script src="{root}assets/js/main.js" defer></script>
'''
    head.append(BeautifulSoup(head_html, 'html.parser'))
    soup.html.attrs = {'lang': 'ja'}
    soup.body.attrs = {}

    # スキップリンク
    main = soup.find('main')
    if main is not None:
        main['id'] = 'main'
        skip = BeautifulSoup('<a class="skip" href="#main">本文へ移動</a>', 'html.parser')
        soup.body.insert(0, skip)

    out = '<!doctype html>\n' + str(soup.html)
    out = re.sub(r'\n\s*\n+', '\n', out)
    return out, missing


def build_css(phase):
    css = (DESIGN / 'assets' / 'style.css').read_text(encoding='utf-8')
    # 確認用パネル・一覧ページ用のスタイルを削除
    css = re.sub(r'/\* -+ 確認用パネル.*?(?=/\* -+ 画面の外枠)', '', css, flags=re.S)
    css = re.sub(r'/\* 一覧ページ（index.html） \*/.*?(?=/\* -+ 動き)', '', css, flags=re.S)
    css = re.sub(r'/\* -+ フェーズ別表示 -+ \*/.*?\}\n', '', css, flags=re.S)

    # ルールを分解して html.sp を メディアクエリへ
    out, sp, hdr = [], [], []
    i, depth, start = 0, 0, 0
    blocks = []
    buf = ''
    for ch in css:
        buf += ch
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                blocks.append(buf)
                buf = ''
    tail = buf
    HDR = ('s-header', 'gnav', 'hdr-cta', 'hamburger', 'sp-menu', '.logo')
    for b in blocks:
        m = re.match(r'(\s*(?:/\*.*?\*/\s*)*)([^{]+)\{(.*)\}\s*$', b, flags=re.S)
        if not m:
            out.append(b)
            continue
        pre, sel, body = m.group(1), m.group(2).strip(), m.group(3)
        if sel.startswith('@'):
            out.append(b)
            continue
        sels = [s.strip() for s in sel.split(',')]
        if any('html.notes' in s or s.startswith('.note') or s == '.sec-label' for s in sels):
            out.append(pre)
            continue
        if all(s.startswith('html.sp') for s in sels):
            ns = [re.sub(r'^html\.sp\s*', '', s) for s in sels]
            if any(s.startswith('body') or s.startswith('.site') for s in ns):
                out.append(pre)
                continue
            rule = ', '.join(ns) + ' {' + body + '}'
            (hdr if any(k in s for s in ns for k in HDR) else sp).append(rule)
            out.append(pre)
            continue
        out.append(b)
    css = ''.join(out) + tail
    css = css.replace('''body {
  margin: 0;
  background: #d9d3c8;''', '''body {
  margin: 0;
  background: var(--paper);''')
    css = re.sub(r'\.site \{.*?\}\n', '.site { overflow: clip; }\n', css, count=1, flags=re.S)

    css += '''
/* ---------- 本番用：補助 ---------- */
.skip { position: absolute; left: 8px; top: -60px; z-index: 100; padding: 8px 16px; border-radius: 8px; background: var(--ink); color: #fff; text-decoration: none; }
.skip:focus { top: 8px; }
.visually-hidden { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.btn[aria-busy="true"] { opacity: .6; pointer-events: none; }

/* ---------- 本番用：フォーム部品 ---------- */
.input { width: 100%; font: inherit; font-size: 15px; color: var(--ink); }
.input::placeholder { color: var(--ink-3); }
textarea.input { display: block; padding: 14px 16px; resize: vertical; line-height: 1.7; }
select.input {
  appearance: none; -webkit-appearance: none; padding-right: 40px; cursor: pointer;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235d564b' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") right 14px center / 16px no-repeat;
}
select.input::after { display: none; }
.input:focus { outline: 0; border-color: var(--ink); box-shadow: 0 0 0 4px rgba(184, 137, 46, .18); }
.input:user-invalid { border-color: var(--cv); }
.choices { gap: 10px; }
.choices > label {
  position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px 9px 12px;
  border: 1px solid var(--line-2); border-radius: 999px; background: #fff; cursor: pointer; transition: .2s;
}
.choices > label > span { display: inline; padding: 0; border: 0; background: none; }
.choices > label > span::before { content: none; }
.choices > label::before { content: ""; flex: none; width: 16px; height: 16px; border: 1.5px solid var(--line-2); border-radius: 50%; background: #fff; transition: .15s; }
.choices.cb > label::before { border-radius: 4px; }
.choices > label:hover { border-color: var(--ink-2); }
.choices > label > input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.choices > label:has(input:checked) { border-color: var(--ink); background: var(--paper); font-weight: 700; }
.choices > label:has(input:checked)::before { border: 5px solid var(--ink); }
.choices.cb > label:has(input:checked)::before { border: 0; background: var(--ink) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 12.5l4 4 8-9'/%3E%3C/svg%3E") center / 12px no-repeat; }
.choices > label:has(input:focus-visible) { outline: 2px solid var(--gold); outline-offset: 2px; }
.card .choices > label { border: 0; padding: 0; background: none; }
label.fileup { cursor: pointer; text-align: center; padding: 12px; }
label.fileup:has(input:focus-visible) { outline: 2px solid var(--gold); outline-offset: 2px; }
.form-error { margin: 0; padding: 12px 16px; border-radius: 10px; background: var(--cv-soft); color: var(--cv-dk); font-size: 14px; font-weight: 700; }
.field.is-error .choices > label { border-color: var(--cv); }
.tbl td { white-space: pre-wrap; word-break: break-word; }

/* ---------- 本番用：レスポンシブ ---------- */
@media (max-width: 1023px) {
  .sec { padding: 88px 40px; }
  .hero { padding: 56px 40px 64px; }
  .g4, .g5 { grid-template-columns: repeat(2, 1fr); }
  .split { gap: 40px; }
  .side { grid-template-columns: 1fr; }
  .sticky { position: static; }
  .steps { grid-auto-flow: row; grid-template-columns: repeat(3, 1fr); }
  .steps li:not(:last-child)::after { display: none; }
  .cal { grid-template-columns: repeat(6, 1fr); }
  .s-footer { padding: 64px 40px 32px; }
  .s-footer .f-top { grid-template-columns: 1fr; gap: 36px; }
}
@media (max-width: 1100px) {
''' + '\n'.join('  ' + r for r in hdr) + '''
}
@media (max-width: 767px) {
''' + '\n'.join('  ' + r for r in sp) + '''
  .top-fv .split { grid-template-columns: 1fr; }
}
'''
    return css


MAIN_JS = r'''/* =========================================================
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
'''

CONFIG_JS = r'''/* =========================================================
   サイト設定
   formEndpoint : フォームの送信先URL（POST・multipart/form-data）
     例）formrun / Formspree / SSGform などのフォームサービスのURL、
         または自社サーバーの送信用プログラムのURL
     空のままだと「送信せずに完了画面へ進む」動作になります。公開前に必ず設定してください。
   ========================================================= */
window.SITE_CONFIG = {
  formEndpoint: ''
};
'''

FAVICON = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="1" y="1" width="38" height="38" rx="11" fill="#1f1c17"/><path d="M11 28h18" stroke="#c9bba3" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1.5 3"/><rect x="11" y="18" width="4" height="7" rx="1" fill="#f7f2e9"/><rect x="18" y="14" width="4" height="11" rx="1" fill="#f7f2e9"/><rect x="25" y="10" width="4" height="15" rx="1" fill="#c8402a"/></svg>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--phase', type=int, default=1, choices=(1, 2, 3))
    args = ap.parse_args()
    phase = args.phase
    published = {k for k, v in PAGES.items() if v[2] <= phase}

    if OUT.exists():
        for p in OUT.iterdir():
            shutil.rmtree(p) if p.is_dir() else p.unlink()
    OUT.mkdir(exist_ok=True)
    (OUT / 'assets' / 'css').mkdir(parents=True)
    (OUT / 'assets' / 'js').mkdir(parents=True)
    (OUT / 'assets' / 'img').mkdir(parents=True)

    report = []
    for pid in sorted(published):
        src, url = PAGES[pid][0], PAGES[pid][1]
        html, missing = process(pid, dump(DESIGN / src, phase), phase, published)
        dest = OUT / (url + 'index.html' if url.endswith('/') or url == '' else url)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding='utf-8')
        report.append((pid, url or '/', missing))
        print(f'{pid}  /{url:<28} {len(html)//1024:>4} KB' + (f'  未公開ページへのリンクを処理: {missing}' if missing else ''))

    (OUT / 'assets' / 'css' / 'style.css').write_text(build_css(phase), encoding='utf-8')
    (OUT / 'assets' / 'js' / 'main.js').write_text(MAIN_JS, encoding='utf-8')
    (OUT / 'assets' / 'js' / 'config.js').write_text(CONFIG_JS, encoding='utf-8')
    (OUT / 'assets' / 'img' / 'favicon.svg').write_text(FAVICON, encoding='utf-8')
    (OUT / 'robots.txt').write_text('User-agent: *\nAllow: /\n', encoding='utf-8')
    (OUT / '.htaccess').write_text(
        '# Apache 用の設定（Nginx などでは使われません）\n'
        'ErrorDocument 404 /404.html\n'
        'DirectoryIndex index.html\n'
        'AddDefaultCharset UTF-8\n'
        '<IfModule mod_headers.c>\n'
        '  Header set X-Content-Type-Options "nosniff"\n'
        '  Header set Referrer-Policy "strict-origin-when-cross-origin"\n'
        '</IfModule>\n', encoding='utf-8')
    print(f'\nPhase {phase}：{len(published)}ページを書き出しました → {OUT}')


if __name__ == '__main__':
    main()
