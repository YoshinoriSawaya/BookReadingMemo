import { Rnd } from 'react-rnd';
import { Button } from "../../../../shared/ui/button/Button";
import { useOcrScanner, type BufferItem } from '../../hooks/useOcrScanner';
import '../../style.css'; // 標準CSSをインポート

interface OcrScannerProps {
    onDetected: (text: string) => void;
    onClose: () => void;
}

export const OcrScanner = ({ onDetected, onClose }: OcrScannerProps) => {
    const { refs, state, setters, textBufferRef } = useOcrScanner();
    const { videoRef, sourceCanvasRef, canvasRef, rndWrapperRef } = refs;
    const { crop, bufferSize, minRequired, displayData, scannedText, status } = state;
    const { setCrop, setBufferSize, setMinRequired } = setters;

    return (
        <div className="ocr-scanner-container">
            {/* UI設定パネル */}
            <div className="ocr-settings-panel">
                <div>
                    <div className="ocr-setting-info">
                        <span>候補の保持件数: {bufferSize}件</span>
                        <span>最新から何件残すか</span>
                    </div>
                    <input
                        type="range" min="1" max="10" step="1"
                        value={bufferSize}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setBufferSize(val);
                            if (minRequired > val) setMinRequired(val);
                        }}
                        className="ocr-range-input"
                    />
                </div>

                <div>
                    <div className="ocr-setting-info">
                        <span>採用のしきい値: 最低 {minRequired}件</span>
                        <span>Rustで比較する数</span>
                    </div>
                    <input
                        type="range" min="1" max={bufferSize} step="1"
                        value={minRequired}
                        onChange={(e) => setMinRequired(parseInt(e.target.value))}
                        className="ocr-range-input"
                    />
                </div>
            </div>

            {/* デバッグ用パネル */}
            <div className="ocr-debug-panel">
                <div className="ocr-debug-header">DEBUG INFO</div>
                <div className="ocr-debug-grid">
                    <div>
                        <div style={{ color: '#94a3b8' }}>感度 (S) 範囲:</div>
                        <div>
                            {(displayData.wave.baseS - displayData.wave.ampS).toFixed(3)}
                            <span style={{ color: '#64748b' }}> ~ </span>
                            {(displayData.wave.baseS + displayData.wave.ampS).toFixed(3)}
                        </div>
                        <div style={{ color: '#86efac' }}>現在: {displayData.params.sensitivity.toFixed(3)}</div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8' }}>計算範囲 (W) 範囲:</div>
                        <div>
                            {(displayData.wave.baseW - displayData.wave.ampW).toFixed(3)}
                            <span style={{ color: '#64748b' }}> ~ </span>
                            {(displayData.wave.baseW + displayData.wave.ampW).toFixed(3)}
                        </div>
                        <div style={{ color: '#93c5fd' }}>現在: {displayData.params.windowRatio.toFixed(3)}</div>
                    </div>
                </div>

                <div style={{ color: '#94a3b8' }}>
                    学習履歴 (高精度ヒット数): <span style={{ color: '#facc15' }}>{displayData.historyCount}件</span>
                </div>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>バッファ状況 ({displayData.buffer.length}/{bufferSize}):</div>
                    <div style={{ maxHeight: '128px', overflowY: 'auto' }}>
                        {displayData.buffer.length === 0 && <div style={{ color: '#475569', fontStyle: 'italic' }}>No data</div>}
                        {displayData.buffer.map((item: BufferItem, idx: number) => {
                            const badgeClass = item.confidence >= 80 ? 'high' : item.confidence >= 70 ? 'mid' : 'low';
                            return (
                                <div key={idx} className="ocr-debug-buffer-item">
                                    {/* 🌟 バッククォートを使って badgeClass を適用する */}
                                    <span className={`ocr-debug-badge ${badgeClass}`}>
                                        {Math.round(item.confidence)}%
                                    </span>
                                    <span style={{ color: '#cbd5e1', wordBreak: 'break-all', lineHeight: 1.2 }}>{item.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

            {/* メインカメラ（読み取り範囲指定） */}
            <div ref={rndWrapperRef} className="ocr-camera-wrapper">
                <canvas ref={sourceCanvasRef} className="ocr-source-canvas" />
                <Rnd
                    size={{ width: crop.width, height: crop.height }}
                    position={{ x: crop.x, y: crop.y }}
                    onDragStop={(_e, d) =>
                        setCrop((prev: { width: number, height: number, x: number, y: number }) => ({ ...prev, x: d.x, y: d.y }))
                    }
                    onResizeStop={(_e, _direction, ref, _delta, position) => {
                        setCrop({
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                            ...position
                        });
                    }}
                    bounds="parent"
                    style={{ border: '2px solid #00FF00', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)', zIndex: 10 }}
                >
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <div className="ocr-corner-marker" style={{ borderTop: '4px solid', borderLeft: '4px solid', top: 0, left: 0 }} />
                        <div className="ocr-corner-marker" style={{ borderTop: '4px solid', borderRight: '4px solid', top: 0, right: 0 }} />
                        <div className="ocr-corner-marker" style={{ borderBottom: '4px solid', borderLeft: '4px solid', bottom: 0, left: 0 }} />
                        <div className="ocr-corner-marker" style={{ borderBottom: '4px solid', borderRight: '4px solid', bottom: 0, right: 0 }} />
                    </div>
                </Rnd>
            </div>

            {/* OCR処理用（拡大・白黒表示） */}
            <div className="ocr-camera-wrapper">
                <div className="ocr-canvas-badge">OCR本処理用 (内部1200px)</div>
                <canvas ref={canvasRef} className="ocr-process-canvas" />
            </div>

            {/* テキスト表示とボタンUI */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '8px', alignItems: 'center' }}>
                <span className={`ocr-status-badge ${scannedText ? 'success' : 'processing'}`}>
                    {status}
                </span>
            </div>

            <div className="ocr-result-box">
                {scannedText ? scannedText : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>スキャン中...</span>}
            </div>

            <div className="ocr-actions">
                <Button onClick={onClose} variant="danger">キャンセル</Button>
                <Button
                    onClick={() => onDetected(scannedText)}
                    variant="primary"
                    disabled={!scannedText || textBufferRef.current.length < minRequired}
                >
                    決定
                </Button>
            </div>
        </div>
    );
};