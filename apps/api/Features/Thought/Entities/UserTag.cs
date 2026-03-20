using BookReading.Api.Core.Entities;
using BookReading.Api.Features.Users.Entities;

namespace BookReading.Api.Features.Thoughts.Entities;

public class UserTag : BaseEntity
{
    public int MasterTagId { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;

    // ナビゲーションプロパティ
    // Userクラスの場所に応じてnamespaceを追加してください
    public User? User { get; set; }
    public MasterTag? MasterTag { get; set; }
    public ICollection<ThoughtRecord> ThoughtRecords { get; set; } = new List<ThoughtRecord>();
}
