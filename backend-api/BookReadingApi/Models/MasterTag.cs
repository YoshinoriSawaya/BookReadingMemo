namespace BookReadingApi.Models
{
    public class MasterTag : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}