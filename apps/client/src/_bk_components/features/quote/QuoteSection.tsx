import React, { useState, useEffect, useRef } from 'react';
import client from '../../../api/client';
import { type Quote, type MasterTag, type UserTag } from '../../../types';
import { ThoughtSection } from '../thought/ThoughtSection';

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

// スタイルを外出し
import './quote.css';
import { ImageProcessor } from '../../../features/quote/components/ocr/ImageProcessor';

interface Props {
    bookId: number;
    masterTags: MasterTag[];
    userTags: UserTag[];
}

export const QuoteSection = ({ bookId, masterTags, userTags }: Props) => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [newText, setNewText] = useState('');
    const [page, setPage] = useState<number | ''>('');
    const [isOcrLoading, setIsOcrLoading] = useState(false); // OCR状態管理
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOcrAction = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsOcrLoading(true);
        try {
            // 1. フロントエンド(TS)で画像をプリプロセッシング
            const processedBase64 = await ImageProcessor.processForOcr(file);

            // 2. C# の API へ送信（以前あなたが構築した client を利用）
            // backend ではこの Base64 を受け取って Rust を叩く
            const response = await client.post<{ text: string }>('Ocr/process', {
                base64Image: processedBase64.split(',')[1]
            });

            setNewText(prev => (prev ? `${prev}\n${response.data.text}` : response.data.text));
        } catch (err) {
            console.error("OCR連携失敗:", err);
        } finally {
            setIsOcrLoading(false);
        }
    };

    const fetchQuotes = async () => {
        try {
            const res = await client.get<Quote[]>(`Quotes/book/${bookId}`);
            setQuotes(res.data);
        } catch (err) {
            console.error("引用の取得に失敗:", err);
        }
    };

    useEffect(() => { fetchQuotes(); }, [bookId]);

    const handleAddQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim()) return;

        try {
            await client.post('Quotes', {
                bookId: bookId,
                text: newText,
                pageNumber: page === '' ? null : page,
                userId: 1
            });
            setNewText('');
            setPage('');
            fetchQuotes();
        } catch (err) {
            alert("引用の登録に失敗しました。");
        }
    };

    return (
        <div className="quote-section-container">
            <h5 className="quote-section-title">引用メモ</h5>

            {/* OCR ボタン：フォームのすぐ上に配置 */}
            <div className="ocr-upload-area">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleOcrAction}
                    style={{ display: 'none' }}
                />
                <Button
                    type="button"
                    className="common-button ocr-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOcrLoading}
                >
                    {isOcrLoading ? '読み取り中...' : '📷 画像から引用を入力'}
                </Button>
            </div>

            {/* 登録フォーム */}
            <form onSubmit={handleAddQuote} className="quote-form">
                <Input
                    type="number"
                    className="quote-page-input"
                    value={page}
                    onChange={(e) => setPage(e.target.value ? Number(e.target.value) : '')}
                    placeholder="ページ"
                />
                <textarea
                    className="quote-textarea"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="引用したいフレーズを入力"
                />

                <Button className='common-button' type="submit" variant="primary">
                    保存
                </Button>
            </form>

            {/* 一覧表示 */}
            <div className="quote-list">
                {quotes.map((q) => (
                    <div key={q.id} className="quote-item">
                        <div className="quote-text-wrapper">
                            <p className="quote-content">{q.text}</p>
                            {q.pageNumber && (
                                <span className="quote-page-tag">p.{q.pageNumber}</span>
                            )}
                        </div>

                        {/* 引用に紐づく感想セクション */}
                        <div className="quote-thought-area">
                            <ThoughtSection
                                bookId={bookId}
                                quoteRecordId={q.id}
                                masterTags={masterTags}
                                userTags={userTags}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};