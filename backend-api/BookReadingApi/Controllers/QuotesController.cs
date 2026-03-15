using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookReadingApi.Data;
using BookReadingApi.Models;

namespace BookReadingApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QuotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuotesController(AppDbContext context)
    {
        _context = context;
    }

    // 1. 引用を登録する
    [HttpPost]
    public async Task<ActionResult<QuoteRecord>> CreateQuote([FromBody] QuoteRecord quote)
    {
        // 本が存在するかチェック
        var bookExists = await _context.Books.AnyAsync(b => b.Id == quote.BookId);
        if (!bookExists) return NotFound("指定された本が見つかりません。");

        // ユーザーIDは一旦固定（ログイン機能実装前のため）
        quote.UserId = 1;

        _context.QuoteRecords.Add(quote);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuote), new { id = quote.Id }, quote);
    }

    // 2. 特定の引用を取得する
    [HttpGet("{id}")]
    public async Task<ActionResult<QuoteRecord>> GetQuote(int id)
    {
        var quote = await _context.QuoteRecords
            .Include(q => q.Thoughts) // 感想も一緒に見たい場合
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quote == null) return NotFound();

        return quote;
    }

    // 3. 特定の本に紐づく引用一覧を取得する
    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<QuoteRecord>>> GetQuotesByBook(int bookId)
    {
        return await _context.QuoteRecords
            .Where(q => q.BookId == bookId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }
}
