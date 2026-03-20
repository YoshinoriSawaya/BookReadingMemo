using System.ComponentModel.DataAnnotations;

namespace BookReading.Api.Features.Quotes.DTOs;

public class QuoteRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int BookId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    public int? PageNumber { get; set; }
}

public class QuoteResponse
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int? PageNumber { get; set; }
    public DateTime CreatedAt { get; set; }

    // 引用と一緒に、紐づく感想も返したい場合はここにリストを持たせます
    // public List<ThoughtResponse> Thoughts { get; set; } = new();
}