import { type BookResponse } from '../../../book/schemas/book';
import { type MasterTag, type UserTag } from '../../../tag/schemas/tag';

import { ThoughtSection } from '../../../thought/components/ThoughtSection';
import { QuoteSection } from '../../../quote/components/quote/QuoteSection';



import '../../style.css';

interface Props {
    book: BookResponse;
    masterTags: MasterTag[];
    userTags: UserTag[];
}

export const BookDetailView = ({ book, masterTags, userTags }: Props) => {
    return (
        <div className="book-detail-view">
            <header className="detail-header">
                <h1 className="detail-title">{book.title}</h1>
                <p className="detail-authors">
                    {book.authors?.map(ba => ba).join(', ') || '著者不明'}
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