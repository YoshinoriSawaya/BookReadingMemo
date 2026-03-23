import { type BookResponse } from '../../schemas/book';
import '../../style.css';

export const BookCard = ({ book, isCompact }: { book: BookResponse; isCompact: boolean }) => {
    const authorNames = book.authors?.length > 0
        ? book.authors?.map(ba => ba).join(', ')
        : '著者不明';

    return (
        <div className={`book-card ${isCompact ? 'compact' : ''}`}>
            {book.imageUrl && (
                <img
                    src={book.imageUrl.replace('http://', 'https://')}
                    className="book-cover"
                    alt={book.title}
                />
            )}

            {!isCompact && (
                <div className="book-info">
                    <div className="book-title">
                        {book.title}
                    </div>
                    <div className="book-author">
                        {authorNames}
                    </div>
                </div>
            )}
        </div>
    );
};