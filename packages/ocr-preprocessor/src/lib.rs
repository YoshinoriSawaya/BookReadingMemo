use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn preprocess_image(
    mut data: Vec<u8>,
    width: usize,
    height: usize,
    window_ratio: f32, // 追加
    sensitivity: f32,  // 追加
) -> Vec<u8> {
    // let window_ratio: f32 = 0.15;
    // let sensitivity: f32 = 0.15; // 正規化を入れるなら 0.15 くらいが標準的です

    // 1. グレースケール化
    let mut gray = vec![0u8; width * height];
    let mut min_val = 255u8;
    let mut max_val = 0u8;

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) * 4;
            let r = data[idx] as f32;
            let g = data[idx + 1] as f32;
            let b = data[idx + 2] as f32;
            let g_val = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
            gray[y * width + x] = g_val;

            // コントラスト範囲を調べる
            if g_val < min_val {
                min_val = g_val;
            }
            if g_val > max_val {
                max_val = g_val;
            }
        }
    }

    // --- 【追加】コントラスト正規化 (Min-Max Stretching) ---
    // 白飛び対策：一番暗い所を0に、明るい所を255に引き伸ばす
    let range = (max_val - min_val) as f32;
    if range > 0.0 {
        for val in gray.iter_mut() {
            *val = ((*val - min_val) as f32 / range * 255.0) as u8;
        }
    }

    // 2. 積分画像 (Integral Image) の作成
    let mut int_img = vec![0u32; (width + 1) * (height + 1)];
    for y in 0..height {
        let mut sum = 0;
        for x in 0..width {
            sum += gray[y * width + x] as u32;
            let top = int_img[y * (width + 1) + (x + 1)];
            int_img[(y + 1) * (width + 1) + (x + 1)] = top + sum;
        }
    }

    // 3. 適応的二値化
    let s = (width as f32 * window_ratio) as usize / 2;
    for y in 0..height {
        for x in 0..width {
            let x1 = x.saturating_sub(s);
            let x2 = (x + s + 1).min(width);
            let y1 = y.saturating_sub(s);
            let y2 = (y + s + 1).min(height);

            let count = ((x2 - x1) * (y2 - y1)) as u32;
            let sum = int_img[y2 * (width + 1) + x2]
                - int_img[y1 * (width + 1) + x2]
                - int_img[y2 * (width + 1) + x1]
                + int_img[y1 * (width + 1) + x1];

            let current_gray = gray[y * width + x];
            // 平均値の (1 - sensitivity) 倍を閾値にする
            let threshold = (sum as f32 / count as f32) * (1.0 - sensitivity);

            let bin = if (current_gray as f32) < threshold {
                0
            } else {
                255
            };

            let idx = (y * width + x) * 4;
            data[idx] = bin;
            data[idx + 1] = bin;
            data[idx + 2] = bin;
        }
    }
    data
}
