using BookReading.Api.Features.Thoughts.DTOs;
using BookReading.Api.Features.Thoughts.Entities;
using BookReading.Api.Features.Thoughts.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BookReading.Api.Features.Thoughts.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThoughtsController : ControllerBase
{
    private readonly IThoughtRepository _repository;

    public ThoughtsController(IThoughtRepository repository)
    {
        _repository = repository;
    }

    // 1. 感想の作成 (POST)
    [HttpPost]
    public async Task<ActionResult<ThoughtResponse>> Create([FromBody] ThoughtRequest request)
    {
        // DTO -> Entity へのマッピング
        var thought = new ThoughtRecord
        {
            UserId = request.UserId,
            BookId = request.BookId,
            QuoteRecordId = request.QuoteRecordId,
            MasterTagId = request.MasterTagId,
            UserTagId = request.UserTagId,
            Content = request.Content
        };

        await _repository.AddAsync(thought);
        await _repository.SaveChangesAsync();

        // 登録後、タグ情報などを含めて再取得する（レスポンスをリッチにするため）
        var createdThought = await _repository.GetByIdAsync(thought.Id);

        if (createdThought == null) return StatusCode(500, "保存後のデータ取得に失敗しました。");

        return CreatedAtAction(nameof(GetById), new { id = thought.Id }, MapToResponse(createdThought));
    }

    // 2. IDで1件取得 (GET)
    [HttpGet("{id}")]
    public async Task<ActionResult<ThoughtResponse>> GetById(int id)
    {
        var thought = await _repository.GetByIdAsync(id);

        if (thought == null) return NotFound();

        return Ok(MapToResponse(thought));
    }

    // 3. 本に紐づく感想一覧を取得 (GET)
    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<ThoughtResponse>>> GetByBookId(int bookId)
    {
        var thoughts = await _repository.GetByBookIdAsync(bookId);
        var response = thoughts.Select(MapToResponse).ToList();

        return Ok(response);
    }

    // 4. 感想の削除 (DELETE)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var thought = await _repository.GetByIdAsync(id);

        if (thought == null) return NotFound();

        _repository.Delete(thought);
        await _repository.SaveChangesAsync(); // ここで論理削除が走る

        return NoContent();
    }

    // --- プライベートヘルパーメソッド ---

    // Entity -> DTO へのマッピングを共通化
    private static ThoughtResponse MapToResponse(ThoughtRecord entity)
    {
        return new ThoughtResponse
        {
            Id = entity.Id,
            BookId = entity.BookId,
            QuoteRecordId = entity.QuoteRecordId,
            Content = entity.Content,
            MasterTagName = entity.MasterTag?.Name ?? string.Empty,
            UserTagName = entity.UserTag?.Name,
            CreatedAt = entity.CreatedAt
        };
    }
}