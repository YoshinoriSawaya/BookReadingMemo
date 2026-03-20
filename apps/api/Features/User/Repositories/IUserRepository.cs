using BookReading.Api.Features.Users.Entities;

namespace BookReading.Api.Features.Users.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<IEnumerable<User>> GetAllAsync(); // ユーザー一覧用
    Task AddAsync(User user);
    void Update(User user);
    void Delete(User user);
    Task SaveChangesAsync();
}