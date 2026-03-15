using System.ComponentModel.DataAnnotations;

namespace BookReadingApi.Models
{
    public class Author : BaseEntity
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        // 中間テーブルへのナビゲーションプロパティ
        public List<BookAuthor> BookAuthors { get; set; } = new();
    }
}