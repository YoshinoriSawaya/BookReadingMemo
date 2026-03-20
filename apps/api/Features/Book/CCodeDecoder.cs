namespace BookReading.Api.Features.Books;

public static class CcodeExtensions
{
    private const int MinLength = 13;

    // 第1桁：販売対象 (Target)
    public static string ToTargetName(this string fullCcode)
    {
        if (string.IsNullOrEmpty(fullCcode) || fullCcode.Length < MinLength) return "不明";

        return fullCcode[3] switch
        {
            '0' => "一般",
            '1' => "教養",
            '2' => "実用",
            '3' => "専門",
            '4' => "検定教科書",
            '5' => "学習参考書",
            '6' => "辞典・事典",
            '7' => "コミック",
            '8' => "児童",
            '9' => "雑誌・その他",
            _ => "不明"
        };
    }

    // 第2桁：発行形態 (Format)
    public static string ToFormatName(this string fullCcode)
    {
        if (string.IsNullOrEmpty(fullCcode) || fullCcode.Length < MinLength) return "不明";

        return fullCcode[4] switch
        {
            '0' => "単行本",
            '1' => "文庫",
            '2' => "新書",
            '3' => "全集・双書",
            '4' => "ムック・その他",
            '5' => "事典・辞典",
            '6' => "図鑑",
            '7' => "絵本",
            '8' => "磁気媒体等",
            '9' => "その他",
            _ => "不明"
        };
    }

    //TODO:基本的に変わることは無いため、ベタ書きで良いが、どうするかは検討しても良いかもしれない
    // 第3・4桁：内容分類 (Category)
    public static string ToCategoryName(this string fullCcode)
    {
        if (string.IsNullOrEmpty(fullCcode) || fullCcode.Length < MinLength) return "不明";

        // 5桁目と6桁目を数値として取得
        if (!int.TryParse(fullCcode.Substring(5, 2), out int code)) return "不明";

        // 十の位で大まかなジャンルが決まる（日本十進分類法に準拠）
        return code switch
        {
            // --- 00番台：総記・哲学 ---
            00 => "総記",
            01 => "百科事典",
            02 => "年鑑・資料",
            04 => "情報科学・コンピュータ",
            05 => "婦人・女性", // C-CODE特有：5は女性誌・婦人向け
            06 => "育児・家庭",

            // 10番台：哲学・心理・宗教
            10 => "哲学",
            11 => "心理",
            12 => "倫理・道徳",
            14 => "宗教",
            15 => "仏教",
            16 => "キリスト教",

            // --- 20番台：歴史・地理 ---
            20 => "歴史総記",
            21 => "日本歴史",
            22 => "外国歴史",
            23 => "伝記",
            25 => "地理",
            26 => "旅行",

            // --- 30番台：社会科学 ---
            30 => "社会科学総記",
            31 => "政治",
            32 => "法律",
            33 => "経済・財政・統計",
            34 => "経営",
            36 => "社会",
            37 => "教育",
            39 => "国防・軍事",

            // --- 40番台：自然科学 ---
            40 => "自然科学総記",
            41 => "数学",
            42 => "物理学",
            43 => "化学",
            44 => "天文・宇宙",
            45 => "地球科学・地質",
            47 => "生物学",
            48 => "植物学",
            49 => "医学・薬学",

            // --- 50番台：工学・工業 ---
            50 => "工学・工業総記",
            51 => "土木",
            52 => "建築",
            53 => "機械",
            54 => "電気",
            55 => "電子通信",
            58 => "製造",

            // --- 60番台：産業 ---
            60 => "産業総記",
            61 => "農林水産業",
            62 => "商業",
            63 => "運輸・交通",
            65 => "通信・放送",

            // --- 70番台：芸術・生活 ---
            70 => "芸術総記",
            71 => "絵画・彫刻",
            72 => "写真・工芸",
            73 => "音楽・舞踊",
            74 => "演劇・映画",
            75 => "体育・スポーツ",
            76 => "諸芸・娯楽",
            77 => "家政・生活",
            78 => "料理",
            79 => "コミック・劇画", // C-CODE 79はコミック専門

            // --- 80番台：語学 ---
            80 => "語学総記",
            81 => "日本語",
            82 => "英米語",
            84 => "ドイツ語",
            85 => "フランス語",
            87 => "各国語",

            // --- 90番台：文学 ---
            90 => "文学総記",
            91 => "日本文学総記",
            92 => "日本文学詩歌",
            93 => "日本文学小説・物語",
            95 => "日本文学評論・随筆",
            97 => "外国文学小説",
            98 => "外国文学その他",

            // 上記にない細かい番号は10の位で丸める
            _ => (code / 10) switch
            {
                0 => "総記・哲学",
                1 => "歴史・地理",
                2 => "歴史・地理",
                3 => "社会科学",
                4 => "自然科学",
                5 => "工学・工業",
                6 => "産業",
                7 => "芸術・生活",
                8 => "語学",
                9 => "文学",
                _ => "その他"
            }
        };
    }

    // 第8～12桁：本体価格 (Price)
    public static int ToPrice(this string fullCcode)
    {
        if (string.IsNullOrEmpty(fullCcode) || fullCcode.Length < 12) return 0;

        // 192[T][F][CC][PRICE]... 
        // インデックス 7 から 5 桁が価格 (例: 01500 = 1500円)
        if (int.TryParse(fullCcode.Substring(7, 5), out int price))
        {
            return price;
        }
        return 0;
    }

    // 便利なサマリー表示
    public static string ToCcodeSummary(this string fullCcode)
    {
        if (string.IsNullOrEmpty(fullCcode) || fullCcode.Length < MinLength) return "C-CODE無効";
        return $"{fullCcode.ToTargetName()} / {fullCcode.ToFormatName()} ({fullCcode.ToCategoryName()})";
    }
}