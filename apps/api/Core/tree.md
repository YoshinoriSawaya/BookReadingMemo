`Core` フォルダは、アプリケーションの**「心臓部」であり「憲法」**のような場所です。

特定の機能（Book や Quote）に依存せず、システム全体で守るべきルールや、どこからでも参照される共通の定義を格納します。クリーンアーキテクチャの文脈では、ここにあるコードは**外部（DB や API）のライブラリに依存してはいけない**という鉄則があります。

具体的に `Core` フォルダに入れるべき要素は以下の通りです。

---

## 1. Core フォルダの中身（構成案）

```text
E:.
└─Core
    ├─Entities           (全機能で共通のベースクラス)
    │  └─BaseEntity.cs
    ├─Interfaces         (システム基盤の契約)
    │  └─IDateTimeProvider.cs (時刻取得の抽象化)
    ├─Exceptions         (業務上のカスタムエラー)
    │  └─DomainException.cs
    ├─Constants          (システム共通の定数)
    │  └─RoleConstants.cs
    └─Enums              (共通の列挙型)
       └─StatusType.cs
```

---

## 2. 具体的な役割と「なぜここか」の理由

### ① Entities (共通基盤)
今回作成した `BaseEntity.cs` がここに入ります。
すべての `Features`（Book, Quote, Thought）がこれを継承するため、ピラミッドの頂点に置く必要があります。

### ② Interfaces (システム共通の契約)
機能ごとのリポジトリ（IBookRepository）ではなく、**「システムとしてどう振る舞うか」**のインターフェースです。
* **例: `IDateTimeProvider`**
  `DateTime.UtcNow` を直接使うのではなく、インターフェース経由にすることで、テスト時に「2026年3月15日」の状態をシミュレートしやすくなります。

### ③ Exceptions (カスタム例外)
「本が見つからない」「権限がない」といった、このアプリ固有の例外クラスを定義します。
* 理由：Controller や UseCase で `throw new NotFoundException("Book not found")` と書く際、どこからでも参照できる必要があります。

### ④ Value Objects (値オブジェクト)
これは少し高度ですが、例えば「ISBN」という文字列を単なる `string` ではなく、**「ISBN型」**として定義する場合に置きます。
* 自前でバリデーションロジック（13桁チェック等）を内包させることができ、不正なISBNがシステム内に紛れ込むのを防げます。

---

## 3. Core に「入れてはいけない」もの

ここが設計の分かれ道です。以下のものは **Core には入れず**、前回決めた通り `Features` か `Infrastructure` に置きます。

* **NuGetパッケージに依存するコード**: `Microsoft.EntityFrameworkCore` などの特定の技術に依存するものは Core に入れません。
* **特定の機能のロジック**: 「本のスキャン手順」は `Features/Book` にあるべきで、Core はそれを知りません。
* **DB接続文字列**: これは環境依存なので、Core は関与しません。

---

## 💡 アドバイス

まずは **`BaseEntity.cs`** と、それに関連する **`Exceptions`（共通エラー）** くらいから始めるのがスッキリして良いと思います。

次は、Core に置いた `BaseEntity` を使って、**`AppDbContext` で「作成日時・更新日時を全自動でセットする魔法のコード」**を実装してみますか？ 

これを作ると、`Features` 側の開発がめちゃくちゃ楽になりますよ。