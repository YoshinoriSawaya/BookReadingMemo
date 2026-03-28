import { type BookResponse } from '../../schemas/book';
import '../../style.css';

interface Props {
    book: BookResponse;
    isCompact?: boolean;
}

export const BookCard = ({ book, isCompact = false }: Props) => {
    const authorNames = book.authors?.length > 0 ? book.authors.join(', ') : '著者不明';
    const secureImageUrl = book.imageUrl?.replace('http://', 'https://');

    return (
        <div className={`book-card ${isCompact ? 'compact' : ''}`}>
            {secureImageUrl && (
                <img
                    src={secureImageUrl}
                    className="book-cover"
                    alt={book.title}
                />
            )}

            {!isCompact && (
                <div className="book-info">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{authorNames}</div>
                </div>
            )}
        </div>
    );
};