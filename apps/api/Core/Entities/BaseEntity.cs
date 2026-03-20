namespace BookReading.Api.Core.Entities;

public abstract class BaseEntity<TKey>
{
    public TKey Id { get; set; } = default!; // int か Guid かを選べるように

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // 論理削除
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    // 排他制御用（Postgresなら [Timestamp] 属性などで xmin をマッピングすることもあります）
    // public uint RowVersion { get; set; } 
}

// 普段使い用のエイリアス（int IDが多い場合）
public abstract class BaseEntity : BaseEntity<int> { }