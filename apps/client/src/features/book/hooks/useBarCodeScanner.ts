import { useEffect, useRef, useState } from 'react';
import initWasm, { preprocess_image, check_is_still } from 'ocr-preprocessor';
// インポートをコア機能に変更
import {
    MultiFormatReader,
    BarcodeFormat,
    DecodeHintType,
    HTMLCanvasElementLuminanceSource,
    BinaryBitmap,
    HybridBinarizer
} from '@zxing/library';

export const useBarcodeScanner = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rndWrapperRef = useRef<HTMLDivElement>(null);
    const motionCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

    const isScannerRunning = useRef(false);
    const isMounted = useRef(true);
    const requestRef = useRef<number | null>(null);

    const [crop, setCrop] = useState({ width: 280, height: 150, x: 50, y: 100 });
    const cropRef = useRef(crop);
    useEffect(() => { cropRef.current = crop; }, [crop]);

    // OCR用だったバッファサイズ系は不要になったので削除
    // 代わりに取得済みのISBN/C-CODEを保持するステート
    const [scannedData, setScannedData] = useState<{ isbn?: string; ccode?: string }>({});

    // 動的なベース値と、連続失敗カウンター
    const exploreScaleRef = useRef(1.0);
    const consecutiveFailuresRef = useRef(0);

    const currentParamsRef = useRef({ sensitivity: 0.15, windowRatio: 0.15 });
    const waveParamsRef = useRef({ baseS: 0.15, ampS: 0.1, baseW: 0.15, ampW: 0.1 });

    const [displayData, setDisplayData] = useState({
        params: { sensitivity: 0.15, windowRatio: 0.15 },
        wave: { baseS: 0.15, ampS: 0.1, baseW: 0.15, ampW: 0.1 }
    });

    const [status, setStatus] = useState<string>('カメラを起動中...');

    // インジケータ同期（デバッグUI用）
    useEffect(() => {
        const interval = setInterval(() => {
            if (isMounted.current) {
                setDisplayData({
                    params: { ...currentParamsRef.current },
                    wave: { ...waveParamsRef.current }
                });
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // フック内のRef定義をコアエンジンに変更
    const codeReaderRef = useRef<MultiFormatReader | null>(null);

    // 初回マウント時に、EAN-13（書籍のバーコード規格）専用に設定したリーダーを生成
    useEffect(() => {
        const hints = new Map();
        // ISBNもC-CODE（192...）も、バーコードの規格自体はどちらも「EAN-13」です
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

        const reader = new MultiFormatReader();
        reader.setHints(hints);
        codeReaderRef.current = reader;
    }, []);

    // 🌟 バーコード解析処理（修正版）
    const runBarcodeReader = (targetCanvas: HTMLCanvasElement) => {
        isScannerRunning.current = true;
        try {
            if (targetCanvas.width < 10 || targetCanvas.height < 10 || !codeReaderRef.current) return;

            // Canvasから白黒データを抽出し、ZXingのコアエンジンに渡す
            const luminanceSource = new HTMLCanvasElementLuminanceSource(targetCanvas);
            const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

            // 同期処理で瞬時にデコード
            const result = codeReaderRef.current.decode(bitmap);
            const text = result.getText();

            if (isMounted.current) {
                consecutiveFailuresRef.current = 0;
                exploreScaleRef.current = 1.0;

                if (text.startsWith('978')) {
                    setScannedData(prev => ({ ...prev, isbn: text }));
                    setStatus(`✅ ISBN取得: ${text}`);
                } else if (text.startsWith('19')) {
                    setScannedData(prev => ({ ...prev, ccode: text }));
                    setStatus(`✅ C-CODE取得: ${text}`);
                }
            }
        } catch (err) {
            // ZXingはバーコードが見つからないと例外(NotFoundException)を投げる仕様です
            if (isMounted.current) {
                consecutiveFailuresRef.current += 1;
                if (consecutiveFailuresRef.current >= 10) {
                    exploreScaleRef.current = Math.min(3.0, exploreScaleRef.current * 1.1);
                    consecutiveFailuresRef.current = 0;
                    setStatus(`明暗を自動調整中... (探索幅 x${exploreScaleRef.current.toFixed(1)})`);
                } else {
                    setStatus('スキャン中...');
                }
            }
        } finally {
            setTimeout(() => { isScannerRunning.current = false; }, 100);
        }
    };

    const processFrame = () => {
        if (!isMounted.current || !videoRef.current || !sourceCanvasRef.current || !canvasRef.current || !rndWrapperRef.current) return;

        const video = videoRef.current;
        const sourceCanvas = sourceCanvasRef.current;
        const canvas = canvasRef.current;
        const motionCanvas = motionCanvasRef.current;
        const rndWrapper = rndWrapperRef.current;

        const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const motionCtx = motionCanvas.getContext('2d', { willReadFrequently: true });

        if (!sourceCtx || !ctx || !motionCtx || video.readyState < 2) {
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        const time = performance.now();

        // バーコードの場合、OCRほど履歴に依存しなくて良いので波のロジックをシンプル化
        const baseS = 0.15;
        const baseW = 0.15;
        const ampS = baseS * 0.5 * exploreScaleRef.current;
        const ampW = baseW * 0.5 * exploreScaleRef.current;

        const currentS = Math.max(0.01, Math.min(1.0, baseS + ampS * Math.sin(time / 2000)));
        const currentW = Math.max(0.01, Math.min(1.0, baseW + ampW * Math.cos(time / 3000)));

        currentParamsRef.current = { sensitivity: currentS, windowRatio: currentW };
        waveParamsRef.current = { baseS, ampS, baseW, ampW };

        const displayWidth = rndWrapper.offsetWidth;
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const displayHeight = displayWidth / videoAspectRatio;

        if (sourceCanvas.width !== displayWidth) {
            sourceCanvas.width = displayWidth;
            sourceCanvas.height = displayHeight;
        }
        sourceCtx.drawImage(video, 0, 0, displayWidth, displayHeight);

        const currentCrop = cropRef.current;
        const scaleX = video.videoWidth / displayWidth;
        const scaleY = video.videoHeight / displayHeight;
        const rectX = currentCrop.x * scaleX;
        const rectY = currentCrop.y * scaleY;
        const rectW = currentCrop.width * scaleX;
        const rectH = currentCrop.height * scaleY;

        // 🌟 1. 静止判定（ブレていたらスキップ）
        motionCanvas.width = 64;
        motionCanvas.height = 64;
        motionCtx.drawImage(video, rectX, rectY, rectW, rectH, 0, 0, 64, 64);
        const motionData = motionCtx.getImageData(0, 0, 64, 64);
        const isStill = check_is_still(new Uint8Array(motionData.data), 25000);

        if (!isStill) {
            if (!isScannerRunning.current) setStatus('カメラを固定してください...');
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // 🌟 2. 前処理＆スキャン実行
        if (isStill && !isScannerRunning.current) {
            // バーコードはOCRほど超高解像度を求めないので MAX_DIMENSION は 800 程度で十分高速化します
            const MAX_DIMENSION = 800;
            const resizeRatio = Math.min(1.0, MAX_DIMENSION / Math.max(rectW, rectH));
            const targetWidth = Math.round(rectW * resizeRatio);
            const targetHeight = Math.round(rectH * resizeRatio);

            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
            }

            ctx.drawImage(video, rectX, rectY, rectW, rectH, 0, 0, targetWidth, targetHeight);

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

                runBarcodeReader(canvas);
            } catch (e) {
                console.error("Rust processing error:", e);
            }
        }
        requestRef.current = requestAnimationFrame(processFrame);
    };

    useEffect(() => {
        isMounted.current = true;
        let stream: MediaStream | null = null;
        const startScanner = async () => {
            try {
                await initWasm();
                stream = await navigator.mediaDevices.getUserMedia({
                    // ズーム機能対応ブラウザ用にadvancedを含める
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        advanced: [{ zoom: 2.0 }] as any
                    }
                });
                if (videoRef.current && isMounted.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setStatus('スキャン中...');
                        requestRef.current = requestAnimationFrame(processFrame);
                    };
                }
            } catch (err) {
                setStatus('カメラの起動に失敗しました。');
            }
        };
        startScanner();
        return () => {
            isMounted.current = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    // 呼び出し元のUIコンポーネントが壊れないよう、返り値の形は維持
    return {
        refs: { videoRef, sourceCanvasRef, canvasRef, rndWrapperRef },
        state: { crop, displayData, scannedData, status },
        setters: { setCrop }
    };
};