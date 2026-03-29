import { useState, useEffect, useCallback } from 'react';
import client from '../../../api/client';
import { type Book, type MasterTag, type UserTag } from '../../../types';

export const useBookData = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [masterTags, setMasterTags] = useState<MasterTag[]>([]);
    const [userTags, setUserTags] = useState<UserTag[]>([]);

    // useCallbackで囲むことで、他の副作用フックの依存配列に安全に含められます
    const fetchData = useCallback(async () => {
        try {
            const [booksRes, masterRes, userRes] = await Promise.all([
                client.get<Book[]>('/Books'),
                client.get<MasterTag[]>('/MasterTags'),
                client.get<UserTag[]>('/UserTags?userId=1')
            ]);

            if (Array.isArray(booksRes.data)) setBooks(booksRes.data);
            if (Array.isArray(masterRes.data)) setMasterTags(masterRes.data);
            if (Array.isArray(userRes.data)) setUserTags(userRes.data);
        } catch (err) {
            console.error("データの取得に失敗しました:", err);
        }
    }, []);

    // 初回マウント時にデータを取得
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        books,
        masterTags,
        userTags,
        refreshData: fetchData, // 再取得用に関数を公開
    };
};