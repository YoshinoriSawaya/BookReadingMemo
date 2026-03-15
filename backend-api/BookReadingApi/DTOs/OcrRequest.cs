namespace BookReadingApi.DTOs
{
    public class OcrRequest
    {
        // フロントの split(',')[1] で送られてくる純粋なデータ部分
        public string Base64Image { get; set; } = string.Empty;
    }
}