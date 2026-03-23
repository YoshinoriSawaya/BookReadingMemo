// src/features/book/hooks/useCreateBook.ts
import { useState } from 'react';
import client from '../../../shared/api/client';
import type { BookResponse } from '../schemas/book'; // (旧 ../../../types)

export const useSearchOrCreateBook = () => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<BookResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const searchOrCreate = async (isbn: string, ccode?: string) => {
        if (!isbn) return;

        setLoading(true);
        setError(null);
        try {
            const res = await client.post<BookResponse>('/Books/search-or-create', {
                isbn,
                ccode
            });
            setPreview(res.data);
        } catch (err: any) {
            if (err.response?.status === 422) {
                setError("データベースに該当する本が見つかりませんでした。");
            } else {
                setError(`処理中にエラーが発生しました。`);
            }
        } finally {
            setLoading(false);
        }
    };

    return { searchOrCreate, loading, preview, error };
};