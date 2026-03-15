using Microsoft.EntityFrameworkCore;
using BookReadingApi.Data;
using BookReadingApi.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. 先にCORSポリシーをガチガチに定義する
builder.Services.AddCors(options =>
{
    options.AddPolicy("Open", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// 修正後
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 循環参照を無視して、ループを断ち切る設定
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;

        // (ついでに) JSONの見た目を綺麗にするならこれもおすすめ
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// HttpClient と BookApiService を DI コンテナに登録
builder.Services.AddHttpClient<BookApiService>();

var app = builder.Build();

// 1. 開発環境（Development）のときだけ Swagger を表示
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. HTTPSへの自動転送を復活（本番では必須）
app.UseHttpsRedirection();

// 3. CORSポリシーを適用（名前で指定するのが標準）
// 前に builder.Services.AddCors で "Open" という名前で作った場合
app.UseCors("Open");

// 4. 認証・認可（ログイン機能などを作る時に重要）
app.UseAuthorization();

// 5. コントローラーの紐付け
app.MapControllers();

app.Run();