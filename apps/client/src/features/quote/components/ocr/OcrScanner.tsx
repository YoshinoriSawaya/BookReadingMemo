import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import initWasm, { preprocess_image } from 'ocr-preprocessor';
import { Button } from "../../../../shared/ui/button";
import { Rnd } from 'react-rnd';

interface OcrScannerProps {
    onDetected: (text: string) => void;
    onClose: () => void;
}

export const OcrScanner = ({ onDetected, onClose }: OcrScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const parentContainerRef = useRef<HTMLDivElement>(null);
    // コンポーネント内の上部に配置
    const rndWrapperRef = useRef<HTMLDivElement>(null);


    const isOcrRunning = useRef(false);
    const isMounted = useRef(true);
    const requestRef = useRef<number | null>(null);

    const [crop, setCrop] = useState({
        width: 250,
        height: 120,
        x: 50,
        y: 80
    });

    const [sensitivity, setSensitivity] = useState(0.15);
    const [windowRatio, setWindowRatio] = useState(0.15);

    const paramsRef = useRef({ sensitivity, windowRatio });
    useEffect(() => {
        paramsRef.current = { sensitivity, windowRatio };
    }, [sensitivity, windowRatio]);


    const cropRef = useRef(crop);

    // crop ステートが更新されたら Ref も更新する
    useEffect(() => {
        cropRef.current = crop;
    }, [crop]);

    const [scannedText, setScannedText] = useState<string>('');
    const [status, setStatus] = useState<string>('カメラを起動中...');

    const processFrame = () => {
        if (!isMounted.current || !videoRef.current || !sourceCanvasRef.current || !canvasRef.current || !rndWrapperRef.current) return;

        const video = videoRef.current;
        const sourceCanvas = sourceCanvasRef.current;
        const canvas = canvasRef.current;
        const rndWrapper = rndWrapperRef.current;

        const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!sourceCtx || !ctx || video.readyState < 2) {
            requestRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // --- 1. 上のキャンバス (表示用) ---
        const displayWidth = rndWrapper.offsetWidth;
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        const displayHeight = displayWidth / videoAspectRatio;

        if (sourceCanvas.width !== displayWidth) {
            sourceCanvas.width = displayWidth;
            sourceCanvas.height = displayHeight;
        }
        sourceCtx.drawImage(video, 0, 0, displayWidth, displayHeight);

        // --- 2. 下のキャンバス (OCR処理用) ---
        const currentCrop = cropRef.current;

        // 表示上の座標をビデオの生解像度上の座標に変換 (切り取り元を指定するため)
        const scaleX = video.videoWidth / displayWidth;
        const scaleY = video.videoHeight / displayHeight;
        const rectX = currentCrop.x * scaleX;
        const rectY = currentCrop.y * scaleY;
        const rectW = currentCrop.width * scaleX;
        const rectH = currentCrop.height * scaleY;

        // --- 【追加】解像度によるスケーリング判定 ---
        // 基準（しきい値）を 300px としてみます
        const resolutionThreshold = 300;
        let multiplier = 1;

        if (currentCrop.width < resolutionThreshold) {
            multiplier = 2; // 300px 未満なら2倍に拡大
        }
        // 必要なら「150px 以下なら3倍」のように段階を増やしてもOK

        const targetWidth = currentCrop.width * multiplier;
        const targetHeight = currentCrop.height * multiplier;

        // キャンバスの解像度を設定（拡大後のサイズにする）
        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
        }

        // ビデオ（生解像度）から、拡大後のキャンバスサイズへギュッと描画
        // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(
            video,
            rectX, rectY, rectW, rectH, // 切り取り元（生解像度）
            0, 0, targetWidth, targetHeight // 描画先（拡大後サイズ）
        );

        // --- 3. 前処理 (WASM) ---
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Refから最新の調整値を取得してWASMに渡す
            const { windowRatio, sensitivity } = paramsRef.current;

            const processedPixels = preprocess_image(
                new Uint8Array(imageData.data),
                canvas.width,
                canvas.height,
                windowRatio,    // 第4引数
                sensitivity     // 第5引数
            );

            ctx.putImageData(new ImageData(new Uint8ClampedArray(processedPixels), canvas.width, canvas.height), 0, 0);


            if (!isOcrRunning.current) {
                // 前処理済みのキャンバスを渡す
                runOcr(canvas);
            }

        } catch (e) {
            // console.error(e);
            requestRef.current = requestAnimationFrame(processFrame);
        }

        requestRef.current = requestAnimationFrame(processFrame);
    };

    // const processFrame = () => {
    //     if (!isMounted.current || !videoRef.current || !sourceCanvasRef.current || !canvasRef.current || !parentContainerRef.current) return;

    //     const video = videoRef.current;
    //     const sourceCanvas = sourceCanvasRef.current;
    //     const canvas = canvasRef.current;
    //     const parent = parentContainerRef.current;

    //     const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    //     const ctx = canvas.getContext('2d', { willReadFrequently: true });

    //     if (!sourceCtx || !ctx || video.readyState < 2) {
    //         requestRef.current = requestAnimationFrame(processFrame);
    //         return;
    //     }

    //     const displayWidth = parent.offsetWidth - 16;
    //     const aspectRatio = video.videoWidth / video.videoHeight;
    //     const displayHeight = displayWidth / aspectRatio;

    //     if (sourceCanvas.width !== displayWidth) {
    //         sourceCanvas.width = displayWidth;
    //         sourceCanvas.height = displayHeight;
    //     }

    //     sourceCtx.drawImage(video, 0, 0, displayWidth, displayHeight);

    //     const scaleX = video.videoWidth / displayWidth;
    //     const scaleY = video.videoHeight / displayHeight;

    //     const rectX = crop.x * scaleX;
    //     const rectY = crop.y * scaleY;
    //     const rectW = crop.width * scaleX;
    //     const rectH = crop.height * scaleY;

    //     canvas.width = displayWidth;
    //     canvas.height = displayHeight;

    //     ctx.drawImage(sourceCanvas, rectX, rectY, rectW, rectH, 0, 0, displayWidth, displayHeight);

    //     try {
    //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //         const processedPixels = preprocess_image(new Uint8Array(imageData.data), canvas.width, canvas.height);
    //         ctx.putImageData(new ImageData(new Uint8ClampedArray(processedPixels), canvas.width, canvas.height), 0, 0);

    //         // if (!isOcrRunning.current) {
    //         //     isOcrRunning.current = true; // ここで即座にロックをかける
    //         //     runOcr(canvas).finally(() => {
    //         //         isOcrRunning.current = false; // 終わったら解放
    //         //     });
    //         // }
    //     } catch (e) {
    //         // Processing error
    //     }

    //     requestRef.current = requestAnimationFrame(processFrame);
    // };


    // const processFrame = () => {
    //     if (!isMounted.current || !videoRef.current || !sourceCanvasRef.current || !canvasRef.current || !parentContainerRef.current) return;

    //     const video = videoRef.current;
    //     const sourceCanvas = sourceCanvasRef.current;
    //     const canvas = canvasRef.current;
    //     const parent = parentContainerRef.current;

    //     const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    //     const ctx = canvas.getContext('2d', { willReadFrequently: true });

    //     if (!sourceCtx || !ctx || video.readyState < 2) {
    //         requestRef.current = requestAnimationFrame(processFrame);
    //         return;
    //     }



    //     // --- 1. 表示用キャンバスの描画（全体像） ---
    //     // crop ではなく cropRef.current を参照する
    //     const currentCrop = cropRef.current;

    //     const displayWidth = parent.offsetWidth - 16;
    //     const aspectRatio = video.videoWidth / video.videoHeight;
    //     const displayHeight = displayWidth / aspectRatio;
    //     if (sourceCanvas.width !== displayWidth) {
    //         sourceCanvas.width = displayWidth;
    //         sourceCanvas.height = displayHeight;
    //     }
    //     sourceCtx.drawImage(video, 0, 0, displayWidth, displayHeight);

    //     // --- 2. OCR用キャンバスの描画（切り抜き） ---
    //     // 表示サイズと実解像度の比率を計算
    //     const scaleX = video.videoWidth / displayWidth;
    //     const scaleY = video.videoHeight / displayHeight;

    //     // ビデオ上の実際の切り取り座標とサイズを計算
    //     const rectX = currentCrop.x * scaleX;
    //     const rectY = currentCrop.y * scaleY;
    //     const rectW = currentCrop.width * scaleX;
    //     const rectH = currentCrop.height * scaleY;

    //     // 【重要】キャンバスの「中身のサイズ」を切り取り範囲と全く同じにする
    //     // これをやらないと、前回の描画サイズに引き伸ばされて歪みます
    //     if (canvas.width !== rectW || canvas.height !== rectH) {
    //         canvas.width = rectW;
    //         canvas.height = rectH;
    //     }


    //     // ビデオ（生解像度）から直接切り出して描画
    //     ctx.drawImage(video, rectX, rectY, rectW, rectH, 0, 0, rectW, rectH);

    //     // --- 3. 前処理 (WASM) ---
    //     try {
    //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //         const processedPixels = preprocess_image(new Uint8Array(imageData.data), canvas.width, canvas.height);
    //         ctx.putImageData(new ImageData(new Uint8ClampedArray(processedPixels), canvas.width, canvas.height), 0, 0);

    //         // OCRの実行（コメントアウトを外す場合は、ここでの解像度を確認してください）
    //         // if (!isOcrRunning.current) { ... }
    //     } catch (e) {
    //         // console.error(e);
    //     }

    //     requestRef.current = requestAnimationFrame(processFrame);
    // };

    // const processFrame = () => {
    //     // rndWrapperRef.current が存在することを確認
    //     if (!isMounted.current || !videoRef.current || !sourceCanvasRef.current || !canvasRef.current || !rndWrapperRef.current) return;

    //     const video = videoRef.current;
    //     const sourceCanvas = sourceCanvasRef.current;
    //     const canvas = canvasRef.current;
    //     const rndWrapper = rndWrapperRef.current;

    //     const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    //     const ctx = canvas.getContext('2d', { willReadFrequently: true });

    //     if (!sourceCtx || !ctx || video.readyState < 2) {
    //         requestRef.current = requestAnimationFrame(processFrame);
    //         return;
    //     }

    //     // --- 1. メイン映像の表示サイズを計算 ---
    //     const displayWidth = rndWrapper.offsetWidth;
    //     const videoAspectRatio = video.videoWidth / video.videoHeight;
    //     const displayHeight = displayWidth / videoAspectRatio;

    //     // 表示用キャンバスの解像度をセット（表示上のサイズと合わせる）
    //     if (sourceCanvas.width !== displayWidth) {
    //         sourceCanvas.width = displayWidth;
    //         sourceCanvas.height = displayHeight;
    //     }
    //     sourceCtx.drawImage(video, 0, 0, displayWidth, displayHeight);

    //     // --- 2. 切り抜き範囲の計算 ---
    //     const currentCrop = cropRef.current;

    //     // 表示上の1pxが、ビデオ本来の何pxに相当するかを計算
    //     const scaleX = video.videoWidth / displayWidth;
    //     const scaleY = video.videoHeight / displayHeight;

    //     const rectX = currentCrop.x * scaleX;
    //     const rectY = currentCrop.y * scaleY;
    //     const rectW = currentCrop.width * scaleX;
    //     const rectH = currentCrop.height * scaleY;

    //     // --- 3. OCR用キャンバス（下の白黒画像）のサイズ設定 ---
    //     // ここで内部解像度を「切り取りサイズ」に合わせることで歪みを防ぐ
    //     if (canvas.width !== rectW || canvas.height !== rectH) {
    //         canvas.width = rectW;
    //         canvas.height = rectH;
    //     }

    //     // ビデオから切り取って描画
    //     ctx.drawImage(video, rectX, rectY, rectW, rectH, 0, 0, rectW, rectH);

    //     // --- 4. WASM前処理 ---
    //     try {
    //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //         const processedPixels = preprocess_image(new Uint8Array(imageData.data), canvas.width, canvas.height);
    //         ctx.putImageData(new ImageData(new Uint8ClampedArray(processedPixels), canvas.width, canvas.height), 0, 0);
    //     } catch (e) {
    //         // console.error("Wasm Error:", e);
    //     }

    //     requestRef.current = requestAnimationFrame(processFrame);
    // };

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


    // const runOcr = async (sourceCanvas: HTMLCanvasElement) => {
    //     if (isOcrRunning.current || !isMounted.current) return;

    //     isOcrRunning.current = true;
    //     setStatus('文字を解析中...');

    //     try {
    //         // キャンバスが小さすぎるとエラーになるのでガード
    //         if (sourceCanvas.width < 20 || sourceCanvas.height < 20) return;

    //         // Tesseract実行
    //         const { data: { text } } = await Tesseract.recognize(sourceCanvas, 'jpn', {
    //             // 必要に応じてログを見たい場合
    //             // logger: m => console.log(m)
    //         });

    //         const cleanedText = text.replace(/\s+/g, '').trim(); // 日本語の場合は空白を詰めると綺麗です

    //         if (cleanedText && isMounted.current) {
    //             setScannedText(cleanedText);
    //             setStatus('スキャン完了');
    //         } else {
    //             setStatus('読み取り中...');
    //         }
    //     } catch (err) {
    //         console.error("OCR Error:", err);
    //         setStatus('エラーが発生しました');
    //     } finally {
    //         // 次の解析まで少し間隔を空ける（例：2秒）
    //         // 10秒だと少し長いので、使い勝手に合わせて調整してください
    //         setTimeout(() => {
    //             if (isMounted.current) {
    //                 isOcrRunning.current = false;
    //                 setStatus('スキャン中...');
    //             }
    //         }, 5000);
    //     }
    // };
    const runOcr = async (sourceCanvas: HTMLCanvasElement) => {
        isOcrRunning.current = true;
        try {
            if (sourceCanvas.width < 10 || sourceCanvas.height < 10) return;
            const { data: { text } } = await Tesseract.recognize(sourceCanvas, 'jpn');
            const cleanedText = text.trim();
            if (cleanedText && isMounted.current) {
                setScannedText(cleanedText);
            }
        } catch (err) {
            console.error("OCR Error:", err);
        } finally {
            setTimeout(() => {
                isOcrRunning.current = false;
            }, 10000);
        }
    };

    return (
        <div ref={parentContainerRef} className="flex flex-col items-center gap-4 w-full p-2">
            {/* 調整パネル */}
            <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 shadow-sm">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>感度 (Sensitivity): {sensitivity.toFixed(2)}</span>
                        <span className="text-gray-400">低いほど白飛びに強い</span>
                    </div>
                    <input
                        type="range" min="0" max="0.5" step="0.01"
                        value={sensitivity}
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>計算範囲 (Window Ratio): {windowRatio.toFixed(2)}</span>
                        <span className="text-gray-400">大きいほど影に強い</span>
                    </div>
                    <input
                        type="range" min="0.05" max="0.4" step="0.01"
                        value={windowRatio}
                        onChange={(e) => setWindowRatio(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>

            <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

            {/* A. メインカメラ（読み取り範囲指定） */}
            {/* ↓ ここに ref={rndWrapperRef} を追加します */}
            1. 読み取る範囲を合わせる
            <div ref={rndWrapperRef} className="relative w-full bg-black rounded-lg overflow-hidden border border-gray-800">
                <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded z-20 pointer-events-none">

                </div>
                <canvas ref={sourceCanvasRef} className="block" style={{ width: '100%', height: 'auto' }} />
                <Rnd
                    size={{ width: crop.width, height: crop.height }}
                    position={{ x: crop.x, y: crop.y }}
                    onDragStop={(_e, d) => setCrop(prev => ({ ...prev, x: d.x, y: d.y }))}
                    onResizeStop={(_e, _direction, ref, _delta, position) => {
                        setCrop({
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                            ...position
                        });
                    }}
                    bounds="parent"
                    style={{
                        border: '2px solid #00FF00',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        zIndex: 10
                    }}
                >
                    <div className="w-full h-full relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400" />
                    </div>
                </Rnd>
            </div>

            {/* B. OCR処理用（拡大・白黒表示） */}
            2. OCR認識画像（白黒・拡大）
            <div className="relative w-full bg-black rounded-lg overflow-hidden border border-gray-800">
                <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded z-20 pointer-events-none">

                </div>
                {/* className="w-full h-auto" にすることで、どんな形でも横幅いっぱいにフィットします */}
                <canvas
                    ref={canvasRef}
                    className="block w-full h-auto bg-gray-900"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>

            <div className="flex justify-center w-full gap-2 items-center">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${scannedText ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {status}
                </span>
            </div>

            <div className="w-full bg-white p-3 rounded border h-24 overflow-y-auto text-sm text-gray-800 shadow-inner">
                {scannedText ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{scannedText}</div>
                ) : (
                    <span className="text-gray-400 italic">スキャン中...</span>
                )}
            </div>

            <div className="flex gap-2 w-full mt-2">
                <Button onClick={onClose} variant="danger" className="w-full flex-1">キャンセル</Button>
                <Button
                    onClick={() => onDetected(scannedText)}
                    variant="primary"
                    className="w-full flex-1"
                    disabled={!scannedText}
                >
                    決定
                </Button>
            </div>
        </div>
    );
};