using System.ComponentModel.DataAnnotations;

namespace BookReading.Api.Features.Users.DTOs;

public class UserRequest
{
    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;
}

public class UserResponse
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
}