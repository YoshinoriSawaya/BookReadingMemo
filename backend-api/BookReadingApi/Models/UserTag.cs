namespace BookReadingApi.Models
{
    public class UserTag : BaseEntity
    {
        public int Id { get; set; }
        public int MasterTagId { get; set; } // 親
        public int UserId { get; set; }      // 所有者
        public string Name { get; set; } = string.Empty;

        public MasterTag? MasterTag { get; set; }
    }
}