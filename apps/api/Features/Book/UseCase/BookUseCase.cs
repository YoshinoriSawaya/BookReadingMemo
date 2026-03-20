using BookReading.Api.Features.Books.DTOs;
using BookReading.Api.Features.Books.Entities;
using BookReading.Api.Features.Books.Repositories;
using BookReading.Api.Features.Books.Extensions;
// using BookReading.Api.Services; // Google API Service

namespace BookReading.Api.Features.Books.UseCase;

public class BookUseCase : IBookUseCase
{
    private readonly IBookRepository _repository;
    private readonly IAuthorRepository _authorRepository;

    //グーグルAPI用
    private readonly IBooksAPIRepository _booksAPIRepository;

    public BookUseCase(IBookRepository repository, IAuthorRepository authorRepository, IBooksAPIRepository booksAPIRepository)
    {
        _repository = repository;
        _authorRepository = authorRepository;

        //グーグルAPI用
        _booksAPIRepository = booksAPIRepository;
    }

    public async Task<IEnumerable<BookResponse>> GetBooksAsync() => await _repository.GetAllAsync().MapToResponse();

    public async Task<BookResponse?> GetBookByIdAsync(int id) => await _repository.GetByIdAsync(id).MapToResponse();

    public async Task DeleteBookAsync(int id)
    {
        var book = await _repository.GetByIdAsync(id);
        if (book != null)
        {
            book.IsDeleted = true;
            book.DeletedAt = DateTime.Now;
            await _repository.SaveChangesAsync();
        }
    }
    public async Task<BookResponse> SearchOrCreateBookAsync(string isbn, string cCode)
    {
        // 1. DBチェック（既存の本があれば、それを著者情報付きで返す）
        // リポジトリの GetByIsbnAsync で .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author) されている想定
        var existing = await _repository.GetByIsbnAsync(isbn).MapToResponse();
        if (existing != null) return existing;

        try
        {
            // 2. 外部API取得（Google Books API）
            var (newBook, authorNames) = await _booksAPIRepository.GetBookWithAuthorsAsync(isbn);

            if (newBook == null)
            {
                // Googleに存在しない場合は、フロントで422エラーを出すための例外
                throw new KeyNotFoundException($"ISBN {isbn} は外部サービスで見つかりませんでした。");
            }

            // 3. CCODEの適用（ユーザーから渡された値をセット）
            // これで Entity の [Required] と [RegularExpression] バリデーションをクリアできる
            newBook.Ccode = cCode;

            // 4. 著者のマッピングロジック
            foreach (var name in authorNames)
            {
                // 名前で既存の著者を検索。いなければ新規作成（AuthorRepositoryを使用）
                var author = await _authorRepository.GetByNameAsync(name)
                             ?? new Author { Name = name };

                // 中間テーブルを介して紐付け
                newBook.BookAuthors.Add(new BookAuthor { Author = author });
            }

            // 5. DB保存
            await _repository.AddAsync(newBook);
            await _repository.SaveChangesAsync();

            return newBook.ToResponse();
        }
        catch (HttpRequestException ex)
        {
            // APIのレート制限や通信エラーを上位（Controller）へ伝える
            throw new ApplicationException($"外部APIとの通信に失敗しました: {ex.Message}", ex);
        }
    }
}


