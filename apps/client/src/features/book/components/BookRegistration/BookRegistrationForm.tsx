
import { useState } from 'react';
import { Button } from "../../../../shared/ui/button";
import { Input } from "../../../../shared/ui/input";
import { Scanner } from './Scanner';
import { useSearchOrCreateBook } from '../../hooks/useSearchOrCreateBook';

import '../../style.css';

export const BookRegistrationForm = ({ onComplete }: { onComplete: () => void }) => {
    const [isbn, setIsbn] = useState('');
    const [ccode, setCcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // 🌟 Hooksを呼び出して、通信機能と状態をもらう
    const { searchOrCreate, loading, preview, error } = useSearchOrCreateBook();

    const handleDetected = (detectedIsbn: string, detectedCcode: string) => {
        setIsbn(detectedIsbn);
        setCcode(detectedCcode);
        setIsScanning(false);
    };

    return (
        <div className="registration-form-container">
            {/* エラー表示を追加 */}
            {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

            {isScanning ? (
                <Scanner onDetected={handleDetected} onClose={() => setIsScanning(false)} />
            ) : (
                <div style={{ marginBottom: '15px' }}>
                    <Button onClick={() => setIsScanning(true)} variant="primary">
                        📷 バーコードを読み取る
                    </Button>
                </div>
            )}

            <div className="registration-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label style={{ fontSize: '0.8rem', color: '#666' }}>ISBN (1段目)</label>
                    <Input
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="978..."
                        className="registration-isbn-input"
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', color: '#666' }}>C-CODE (2段目)</label>
                    <Input
                        value={ccode}
                        onChange={(e) => setCcode(e.target.value)}
                        placeholder="19..."
                        className="registration-ccode-input"
                    />
                </div>

                {/* 🌟 通信処理はHooksに任せる */}
                <Button onClick={() => searchOrCreate(isbn, ccode)} disabled={loading || !isbn} variant="primary">
                    {loading ? '処理中...' : '実行'}
                </Button>
            </div>

            {/* プレビュー表示（既存コードのまま） */}
            {preview && (
                <div className="registration-preview-card">
                    {/* ...既存のプレビュー表示... */}
                    <div className="preview-info-layout">
                        {preview.imageUrl && (
                            <img src={preview.imageUrl} alt="" className="preview-cover-img" />
                        )}
                        <div className="preview-text-content">
                            <h4 className="preview-title">{preview.title}</h4>
                            <p className="preview-author">
                                {preview.authors?.join(', ')}
                            </p>
                            {/* 登録後のデータにCCODEが含まれるなら表示 */}
                            {preview.ccode && <p className="preview-ccode">C-CODE: {preview.ccode}</p>}
                        </div>
                    </div>

                    <Button onClick={onComplete} variant="success" className="registration-complete-btn">
                        本棚を確認する
                    </Button>
                </div>
            )}
        </div>
    );
};