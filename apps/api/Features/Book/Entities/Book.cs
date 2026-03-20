
using System.ComponentModel.DataAnnotations;
using BookReading.Api.Core.Entities; // ドットあり


namespace BookReading.Api.Features.Books.Entities;

public class Book : BaseEntity
{
    [Required]
    [RegularExpression(@"^(978|979)\d{10}$", ErrorMessage = "ISBNは13桁の数字で入力してください。")]
    public string Isbn { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^19[12]\d{10}$", ErrorMessage = "C-CODEバーコードが正しくありません。")]
    public string Ccode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    // ナビゲーションプロパティ
    public List<BookAuthor> BookAuthors { get; set; } = new();
}
