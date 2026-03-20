using System.ComponentModel.DataAnnotations;
using BookReading.Api.Core.Entities;

namespace BookReading.Api.Features.Books.Entities;

/// <summary>
/// 著者情報を保持するエンティティ
/// </summary>
public class Author : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    // TODO: 必要に応じて著者のプロフィール、国籍などのフィールドを追加
    // public string? Biography { get; set; }

    /// <summary>
    /// 中間テーブルへのナビゲーションプロパティ
    /// Bookエンティティ側でもコメントアウトを外して、多対多の関係を構成します
    /// </summary>
    public List<BookAuthor> BookAuthors { get; set; } = new();
}

/// <summary>
/// Book と Author を結びつける中間テーブル用エンティティ
/// </summary>
public class BookAuthor : BaseEntity
{
    [Required]
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;

    [Required]
    public int AuthorId { get; set; }
    public Author Author { get; set; } = null!;
}