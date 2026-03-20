using BookReading.Api.Data;
using BookReading.Api.Features.Books.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookReading.Api.Features.Books.Repositories;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    public BookRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<Book>> GetAllAsync()
    {
        return await _context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .OrderByDescending(b => b.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Book?> GetByIdAsync(int id)
    {
        return await _context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Book?> GetByIsbnAsync(string isbn)
    {
        return await _context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Isbn == isbn);
    }

    public async Task AddAsync(Book book) => await _context.Books.AddAsync(book);

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
}