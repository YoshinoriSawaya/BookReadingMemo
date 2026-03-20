using BookReading.Api.Features.Books.Repositories;
using BookReading.Api.Features.Books.UseCase;

namespace Microsoft.Extensions.DependencyInjection;

public static class BookExtensions
{
    public static IServiceCollection AddBookServices(this IServiceCollection services)
    {
        // 「Book機能」という単位で必要なサービスをすべて登録
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<IBookUseCase, BookUseCase>();

        // 今後、C-CODE専用のバリデーターなどが増えてもここに追加するだけ
        return services;
    }
}
