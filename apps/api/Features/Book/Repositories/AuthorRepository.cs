using BookReading.Api.Features.Books.Entities;
using Microsoft.EntityFrameworkCore;
using BookReading.Api.Data; // DbContextの名前空間

namespace BookReading.Api.Features.Books.Repositories;

public class AuthorRepository : IAuthorRepository
{
    private readonly AppDbContext _context;

    public AuthorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Author?> GetByIdAsync(int id)
    {
        // BaseEntity の論理削除フラグを考慮
        return await _context.Authors
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
    }

    public async Task<Author?> GetByNameAsync(string name)
    {
        // 名前で完全一致検索（大文字小文字の扱いはDB設定に依存）
        // 重複を避けるため、論理削除されていないものを優先
        return await _context.Authors
            .FirstOrDefaultAsync(a => a.Name == name && !a.IsDeleted);
    }

    public async Task AddAsync(Author author)
    {
        await _context.Authors.AddAsync(author);
        // SaveChangesAsync は UnitOfWork パターンや UseCase 側で一括で行うのが一般的ですが、
        // リポジトリ単体で完結させる設計ならここに追加します。
    }
}