import { useState, useEffect } from 'react';
import client from '../../../api/client'; // 階層が変わったので注意
// import { Select } from '../../ui/select/Select';
// import { Input } from '../../ui/input/Input'; // 同様に共通化済みと想定
// import { Button } from '../../ui/button/Button';
import { type Thought, type MasterTag, type UserTag } from '../../../types';
import '../style.css';
// 以前: ../../ui/Button
// 現在: ../../ui/button/Button (フォルダが一段深くなった)

import { Button } from "../../../shared/ui/button";
import { Select } from "../../../shared/ui/select";
import { Input } from "../../../shared/ui/input";

// インポート文の下に追加
interface Props {
    bookId: number;
    quoteRecordId?: number | null; // Nullなら本全体の考察
    masterTags: MasterTag[];
    userTags: UserTag[];
    onThoughtAdded?: () => void; // 親コンポーネントに再取得を通知する関数
}
export const ThoughtSection = ({ bookId, quoteRecordId, masterTags, userTags }: Props) => {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [content, setContent] = useState('');
    const [selectedMasterId, setSelectedMasterId] = useState<number>(1); // 初期値は最初のタグ

    // const [selectedMasterId, setSelectedMasterId] = useState<number>(masterTags[0]?.id || 0);

    const [selectedUserTagId, setSelectedUserTagId] = useState<number | "">("");

    // 1. 感想を取得する (本全体 or 特定の引用)
    const fetchThoughts = async () => {
        try {
            // 本に紐づく全ての感想を取得し、フロントでフィルタリングする
            const res = await client.get<Thought[]>(`Thoughts/book/${bookId}`);
            const filtered = res.data.filter(t => t.quoteRecordId === (quoteRecordId ?? null));
            setThoughts(filtered);
        } catch (err) {
            console.error("感想の取得に失敗:", err);
        }
    };

    // マスタータグが変わったら、ユーザータグの選択をリセットする
    const handleMasterChange = (id: number) => {
        setSelectedMasterId(id);
        setSelectedUserTagId(""); // カテゴリが変わったのでリセット
    };

    useEffect(() => {
        fetchThoughts();
    }, [bookId, quoteRecordId]);

    // 2. 感想を投稿する
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await client.post('Thoughts', {
                bookId: bookId,
                quoteRecordId: quoteRecordId ?? null,
                masterTagId: selectedMasterId,
                userTagId: selectedUserTagId || null,
                content: content,
                userId: 1 // 固定
            });
            setContent('');
            fetchThoughts(); // リスト更新
        } catch (err) {
            alert("考察の保存に失敗しました。");
        }
    };
    return (
        <div className="thought-section-container">
            <form onSubmit={handleSubmit} className="thought-form">
                <div className="thought-input-group">
                    {/* 共通Selectを使用 */}
                    <Select
                        value={selectedMasterId}
                        onChange={(e) => handleMasterChange(Number(e.target.value))}
                        options={masterTags.map(mt => ({ value: mt.id, label: mt.name }))}
                    />

                    {/* ユーザータグ選択も共通Selectに */}
                    <Select
                        value={selectedUserTagId}
                        onChange={(e) => setSelectedUserTagId(e.target.value ? Number(e.target.value) : "")}
                        options={[
                            { value: "", label: "タグを選択..." },
                            ...userTags
                                .filter(ut => ut.masterTagId === selectedMasterId)
                                .map(ut => ({ value: ut.id, label: `#${ut.name}` }))
                        ]}
                    />

                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="感想を入力..."
                    />

                    <Button type="submit" variant="success">記録</Button>
                </div>
            </form>

            {/* 表示一覧 */}
            <div className="thought-list">
                {thoughts.map(t => (
                    <div key={t.id} className="thought-card">
                        <span className="master-tag-label">[{t.masterTag?.name || 'メモ'}]</span>
                        {t.userTag && <span className="user-tag-label">#{t.userTag.name}</span>}
                        <span className="thought-content">{t.content}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// import { useState, useEffect } from 'react';
// import client from '../../../api/client';
// import { type Thought, type MasterTag, type UserTag } from '../../../types';

// interface Props {
//     bookId: number;
//     quoteRecordId?: number | null; // Nullなら本全体の考察
//     masterTags: MasterTag[];
//     userTags: UserTag[];
// }

// export const ThoughtSection = ({ bookId, quoteRecordId, masterTags, userTags }: Props) => {
//     const [thoughts, setThoughts] = useState<Thought[]>([]);
//     const [content, setContent] = useState('');
//     const [selectedMasterId, setSelectedMasterId] = useState<number>(1); // 初期値は最初のタグ

//     // const [selectedMasterId, setSelectedMasterId] = useState<number>(masterTags[0]?.id || 0);

//     const [selectedUserTagId, setSelectedUserTagId] = useState<number | "">("");

//     // 1. 感想を取得する (本全体 or 特定の引用)
//     const fetchThoughts = async () => {
//         try {
//             // 本に紐づく全ての感想を取得し、フロントでフィルタリングする
//             const res = await client.get<Thought[]>(`Thoughts/book/${bookId}`);
//             const filtered = res.data.filter(t => t.quoteRecordId === (quoteRecordId ?? null));
//             setThoughts(filtered);
//         } catch (err) {
//             console.error("感想の取得に失敗:", err);
//         }
//     };

//     // マスタータグが変わったら、ユーザータグの選択をリセットする
//     const handleMasterChange = (id: number) => {
//         setSelectedMasterId(id);
//         setSelectedUserTagId(""); // カテゴリが変わったのでリセット
//     };

//     useEffect(() => {
//         fetchThoughts();
//     }, [bookId, quoteRecordId]);

//     // 2. 感想を投稿する
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!content.trim()) return;

//         try {
//             await client.post('Thoughts', {
//                 bookId: bookId,
//                 quoteRecordId: quoteRecordId ?? null,
//                 masterTagId: selectedMasterId,
//                 userTagId: selectedUserTagId || null,
//                 content: content,
//                 userId: 1 // 固定
//             });
//             setContent('');
//             fetchThoughts(); // リスト更新
//         } catch (err) {
//             alert("考察の保存に失敗しました。");
//         }
//     };

//     return (
//         <div style={{ marginTop: '10px', paddingLeft: quoteRecordId ? '20px' : '0' }}>
//             {/* 投稿フォーム */}
//             <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
//                 <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
//                     <select
//                         value={selectedMasterId}
//                         onChange={(e) => handleMasterChange(Number(e.target.value))}
//                         style={selectStyle} // ここで適用
//                     >
//                         {masterTags.map(mt => (
//                             <option key={mt.id} value={mt.id}>{mt.name}</option>
//                         ))}
//                     </select>

//                     <select
//                         value={selectedUserTagId}
//                         onChange={(e) => setSelectedUserTagId(e.target.value ? Number(e.target.value) : "")}
//                         style={selectStyle} // ここで適用
//                     >
//                         <option value="">タグを選択...</option>
//                         {userTags
//                             .filter(ut => ut.masterTagId === selectedMasterId)
//                             .map(ut => (
//                                 <option key={ut.id} value={ut.id}>#{ut.name}</option>
//                             ))
//                         }
//                     </select>

//                     <input
//                         value={content}
//                         onChange={(e) => setContent(e.target.value)}
//                         placeholder="本全体への考察..."
//                         style={inputStyle}
//                     />
//                     <button onClick={handleSubmit} style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', padding: '0 15px', cursor: 'pointer' }}>
//                         記録
//                     </button>
//                 </div>
//             </form>

//             {/* 感想一覧表示 */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                 {thoughts.map(t => (
//                     <div key={t.id} style={{ fontSize: '0.8rem', backgroundColor: '#2a2a2a', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #4caf50' }}>
//                         {/* マスタータグ */}
//                         <span style={{ color: '#81c784', fontWeight: 'bold', marginRight: '4px' }}>
//                             [{t.masterTag?.name || 'メモ'}]
//                         </span>

//                         {/* ユーザータグ（追加部分） */}
//                         {t.userTag && (
//                             <span style={{ color: '#aaa', marginRight: '8px', fontSize: '0.75rem' }}>
//                                 #{t.userTag.name}
//                             </span>
//                         )}

//                         {/* 内容 */}
//                         <span style={{ color: '#eee' }}>{t.content}</span>
//                     </div>
//                 ))}
//             </div>
//             {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                 {thoughts.map(t => (
//                     <div key={t.id} style={{ fontSize: '0.8rem', backgroundColor: '#2a2a2a', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #4caf50' }}>
//                         <span style={{ color: '#81c784', fontWeight: 'bold', marginRight: '8px' }}>
//                             [{t.masterTag?.name || 'メモ'}]
//                         </span>
//                         {t.content}
//                     </div>
//                 ))}
//             </div> */}
//         </div>
//     );
// };

// // ThoughtSection.tsx の一番下などに追加
// const selectStyle: React.CSSProperties = {
//     padding: '8px',
//     borderRadius: '4px',
//     backgroundColor: '#333',
//     color: '#fff',
//     border: '1px solid #444',
//     cursor: 'pointer'
// };

// const inputStyle: React.CSSProperties = {
//     flex: 1,
//     padding: '8px',
//     borderRadius: '4px',
//     border: '1px solid #444',
//     backgroundColor: '#111',
//     color: '#fff'
// };