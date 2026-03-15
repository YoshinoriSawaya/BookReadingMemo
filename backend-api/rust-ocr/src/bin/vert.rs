use std::env;
use tesseract::Tesseract;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: rust_ocr_vert <image_path>");
        std::process::exit(1);
    }
    let image_path = &args[1];

    let mut tes = Tesseract::new(None, Some("jpn_vert"))?;


    // 【重要】ページセグメンテーションモードを 5 (縦書きの単一ブロック) に設定
    // ※ クレートの仕様により .set_variable で直接 Tesseract に指示を出します
    tes = tes//.set_variable("tessedit_char_whitelist", "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろわをんー。、？！「」『』0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz一-龠")?
             .set_variable("tessedit_pageseg_mode", "3")?;


    let text = tes
        .set_image(image_path)?
        .get_text()?;

    print!("{}", text);

    Ok(())
}