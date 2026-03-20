using System.ComponentModel.DataAnnotations;

namespace BookReading.Api.Features.Thoughts.DTOs;

// ▼ クライアントから送られてくるデータ
public class ThoughtRequest
{
    [Required]
    public int UserId { get; set; } // ※将来的には認証トークンから取得するのがベストです

    [Required]
    public int BookId { get; set; }

    public int? QuoteRecordId { get; set; }

    [Required]
    public int MasterTagId { get; set; }

    public int? UserTagId { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;
}

// ▼ クライアントに返すデータ
public class ThoughtResponse
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public int? QuoteRecordId { get; set; }
    public string Content { get; set; } = string.Empty;

    // タグはIDだけでなく、名前（文字列）も返してあげるとフロントエンドが楽です
    public string MasterTagName { get; set; } = string.Empty;
    public string? UserTagName { get; set; }

    public DateTime CreatedAt { get; set; }
}