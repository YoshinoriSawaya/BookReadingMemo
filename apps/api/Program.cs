using Microsoft.EntityFrameworkCore;
// using BookReading.Api.Data;
// 他の機能も必要に応じて using
// using Microsoft.EntityFrameworkCore;
using BookReading.Api.Data;
using BookReading.Api.Features.Books.Repositories;
using BookReading.Api.Features.Books.UseCase;
using BookReading.Api.Features.Thoughts.Repositories;
using BookReading.Api.Features.Quotes.Repositories;
using BookReading.Api.Features.Users.Repositories;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// 1. Builder Phase (Services Configuration)
// ============================================================

// --- データベース (PostgreSQL) ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// --- 各機能 (Features) の依存性注入 (DI) ---
// Repository
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
// Google API Service (HttpClient)
// AddHttpClient を使うことで、BooksAPIRepository 内で HttpClient が使えるようになります
builder.Services.AddHttpClient<IBooksAPIRepository, BooksAPIRepository>();


builder.Services.AddScoped<IThoughtRepository, ThoughtRepository>();
builder.Services.AddScoped<IQuoteRepository, QuoteRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// UseCase
builder.Services.AddScoped<IBookUseCase, BookUseCase>();

// --- 標準機能 (CORS, JSON, Swagger) ---
// builder.Services.AddCors(options =>
// {
//     options.AddDefaultPolicy(policy =>
//     {
//         policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
//     });
// });

// --- Program.cs の builder.Services セクション ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // すべてのオリジンを許可
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // クッキー等を使う場合に必要
    });
});


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler
         = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient(); // 汎用的なHttpClientとして登録

// ============================================================
// 2. App Phase (Middleware Pipeline)
// ============================================================

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

app.Run();

