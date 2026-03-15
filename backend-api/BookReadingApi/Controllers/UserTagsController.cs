using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookReadingApi.Data;
using BookReadingApi.Models;

namespace BookReadingApi.Controllers;

// 受け取り用DTO
public class UserTagCreateDto
{
    public string Name { get; set; } = string.Empty;
    public int MasterTagId { get; set; }
    public int UserId { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class UserTagsController : ControllerBase
{
    private readonly AppDbContext _context;
    public UserTagsController(AppDbContext context) { _context = context; }

    [HttpPost] // これが必要！
    public async Task<ActionResult<UserTag>> CreateUserTag([FromBody] UserTagCreateDto dto)
    {
        var userTag = new UserTag
        {
            Name = dto.Name,
            MasterTagId = dto.MasterTagId, // 親となるマスタータグのID
            UserId = dto.UserId
        };

        _context.UserTags.Add(userTag);
        await _context.SaveChangesAsync();

        return Ok(userTag);
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserTag>>> GetUserTags()
    {
        // とりあえず UserId = 1 のものを返す
        return await _context.UserTags.Where(t => t.UserId == 1).ToListAsync();
    }
}