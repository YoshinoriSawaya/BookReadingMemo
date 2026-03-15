// import { useState } from 'react';
// import { type Book, type MasterTag, type UserTag } from '../../../types';
// import { QuoteSection } from '../quote/QuoteSection';
// import { ThoughtSection } from '../thought/ThoughtSection';

// import { Button } from "../../ui/button";
// // 注意: Select や Input はこのカードの「表示」だけなら不要かもしれませんが、
// // もし編集機能などを持たせる場合はインポートを維持してください。

// import './book.css';

// interface Props {
//     book: Book;
//     masterTags: MasterTag[];
//     userTags: UserTag[];
// }

// export const BookCard = ({ book, masterTags, userTags }: Props) => {
//     const [showQuotes, setShowQuotes] = useState(false);

//     const authorNames = book.bookAuthors?.length > 0
//         ? book.bookAuthors.map(ba => ba.author?.name).filter(Boolean).join(', ')
//         : '著者不明';

//     const coverUrl = book.imageUrl ? book.imageUrl.replace('http://', 'https://') : '';

//     return (
//         <div className="book-card">
//             {/* --- 上部：本の基本情報 --- */}
//             <div className="book-card-main">
//                 {coverUrl && (
//                     <img src={coverUrl} alt={book.title} className="book-cover" />
//                 )}
//                 <div className="book-info">
//                     <h3 className="book-title">{book.title}</h3>
//                     <p className="book-author">{authorNames}</p>
//                     <p className="book-isbn">ISBN: {book.isbn}</p>
//                 </div>
//             </div>

//             {/* --- 中間：アクションバー (共通Buttonを使用) --- */}
//             <Button
//                 onClick={() => setShowQuotes(!showQuotes)}
//                 className={`quote-toggle-button ${showQuotes ? 'active' : ''}`}
//                 style={{ width: '100%', borderRadius: 0 }} // カードの幅に合わせる
//             >
//                 {showQuotes ? '▲ 引用を閉じる' : `▼ 引用・メモを表示`}
//             </Button>

//             {/* --- 下部：自分のアウトプット --- */}
//             {showQuotes && (
//                 <div className="book-card-details">
//                     <QuoteSection
//                         bookId={book.id}
//                         masterTags={masterTags}
//                         userTags={userTags}
//                     />

//                     <div className="overall-thought-section">
//                         <p className="section-label">本全体の考察</p>
//                         <ThoughtSection
//                             bookId={book.id}
//                             masterTags={masterTags}
//                             userTags={userTags}
//                         />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };