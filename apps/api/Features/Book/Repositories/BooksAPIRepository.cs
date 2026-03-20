using System.Text.Json;
using BookReading.Api.Features.Books.Entities;

namespace BookReading.Api.Features.Books.Repositories;

public class BooksAPIRepository : IBooksAPIRepository
{
    private readonly HttpClient _httpClient;

    public BooksAPIRepository(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<(Book? Book, List<string> AuthorNames)> GetBookWithAuthorsAsync(string isbn)
    {
        var authorNames = new List<string>();

        // Google API へのリクエスト
        var response = await _httpClient.GetAsync($"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}");

        // 通信失敗時は例外をスロー（Controller側でキャッチして適切なステータスコードを返すため）
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);

        // 該当なしの場合
        if (!doc.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
        {
            return (null, authorNames);
        }

        var volumeInfo = items[0].GetProperty("volumeInfo");

        // Bookエンティティの生成
        var book = new Book
        {
            Isbn = isbn,
            Title = GetStringProperty(volumeInfo, "title") ?? "Unknown Title",
            ImageUrl = GetThumbnailUrl(volumeInfo),

            // CcodeはGoogle APIから取得できないため、空文字をセット。
            // エンティティの[Required]を満たすため、または後続のUseCaseで値を埋める想定。
            Ccode = string.Empty
        };

        // 著者名のリスト抽出
        if (volumeInfo.TryGetProperty("authors", out var authorsElement))
        {
            foreach (var author in authorsElement.EnumerateArray())
            {
                var name = author.GetString();
                if (!string.IsNullOrEmpty(name)) authorNames.Add(name);
            }
        }

        return (book, authorNames);
    }

    private static string? GetStringProperty(JsonElement element, string propertyName)
    {
        return element.TryGetProperty(propertyName, out var prop) ? prop.GetString() : null;
    }

    private static string? GetThumbnailUrl(JsonElement volumeInfo)
    {
        if (volumeInfo.TryGetProperty("imageLinks", out var images))
        {
            return GetStringProperty(images, "thumbnail") ?? GetStringProperty(images, "smallThumbnail");
        }
        return null;
    }
}