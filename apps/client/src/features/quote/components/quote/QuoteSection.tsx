import React, { useState, useEffect, useRef } from 'react';
import client from '../../../../api/client';
import { type Quote } from '../../schemas/quote';
import { type MasterTag, type UserTag } from '../../../tag/schemas/tag';
import { ThoughtSection } from '../../../thought/components/ThoughtSection';

import { Button } from "../../../../shared/ui/button/Button";
import { Input } from "../../../../shared/ui/input/Input";
// 🌟 Modalのインポートは不要になるので削除します
// import { Modal } from "../../../../shared/ui/modal/Modal"; 

import { ImageProcessor } from '../ocr/ImageProcessor';
import { OcrScanner } from '../ocr/OcrScanner';

import "../../style.css";

interface Props {
    bookId: number;
    masterTags: MasterTag[];
    userTags: UserTag[];
}

export const QuoteSection = ({ bookId, masterTags, userTags }: Props) => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [newText, setNewText] = useState('');
    const [page, setPage] = useState<number | ''>('');
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOcrAction = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsOcrLoading(true);
        try {
            const processedBase64 = await ImageProcessor.processForOcr(file);
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

            {/* 🌟 1. Modalから出し、引用エリアの最上部にインライン配置 */}
            {isScanning && (
                <div className="ocr-scanner-inline-wrapper" style={{ marginBottom: '20px' }}>
                    <OcrScanner
                        onDetected={(text) => {
                            setNewText(prev => prev ? `${prev}\n${text}` : text);
                            setIsScanning(false);
                        }}
                        onClose={() => setIsScanning(false)}
                    />
                </div>
            )}

            {/* 🌟 元のUIを常に表示する（三項演算子で隠さない） */}
            <div className="ocr-upload-area" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
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
                    {isOcrLoading ? '読み取り中...' : '📁 画像から'}
                </Button>

                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsScanning(true)}
                    disabled={isScanning} // 🌟 スキャン中はボタンを押せなくしておくと親切です
                >
                    📷 カメラでリアルタイム読取
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

            {/* 🌟 下にあった <Modal> ブロックはすべて削除 */}
        </div>
    );
};