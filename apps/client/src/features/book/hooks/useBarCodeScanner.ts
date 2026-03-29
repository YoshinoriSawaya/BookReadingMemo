import { useEffect, useRef, useState, useCallback } from 'react';
import initWasm from 'ocr-preprocessor';
import { useCamera } from './useCamera';
import { useBarcodeDecoder } from './useBarcodeDecoder';

// 🌟 設定値（マジックナンバー・マジックストリングをここに集約）
const SCANNER_CONFIG = {
    // UI・クロップ初期値
    DEFAULT_CROP: { width: 300, height: 100, x: 30, y: 150 },

    // デバッグUIの更新間隔（ミリ秒）
    DEBUG_UI_UPDATE_INTERVAL: 100,

    // 解析解像度とスキャン間隔
    RESOLUTION_WIDTH: 1280,
    SCAN_INTERVAL_MS: 200,

    // 探索用パラメータ初期値
    DEFAULT_PARAMS: { sensitivity: 0.15, windowRatio: 0.15 },
    DEFAULT_WAVE_PARAMS: { baseS: 0.15, ampS: 0.1, baseW: 0.15, ampW: 0.1 },

    // バーコードのプレフィックス判定用
    PREFIX_ISBN: '978',
    PREFIX_CCODE: '19',

    // ステータスメッセージ
    STATUS: {
        INIT: '初期化中...',
        SCANNING: 'スキャン中...',
        COMPLETE: '読み取り完了',
        WASM_ERROR: 'WASMモジュールの読み込みに失敗しました',
    }
} as const;

// HTMLMediaElement.readyState の定数（2 = HAVE_CURRENT_DATA）
const VIDEO_READY_STATE_HAVE_CURRENT_DATA = 2;

export const useBarcodeScanner = () => {
    // 外部フック
    const { videoRef, cameraStatus } = useCamera();
    const { decodeCanvas } = useBarcodeDecoder();

    // Refs
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rndWrapperRef = useRef<HTMLDivElement>(null);
    const isScannerRunning = useRef(false);
    const isMounted = useRef(true);
    const requestRef = useRef<number | null>(null);

    // 状態管理
    const [crop, setCrop] = useState(SCANNER_CONFIG.DEFAULT_CROP);
    const cropRef = useRef(crop);
    useEffect(() => { cropRef.current = crop; }, [crop]);

    const [scannedData, setScannedData] = useState<{ isbn?: string; ccode?: string }>({});
    const [status, setStatus] = useState<string>(SCANNER_CONFIG.STATUS.INIT);

    // 探索用パラメータ
    const currentParamsRef = useRef({ ...SCANNER_CONFIG.DEFAULT_PARAMS });
    const waveParamsRef = useRef({ ...SCANNER_CONFIG.DEFAULT_WAVE_PARAMS });

    const [displayData, setDisplayData] = useState({
        params: { ...SCANNER_CONFIG.DEFAULT_PARAMS },
        wave: { ...SCANNER_CONFIG.DEFAULT_WAVE_PARAMS }
    });

    const displayStatus = scannedData.isbn && scannedData.ccode
        ? SCANNER_CONFIG.STATUS.COMPLETE
        : (status !== SCANNER_CONFIG.STATUS.INIT && status !== SCANNER_CONFIG.STATUS.SCANNING
            ? status
            : cameraStatus);

    // デバッグUIの更新
    useEffect(() => {
        const interval = setInterval(() => {
            if (isMounted.current) {
                setDisplayData({
                    params: { ...currentParamsRef.current },
                    wave: { ...waveParamsRef.current }
                });
            }
        }, SCANNER_CONFIG.DEBUG_UI_UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const processFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !isMounted.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // ビデオの準備ができていない場合はスキップ
        if (video.readyState < VIDEO_READY_STATE_HAVE_CURRENT_DATA || !ctx) {
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // 解析解像度を決定
        const targetW = SCANNER_CONFIG.RESOLUTION_WIDTH;
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

            // ZXingに画像全体を渡す
            const text = decodeCanvas(canvas);

            if (text) {
                if (text.startsWith(SCANNER_CONFIG.PREFIX_ISBN)) {
                    setScannedData(p => ({ ...p, isbn: text }));
                } else if (text.startsWith(SCANNER_CONFIG.PREFIX_CCODE)) {
                    setScannedData(p => ({ ...p, ccode: text }));
                }
            }

            // 指定間隔で解析（CPUに優しい）
            setTimeout(() => {
                isScannerRunning.current = false;
            }, SCANNER_CONFIG.SCAN_INTERVAL_MS);
        }

        requestRef.current = requestAnimationFrame(processFrame);
    }, [decodeCanvas, videoRef]);

    // WASM初期化とループ開始
    useEffect(() => {
        isMounted.current = true;
        initWasm().then(() => {
            setStatus(SCANNER_CONFIG.STATUS.SCANNING);
            requestRef.current = requestAnimationFrame(processFrame);
        }).catch(() => {
            setStatus(SCANNER_CONFIG.STATUS.WASM_ERROR);
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