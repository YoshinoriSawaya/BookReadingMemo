using System.ComponentModel.DataAnnotations;

namespace BookReadingApi.Models;

public class User : BaseEntity
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;
}