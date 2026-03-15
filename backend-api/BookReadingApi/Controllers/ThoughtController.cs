using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookReadingApi.Data;
using BookReadingApi.Models;

namespace BookReadingApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ThoughtsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ThoughtsController(AppDbContext context)
    {
        _context = context;
    }

    // 1. 感想を投稿する
    [HttpPost]
    public async Task<ActionResult<ThoughtRecord>> CreateThought([FromBody] ThoughtRecord thought)
    {
        // 1. 本の存在チェック
        var bookExists = await _context.Books.AnyAsync(b => b.Id == thought.BookId);
        if (!bookExists) return NotFound("指定された本が見つかりません。");

        // 2. MasterTag（必須）の存在チェック
        var masterTagExists = await _context.MasterTags.AnyAsync(t => t.Id == thought.MasterTagId);
        if (!masterTagExists) return BadRequest("有効なMasterTagIDを指定してください。");

        // 3. UserTag（任意）が指定されている場合の存在チェック
        if (thought.UserTagId.HasValue)
        {
            var userTagExists = await _context.UserTags.AnyAsync(t => t.Id == thought.UserTagId.Value);
            if (!userTagExists) return BadRequest("指定されたUserTagIDが存在しません。");
        }

        thought.UserId = 1; // 固定（後で認証実装）

        _context.ThoughtRecords.Add(thought);
        await _context.SaveChangesAsync();

        // 4. フロントでタグ名を表示できるよう、Includeして返却
        var result = await _context.ThoughtRecords
            .Include(t => t.MasterTag)
            .Include(t => t.UserTag) // ここで UserTag も結合
            .FirstOrDefaultAsync(t => t.Id == thought.Id);

        return Ok(result);
    }

    // 2. 特定の本に紐づく感想一覧を取得する
    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<ThoughtRecord>>> GetThoughtsByBook(int bookId)
    {
        return await _context.ThoughtRecords
            .Include(t => t.MasterTag)
            .Include(t => t.UserTag)
            .Where(t => t.BookId == bookId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
}
