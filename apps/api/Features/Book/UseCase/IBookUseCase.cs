using BookReading.Api.Features.Books.DTOs;

namespace BookReading.Api.Features.Books.UseCase;

public interface IBookUseCase
{
    Task<IEnumerable<BookResponse>> GetBooksAsync();
    Task<BookResponse?> GetBookByIdAsync(int id);
    Task DeleteBookAsync(int id);
    Task<BookResponse> SearchOrCreateBookAsync(string isbn, string cCode);
}