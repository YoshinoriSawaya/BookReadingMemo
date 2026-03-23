// import { useState } from 'react';
// import client from '../../../api/client';
// import { type Book } from '../../../types';

// import { Button } from "../../ui/button";
// import { Select } from "../../ui/select";
// import { Input } from "../../ui/input";

// interface Props {
//     onBookAdded: (newBook: Book) => void;
// }

// export const AddBookForm = ({ onBookAdded }: Props) => {
//     const [isbn, setIsbn] = useState('');
//     const [loading, setLoading] = useState(false);

//     // エラーメッセージを表示するためのステートを追加
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);

//     const handleSubmit = async (e: React.SyntheticEvent) => {
//         e.preventDefault();
//         if (!isbn) return;

//         setLoading(true);
//         setErrorMessage(null);

//         try {
//             // バックエンドの [FromBody] BookRegistrationRequest request に合わせる
//             const response = await client.post<Book>('Books/search-or-create', {
//                 isbn: isbn
//             });

//             onBookAdded(response.data);
//             setIsbn('');
//             alert('本を登録しました！');
//         } catch (error: any) {
//             const data = error.response.data;
//             if (typeof data === 'object') {
//                 // 構造化されたエラー（source, upstreamStatusなど）があれば、それをわかりやすく表示
//                 const sourceLabel = data.source ? `[発生源: ${data.source}] ` : "";
//                 const statusLabel = data.upstreamStatus ? `(外部ステータス: ${data.upstreamStatus}) ` : "";
//                 setErrorMessage(`${sourceLabel}${statusLabel}${data.message || JSON.stringify(data)}`);
//             } else {
//                 setErrorMessage(data);
//             }

//             // // 開発環境のコンソールに詳細を出す
//             // console.error('--- Debug Error Start ---');
//             // console.error('Status:', error.response?.status);
//             // console.error('Data:', error.response?.data);
//             // console.error('Config:', error.config);
//             // console.error('--- Debug Error End ---');

//             // if (error.response) {
//             //     // サーバーからエラーが返ってきた場合 (400, 404, 429, 500など)
//             //     const status = error.response.status;
//             //     const data = error.response.data;

//             //     // dataがオブジェクト（{ message: "..." } など）の場合は文字列化、
//             //     // 文字列ならそのまま採用する
//             //     const errorBody = typeof data === 'object'
//             //         ? JSON.stringify(data, null, 2)
//             //         : data;

//             //     setErrorMessage(`[Server Error ${status}]: ${errorBody}`);

//             // } else if (error.request) {
//             //     // リクエストは送ったが反応がない場合
//             //     setErrorMessage("サーバーから応答がありません。バックエンド(5009ポート)が起動しているか確認してください。");
//             // } else {
//             //     // 設定ミスなどのクライアント側エラー
//             //     setErrorMessage(`[Request Error]: ${error.message}`);
//             // }
//         } finally {
//             setLoading(false);
//         }
//     };
//     return (
//         <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #444', borderRadius: '8px' }}>
//             <h3>新しい本を登録</h3>
//             <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
//                 <input
//                     type="text"
//                     value={isbn}
//                     onChange={(e) => setIsbn(e.target.value)}
//                     placeholder="ISBNを入力 (例: 9784798157573)"
//                     style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #666', backgroundColor: '#333', color: 'white' }}
//                     disabled={loading}
//                 />
//                 <button
//                     type="submit"
//                     disabled={loading || !isbn}
//                     style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
//                 >
//                     {loading ? '登録中...' : '登録'}
//                 </button>
//             </form>
//             {/* エラーメッセージの表示エリア */}
//             {errorMessage && (
//                 <div style={{ marginTop: '10px', color: '#ff6b6b', fontSize: '0.9rem', backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '8px', borderRadius: '4px' }}>
//                     ⚠️ {errorMessage}
//                 </div>
//             )}
//         </div>
//     );
// };