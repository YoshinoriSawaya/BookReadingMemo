using BookReading.Api.Features.Books.Entities;

namespace BookReading.Api.Features.Books.Repositories;

public interface IAuthorRepository
{
    Task<Author?> GetByIdAsync(int id);

    /// <summary>
    /// 名前で著者を検索します（重複登録防止用）
    /// </summary>
    Task<Author?> GetByNameAsync(string name);

    Task AddAsync(Author author);

    // 必要に応じて
    // Task<IEnumerable<Author>> GetAllAsync();
}