using Microsoft.EntityFrameworkCore;
using BookReading.Api.Core.Entities;
using BookReading.Api.Features.Books.Entities;
// ▼ 今回追加したThought機能のエンティティを参照
using BookReading.Api.Features.Thoughts.Entities;
using BookReading.Api.Features.Quotes.Entities;
using BookReading.Api.Features.Users.Entities;


namespace BookReading.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // --- DbSet の定義 ---
    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<BookAuthor> BookAuthors => Set<BookAuthor>();
    // ▼ 今回追加するDbSet
    public DbSet<QuoteRecord> QuoteRecords => Set<QuoteRecord>();
    // ▼ 今回追加したDbSet
    public DbSet<ThoughtRecord> ThoughtRecords => Set<ThoughtRecord>();
    public DbSet<MasterTag> MasterTags => Set<MasterTag>();
    public DbSet<UserTag> UserTags => Set<UserTag>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. 中間テーブルの複合インデックス設定（同じ本に同じ著者が重複登録されるのを防ぐ）
        modelBuilder.Entity<BookAuthor>()
            .HasIndex(ba => new { ba.BookId, ba.AuthorId })
            .IsUnique();


        // --- ▼ ここから追加：MasterTag のシードデータ ---
        // マイグレーション生成のたびに差分が出ないよう、固定の日時を使用します
        var seedDate = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc);

        // ▼ テスト用ユーザーを追加（ID=1）
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, UserName = "TestUser", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false }
        );

        modelBuilder.Entity<MasterTag>().HasData(
            new MasterTag { Id = 1, Name = "感銘を受けた", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 2, Name = "新しい発見", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 3, Name = "要約・まとめ", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 4, Name = "批判的思考", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 5, Name = "実践したい", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 6, Name = "疑問・調査", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 7, Name = "関連書籍あり", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 8, Name = "お気に入り", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 9, Name = "難解", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false },
            new MasterTag { Id = 10, Name = "その他", CreatedAt = seedDate, UpdatedAt = seedDate, IsDeleted = false }
        );

        // MasterTag と UserTag のリレーション制御（任意ですが、安全のため記載）
        modelBuilder.Entity<UserTag>()
            .HasOne(u => u.MasterTag)
            .WithMany(m => m.UserTags)
            .HasForeignKey(u => u.MasterTagId)
            .OnDelete(DeleteBehavior.Restrict); // マスタータグが誤って削除されてもユーザータグを守る
                                                // --- ▲ ここまで追加 ---


        // ▼ User に紐づくデータの削除設定（必要に応じて設定）
        // ユーザーが削除されたとき、そのユーザーの「感想」「引用」「ユーザータグ」も一緒に削除する設定（Cascade）
        modelBuilder.Entity<ThoughtRecord>()
            .HasOne(t => t.User)
            .WithMany(u => u.ThoughtRecords)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<QuoteRecord>()
            .HasOne(q => q.User)
            .WithMany(u => u.QuoteRecords)
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserTag>()
            .HasOne(ut => ut.User)
            .WithMany(u => u.UserTags)
            .HasForeignKey(ut => ut.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // 2. グローバルクエリフィルターの一括適用
        // BaseEntity を継承しているすべてのエンティティに対し、IsDeleted == false のものだけ取得するよう設定
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(CreateIsDeletedFilter(entityType.ClrType));
            }
        }
    }

    // 3. 保存時のタイムスタンプ自動更新 (CreatedAt / UpdatedAt)
    public override int SaveChanges()
    {
        UpdateTimestampsAndHandleSoftDelete();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestampsAndHandleSoftDelete();
        return await base.SaveChangesAsync(cancellationToken);
    }
    private void UpdateTimestampsAndHandleSoftDelete()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity &&
                       (e.State == EntityState.Added ||
                        e.State == EntityState.Modified ||
                        e.State == EntityState.Deleted)); // ← Deleted を追加

        var now = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;

            switch (entry.State)
            {
                case EntityState.Added:
                    entity.CreatedAt = now;
                    entity.UpdatedAt = now;
                    break;

                case EntityState.Modified:
                    entity.UpdatedAt = now;
                    break;

                case EntityState.Deleted:
                    // ▼ 物理削除コマンドを検知したら、論理削除（更新）に切り替える
                    entry.State = EntityState.Modified;
                    entity.IsDeleted = true;
                    entity.UpdatedAt = now;
                    break;
            }
        }
    }

    // 論理削除フィルター用のヘルパーメソッド
    private static System.Linq.Expressions.LambdaExpression CreateIsDeletedFilter(Type type)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var falseConstant = System.Linq.Expressions.Expression.Constant(false);
        var comparison = System.Linq.Expressions.Expression.Equal(property, falseConstant);
        return System.Linq.Expressions.Expression.Lambda(comparison, parameter);
    }
}