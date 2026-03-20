// import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react'; // useRef を追加
import client from './api/client';
import { type Book, type MasterTag, type UserTag } from './types';

// UI components
import { Header } from './components/ui/header/Header';
import { Modal } from './components/ui/modal/Modal';

// Feature components
import { SimpleBookCard } from './components/features/book/SimpleBookCard';
import { BookDetailView } from './components/features/book/BookDetailView';
import { BookRegistrationForm } from './components/features/book/BookRegistrationForm';
import { UserTagManagement } from './components/features/tag/UserTagManagement';


import './App.css';

function App() {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [masterTags, setMasterTags] = useState<MasterTag[]>([]);
  const [userTags, setUserTags] = useState<UserTag[]>([]);


  const fetchData = async () => {
    try {
      const [booksRes,
        masterRes,
        userRes
      ] = await Promise.all([
        client.get<Book[]>('/Books'),
        client.get<MasterTag[]>('/MasterTags'),
        client.get<UserTag[]>('/UserTags?userId=1')
      ]);

      console.log(booksRes);

      // データが配列のときだけ state を更新する
      if (Array.isArray(booksRes.data)) {
        setBooks(booksRes.data);
      } else {
        console.error("Books API が配列を返しませんでした:", booksRes.data);
        setBooks([]); // 安全のために空配列をセット
      }

      // 他のデータも同様に...
      if (Array.isArray(masterRes.data)) setMasterTags(masterRes.data);
      if (Array.isArray(userRes.data)) setUserTags(userRes.data);

    } catch (err) {
      console.error("データの取得に失敗しました:", err);
    }
  };


  useEffect(() => {
    if (selectedBookId) {
      const timer = setTimeout(() => {
        // 'active' クラスがついた要素を直接指定
        const activeElement = document.querySelector('.book-card-wrapper.active');

        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start', // 上端に合わせる
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedBookId]);




  useEffect(() => {
    fetchData();
  }, []);

  // books が配列であることを確認してから find を実行するように変更
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
                onClick={() => setSelectedBookId(book.id)}
                // active クラスを scrollIntoView の目印にする
                className={`book-card-wrapper ${selectedBookId === book.id ? 'active' : ''}`}
              >
                <SimpleBookCard book={book} isCompact={!!selectedBookId} />
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

      {/* モーダル類：isOpen が false の時は Modal コンポーネント側で null を返す前提 */}
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