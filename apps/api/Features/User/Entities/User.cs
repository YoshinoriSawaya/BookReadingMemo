using System.ComponentModel.DataAnnotations;
using BookReading.Api.Core.Entities;
// 他の機能のエンティティを参照
using BookReading.Api.Features.Thoughts.Entities;
using BookReading.Api.Features.Quotes.Entities;

namespace BookReading.Api.Features.Users.Entities; // <-- ネームスペースは複数形

public class User : BaseEntity
{
    // public int Id { get; set; } // BaseEntityにIdがある場合は不要です

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;

    // --- ナビゲーションプロパティ（1対多） ---
    // ユーザーが作成した感想
    public ICollection<ThoughtRecord> ThoughtRecords { get; set; } = new List<ThoughtRecord>();

    // ユーザーが作成した引用
    public ICollection<QuoteRecord> QuoteRecords { get; set; } = new List<QuoteRecord>();

    // ユーザーが独自に作成したタグ
    public ICollection<UserTag> UserTags { get; set; } = new List<UserTag>();
}