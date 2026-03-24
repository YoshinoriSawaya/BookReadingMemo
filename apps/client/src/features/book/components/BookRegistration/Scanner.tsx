import { useEffect } from 'react';
import { Button } from "../../../../shared/ui/button";
import { useBarcodeScanner } from '../../hooks/useBarCodeScanner'; // パスは適宜合わせてください

import '../../style.css';

interface ScannerProps {
    onDetected: (isbn: string, ccode: string) => void;
    onClose: () => void;
}

export const Scanner = ({ onDetected, onClose }: ScannerProps) => {
    const { refs, state } = useBarcodeScanner();

    // ISBNとC-CODEの両方が揃ったら親コンポーネントに通知
    useEffect(() => {
        if (state.scannedData.isbn && state.scannedData.ccode) {
            console.log("🔥 全データ取得完了:", state.scannedData);
            onDetected(state.scannedData.isbn, state.scannedData.ccode);
        }
    }, [state.scannedData, onDetected]);

    return (
        <div className="scanner-wrapper flex flex-col items-center gap-4 w-full">
            {/* カメラ映像と読み取り枠のラッパー */}
            <div
                ref={refs.rndWrapperRef}
                className="relative w-full max-w-[400px] rounded-xl overflow-hidden bg-black"
            >
                {/* iOS対応のため playsInline と muted は必須 */}
                <video
                    ref={refs.videoRef}
                    className="w-full h-auto object-cover block"
                    playsInline
                    muted
                    autoPlay
                />

                {/* 読み取りガイド枠（ここだけをWASMが切り取って解析しています） */}
                <div
                    className="absolute border-2 border-red-500 box-border z-10"
                    style={{
                        top: `${state.crop.y}px`,
                        left: `${state.crop.x}px`,
                        width: `${state.crop.width}px`,
                        height: `${state.crop.height}px`,
                        // 枠の外側を暗くする小技
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* レーザー風の演出（お好みで外してください） */}
                    <div className="w-full h-[2px] bg-red-500 opacity-70 animate-pulse absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                </div>
            </div>

            {/* 進捗ステータスバッジ */}
            <div className="flex gap-2 text-sm font-bold mt-2">
                <span className={`px-3 py-1 rounded-full transition-colors ${state.scannedData.isbn ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {state.scannedData.isbn ? "✓ ISBN" : "待機中: ISBN"}
                </span>
                <span className={`px-3 py-1 rounded-full transition-colors ${state.scannedData.ccode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {state.scannedData.ccode ? "✓ C-CODE" : "待機中: C-CODE"}
                </span>
            </div>

            {/* 解析エンジンの現在のステータス */}
            <p className="text-sm font-medium text-blue-600 h-5">
                {state.status}
            </p>

            <Button onClick={onClose} variant="danger" className="w-full max-w-[200px] mt-2">
                キャンセル
            </Button>

            <div className="text-center px-4 mb-4">
                <p className="font-bold text-gray-700">赤い枠内にバーコードを合わせてください</p>
                <p className="text-xs text-gray-500 mt-1">1段目と2段目を順番にスキャンします</p>
            </div>

            {/* WASM処理用の隠しCanvas群 */}
            <canvas ref={refs.sourceCanvasRef} className="hidden" />
            <canvas ref={refs.canvasRef} className="hidden" />
        </div>
    );
};
// import { useEffect, useRef, useState } from 'react';
// import { Html5Qrcode } from 'html5-qrcode';
// import { Button } from "../../../../shared/ui/button";

// import '../../style.css';

// interface ScannerProps {
//     onDetected: (isbn: string, ccode: string) => void;
//     onClose: () => void;
// }

// export const Scanner = ({ onDetected, onClose }: ScannerProps) => {
//     const onDetectedRef = useRef(onDetected);
//     const [scannedData, setScannedData] = useState<{ isbn?: string; ccode?: string }>({});

//     useEffect(() => {
//         onDetectedRef.current = onDetected;
//     }, [onDetected]);

//     useEffect(() => {
//         let isMounted = true;
//         const html5Qrcode = new Html5Qrcode("reader");

//         const startScanner = async () => {
//             try {
//                 if (html5Qrcode.getState() === 2) {
//                     await html5Qrcode.stop();
//                 }

//                 // --- 修正ポイント：条件をゆるくする ---
//                 await html5Qrcode.start(
//                     // exact: "environment" ではなく "environment" (背面優先、なければ他) にする
//                     { facingMode: "environment" },
//                     {
//                         fps: 20,
//                         qrbox: { width: 280, height: 200 },
//                         videoConstraints: {
//                             // ここも ideal (理想) に留める
//                             facingMode: "environment",
//                             width: { ideal: 1280 },
//                             height: { ideal: 720 }
//                         }
//                     },
//                     (decodedText) => {
//                         if (!isMounted) return;

//                         if (decodedText.startsWith('978')) {
//                             setScannedData(prev => ({ ...prev, isbn: decodedText }));
//                             console.log("✅ ISBN取得:", decodedText);
//                         }
//                         else if (decodedText.startsWith('19')) {
//                             setScannedData(prev => ({ ...prev, ccode: decodedText }));
//                             console.log("✅ C-CODE取得:", decodedText);
//                         }
//                     },
//                     () => { }
//                 );
//             } catch (err) {
//                 console.error("カメラ起動エラー:", err);

//                 // --- 予備のフォールバック (どんなカメラでもいいから開く) ---
//                 if (isMounted) {
//                     try {
//                         await html5Qrcode.start(
//                             { facingMode: "user" }, // 前面カメラを試す
//                             { fps: 20, qrbox: { width: 280, height: 200 } },
//                             () => { }, // callback
//                             () => { }  // error
//                         );
//                     } catch (finalErr) {
//                         console.error("最終的なカメラ起動失敗:", finalErr);
//                     }
//                 }
//             }
//         };

//         const timer = setTimeout(() => {
//             if (isMounted) startScanner();
//         }, 100);

//         return () => {
//             isMounted = false;
//             clearTimeout(timer);
//             if (html5Qrcode.getState() === 2) {
//                 html5Qrcode.stop().catch(() => { });
//             }
//         };
//     }, []);

//     useEffect(() => {
//         if (scannedData.isbn && scannedData.ccode) {
//             console.log("🔥 全データ取得完了:", scannedData);
//             onDetectedRef.current(scannedData.isbn, scannedData.ccode);
//         }
//     }, [scannedData]);

//     return (
//         <div className="scanner-wrapper flex flex-col items-center gap-4 w-full">
//             <div id="reader" className="w-full max-w-[400px] rounded-xl overflow-hidden bg-black"></div>

//             <div className="flex gap-2 text-sm font-bold">
//                 <span className={`px-3 py-1 rounded-full transition-colors ${scannedData.isbn ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
//                     {scannedData.isbn ? "✓ ISBN" : "待機中: ISBN"}
//                 </span>
//                 <span className={`px-3 py-1 rounded-full transition-colors ${scannedData.ccode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
//                     {scannedData.ccode ? "✓ C-CODE" : "待機中: C-CODE"}
//                 </span>
//             </div>

//             <Button onClick={onClose} variant="danger" className="w-full max-w-[200px]">キャンセル</Button>

//             <div className="text-center px-4">
//                 <p className="font-bold text-gray-700">上下のバーコードを順番にスキャン</p>
//                 <p className="text-xs text-gray-500 mt-1">1段目がISBN、2段目が分類/価格コードです</p>
//             </div>
//         </div>
//     );
// };