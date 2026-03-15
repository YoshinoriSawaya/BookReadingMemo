using Microsoft.EntityFrameworkCore;
using BookReadingApi.Models;

namespace BookReadingApi.Data;

public class AppDbContext : DbContext
{
    //User
    public DbSet<User> Users { get; set; }
    //著者
    public DbSet<Author> Authors { get; set; }
    //本
    public DbSet<Book> Books { get; set; }

    //本、著者ブリッジ
    public DbSet<BookAuthor> BookAuthors { get; set; }

    //Tag
    public DbSet<MasterTag> MasterTags { get; set; }
    public DbSet<UserTag> UserTags { get; set; }

    //引用、感想
    public DbSet<QuoteRecord> QuoteRecords { get; set; }
    public DbSet<ThoughtRecord> ThoughtRecords { get; set; }





    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // BookId と AuthorId の組み合わせをユニーク（唯一）にする
        modelBuilder.Entity<BookAuthor>()
            .HasIndex(ba => new { ba.BookId, ba.AuthorId })
            .IsUnique();
        modelBuilder.Entity<BookAuthor>().HasQueryFilter(x => !x.IsDeleted);

        modelBuilder.Entity<Book>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Author>().HasQueryFilter(x => !x.IsDeleted);

        modelBuilder.Entity<QuoteRecord>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<ThoughtRecord>().HasQueryFilter(x => !x.IsDeleted);

        modelBuilder.Entity<UserTag>().HasQueryFilter(x => !x.IsDeleted);

    }
    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            var now = DateTime.Now;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = now;
            }
            entity.UpdatedAt = now;
        }
    }
}