using BookReading.Api.Core.Entities;

namespace BookReading.Api.Features.Thoughts.Entities;

public class MasterTag : BaseEntity
{
    // BaseEntityにIdがある場合は定義不要
    public string Name { get; set; } = string.Empty;

    // ナビゲーションプロパティ
    public ICollection<UserTag> UserTags { get; set; } = new List<UserTag>();
    public ICollection<ThoughtRecord> ThoughtRecords { get; set; } = new List<ThoughtRecord>();
}
