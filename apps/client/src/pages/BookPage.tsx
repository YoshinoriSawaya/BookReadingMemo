import { useState, useEffect, useRef } from 'react';
import { type Book } from '../types';
import { useBookData } from '../features/book/hooks/useBookData'; // 追加

import { Header } from '../shared/ui/header/Header';
import { Modal } from '../shared/ui/modal/Modal';
import { BookCard } from '../features/book/components/BookCard/BookCard';
import { BookDetailView } from '../features/book/components/BookDetail/BookDetailView';
import { BookRegistrationForm } from '../features/book/components/BookRegistration/BookRegistrationForm';
import { UserTagManagement } from '../features/tag/components/UserTagManagement';

export const BookPage = () => {
    // カスタムフックからデータと更新関数を取得
    const { books, masterTags, userTags, refreshData } = useBookData();

    // ページ固有のUIステート（モーダル開閉、選択状態）のみ残す
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

    const bookRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // スクロール制御（UI操作なのでPageに残す）
    useEffect(() => {
        if (selectedBookId) {
            const timer = setTimeout(() => {
                const activeElement = bookRefs.current.get(selectedBookId);
                if (activeElement) {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [selectedBookId]);

    const selectedBook = books.find((b: Book) => b.id === selectedBookId);

    return (
        <div className="book-page-container">
            <Header
                onOpenBookModal={() => setIsBookModalOpen(true)}
                onOpenTagModal={() => setIsTagModalOpen(true)}
            />

            <main className={`app-main-layout ${selectedBookId ? 'has-detail' : ''}`}>
                <div className="book-grid-container">
                    <div className="book-grid">
                        {books.map((book: Book) => (
                            <div
                                key={book.id}
                                ref={(node) => {
                                    if (node) bookRefs.current.set(book.id, node);
                                    else bookRefs.current.delete(book.id);
                                }}
                                onClick={() => setSelectedBookId(book.id)}
                                className={`book-card-wrapper ${selectedBookId === book.id ? 'active' : ''}`}
                            >
                                <BookCard book={book} isCompact={!!selectedBookId} />
                            </div>
                        ))}
                    </div>
                </div>

                {selectedBookId && selectedBook && (
                    <aside className="book-detail-aside">
                        <button className="close-detail-btn" onClick={() => setSelectedBookId(null)}>✕</button>
                        <BookDetailView
                            book={selectedBook}
                            masterTags={masterTags}
                            userTags={userTags}
                        />
                    </aside>
                )}
            </main>

            <Modal
                isOpen={isBookModalOpen}
                onClose={() => setIsBookModalOpen(false)}
                title="新しい本を登録"
            >
                <BookRegistrationForm
                    onComplete={() => {
                        refreshData(); // fetchData を refreshData に変更
                        setIsBookModalOpen(false);
                    }}
                />
            </Modal>

            <Modal
                isOpen={isTagModalOpen}
                onClose={() => setIsTagModalOpen(false)}
                title="ユーザータグ管理"
            >
                <UserTagManagement
                    userTags={userTags}
                    masterTags={masterTags}
                    onTagAdded={refreshData} // fetchData を refreshData に変更
                />
            </Modal>
        </div>
    );
};