# Book Reading API
本プロジェクトは、書籍の読書記録、引用（Quote）、思考・メモ（Thought）を管理するための Web API です。
現在は個人で開発を進めていますが、**将来的なチーム開発へのスケールアップ**や、**新しいメンバー（初学者）のオンボーディング**を想定したアーキテクチャを採用しています。

## アーキテクチャの概要

本 API は、機能ごとの凝集度を高め、保守性と拡張性を向上させるために **フィーチャーベース（垂直スライス）アーキテクチャ** を採用しています。
従来のレイヤーごとのディレクトリ分割（Controllers, Services, Models...）を廃止し、ドメイン機能（Feature）ごとに必要な要素をカプセル化しています。

### 採用している設計原則
* **関心の分離 (Separation of Concerns):** ビジネスロジック、データアクセス、APIのエンドポイント定義を明確に分離。
* **依存性逆転の原則 (Dependency Inversion Principle):** レイヤーをまたぐ通信はインターフェースに依存させ、実装の詳細（データベースや外部API）から分離。
* **単一責任の原則 (Single Responsibility Principle):** 各機能が自身のドメイン知識のみを持つように設計。

---

## ディレクトリ構成と役割

プロジェクトの全体像が直感的に把握できるよう、主要なディレクトリとファイルのみを抜粋した構成図です。

```text
BookReadingApi/
│  Program.cs                // アプリケーションのエントリポイント・DI等の設定
│  appsettings.json          // アプリケーション環境設定
│
├─ Core/                     // システム全体で共有する基盤コード
│  ├─ Constants/             // 定数クラス
│  ├─ Entities/              // 共通の基底クラス (BaseEntity.cs など)
│  ├─ Enums/                 // 列挙型
│  └─ Exceptions/            // カスタム例外
│
├─ Data/                     // インフラストラクチャ層
│  └─ AppDbContext.cs        // EF Core データベースコンテキスト
│
└─ Features/                 // 機能（ドメイン）ごとの垂直スライス
   │
   ├─ Book/                  // 【例】複雑なビジネスロジックを持つ機能
   │  ├─ Controllers/        // BooksController.cs
   │  ├─ DTOs/               // BookRequest.cs, BookResponse.cs
   │  ├─ Entities/           // Book.cs, Author.cs
   │  ├─ Repositories/       // IBookRepository.cs, BookRepository.cs
   │  └─ UseCase/            // IBookUseCase.cs, BookUseCase.cs
   │
   ├─ Quote/                 // 引用関連機能
   │
   ├─ Thought/               // 【例】シンプルなCRUD構成の機能
   │  ├─ Controllers/        // ThoughtsController.cs
   │  ├─ DTOs/               // ThoughtDTOs.cs
   │  ├─ Entities/           // ThoughtRecord.cs
   │  └─ Repositories/       // IThoughtRepository.cs, ThoughtRepository.cs
   │                           // ※単純な機能のため UseCase は意図的に省略
   │
   └─ User/                  // ユーザー関連機能
```
### 1. `Features/` (中核機能)
アプリケーションの各機能（ドメイン）ごとにフォルダを分割しています。新しい機能を追加する場合は、この配下に新しいフォルダを作成し、その中で実装を完結させます。

* `Book/` : 書籍情報および外部書籍API連携に関する機能
* `Quote/` : 書籍からの引用に関する機能
* `Thought/` : 読書を通じた思考・メモ・タグ付けに関する機能
* `User/` : ユーザー情報に関する機能

**各機能（Feature）内の標準的な構造:**
* `Controllers/` : HTTPリクエストを受け取り、レスポンスを返すAPIエンドポイント。
* `UseCase/` : アプリケーションの複雑なビジネスロジックをカプセル化する層。（※単純なCRUDの場合は省略可）
* `Repositories/` : DBや外部APIへのアクセスを抽象化する層。必ずインターフェース（`I...Repository`）を定義し、DI コンテナに登録します。
* `Entities/` : データベースのテーブルとマッピングされるドメインモデル。
* `DTOs/` : クライアントとのデータのやり取り（リクエスト/レスポンス）専用のデータ転送オブジェクト。APIの契約を定義します。

### 2. `Core/` (共通基盤)
アプリケーション全体で共有される要素を配置します。
* `Entities/` : 共通の基底エンティティ（`BaseEntity.cs` など）。
* `Constants/`, `Enums/` : システム全体で利用する定数や列挙型。
* `Exceptions/` : カスタム例外クラス。

### 3. `Data/` (インフラストラクチャ)
* `AppDbContext.cs` : Entity Framework Core のコンテキストクラス。

---

## 開発ガイドライン：新機能の追加手順

1. **DTOの定義:** `Features/{FeatureName}/DTOs/` にリクエストとレスポンスの型を定義。
2. **Entityの定義:** DB保存が必要な場合は `Entities/` に定義し、`AppDbContext` に追加して Migration を実行。
3. **Repositoryの実装:** データの保存・取得ロジックを `Repositories/` にインターフェースと共に実装。
4. **UseCaseの実装:** `UseCase/` にビジネスロジックを実装し、Repository を DI してデータを処理。
5. **Controllerの追加:** `Controllers/` でエンドポイントを公開し、UseCase（またはRepository）を呼び出して DTO を返却。

---

## テクノロジースタック

* **Framework:** .NET 10 (ASP.NET Core Web API)
* **ORM:** Entity Framework Core
* **Database:** PostgreSQL (Npgsql)
* **API Documentation:** OpenAPI / Swagger / Scalar

---

## 設計思想：クリーンアーキテクチャとプラグマティックなアプローチ

本プロジェクトでは、クリーンアーキテクチャやドメイン駆動設計（DDD）のエッセンスを取り入れつつも、過度な複雑さ（オーバーエンジニアリング）を避けるために、実用性と開発体験（DX）を優先した「意図的な妥協」をルール化しています。

### 🚨 絶対に守るべきルール (Strict Rules)

保守性とテスト容易性を担保するため、以下の原則は厳密に適用しています。

* **層の境界を越える際は、必ず DI（依存性の注入）を利用する**
  ControllerからRepositoryを呼ぶ場合や、UseCaseから他機能のRepositoryを呼ぶ場合など、レイヤーや機能をまたぐ通信は必ずインターフェース（`I...`）をコンストラクタインジェクションで注入してください。具象クラスの直接インスタンス化（`new`）は禁止です。
* **モデルとコントラクト（契約）の分離**
  DBの構造を表す `Entity` と、APIの入出力を表す `DTO` は明確に分けます。DBスキーマの変更がAPIのレスポンスに意図せず影響を与えることを防ぎます。

### ⚖️ 意図的な妥協と許容事項 (Pragmatic Trade-offs)

開発スピードや認知負荷の軽減を優先し、以下の点を「正解」として許容しています。

* **シンプルなCRUDにおける UseCase の省略**
  複雑なビジネスロジックを持たない単純なデータの登録・取得（Thought機能など）においては、無意味なパススルー層を作るのを避けるため、Controllerから直接 `IRepository` をDIして呼び出すことを許可します。
* **Repository パターンの広義な解釈（DBと外部APIの統一）**
  自システムDB（EF Core）へのアクセスであれ、外部APIからの取得であれ、データソースを問わず `Repository` と命名・配置しています。呼び出し側が「どこからデータを取ってくるか」を意識させないための措置です。
* **Feature（機能）間のクロスリファレンスの許容**
  厳密な機能の独立性よりもモノリスとしての開発しやすさを優先します。
  * **Entity:** EF Coreの `.Include()` の恩恵を受けるため、他FeatureのEntityへのナビゲーションプロパティ（直接参照）を持たせます。
  * **DI:** ControllerやUseCaseから、他のFeatureのUseCaseやRepositoryを直接DIして呼び出すことを許可します。
* **レイヤー間の物理的な完全分離（プロジェクト分割）の省略**
  垂直スライス（フィーチャーベース）を優先し、同一フォルダ（`Features/{FeatureName}/`）内にインターフェースも実装（インフラストラクチャ）も同居させています。
* **データモデルとドメインモデルの共用**
  冗長なマッピングを避けるため、EF Coreの `Entity` クラスをそのままドメインモデルとして扱います。
* **CQRSの未導入（シンプルなCRUD構成）**
  現在の要件において読み取りと書き込みのモデルを完全に分離するほどの複雑性はないと判断し、一つの Repository と UseCase でデータの参照と更新の両方を扱っています。将来的に特定の参照系のパフォーマンス要件が厳しくなった場合にのみ、部分的な導入を検討します。

---

## 📝 命名規則 (Naming Conventions)

初学者がファイルを探しやすく、追加しやすくするための統一ルールです。

* **ディレクトリとController:**
  * ドメイン（機能）のフォルダ名は **単数形** （例: `Book`, `Quote`）。
  * Controller のクラス名およびファイル名は **複数形** に統一（例: `BooksController`, `ThoughtsController`）。
* **Entityのサフィックス（接尾辞）:**
  * システムが提供する共通のマスターデータにはサフィックスを付けません（例: `Book`, `User`, `MasterTag`）。
  * ユーザーが自身の操作で生成するトランザクションデータ（記録）には `Record` を付け、視覚的に区別します（例: `ThoughtRecord`, `QuoteRecord`）。


---
## 🚀 今後のTODO (Future Work)

本プロジェクトのアーキテクチャ（依存性逆転の原則とDIの徹底）の恩恵を活かし、以下の順序でテストコードの拡充を予定しています。

* **UseCase の単体テスト（Unit Test）**
  * `Moq` 等を利用して Repository のインターフェースをモック化し、データベースに依存せずにビジネスロジックの振る舞いを高速に検証します。
* **Controller の統合テスト（Integration Test）**
  * `WebApplicationFactory` を使用し、エンドポイントの入出力（DTOのシリアライズ・HTTPステータスコード）が仕様通りに機能するかを検証します。特に UseCase を省略しているシンプルなCRUD機能（Thought機能など）の品質担保に活用します。
* **ドキュメント生成の自動化**
  * SwaggerでのAPI仕様は書けているが、テストコードからドキュメントを生成し、別軸から参照出来るようにしたい。 
