import { useEffect } from 'react';
import { Button } from "../../../../shared/ui/button/Button";
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import '../../style.css';

interface ScannerProps {
    onDetected: (isbn: string, ccode: string) => void;
    onClose: () => void;
}

export const Scanner = ({ onDetected, onClose }: ScannerProps) => {
    const { refs, state } = useBarcodeScanner();

    useEffect(() => {
        if (state.scannedData.isbn && state.scannedData.ccode) {
            onDetected(state.scannedData.isbn, state.scannedData.ccode);
        }
    }, [state.scannedData, onDetected]);

    const isIsbnScanned = !!state.scannedData.isbn;
    const isCcodeScanned = !!state.scannedData.ccode;

    // 🌟 固定サイズ定義
    const FIXED_WIDTH = 300; // VideoとPreview共通の幅
    const VIDEO_HEIGHT = 400; // Videoコンテナの高さ

    return (
        <div className="scanner-container">
            {/* 🌟 1. VideoとPreviewを束ねるグループコンテナ (幅300pxに固定) */}
            <div
                style={{
                    width: `${FIXED_WIDTH}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px', // VideoとPreviewの間の微小な隙間
                    margin: '0 auto', // 中央寄せ
                    overflow: 'hidden' // 角丸からはみ出し防止
                }}
            >
                {/* 🌟 上段：Video Wrapper (高さ400px) */}
                <div
                    ref={refs.rndWrapperRef}
                    style={{
                        width: '100%', // 親コンテナ(300px)一杯
                        height: `${VIDEO_HEIGHT}px`,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        borderTopLeftRadius: '8px', // 上側だけ角丸
                        borderTopRightRadius: '8px',
                    }}
                >
                    <video
                        ref={refs.videoRef}
                        playsInline
                        muted
                        autoPlay
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />

                    {/* 🌟 完全にCSSで制御する「飾り」の赤枠 */}
                    <div className="scanner-guide-overlay">
                        <div className="scanner-laser"></div>
                    </div>
                </div>

            </div>

            {/* 進捗ステータス */}
            <div className="scanner-status-badges">
                <span className={`badge ${isIsbnScanned ? 'badge-success' : 'badge-pending'}`}>
                    {isIsbnScanned ? "✓ ISBN" : "待機中: ISBN"}
                </span>
                <span className={`badge ${isCcodeScanned ? 'badge-success' : 'badge-pending'}`}>
                    {isCcodeScanned ? "✓ C-CODE" : "待機中: C-CODE"}
                </span>
            </div>

            <p className="scanner-status-text">
                {state.status}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <Button onClick={onClose} variant="danger" style={{ width: '200px' }}>
                    キャンセル
                </Button>
            </div>

            <div className="scanner-instructions">
                <p className="main-text">赤い枠内にバーコードを合わせてください</p>
                <p className="sub-text">1段目と2段目を順番にスキャンします</p>
            </div>

            {/* 解析用のCanvasをフックに紐付ける (sourceCanvasRefが不要であれば置き換えでOKです) */}
            <canvas ref={refs.canvasRef} style={{ display: 'none' }} />
            {/* もし sourceCanvasRef も別の処理で使っているなら両方置いてください */}
            <canvas ref={refs.sourceCanvasRef} style={{ display: 'none' }} />
        </div>
    );
};