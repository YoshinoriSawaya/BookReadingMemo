import { useState, useEffect, useRef } from 'react';
import client from './api/client';
import { type Book, type MasterTag, type UserTag } from './types';

// Shared UI components
// ※ Headerコンポーネントがツリーになかったため、仮パスとしています。必要に応じて調整してください
import { Header } from './shared/ui/header/Header';
import { Modal } from './shared/ui/modal/Modal';

// Feature components
// ※ ディレクトリ構成に合わせてパスとコンポーネント名を修正
import { BookCard } from './features/book/components/BookCard/BookCard';
import { BookDetailView } from './features/book/components/BookDetail/BookDetailView';
import { BookRegistrationForm } from './features/book/components/BookRegistration/BookRegistrationForm';
import { UserTagManagement } from './features/tag/components/UserTagManagement'; // ツリーには詳細がありませんでしたが推測で配置

import './App.css';

function App() {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [masterTags, setMasterTags] = useState<MasterTag[]>([]);
  const [userTags, setUserTags] = useState<UserTag[]>([]);

  // DOMへの直接アクセスをやめ、各Bookカードの参照を保持するMapを作成
  const bookRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const fetchData = async () => {
    try {
      const [booksRes, masterRes, userRes] = await Promise.all([
        client.get<Book[]>('/Books'),
        client.get<MasterTag[]>('/MasterTags'),
        client.get<UserTag[]>('/UserTags?userId=1')
      ]);

      if (Array.isArray(booksRes.data)) {
        setBooks(booksRes.data);
      } else {
        console.error("Books API が配列を返しませんでした:", booksRes.data);
        setBooks([]);
      }

      if (Array.isArray(masterRes.data)) setMasterTags(masterRes.data);
      if (Array.isArray(userRes.data)) setUserTags(userRes.data);

    } catch (err) {
      console.error("データの取得に失敗しました:", err);
    }
  };

  // querySelectorの代わりにuseRef(Map)を使用してスクロール
  useEffect(() => {
    if (selectedBookId) {
      const timer = setTimeout(() => {
        const activeElement = bookRefs.current.get(selectedBookId);
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedBookId]);

  useEffect(() => {
    fetchData();
  }, []);

  const selectedBook = Array.isArray(books)
    ? books.find(b => b.id === selectedBookId)
    : undefined;

  return (
    <div className="app-container">
      <Header
        onOpenBookModal={() => setIsBookModalOpen(true)}
        onOpenTagModal={() => setIsTagModalOpen(true)}
      />

      <main className={`app-main-layout ${selectedBookId ? 'has-detail' : ''}`}>
        <div className="book-grid-container">
          <div className="book-grid">
            {books.map(book => (
              <div
                key={book.id}
                // MapにDOMノードを登録・解除する
                ref={(node) => {
                  if (node) {
                    bookRefs.current.set(book.id, node);
                  } else {
                    bookRefs.current.delete(book.id);
                  }
                }}
                onClick={() => setSelectedBookId(book.id)}
                className={`book-card-wrapper ${selectedBookId === book.id ? 'active' : ''}`}
              >
                {/* ツリーに合わせて SimpleBookCard -> BookCard に変更 */}
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
            fetchData();
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
          onTagAdded={fetchData}
        />
      </Modal>
    </div>
  );
}

export default App;
