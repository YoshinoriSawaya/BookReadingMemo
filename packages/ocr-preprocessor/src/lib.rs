use wasm_bindgen::prelude::*;

// 前回フレームのピクセルデータを保持（64x64を想定）
static mut PREV_FRAME: Vec<u8> = Vec::new();

#[wasm_bindgen]
pub fn check_is_still(current_pixels: &[u8], threshold: u32) -> bool {
    unsafe {
        // 初回実行時やサイズが変わった場合は初期化して「動いている」と判定
        if PREV_FRAME.len() != current_pixels.len() {
            PREV_FRAME = current_pixels.to_vec();
            return false;
        }

        let mut diff_sum: u32 = 0;

        // RGBAのRチャンネル（インデックス0, 4, 8...）のみを比較して計算を高速化
        for i in (0..current_pixels.len()).step_by(4) {
            let diff = (current_pixels[i] as i32 - PREV_FRAME[i] as i32).abs() as u32;
            diff_sum += diff;
        }

        // 現在のフレームを次回用に保存
        PREV_FRAME.copy_from_slice(current_pixels);

        // 差分の合計が閾値（threshold）を下回っていれば静止していると判定
        diff_sum < threshold
    }
}

// 既存の preprocess_image はそのまま利用します（内部でVecのメモリ確保をしている前提）

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

// レーベンシュタイン距離を計算する内部関数
fn levenshtein_distance(a: &str, b: &str) -> usize {
    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();
    let len_a = a_chars.len();
    let len_b = b_chars.len();

    if len_a == 0 {
        return len_b;
    }
    if len_b == 0 {
        return len_a;
    }

    let mut matrix = vec![vec![0; len_b + 1]; len_a + 1];

    for i in 0..=len_a {
        matrix[i][0] = i;
    }
    for j in 0..=len_b {
        matrix[0][j] = j;
    }

    for i in 1..=len_a {
        for j in 1..=len_b {
            let cost = if a_chars[i - 1] == b_chars[j - 1] {
                0
            } else {
                1
            };
            matrix[i][j] = (matrix[i - 1][j] + 1)
                .min(matrix[i][j - 1] + 1)
                .min(matrix[i - 1][j - 1] + cost);
        }
    }

    matrix[len_a][len_b]
}

// JS側から呼ばれる関数
#[wasm_bindgen]
pub fn find_best_text(texts: Vec<String>) -> String {
    if texts.is_empty() {
        return String::new();
    }
    if texts.len() == 1 {
        return texts[0].clone();
    }

    let mut best_text = &texts[0];
    let mut min_total_distance = usize::MAX;

    // 総当たりで距離を計算し、最も他と似ている（距離の合計が少ない）テキストを選ぶ
    for i in 0..texts.len() {
        let mut total_distance = 0;
        for j in 0..texts.len() {
            if i != j {
                total_distance += levenshtein_distance(&texts[i], &texts[j]);
            }
        }

        if total_distance < min_total_distance {
            min_total_distance = total_distance;
            best_text = &texts[i];
        }
    }

    best_text.clone()
}

// TS側から「2つの文字列の距離」だけを計算できるように公開するラッパー
#[wasm_bindgen]
pub fn calculate_distance(a: &str, b: &str) -> usize {
    levenshtein_distance(a, b)
}
