import { type MasterTag, type UserTag } from '../../tag/schemas/tag';

export interface Thought {
    id: number;
    userId: number;
    bookId: number;
    quoteRecordId?: number | null; // Nullなら本全体への感想
    masterTagId: number;
    userTagId?: number | null;
    content: string;
    // ナビゲーションプロパティ
    masterTag?: MasterTag;
    userTag?: UserTag;
    createdAt?: string;
}