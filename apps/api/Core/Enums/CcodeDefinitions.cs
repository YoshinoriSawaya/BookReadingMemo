namespace BookReading.Api.Core.Enums;

// 第1桁：販売対象
public enum CcodeTarget
{
    General = 0,      // 0: 一般
    Educational = 1,  // 1: 教養
    Practical = 2,    // 2: 実用
    Professional = 3, // 3: 専門
    Children = 8,     // 8: 児童
    Magazine = 9      // 9: 雑誌
}

// 第2桁：発行形態
public enum CcodeFormat
{
    SingleVolume = 0, // 0: 単行本
    Paperback = 1,    // 1: 文庫
    NewBook = 2,      // 2: 新書
    CompleteWorks = 3 // 3: 全集・双書
}

// 第3・4桁：内容分類（主要なもののみ抜粋）
public enum CcodeCategory
{
    Philosophy = 00,
    History = 10,
    SocialScience = 30,
    NaturalScience = 40,
    Engineering = 50,
    Industry = 60,
    Art = 70,
    Language = 80,
    Literature = 90
}