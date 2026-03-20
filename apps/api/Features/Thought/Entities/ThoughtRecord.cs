using System.ComponentModel.DataAnnotations;
using BookReading.Api.Core.Entities;
using BookReading.Api.Features.Books.Entities; // Book参照用
using BookReading.Api.Features.Quotes.Entities; // Quote参照用
using BookReading.Api.Features.Users.Entities;

namespace BookReading.Api.Features.Thoughts.Entities;

public class ThoughtRecord : BaseEntity
{
    // BaseEntityにIdがある場合は定義不要
    [Required]
    public int UserId { get; set; }

    [Required]
    public int BookId { get; set; }

    public int? QuoteRecordId { get; set; }

    [Required]
    public int MasterTagId { get; set; } // 必須：システム共通10種

    public int? UserTagId { get; set; }    // 任意：詳細タグ

    [Required]
    public string Content { get; set; } = string.Empty;

    // ナビゲーションプロパティ
    // Userクラスの場所に応じてnamespaceを追加してください
    public User? User { get; set; }
    public Book? Book { get; set; }
    public QuoteRecord? QuoteRecord { get; set; }
    public MasterTag? MasterTag { get; set; }
    public UserTag? UserTag { get; set; }
}
