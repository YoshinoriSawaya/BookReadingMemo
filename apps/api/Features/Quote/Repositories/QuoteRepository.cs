using BookReading.Api.Data;
using BookReading.Api.Features.Quotes.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookReading.Api.Features.Quotes.Repositories;

public class QuoteRepository : IQuoteRepository
{
    private readonly AppDbContext _context;

    public QuoteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<QuoteRecord?> GetByIdAsync(int id)
    {
        return await _context.QuoteRecords
            .Include(q => q.Thoughts) // 紐づく感想も一緒に取得したい場合
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<IEnumerable<QuoteRecord>> GetByBookIdAsync(int bookId)
    {
        return await _context.QuoteRecords
            .Where(q => q.BookId == bookId)
            .OrderBy(q => q.PageNumber) // ページ順に並べると便利
            .ToListAsync();
    }

    public async Task AddAsync(QuoteRecord quote)
    {
        await _context.QuoteRecords.AddAsync(quote);
    }

    public void Update(QuoteRecord quote)
    {
        _context.QuoteRecords.Update(quote);
    }

    public void Delete(QuoteRecord quote)
    {
        _context.QuoteRecords.Remove(quote);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}