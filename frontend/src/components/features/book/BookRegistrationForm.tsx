import { useState } from 'react';
import client from '../../../api/client';
import { type Book } from '../../../types';

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

// features/book/book.css を読み込む（既存のファイルへ追記）
import './book.css';

export const BookRegistrationForm = ({ onComplete }: { onComplete: () => void }) => {
    const [isbn, setIsbn] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<Book | null>(null);

    const handleProcess = async () => {
        if (!isbn) return;
        setLoading(true);
        try {
            const res = await client.post<Book>('/Books/search-or-create', { isbn });
            setPreview(res.data);
        } catch (err: any) {
            if (err.response?.status === 422) {
                alert("Googleのデータベースに該当する本が見つかりませんでした。");
            } else {
                alert("処理中にエラーが発生しました。");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-form-container">
            {/* 入力エリア */}
            <div className="registration-input-group">
                <Input
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="ISBNを入力 (978...)"
                    className="registration-isbn-input"
                />
                <Button onClick={handleProcess} disabled={loading} variant="primary">
                    {loading ? '処理中...' : '実行'}
                </Button>
            </div>

            {/* プレビュー表示エリア */}
            {preview && (
                <div className="registration-preview-card">
                    <div className="preview-info-layout">
                        {preview.imageUrl && (
                            <img src={preview.imageUrl} alt="" className="preview-cover-img" />
                        )}
                        <div className="preview-text-content">
                            <h4 className="preview-title">{preview.title}</h4>
                            <p className="preview-author">
                                {preview.bookAuthors?.map(ba => ba.author?.name).join(', ')}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={onComplete}
                        variant="success"
                        className="registration-complete-btn"
                    >
                        本棚を確認する
                    </Button>
                </div>
            )}
        </div>
    );
};