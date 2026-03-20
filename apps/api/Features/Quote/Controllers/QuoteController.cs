using BookReading.Api.Features.Quotes.DTOs;
using BookReading.Api.Features.Quotes.Entities;
using BookReading.Api.Features.Quotes.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BookReading.Api.Features.Quote.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotesController : ControllerBase
{
    private readonly IQuoteRepository _repository;

    public QuotesController(IQuoteRepository repository)
    {
        _repository = repository;
    }

    // 1. 引用の作成 (POST)
    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> Create([FromBody] QuoteRequest request)
    {
        var quote = new QuoteRecord
        {
            UserId = request.UserId,
            BookId = request.BookId,
            Text = request.Text,
            PageNumber = request.PageNumber
        };

        await _repository.AddAsync(quote);
        await _repository.SaveChangesAsync();

        // 作成されたリソースを返す
        var createdQuote = await _repository.GetByIdAsync(quote.Id);

        if (createdQuote == null) return StatusCode(500, "保存後のデータ取得に失敗しました。");

        return CreatedAtAction(nameof(GetById), new { id = quote.Id }, MapToResponse(createdQuote));
    }

    // 2. IDで1件取得 (GET)
    [HttpGet("{id}")]
    public async Task<ActionResult<QuoteResponse>> GetById(int id)
    {
        var quote = await _repository.GetByIdAsync(id);

        if (quote == null) return NotFound();

        return Ok(MapToResponse(quote));
    }

    // 3. 本に紐づく引用一覧を取得 (GET)
    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<QuoteResponse>>> GetByBookId(int bookId)
    {
        var quotes = await _repository.GetByBookIdAsync(bookId);
        var response = quotes.Select(MapToResponse).ToList();

        return Ok(response);
    }

    // 4. 引用の更新 (PUT) - ※引用は後からページ番号などを直したいケースが多いので追加
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] QuoteRequest request)
    {
        var quote = await _repository.GetByIdAsync(id);

        if (quote == null) return NotFound();

        // 更新内容を反映（※UserIdやBookIdは本来変更不可にすべきですが、ここではシンプルに）
        quote.Text = request.Text;
        quote.PageNumber = request.PageNumber;

        _repository.Update(quote);
        await _repository.SaveChangesAsync();

        return NoContent();
    }

    // 5. 引用の削除 (DELETE)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var quote = await _repository.GetByIdAsync(id);

        if (quote == null) return NotFound();

        _repository.Delete(quote);
        await _repository.SaveChangesAsync(); // 論理削除

        return NoContent();
    }

    // --- プライベートヘルパーメソッド ---

    private static QuoteResponse MapToResponse(QuoteRecord entity)
    {
        return new QuoteResponse
        {
            Id = entity.Id,
            BookId = entity.BookId,
            Text = entity.Text,
            PageNumber = entity.PageNumber,
            CreatedAt = entity.CreatedAt
        };
    }
}