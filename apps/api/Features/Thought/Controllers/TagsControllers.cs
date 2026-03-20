using BookReading.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookReading.Api.Features.Thoughts.DTOs;
using BookReading.Api.Features.Thoughts.Entities;

namespace BookReading.Api.Features.Thoughts.Controllers;

[ApiController]
[Route("api")] // GET api/MasterTags になるよう調整
public class TagsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TagsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/MasterTags
    [HttpGet("MasterTags")]
    public async Task<IActionResult> GetMasterTags()
    {
        var tags = await _context.MasterTags
            .Where(t => !t.IsDeleted)
            .OrderBy(t => t.Id)
            .Select(t => new { t.Id, t.Name })
            .ToListAsync();
        return Ok(tags);
    }

    // GET: api/UserTags
    [HttpGet("UserTags")]
    public async Task<IActionResult> GetUserTags([FromQuery] int userId)
    {
        var tags = await _context.UserTags
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .Select(t => new { t.Id, t.Name, t.MasterTagId })
            .ToListAsync();
        return Ok(tags);
    }
    // --- 追記：ユーザータグの作成 (POST api/UserTags) ---
    [HttpPost("UserTags")]
    public async Task<ActionResult<UserTagResponse>> CreateUserTag([FromBody] UserTagRequest request)
    {
        // 1. Entityへの詰め替え
        var userTag = new UserTag
        {
            Name = request.Name,
            MasterTagId = request.MasterTagId,
            UserId = request.UserId
        };

        // 2. 保存
        _context.UserTags.Add(userTag);
        await _context.SaveChangesAsync();

        // 3. Response DTOに変換して返す
        var response = new UserTagResponse
        {
            Id = userTag.Id,
            Name = userTag.Name,
            MasterTagId = userTag.MasterTagId
        };

        return CreatedAtAction(nameof(GetUserTags), new { userId = userTag.UserId }, response);
    }
}