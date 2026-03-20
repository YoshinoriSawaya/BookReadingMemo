using BookReading.Api.Features.Thoughts.Entities;

namespace BookReading.Api.Features.Thoughts.Repositories;

public interface IThoughtRepository
{
    Task<ThoughtRecord?> GetByIdAsync(int id);
    Task<IEnumerable<ThoughtRecord>> GetByBookIdAsync(int bookId);
    Task<IEnumerable<ThoughtRecord>> GetByUserIdAsync(int userId);
    Task AddAsync(ThoughtRecord thought);
    void Update(ThoughtRecord thought);
    void Delete(ThoughtRecord thought); // SaveChangesで論理削除される仕組み
    Task SaveChangesAsync();
}