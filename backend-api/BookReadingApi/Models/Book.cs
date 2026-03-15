using System.ComponentModel.DataAnnotations;

namespace BookReadingApi.Models
{
    public class Book : BaseEntity
    {
        public int Id { get; set; }

        [Required]
        public string Isbn { get; set; } = string.Empty; // ISBNを必須に

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? ImageUrl { get; set; } // 書影URL（空でもOK）

        // 中間テーブルへのナビゲーションプロパティ
        public List<BookAuthor> BookAuthors { get; set; } = new();
    }
}