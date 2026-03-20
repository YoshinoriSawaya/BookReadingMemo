using System.ComponentModel.DataAnnotations;

namespace BookReading.Api.Features.Thoughts.DTOs;

public class UserTagRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int MasterTagId { get; set; }

    [Required]
    public int UserId { get; set; }
}

public class UserTagResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int MasterTagId { get; set; }
}