using System.ComponentModel.DataAnnotations;
using BookReading.Api.Core.Entities;
using BookReading.Api.Features.Books.Entities;
using BookReading.Api.Features.Thoughts.Entities; // ThoughtRecordを参照するため
using BookReading.Api.Features.Users.Entities;

namespace BookReading.Api.Features.Quotes.Entities;

public class QuoteRecord : BaseEntity
{
    // public int Id { get; set; } // BaseEntityにIdがある場合は不要です

    [Required]
    public int UserId { get; set; }

    [Required]
    public int BookId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty; // 引用した文章

    public int? PageNumber { get; set; } // ページ番号（任意）


    // ナビゲーションプロパティ
    public User? User { get; set; } // Userの配置場所に応じてusingを追加してください
    public Book? Book { get; set; }

    // この引用に紐づく複数の感想（一対多）
    public List<ThoughtRecord> Thoughts { get; set; } = new();
}