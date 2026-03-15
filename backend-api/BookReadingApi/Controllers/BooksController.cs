using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookReadingApi.Data;
using BookReadingApi.Models;
using BookReadingApi.Services;
using BookReadingApi.DTOs;
using System.ComponentModel.DataAnnotations;

namespace BookReadingApi.Controllers;

// 受け取り用の専用クラスを追加

[Route("api/[controller]")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly BookApiService _bookApiService; // ここを readonly に

    public BooksController(AppDbContext context, BookApiService bookApiService)
    {
        _context = context;
        _bookApiService = bookApiService;
    }

    // 1. 本の一覧を取得 (最新の更新順)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
    {
        // グローバルフィルターのおかげで IsDeleted == false のものだけが来る
        // return await _context.Books
        //     .OrderByDescending(b => b.UpdatedAt)
        //     .ToListAsync();

        // .Include を使って、著者の情報まで一気に取得するように明示する必要があります
        return await _context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .OrderByDescending(b => b.UpdatedAt)
            .Where(b => !b.IsDeleted)
            .ToListAsync();
    }

    // 2. 本の詳細を取得 (著者も含めて)
    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetBook(int id)
    {
        var book = await _context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return NotFound();

        return book;
    }

    // 3. 【論理削除】本の削除
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null) return NotFound();

        book.IsDeleted = true;
        book.DeletedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("search-or-create")]
    public async Task<ActionResult<Book>> SearchOrCreateBook([FromBody] BookRequest request)
    {
        string isbn = request.Isbn;
        try
        {
            // 1. 保存済みの本があるなら、それを返す（最優先）
            var existingBook = await _context.Books
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .FirstOrDefaultAsync(b => b.Isbn == isbn);

            if (existingBook != null) return Ok(existingBook);

            // 2. Google APIにリクエスト
            // ここで Google API が 429/500 等を返せば HttpRequestException がスローされる
            var (newBook, authorNames) = await _bookApiService.GetBookWithAuthorsAsync(isbn);

            // 3. Google API にヒットしたなら、それを保存して返す
            if (newBook != null)
            {
                foreach (var name in authorNames)
                {
                    var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == name)
                                ?? new Author { Name = name };
                    newBook.BookAuthors.Add(new BookAuthor { Author = author });
                }

                _context.Books.Add(newBook);
                await _context.SaveChangesAsync();
                return Ok(newBook);
            }

            // 4. 「ヒットしなかった（正常な結果として0件）」を意味する場合
            // 通信は成功したが、Google側のデータベースにそのISBNが存在しない
            return StatusCode(422, new
            {
                source = "GoogleBooksAPI",
                reason = "NotFound",
                message = $"指定されたISBN({isbn})に一致する書籍は、Googleのデータベースに存在しません。"
            });
        }
        catch (HttpRequestException ex)
        {
            // 5. 「それ以外の原因（通信エラー、制限など）」の場合
            // エラー番号と内容をそのまま、隠さずフロントに投げ出す
            var statusCode = (int)(ex.StatusCode ?? System.Net.HttpStatusCode.InternalServerError);
            return StatusCode(statusCode, new
            {
                source = "GoogleBooksAPI_SystemError",
                status = statusCode,
                message = $"Google APIとの通信中にエラーが発生しました: {ex.Message}"
            });
        }
        catch (Exception ex)
        {
            // 自社サーバー側のエラー
            return StatusCode(500, new { source = "LocalServer", message = ex.Message });
        }
    }
}

