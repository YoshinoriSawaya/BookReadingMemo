import { type Book, type MasterTag, type UserTag } from '../../../types';
import { QuoteSection } from '../quote/QuoteSection';
import { ThoughtSection } from '../thought/ThoughtSection';

// UI パーツをインポート（将来的な機能拡張に備えて Input 等も維持）
// import { Button } from "../../ui/button";
// import { Select } from "../../ui/select";
// import { Input } from "../../ui/input";

// 同じフォルダに作成した CSS を読み込む
import './book.css';

interface Props {
    book: Book;
    masterTags: MasterTag[];
    userTags: UserTag[];
}

export const BookDetailView = ({ book, masterTags, userTags }: Props) => {
    return (
        <div className="book-detail-view">
            <header className="detail-header">
                <h1 className="detail-title">{book.title}</h1>
                <p className="detail-authors">
                    {book.bookAuthors?.map(ba => ba.author?.name).join(', ') || '著者不明'}
                </p>
            </header>

            <div className="detail-content-grid">
                {/* 本全体の考察（サマリーとして最上部に配置） */}
                <section className="detail-section">
                    <h2 className="section-title">本の感想</h2>
                    <div className="section-content">
                        <ThoughtSection
                            bookId={book.id}
                            quoteRecordId={null}
                            masterTags={masterTags}
                            userTags={userTags}
                        />
                    </div>
                </section>

                {/* 引用ログセクション */}
                <section className="detail-section">
                    <h2 className="section-title">引用ログ</h2>
                    <div className="section-content">
                        <QuoteSection
                            bookId={book.id}
                            masterTags={masterTags}
                            userTags={userTags}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};