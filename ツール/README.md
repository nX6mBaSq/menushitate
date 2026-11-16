# コーディング（公開用ファイル）について

`../コーディング/` の中身が、そのままサーバーに置ける公開用ファイルです。
このフォルダ（`ツール/`）はサーバーに置きません。

---

## 1. アップロード

`コーディング/` の **中身** を、サーバーの公開フォルダ（`public_html` など）の直下にそのまま置きます。
`.htaccess` は隠しファイルなので、FTPソフトで隠しファイルを表示する設定にしてからアップしてください。

```
コーディング/
├── index.html …………………… トップ（/）
├── about/index.html ……………… /about/
├── about/company/index.html …… /about/company/
├── method/ quality/ service/ price/ flow/ faq/
├── download/（thanks/） monitor/ contact/（confirm/・thanks/）
├── privacy/ terms/
├── 404.html ………………………… ページが見つからないとき
├── assets/
│   ├── css/style.css
│   ├── js/main.js ……… メニュー・フォームなどの動き
│   ├── js/config.js …… ★フォームの送信先の設定
│   └── img/favicon.svg
├── robots.txt
└── .htaccess ……………………… Apache用（404ページの指定など）
```

- サイトマップの **Phase 1（最小構成）** の22ページです。Phase 2/3 のページ・ナビ・セクションは含みません。
- リンクは相対パスなので、サブフォルダに置いても動きます（404.html だけはルート直下に置く前提です）。
- パソコンで確認するときは、ダブルクリックではなくローカルサーバーで開いてください（例：`コーディング` フォルダで `python -m http.server` を実行し、`http://localhost:8000/` を開く）。

---

## 2. 公開前に必ず行うこと

| # | 内容 | 場所 |
| :-- | :-- | :-- |
| 1 | **フォームの送信先を設定**（未設定だと送信されずに完了画面へ進みます） | `assets/js/config.js` の `formEndpoint` |
| 2 | 資料ファイルを置く：`service-guide.pdf`／`menu-checklist.pdf`／`promo-calendar.xlsx` | `assets/docs/`（フォルダを作成） |
| 3 | 写真枠（カメラのラベルの付いた枠）を実写写真に差し替え | 各ページの `.ph` 要素 |
| 4 | 「○」の未確定事項、社名・ロゴ「Menu Logic（仮）」を確定 | `ツール/build_coding.py` の `SITE_NAME` とデザイン側 |
| 5 | プライバシーポリシー・利用規約の本文（専門家の確認後） | `privacy/`・`terms/` |
| 6 | ドメインが決まったら OGP画像・canonical・sitemap.xml を追加 | 各ページの `<head>` |

### フォームの送信先について
フォームは `multipart/form-data` で `formEndpoint` にPOSTします（項目名は日本語のラベル名）。
formrun・Formspree・SSGform などのフォームサービスのURLを入れるのが手軽です。添付ファイル（3MBまで）も送られます。

| フォーム | 送信後 |
| :-- | :-- |
| 無料相談（/contact/） | 確認画面（/contact/confirm/）→ 送信 → /contact/thanks/ |
| 資料ダウンロード（/download/） | 送信 → /download/thanks/ |
| モニター応募（/monitor/） | 送信 → /contact/thanks/ |

---

## 3. 作り直すとき

デザイン（`../デザイン/`）を修正したあと、次のコマンドで `コーディング/` を作り直せます。
`コーディング/` の中身は毎回すべて消して書き出すので、直接編集したファイルは上書きされます（修正はデザイン側で行ってください）。

```
cd ツール
python build_coding.py            # Phase 1
python build_coding.py --phase 2  # Phase 2（導入事例・コラム・パートナー募集を追加）
python build_coding.py --phase 3  # Phase 3（デザイナー募集を追加）
```

必要なもの：Python 3、`pip install beautifulsoup4`、Google Chrome（または Edge）
