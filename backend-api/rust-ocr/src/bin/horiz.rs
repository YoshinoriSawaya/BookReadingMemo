use std::env;
use tesseract::Tesseract;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: rust_ocr_horiz <image_path>");
        std::process::exit(1);
    }
    let image_path = &args[1];

    let tes = Tesseract::new(None, Some("jpn+eng"))?;
    let text = tes
        .set_image(image_path)?
        .get_text()?;

    print!("{}", text);
    
    Ok(())
}