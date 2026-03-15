using System.ComponentModel.DataAnnotations;

namespace BookReadingApi.Models
{
    public class ThoughtRecord : BaseEntity
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        /// <summary>
        /// 引用に対する感想の場合はそのID。
        /// Nullの場合は「本全体に対する感想」として扱う。
        /// </summary>
        public int? QuoteRecordId { get; set; }

        // --- タグ情報 ---
        [Required]
        public int MasterTagId { get; set; } // システム共通の10種（必須）

        public int? UserTagId { get; set; }    // ユーザーが自由に作った詳細タグ（任意）

        [Required]
        public string Content { get; set; } = string.Empty; // 感想本文


        // ナビゲーションプロパティ
        public User? User { get; set; }
        public Book? Book { get; set; }
        public QuoteRecord? QuoteRecord { get; set; }
        public MasterTag? MasterTag { get; set; }
        public UserTag? UserTag { get; set; }
    }
}