using BookReading.Api.Features.Books.Entities;
using BookReading.Api.Features.Books.DTOs;

namespace BookReading.Api.Features.Books.Extensions;

public static class BookMappingExtensions
{
    // Task<Book?> に対しての拡張メソッド
    public static async Task<BookResponse?> MapToResponse(this Task<Book?> task)
    {
        var book = await task;
        return book?.ToResponse();
    }

    // Task<IEnumerable<Book>> に対しての拡張メソッド（一覧用）
    public static async Task<IEnumerable<BookResponse>> MapToResponse(this Task<IEnumerable<Book>> task)
    {
        var books = await task;
        return books.Select(b => b.ToResponse());
    }

    // 単体の Entity を DTO に変換するコアロジック
    public static BookResponse ToResponse(this Book book)
    {
        return new BookResponse
        {
            Id = book.Id,
            Isbn = book.Isbn,
            Title = book.Title,
            ImageUrl = book.ImageUrl,

            // さきほど定義した CcodeExtensions を活用！
            TargetName = book.Ccode.ToTargetName(),
            FormatName = book.Ccode.ToFormatName(),
            CategoryName = book.Ccode.ToCategoryName(),
            // 著者リストの詰め替え（AuthorがNullの場合を考慮）
            Authors = book.BookAuthors
                .Select(ba => ba.Author?.Name ?? "不明")
                .ToList()
        };
    }
}