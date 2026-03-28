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
    const authorNames = book.authors?.length > 0 ? book.authors.join(', ') : '著者不明';

    return (
        <div className="book-detail-view">
            <header className="detail-header">
                <h1 className="detail-title">{book.title}</h1>
                <p className="detail-authors">{authorNames}</p>
            </header>

            <div className="detail-content-grid">
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