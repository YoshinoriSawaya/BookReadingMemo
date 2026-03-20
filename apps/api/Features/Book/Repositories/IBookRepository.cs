using BookReading.Api.Features.Books.Entities;

namespace BookReading.Api.Features.Books.Repositories;

public interface IBookRepository
{
    Task<IEnumerable<Book>> GetAllAsync();
    Task<Book?> GetByIdAsync(int id);
    Task<Book?> GetByIsbnAsync(string isbn);
    Task AddAsync(Book book);
    Task SaveChangesAsync();
}