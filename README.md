AIに出力させたのみのReadmeのため、修正予定

Apiのリファクタを済ませたので、APIに関するREADMEをapps/ApiReadMe.mdとして配置


# BookReadingMemo

読書中の「この一文を残しておきたい」という衝動を、タイピングの手間（摩擦）なく記録するための読書メモアプリケーションです。

## 📝 概要 (About)
読書の集中（フロー状態）を途切れさせないことを目的としています。
将来的に、バーコード（ISBN）からの書籍データ自動取得や、カメラを使ったOCR（光学文字認識）によるテキスト抽出を組み合わせることで、手入力を最小限に抑えたシームレスなメモ・引用のストック環境を目指して開発中です。

## ✨ 主な機能とロードマップ (Features & Roadmap)

### 現在実装済みの機能
- 書籍に対するメモ（引用・コメント）の登録・管理機能
- バックエンドAPI（C#）とフロントエンド（TypeScript）の連携
- Docker Composeによるローカル開発環境のコンテナ化

### 🚀 今後の実装予定 (WIP / TODO)
- **バーコードスキャン:** Webカメラからバーコードを読み取り、ISBNから書籍のメタデータ（タイトル・著者など）を自動取得する。
- **OCR引用抽出:** カメラで撮影したページからテキストを読み取り、引用文として自動入力する。

## 🛠 技術スタック・アーキテクチャ (Tech Stack)
本プロジェクトは、フロントエンド、バックエンドAPI、および画像処理モジュールからなるフルスタック構成です。

- **Frontend:** TypeScript
- **Backend API:** C# (.NET)
- **Image Processing:** Rust
- **Infrastructure:** Docker / docker-compose

### 🏗 現在のアーキテクチャ課題と移行計画
現在、画像処理やOCRの重い処理をサーバーサイド（バックエンド）で実行していますが、ネットワーク遅延やサーバー負荷の観点から最適ではありません。
今後は、**Rustで記述した処理モジュールをWebAssembly (Wasm) にコンパイルし、フロントエンド（エッジ側）でローカル実行するアーキテクチャ**へのリファクタリングを予定しています。これにより、サーバー通信を最小限に抑えた爆速のUXを実現します。

## 📁 ディレクトリ構成 (Structure)
- `/frontend` : Webブラウザで動作するユーザーインターフェース
- `/backend-api` : 書籍データの取得やメモの保存を担うAPIサーバー
- `docker-compose.yml` : コンテナ群を一括起動するための設定
- `book-reading-memo.sln` : バックエンド開発用のVisual Studioソリューション

## 💻 ローカル開発環境の構築 (Getting Started)

Dockerを使用することで、簡単に開発環境を立ち上げることができます。

### 前提条件 (Prerequisites)
- Docker Desktop (または Docker Compose プラグイン)
- Visual Studio 2022 または互換性のあるIDE（バックエンド開発用）
- Node.js（フロントエンド単体での開発用）

### セットアップ手順 (Setup)
1. リポジトリをクローンします。
```bash
   git clone [https://github.com/YoshinoriSawaya/BookReadingMemo.git](https://github.com/YoshinoriSawaya/BookReadingMemo.git)
   cd BookReadingMemo
```

2. Docker Composeを使って、コンテナ群を一括起動します。
```bash
docker-compose up -d

```


3. 起動後、ブラウザからフロントエンドのURL（例: `http://localhost:3000` 等）にアクセスして動作を確認します。
※ APIサーバー単体をデバッグする場合は、`book-reading-memo.sln` を Visual Studio で開いて実行してください。

## 🐛 既知の課題・イシュー (Issues)

* [ ] バックエンドでの画像処理によるレスポンス遅延（Wasm化によって解消予定）
* [ ] （※その他、UIの崩れなどがあれば追記）

## 📄 ライセンス (License)

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).

