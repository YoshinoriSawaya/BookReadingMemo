namespace BookReading.Api.Features.Books.DTOs;

public record BookResponse
{
    public int Id { get; init; }
    public string Isbn { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }

    // C-CODEからデコードした情報を個別に持たせる
    public string TargetName { get; init; } = string.Empty; // 例: "一般"
    public string FormatName { get; init; } = string.Empty; // 例: "文庫"
    public string CategoryName { get; init; } = string.Empty; // 例: "芸術・生活・スポーツ""

    // 著者リストなどは後ほど追加
    public List<string> Authors { get; init; } = new();
}