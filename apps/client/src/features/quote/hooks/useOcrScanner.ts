import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import initWasm, { preprocess_image, check_is_still, find_best_text, calculate_distance } from 'ocr-preprocessor';

export interface BufferItem {
    text: string;
    confidence: number;
}

export const useOcrScanner = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rndWrapperRef = useRef<HTMLDivElement>(null);
    const motionCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

    const isOcrRunning = useRef(false);
    const isMounted = useRef(true);
    const requestRef = useRef<number | null>(null);

    const [crop, setCrop] = useState({ width: 250, height: 120, x: 50, y: 80 });
    const cropRef = useRef(crop);
    useEffect(() => { cropRef.current = crop; }, [crop]);

    const [bufferSize, setBufferSize] = useState(5);
    const [minRequired, setMinRequired] = useState(3);

    // 🌟 動的なベース値と、連続失敗カウンターを追加
    const exploreScaleRef = useRef(1.0); // 探索幅の倍率
    const consecutiveFailuresRef = useRef(0);

    const currentParamsRef = useRef({ sensitivity: 0.2, windowRatio: 0.2 });
    const waveParamsRef = useRef({ baseS: 0.2, ampS: 0.1, baseW: 0.2, ampW: 0.1 });
    const bestParamsHistoryRef = useRef<{ sensitivity: number, windowRatio: number }[]>([]);
    const textBufferRef = useRef<BufferItem[]>([]);

    const [displayData, setDisplayData] = useState({
        params: { sensitivity: 0.2, windowRatio: 0.2 },
        wave: { baseS: 0.2, ampS: 0.1, baseW: 0.2, ampW: 0.1 },
        buffer: [] as BufferItem[],
        historyCount: 0
    });

    const [scannedText, setScannedText] = useState<string>('');
    const [status, setStatus] = useState<string>('カメラを起動中...');

    // インジケータ同期
    useEffect(() => {
        const interval = setInterval(() => {
            if (isMounted.current) {
                setDisplayData({
                    params: { ...currentParamsRef.current },
                    wave: { ...waveParamsRef.current },
                    buffer: [...textBufferRef.current],
                    historyCount: bestParamsHistoryRef.current.length
                });
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const runOcr = async (sourceCanvas: HTMLCanvasElement) => {
        isOcrRunning.current = true;
        try {
            if (sourceCanvas.width < 10 || sourceCanvas.height < 10) return;

            const result = await Tesseract.recognize(sourceCanvas, 'jpn');
            const text = result.data.text.replace(/\s+/g, '').trim();
            const confidence = result.data.confidence;

            if (confidence >= 60 && text && isMounted.current) {
                consecutiveFailuresRef.current = 0;
                exploreScaleRef.current = 1.0;

                bestParamsHistoryRef.current = [
                    { ...currentParamsRef.current },
                    ...bestParamsHistoryRef.current
                ].slice(0, 2);

                // 🌟 2. ハイブリッド方式のバッファ管理ロジック
                let isTargetChanged = false;
                if (textBufferRef.current.length > 0) {
                    // バッファの最新の文字列と比較
                    const referenceText = textBufferRef.current[0].text;
                    // Rust (WASM) の関数を呼び出して距離を計算
                    const distance = calculate_distance(text, referenceText);
                    const maxLength = Math.max(text.length, referenceText.length);

                    // 文字列の長さに対して50%以上の変更があれば「カメラが別の行に移動した」と判定
                    if (maxLength > 0 && (distance / maxLength) > 0.5) {
                        isTargetChanged = true;
                    }
                }

                if (isTargetChanged) {
                    // カメラが移動した場合はバッファをリセット
                    textBufferRef.current = [{ text, confidence }];
                } else {
                    // 同じ行を読んでいる場合は追加
                    let newBuffer = [{ text, confidence }, ...textBufferRef.current];

                    // バッファが上限を超えたら「確信度が一番低いもの」を捨てる
                    if (newBuffer.length > bufferSize) {
                        let minIndex = 0;
                        let minConf = newBuffer[0].confidence;
                        for (let i = 1; i < newBuffer.length; i++) {
                            if (newBuffer[i].confidence < minConf) {
                                minConf = newBuffer[i].confidence;
                                minIndex = i;
                            }
                        }
                        newBuffer.splice(minIndex, 1);
                    }
                    textBufferRef.current = newBuffer;
                }

                // 🌟 3. Rustの find_best_text で最も妥当な文字列を選択
                if (textBufferRef.current.length >= minRequired) {
                    const textsOnly = textBufferRef.current.map(b => b.text);
                    const bestText = find_best_text(textsOnly); // これもRustの処理

                    setScannedText(bestText);
                    setStatus(`解析済 (精度: ${Math.round(confidence)}%)`);
                } else {
                    setScannedText(text);
                    setStatus(`候補収集中... (${textBufferRef.current.length}/${minRequired})`);
                }

            } else if (isMounted.current) {
                // 🌟 失敗（確信度不足 または テキストなし）の場合
                consecutiveFailuresRef.current += 1;

                if (consecutiveFailuresRef.current >= 5) {
                    // 5回連続失敗で感度と範囲を5%広げる (1.05倍)。最大1.0でストップ。
                    exploreScaleRef.current = Math.min(3.0, exploreScaleRef.current * 1.1);
                    bestParamsHistoryRef.current = [];
                    consecutiveFailuresRef.current = 0;
                    setStatus(`自動調整中... (探索範囲拡張 x${exploreScaleRef.current.toFixed(1)})`);

                    // 過去の狭い成功履歴に引っ張られないよう、一度履歴をクリアする
                    bestParamsHistoryRef.current = [];
                    consecutiveFailuresRef.current = 0; // カウンターをリセットして再スタート

                    setStatus(`自動調整中... (探索範囲拡張)`);
                } else {
                    setStatus(`読み取り中 (確信度: ${Math.round(confidence)}%)`);
                }
            }
        } catch (err) {
            console.error("OCR Error:", err);
        } finally {
            setTimeout(() => { isOcrRunning.current = false; }, 500);
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
        const history = bestParamsHistoryRef.current;

        let baseS = 0.2; // 基本の初期値に固定
        let baseW = 0.2;

        if (history.length > 0) {
            baseS = history.reduce((sum, p) => sum + p.sensitivity, 0) / history.length;
            baseW = history.reduce((sum, p) => sum + p.windowRatio, 0) / history.length;
        }

        // 🌟 ベース値の50%の幅に、探索スケールを掛けて振幅を決定
        let ampS = baseS * 0.5 * exploreScaleRef.current;
        let ampW = baseW * 0.5 * exploreScaleRef.current;

        if (history.length >= 2) {
            ampS = baseS * 0.1;
            ampW = baseW * 0.1;
        }

        // 🌟 0.01 ～ 1.0 の範囲に収まるようにガードをかける
        const currentS = Math.max(0.01, Math.min(1.0, baseS + ampS * Math.sin(time / 3000)));
        const currentW = Math.max(0.01, Math.min(1.0, baseW + ampW * Math.cos(time / 5000)));

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

        motionCanvas.width = 64;
        motionCanvas.height = 64;
        motionCtx.drawImage(video, rectX, rectY, rectW, rectH, 0, 0, 64, 64);
        const motionData = motionCtx.getImageData(0, 0, 64, 64);
        const isStill = check_is_still(new Uint8Array(motionData.data), 25000);

        if (!isStill) {
            if (!isOcrRunning.current) setStatus('カメラを固定してください...');
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        if (isStill && !isOcrRunning.current) {
            setStatus(status.includes('自動調整') ? status : 'テキストを解析中...');
            const MAX_DIMENSION = 1200;
            const resizeRatio = MAX_DIMENSION / Math.max(rectW, rectH);
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
                runOcr(canvas);
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
                    video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
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

    return {
        refs: { videoRef, sourceCanvasRef, canvasRef, rndWrapperRef },
        state: { crop, bufferSize, minRequired, displayData, scannedText, status },
        setters: { setCrop, setBufferSize, setMinRequired },
        textBufferRef
    };
};