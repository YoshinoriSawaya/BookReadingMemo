import { useEffect, useRef, useState, useCallback } from 'react';
import initWasm from 'ocr-preprocessor';
import { useCamera } from './useCamera';
import { useBarcodeDecoder } from './useBarcodeDecoder';
// 🌟 インポートを変更
// import { calculateWaveParams, drawAndCalculateRect, checkMotion, processAndDecodeForPreview } from '../utils/scannerLogic';
import { processSimple, drawAndCalculateRect } from '../utils/scannerLogic';

export const useBarcodeScanner = () => {
    // 外部フック
    const { videoRef, cameraStatus } = useCamera();
    const { decodeCanvas } = useBarcodeDecoder();

    // Refs
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rndWrapperRef = useRef<HTMLDivElement>(null);
    // const motionCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const isScannerRunning = useRef(false);
    const isMounted = useRef(true);
    const requestRef = useRef<number | null>(null);

    // 状態管理
    const [crop, setCrop] = useState({ width: 300, height: 100, x: 30, y: 150 });
    const cropRef = useRef(crop);
    useEffect(() => { cropRef.current = crop; }, [crop]);

    const [scannedData, setScannedData] = useState<{ isbn?: string; ccode?: string }>({});
    const [status, setStatus] = useState<string>('初期化中...');

    // 探索用パラメータ
    // const exploreScaleRef = useRef(1.0);
    // const consecutiveFailuresRef = useRef(0);
    const currentParamsRef = useRef({ sensitivity: 0.15, windowRatio: 0.15 });
    const waveParamsRef = useRef({ baseS: 0.15, ampS: 0.1, baseW: 0.15, ampW: 0.1 });
    const [displayData, setDisplayData] = useState({
        params: { sensitivity: 0.15, windowRatio: 0.15 },
        wave: { baseS: 0.15, ampS: 0.1, baseW: 0.15, ampW: 0.1 }
    });

    const displayStatus = scannedData.isbn && scannedData.ccode
        ? '読み取り完了'
        : (status !== '初期化中...' && status !== 'スキャン中...' ? status : cameraStatus);

    // デバッグUIの更新
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

    // const processFrame = useCallback(() => {
    //     if (!videoRef.current || !canvasRef.current || !isMounted.current) return;

    //     const video = videoRef.current;
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     if (video.readyState < 2 || !ctx) {
    //         requestRef.current = requestAnimationFrame(processFrame);
    //         return;
    //     }

    //     // 🌟 解析解像度の戦略変更
    //     // PCカメラのボケを補うため、あえて高解像度（カメラの生サイズ）で処理
    //     const rawW = video.videoWidth;
    //     const rawH = video.videoHeight;

    //     // 🌟 デジタルズーム効果：中央の60%領域だけを切り出す
    //     // しょぼいカメラでもバーコードを「大きく」見せるため
    //     const zoomFactor = 0.6;
    //     const sw = rawW * zoomFactor;
    //     const sh = rawH * zoomFactor;
    //     const sx = (rawW - sw) / 2;
    //     const sy = (rawH - sh) / 2;

    //     // Canvasは 1280x720 程度の「高密度な」状態に固定
    //     const targetW = 1280;
    //     const targetH = Math.round(targetW * (sh / sw));

    //     if (canvas.width !== targetW) {
    //         canvas.width = targetW;
    //         canvas.height = targetH;
    //     }

    //     // 🌟 中央を切り抜いて拡大描画
    //     ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);

    //     if (!isScannerRunning.current) {
    //         isScannerRunning.current = true;

    //         // 解析実行
    //         const text = decodeCanvas(canvas);

    //         if (text) {
    //             if (text.startsWith('978')) setScannedData(p => ({ ...p, isbn: text }));
    //             else if (text.startsWith('19')) setScannedData(p => ({ ...p, ccode: text }));
    //         }

    //         // PCの負荷を考慮し、解析間隔を 250ms に微調整
    //         setTimeout(() => { isScannerRunning.current = false; }, 250);
    //     }

    //     requestRef.current = requestAnimationFrame(processFrame);
    // }, [decodeCanvas]);


    const processFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !isMounted.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState < 2 || !ctx) {
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // 🌟 解析解像度を決定（1280x720 程度に抑えると解析が速い）
        const targetW = 1280;
        const targetH = (video.videoHeight / video.videoWidth) * targetW;

        if (canvas.width !== targetW) {
            canvas.width = targetW;
            canvas.height = targetH;
        }

        // ビデオ全体をCanvasに描画
        ctx.drawImage(video, 0, 0, targetW, targetH);

        // スキャン実行
        if (!isScannerRunning.current) {
            isScannerRunning.current = true;

            // ZXingに「画像全体」を渡す
            const text = decodeCanvas(canvas);

            if (text) {
                if (text.startsWith('978')) setScannedData(p => ({ ...p, isbn: text }));
                else if (text.startsWith('19')) setScannedData(p => ({ ...p, ccode: text }));
            }

            // 200ms間隔で解析（CPUに優しい）
            setTimeout(() => { isScannerRunning.current = false; }, 200);
        }

        requestRef.current = requestAnimationFrame(processFrame);
    }, [decodeCanvas]);

    // WASM初期化とループ開始
    useEffect(() => {
        isMounted.current = true;
        initWasm().then(() => {
            setStatus('スキャン中...');
            requestRef.current = requestAnimationFrame(processFrame);
        }).catch(() => {
            setStatus('WASMモジュールの読み込みに失敗しました');
        });

        return () => {
            isMounted.current = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [processFrame]);

    return {
        refs: { videoRef, sourceCanvasRef, canvasRef, rndWrapperRef },
        state: { crop, displayData, scannedData, status: displayStatus },
        setters: { setCrop }
    };
};