//バーコード読み取りは前処理不要のため以下は使わない

import { preprocess_image, check_is_still } from 'ocr-preprocessor';

// WASMを介さず、単に赤い枠内をCanvasに切り出すだけの関数
export const processSimple = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    rect: { x: number, y: number, w: number, h: number },
    previewWidth: number,
    decodeCanvas: (canvas: HTMLCanvasElement) => string | null
): string | null => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cropAspectRatio = rect.w / rect.h;
    const targetWidth = previewWidth;
    const targetHeight = Math.round(previewWidth / cropAspectRatio);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
    }

    // 🌟 生のカラー映像をそのまま描画
    ctx.drawImage(video, rect.x, rect.y, rect.w, rect.h, 0, 0, targetWidth, targetHeight);

    // 🌟 そのままZXingに渡す（ZXing内のHybridBinarizerに任せる）
    return decodeCanvas(canvas);
};

// 1. (変更なし) 探索パラメータの計算
export const calculateWaveParams = (time: number, exploreScale: number) => {
    const baseS = 0.15;
    const baseW = 0.15;
    const ampS = baseS * 0.5 * exploreScale;
    const ampW = baseW * 0.5 * exploreScale;

    const currentS = Math.max(0.01, Math.min(1.0, baseS + ampS * Math.sin(time / 2000)));
    const currentW = Math.max(0.01, Math.min(1.0, baseW + ampW * Math.cos(time / 3000)));

    return { currentS, currentW, baseS, ampS, baseW, ampW };
};

// 2. (変更なし) 描画とクロップ領域（解析対象の矩形）の計算
export const drawAndCalculateRect = (
    video: HTMLVideoElement,
    sourceCanvas: HTMLCanvasElement,
    wrapperWidth: number,
    crop: { x: number, y: number, width: number, height: number }
) => {
    const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceCtx) return null;

    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const displayHeight = wrapperWidth / videoAspectRatio;

    if (sourceCanvas.width !== wrapperWidth) {
        sourceCanvas.width = wrapperWidth;
        sourceCanvas.height = displayHeight;
    }
    sourceCtx.drawImage(video, 0, 0, wrapperWidth, displayHeight);

    const scaleX = video.videoWidth / wrapperWidth;
    const scaleY = video.videoHeight / displayHeight;

    return {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        w: crop.width * scaleX,
        h: crop.height * scaleY
    };
};

// 3. (変更なし) WASMを用いた動体検知
export const checkMotion = (
    video: HTMLVideoElement,
    motionCanvas: HTMLCanvasElement,
    rect: { x: number, y: number, w: number, h: number }
) => {
    const motionCtx = motionCanvas.getContext('2d', { willReadFrequently: true });
    if (!motionCtx) return false;

    motionCanvas.width = 64;
    motionCanvas.height = 64;
    motionCtx.drawImage(video, rect.x, rect.y, rect.w, rect.h, 0, 0, 64, 64);

    const motionData = motionCtx.getImageData(0, 0, 64, 64);
    return check_is_still(new Uint8Array(motionData.data), 25000);
};

// 4. (変更なし) WASMによる前処理とZXingへのデコード委譲
export const processAndDecode = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    rect: { x: number, y: number, w: number, h: number },
    currentW: number,
    currentS: number,
    decodeCanvas: (canvas: HTMLCanvasElement) => string | null
): string | null => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const MAX_DIMENSION = 800;
    const resizeRatio = Math.min(1.0, MAX_DIMENSION / Math.max(rect.w, rect.h));
    const targetWidth = Math.round(rect.w * resizeRatio);
    const targetHeight = Math.round(rect.h * resizeRatio);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
    }

    ctx.drawImage(video, rect.x, rect.y, rect.w, rect.h, 0, 0, targetWidth, targetHeight);

    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const processedPixels = preprocess_image(
            new Uint8Array(imageData.data),
            canvas.width,
            canvas.height,
            currentW,
            currentS
        );
        ctx.putImageData(new ImageData(new Uint8ClampedArray(processedPixels), canvas.width, canvas.height), 0, 0);

        return decodeCanvas(canvas);
    } catch (e) {
        console.error("Rust processing error:", e);
        return null;
    }
};

// 🌟 5. (新規) WASM前処理とプレビューCanvasへのリサイズ描画
export const processAndDecodeForPreview = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    rect: { x: number, y: number, w: number, h: number },
    currentW: number,
    currentS: number,
    previewWidth: number, // 🌟 プレビューコンテナの幅 (300px)
    decodeCanvas: (canvas: HTMLCanvasElement) => string | null
): string | null => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // A. 描画Canvasの解像度をプレビューコンテナ幅（300px）に合わせる
    // 高さも crop幅/height の比率を維持して計算
    const cropAspectRatio = rect.w / rect.h;
    const targetWidth = previewWidth;
    const targetHeight = Math.round(previewWidth / cropAspectRatio);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
    }

    // B. Videoの赤い枠内（rect）だけを、Canvas全体（targetWidth/targetHeight）に描画
    ctx.drawImage(video, rect.x, rect.y, rect.w, rect.h, 0, 0, targetWidth, targetHeight);

    try {
        // C. WASMによる二値化前処理
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const processedPixels = preprocess_image(
            new Uint8Array(imageData.data),
            canvas.width,
            canvas.height,
            currentW,
            currentS
        );
        // D. 処理結果をCanvasに書き戻す
        ctx.putImageData(new ImageData(new Uint8ClampedArray(processedPixels), canvas.width, canvas.height), 0, 0);

        // E. ZXingに渡してデコード（すでにリサイズ＆前処理済み）
        return decodeCanvas(canvas);
    } catch (e) {
        console.error("Rust processing error:", e);
        return null;
    }
};