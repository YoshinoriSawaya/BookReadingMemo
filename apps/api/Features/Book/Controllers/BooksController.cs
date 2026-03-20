using Microsoft.AspNetCore.Mvc;
using BookReading.Api.Features.Books.UseCase;
using BookReading.Api.Features.Books.DTOs;
using BookReading.Api.Features.Books.Entities;

namespace BookReading.Api.Features.Books.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly IBookUseCase _bookUseCase;

    public BooksController(IBookUseCase bookUseCase)
    {
        _bookUseCase = bookUseCase;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookResponse>>> GetBooks()
    {
        var books = await _bookUseCase.GetBooksAsync();
        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetBook(int id)
    {
        var book = await _bookUseCase.GetBookByIdAsync(id);
        if (book == null) return NotFound();
        return Ok(book);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        await _bookUseCase.DeleteBookAsync(id);
        return NoContent();
    }

    [HttpPost("search-or-create")]
    public async Task<ActionResult<Book>> SearchOrCreateBook([FromBody] BookRequest request)
    {
        try
        {
            var result = await _bookUseCase.SearchOrCreateBookAsync(request.Isbn, request.Ccode);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return StatusCode(422, new { source = "GoogleBooksAPI", reason = "NotFound" });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode((int)(ex.StatusCode ?? System.Net.HttpStatusCode.InternalServerError),
                new { source = "GoogleBooksAPI_Error", message = ex.Message });
        }
    }
}