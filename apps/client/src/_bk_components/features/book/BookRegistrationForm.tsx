import { useState } from 'react';
import client from '../../../api/client';
import { type Book } from '../../../types';

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Scanner } from './Scanner';
import './book.css';

export const BookRegistrationForm = ({ onComplete }: { onComplete: () => void }) => {
    const [isbn, setIsbn] = useState('');
    const [ccode, setCcode] = useState(''); // C-CODE用のStateを追加
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<Book | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleProcess = async (targetIsbn?: string, targetCcode?: string) => {
        const searchIsbn = (targetIsbn || isbn).trim();
        const searchCcode = (targetCcode || ccode).trim();

        if (!searchIsbn) return;

        setLoading(true);
        try {
            // API側がC-CODEに対応している場合は、パラメータに含める
            const res = await client.post<Book>('/Books/search-or-create', {
                isbn: searchIsbn,
                ccode: searchCcode // バックエンドが受け取れるなら送信
            });
            setPreview(res.data);
        } catch (err: any) {
            if (err.response?.status === 422) {
                alert("データベースに該当する本が見つかりませんでした。");
            } else {
                alert(`処理中にエラーが発生しました。`);
            }
        } finally {
            setLoading(false);
        }
    };

    // ScannerからISBNとC-CODEを受け取るように修正
    const handleDetected = (detectedIsbn: string, detectedCcode: string) => {
        setIsbn(detectedIsbn);
        setCcode(detectedCcode);
        setIsScanning(false);

        // 両方取れたら自動で検索を開始しても良い
        // handleProcess(detectedIsbn, detectedCcode); 
    };

    return (
        <div className="registration-form-container">
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

                <Button onClick={() => handleProcess()} disabled={loading || !isbn} variant="primary">
                    {loading ? '処理中...' : '実行'}
                </Button>
            </div>

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
                                {/* {preview.bookAuthors?.map(ba => ba.author?.name).join(', ')} */}
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


// import { useState } from 'react';
// import client from '../../../api/client';
// import { type Book } from '../../../types';

// import { Button } from "../../ui/button";
// import { Input } from "../../ui/input";
// import { Scanner } from './Scanner'; // 追加: 切り出したScannerを読み込む
// import './book.css';

// export const BookRegistrationForm = ({ onComplete }: { onComplete: () => void }) => {
//     const [isbn, setIsbn] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [preview, setPreview] = useState<Book | null>(null);
//     const [isScanning, setIsScanning] = useState(false);

//     const handleProcess = async (targetIsbn?: string) => {
//         const rawIsbn = typeof targetIsbn === 'string' ? targetIsbn : isbn;
//         const searchIsbn = rawIsbn.trim();

//         if (!searchIsbn) return;

//         setLoading(true);
//         try {
//             console.log("APIに送信するISBN:", searchIsbn);
//             const res = await client.post<Book>('/Books/search-or-create', { isbn: searchIsbn });
//             setPreview(res.data);
//         } catch (err: any) {
//             console.error("🚨 APIエラー詳細:", err);
//             console.error("🚨 エラーレスポンス:", err.response?.data);

//             if (err.response?.status === 422) {
//                 alert("Googleのデータベースに該当する本が見つかりませんでした。");
//             } else {
//                 alert(`処理中にエラーが発生しました。(Status: ${err.response?.status || '不明'})`);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDetected = (code: string) => {
//         setIsbn(code);
//         setIsScanning(false);
//     };

//     return (
//         <div className="registration-form-container">
//             {isScanning ? (
//                 <Scanner onDetected={handleDetected} onClose={() => setIsScanning(false)} />
//             ) : (
//                 <div style={{ marginBottom: '15px' }}>
//                     <Button onClick={() => setIsScanning(true)} variant="primary">
//                         📷 カメラでバーコードを読み取る
//                     </Button>
//                 </div>
//             )}

//             <div className="registration-input-group">
//                 <Input
//                     value={isbn}
//                     onChange={(e) => setIsbn(e.target.value)}
//                     placeholder="ISBNを入力 (978...)"
//                     className="registration-isbn-input"
//                 />
//                 <Button onClick={() => handleProcess()} disabled={loading} variant="primary">
//                     {loading ? '処理中...' : '実行'}
//                 </Button>
//             </div>

//             {preview && (
//                 <div className="registration-preview-card">
//                     <div className="preview-info-layout">
//                         {preview.imageUrl && (
//                             <img src={preview.imageUrl} alt="" className="preview-cover-img" />
//                         )}
//                         <div className="preview-text-content">
//                             <h4 className="preview-title">{preview.title}</h4>
//                             <p className="preview-author">
//                                 {preview.bookAuthors?.map(ba => ba.author?.name).join(', ')}
//                             </p>
//                         </div>
//                     </div>

//                     <Button
//                         onClick={onComplete}
//                         variant="success"
//                         className="registration-complete-btn"
//                     >
//                         本棚を確認する
//                     </Button>
//                 </div>
//             )}
//         </div>
//     );
// };
