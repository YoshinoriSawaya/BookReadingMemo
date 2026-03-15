using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using BookReadingApi.DTOs;

namespace BookReadingApi.Controllers;

public class RustOcrOptions
{
    public string HorizontalPath { get; set; } = string.Empty;
    public string VerticalPath { get; set; } = string.Empty;
    public string TessDataPrefix { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class OcrController : ControllerBase
{
    // 呼び出し側のクラス内
    private readonly RustOcrOptions _ocrOptions;
    private readonly IWebHostEnvironment _env;

    public OcrController(IWebHostEnvironment env, IConfiguration configuration)
    {
        _env = env;
        // appsettings.json の "ExternalTools:RustOcr" セクションをクラスにマップ
        // _ocrOptions = configuration.GetSection("ExternalTools:RustOcr").Get<RustOcrOptions>()
        //               ?? new RustOcrOptions();
        // "ExternalTools:RustOcr" が JSON の階層と一致しているか
        _ocrOptions = configuration.GetSection("ExternalTools:RustOcr").Get<RustOcrOptions>()
                      ?? new RustOcrOptions();
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessOcr([FromBody] OcrRequest request)
    {
        if (string.IsNullOrEmpty(request.Base64Image))
            return BadRequest("画像データが空です。");

        try
        {
            // 1. Base64 をバイト配列にデコード
            byte[] imageBytes = Convert.FromBase64String(request.Base64Image);

            // 2. 一時ファイルとして保存
            // 以前 PowerShell ツールで座標や FPS を管理していた際のように
            // パス管理を明確にします。
            var tempFileName = $"{Guid.NewGuid()}.png";
            var tempPath = Path.Combine(_env.ContentRootPath, "TempOCR", tempFileName);

            // ディレクトリがなければ作成
            Directory.CreateDirectory(Path.GetDirectoryName(tempPath)!);
            await System.IO.File.WriteAllBytesAsync(tempPath, imageBytes);

            // 3. 【ここに Rust の呼び出しを実装予定】
            string recognizedText = await CallRustOcrAsync(tempPath);
#if DEBUG

            // デバッグ実行時は、あえてファイルを残して確認できるようにする
            Console.WriteLine($"[DEBUG] 画像を確認してください: {tempPath}");
#else
            // 本番環境では、リソース管理のために削除する
            if (System.IO.File.Exists(tempPath))
            {
                System.IO.File.Delete(tempPath);
            }
#endif
            return Ok(new { text = recognizedText });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"OCR処理中にエラーが発生しました: {ex.Message}");
        }
    }

    private async Task<string> CallRustOcrAsync(string imagePath)
    {
        var executablePath = _ocrOptions.VerticalPath;

        string fullPath = Path.GetFullPath(executablePath);
        if (!System.IO.File.Exists(fullPath))
        {
            return $"[ERROR] 指定されたパスにファイルが存在しません: {fullPath}";
        }

        // CallRustOcrAsync 内
        Console.WriteLine($"[DEBUG] 実際に実行しているパス: {fullPath}");
        // ファイルの更新日時を表示して、古いバイナリでないか確認する
        Console.WriteLine($"[DEBUG] バイナリの更新日時: {System.IO.File.GetLastWriteTime(fullPath)}");

        var startInfo = new ProcessStartInfo
        {
            FileName = fullPath,
            Arguments = $"\"{imagePath}\"",
            // 作業ディレクトリを実行ファイルのある場所にセットする
            WorkingDirectory = Path.GetDirectoryName(executablePath),
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = System.Text.Encoding.UTF8
        };

        // 1. vcpkg でビルドした DLL が入っているフォルダを特定
        // おそらくこのあたりのパスにあるはずです（エクスプローラーで確認してください）
        // string vcpkgBinPath = @"E:\Engineering\Server\vcpkg-root\vcpkg\installed\x64-windows-static-md\bin";

        // // 2. プロセス実行時の PATH 環境変数を補強する
        // var currentPath = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
        // startInfo.EnvironmentVariables["PATH"] = $"{vcpkgBinPath};{currentPath}";

        // // 3. (念のため) TESSDATA_PREFIX も改めて確実にセット
        // startInfo.EnvironmentVariables["TESSDATA_PREFIX"] = _ocrOptions.TessDataPrefix;


        // 環境変数も設定ファイルから取得
        if (!string.IsNullOrEmpty(_ocrOptions.TessDataPrefix))
        {
            startInfo.EnvironmentVariables["TESSDATA_PREFIX"] = _ocrOptions.TessDataPrefix;
        }

        try
        {
            // 実際に使おうとしているパスを強制表示
            // throw new Exception($"デバッグ表示 - 読み込んだパス: '{_ocrOptions.ExecutablePath}'");
            using (var process = Process.Start(startInfo))
            {
                if (process == null) return "Rustプロセスの起動に失敗しました。";

                var resultTask = process.StandardOutput.ReadToEndAsync();
                var errorTask = process.StandardError.ReadToEndAsync();

                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                {
                    string error = await errorTask;
                    return $"OCR連携エラー (ExitCode: {process.ExitCode}): {error}";
                }

                return (await resultTask).Trim();
            }
        }
        catch (Exception ex)
        {
            return $"システム例外: {ex.Message}";
        }
    }

}