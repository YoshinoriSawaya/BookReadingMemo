using BookReading.Api.Data;
using BookReading.Api.Features.Thoughts.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookReading.Api.Features.Thoughts.Repositories;

public class ThoughtRepository : IThoughtRepository
{
    private readonly AppDbContext _context;

    public ThoughtRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ThoughtRecord?> GetByIdAsync(int id)
    {
        return await _context.ThoughtRecords
            .Include(t => t.MasterTag)
            .Include(t => t.UserTag)
            .Include(t => t.QuoteRecord)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<ThoughtRecord>> GetByBookIdAsync(int bookId)
    {
        return await _context.ThoughtRecords
            .Where(t => t.BookId == bookId)
            .Include(t => t.MasterTag)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ThoughtRecord>> GetByUserIdAsync(int userId)
    {
        return await _context.ThoughtRecords
            .Where(t => t.UserId == userId)
            .Include(t => t.Book)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(ThoughtRecord thought)
    {
        await _context.ThoughtRecords.AddAsync(thought);
    }

    public void Update(ThoughtRecord thought)
    {
        _context.ThoughtRecords.Update(thought);
    }

    public void Delete(ThoughtRecord thought)
    {
        _context.ThoughtRecords.Remove(thought);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}