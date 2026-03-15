using System.Text.Json;
using BookReadingApi.Models;

namespace BookReadingApi.Services
{
    public class BookApiService
    {
        private readonly HttpClient _httpClient;

        public BookApiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<(Book? Book, List<string> AuthorNames)> GetBookWithAuthorsAsync(string isbn)
        {
            var authorNames = new List<string>();

            // リクエスト送信
            var response = await _httpClient.GetAsync($"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}");

            // ★重要：成功(200番台)以外なら、ここで HttpRequestException を発生させる
            // これにより、429や500などのステータスコードがコントローラーまで届くようになります
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);

            // ヒットしなかった場合（これは「正常な通信結果」としての0件）
            if (doc.RootElement.GetProperty("totalItems").GetInt32() == 0)
            {
                return (null, authorNames);
            }

            // --- 以下、パース処理 ---
            var items = doc.RootElement.GetProperty("items");
            var volumeInfo = items[0].GetProperty("volumeInfo");

            var book = new Book
            {
                Isbn = isbn,
                Title = volumeInfo.TryGetProperty("title", out var t) ? t.GetString() ?? "Unknown" : "Unknown",
                ImageUrl = volumeInfo.TryGetProperty("imageLinks", out var images)
                           ? (images.TryGetProperty("thumbnail", out var thumb) ? thumb.GetString() : null)
                           : null
            };

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

        // // タプルを使って、Bookオブジェクトと著者名のリストを両方返すように変更
        // public async Task<(Book? Book, List<string> AuthorNames)> GetBookWithAuthorsAsync(string isbn)
        // {
        //     var authorNames = new List<string>();

        //     var response = await _httpClient.GetAsync($"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}");
        //     if (!response.IsSuccessStatusCode) return (null, authorNames);

        //     var content = await response.Content.ReadAsStringAsync();
        //     using var doc = JsonDocument.Parse(content);

        //     if (doc.RootElement.GetProperty("totalItems").GetInt32() == 0) return (null, authorNames);

        //     var volumeInfo = doc.RootElement.GetProperty("items")[0].GetProperty("volumeInfo");

        //     // Bookオブジェクトの生成
        //     var book = new Book
        //     {
        //         Isbn = isbn,
        //         Title = volumeInfo.TryGetProperty("title", out var t) ? t.GetString() ?? "Unknown" : "Unknown",
        //         ImageUrl = volumeInfo.TryGetProperty("imageLinks", out var images)
        //                    ? images.GetProperty("thumbnail").GetString()
        //                    : null
        //     };

        //     // 著者名の抽出
        //     if (volumeInfo.TryGetProperty("authors", out var authorsElement))
        //     {
        //         foreach (var author in authorsElement.EnumerateArray())
        //         {
        //             var name = author.GetString();
        //             if (!string.IsNullOrEmpty(name)) authorNames.Add(name);
        //         }
        //     }

        //     return (book, authorNames);
        // }
    }
}