using BookReading.Api.Features.Quotes.Entities;

namespace BookReading.Api.Features.Quotes.Repositories;

public interface IQuoteRepository
{
    Task<QuoteRecord?> GetByIdAsync(int id);
    Task<IEnumerable<QuoteRecord>> GetByBookIdAsync(int bookId);
    Task AddAsync(QuoteRecord quote);
    void Update(QuoteRecord quote);
    void Delete(QuoteRecord quote);
    Task SaveChangesAsync();
}