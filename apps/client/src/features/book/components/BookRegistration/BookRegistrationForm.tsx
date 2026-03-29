import { useState } from 'react';
import { Button } from "../../../../shared/ui/button/Button";
import { Input } from "../../../../shared/ui/input/Input";
import { Scanner } from './Scanner';
import { useSearchOrCreateBook } from '../../hooks/useSearchOrCreateBook';
import '../../style.css';

interface Props {
    onComplete: () => void;
}

export const BookRegistrationForm = ({ onComplete }: Props) => {
    const [isbn, setIsbn] = useState('');
    const [ccode, setCcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const { searchOrCreate, loading, preview, error } = useSearchOrCreateBook();

    const handleDetected = (detectedIsbn: string, detectedCcode: string) => {
        setIsbn(detectedIsbn);
        setCcode(detectedCcode);
        setIsScanning(false);
    };

    return (
        <div className="registration-form-container">
            {error && <div className="error-message">{error}</div>}

            {isScanning ? (
                <Scanner onDetected={handleDetected} onClose={() => setIsScanning(false)} />
            ) : (
                <div className="scanner-toggle-wrapper">
                    <Button onClick={() => setIsScanning(true)} variant="primary">
                        📷 バーコードを読み取る
                    </Button>
                </div>
            )}

            <div className="registration-input-group">
                <div className="input-wrapper">
                    <label className="input-label">ISBN (1段目)</label>
                    <Input
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="978..."
                        className="registration-isbn-input"
                    />
                </div>
                <div className="input-wrapper">
                    <label className="input-label">C-CODE (2段目)</label>
                    <Input
                        value={ccode}
                        onChange={(e) => setCcode(e.target.value)}
                        placeholder="19..."
                        className="registration-ccode-input"
                    />
                </div>

                <Button
                    onClick={() => searchOrCreate(isbn, ccode)}
                    disabled={loading || !isbn}
                    variant="primary"
                >
                    {loading ? '処理中...' : '実行'}
                </Button>
            </div>

            {preview && (
                <div className="registration-preview-card">
                    <div className="preview-info-layout">
                        {preview.imageUrl && (
                            <img src={preview.imageUrl} alt={preview.title} className="preview-cover-img" />
                        )}
                        <div className="preview-text-content">
                            <h4 className="preview-title">{preview.title}</h4>
                            <p className="preview-author">{preview.authors?.join(', ')}</p>
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