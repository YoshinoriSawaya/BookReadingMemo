using BookReading.Api.Features.Users.DTOs;
using BookReading.Api.Features.Users.Entities;
using BookReading.Api.Features.Users.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace BookReading.Api.Features.Users.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repository;

    public UsersController(IUserRepository repository)
    {
        _repository = repository;
    }

    // 1. ユーザーの作成 (POST)
    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create([FromBody] UserRequest request)
    {
        var user = new User
        {
            UserName = request.UserName
        };

        await _repository.AddAsync(user);
        await _repository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, MapToResponse(user));
    }

    // 2. IDで1件取得 (GET)
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _repository.GetByIdAsync(id);

        if (user == null) return NotFound();

        return Ok(MapToResponse(user));
    }

    // 3. 全ユーザー一覧を取得 (GET)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        var users = await _repository.GetAllAsync();
        var response = users.Select(MapToResponse).ToList();

        return Ok(response);
    }

    // 4. ユーザー名の更新 (PUT)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UserRequest request)
    {
        var user = await _repository.GetByIdAsync(id);

        if (user == null) return NotFound();

        user.UserName = request.UserName;

        _repository.Update(user);
        await _repository.SaveChangesAsync();

        return NoContent();
    }

    // 5. ユーザーの削除 (DELETE)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _repository.GetByIdAsync(id);

        if (user == null) return NotFound();

        _repository.Delete(user);
        await _repository.SaveChangesAsync(); // ここで論理削除が走る

        return NoContent();
    }

    // --- プライベートヘルパーメソッド ---

    private static UserResponse MapToResponse(User entity)
    {
        return new UserResponse
        {
            Id = entity.Id,
            UserName = entity.UserName
        };
    }
}