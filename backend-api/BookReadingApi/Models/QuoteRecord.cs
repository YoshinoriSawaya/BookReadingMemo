using System.ComponentModel.DataAnnotations;

namespace BookReadingApi.Models
{
    public class QuoteRecord : BaseEntity
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty; // 引用した文章

        public int? PageNumber { get; set; } // ページ番号（任意）


        // ナビゲーションプロパティ
        public User? User { get; set; }
        public Book? Book { get; set; }

        // この引用に紐づく複数の感想（一対多）
        public List<ThoughtRecord> Thoughts { get; set; } = new();
    }
}