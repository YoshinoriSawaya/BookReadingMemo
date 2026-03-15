import { type Book } from '../../../types';
import './book.css';

export const SimpleBookCard = ({ book, isCompact }: { book: Book; isCompact: boolean }) => {
    const authorNames = book.bookAuthors?.length > 0
        ? book.bookAuthors.map(ba => ba.author?.name).filter(Boolean).join(', ')
        : '著者不明';

    return (
        <div className={`simple-book-card ${isCompact ? 'compact' : ''}`}>
            {book.imageUrl && (
                <img
                    src={book.imageUrl.replace('http://', 'https://')}
                    className="simple-book-cover"
                    alt={book.title}
                />
            )}

            {!isCompact && (
                <div className="simple-book-info">
                    <div className="simple-book-title">
                        {book.title}
                    </div>
                    <div className="simple-book-author">
                        {authorNames}
                    </div>
                </div>
            )}
        </div>
    );
};