export interface Book {
    id: number;
    isbn: string;
    ccode: string; // 13桁の生データ
    ccodeClassification?: string; // サーバーが計算して返してくれるなら
    price?: number;               // サーバーが計算して返してくれるなら
    title: string;
    authors: string[];
    imageUrl?: string;
}
export interface Author {
    id: number;
    name: string;
}

export interface BookAuthor {
    author: Author;
}

export interface MasterTag {
    id: number;
    name: string;
}

export interface UserTag {
    id: number;
    masterTagId: number; // 親となる MasterTag の ID
    userId: number;
    name: string;
}

export interface Quote {
    id: number;
    bookId: number;
    pageNumber?: number;
    text: string;
    thoughts?: Thought[]; // 感想のリストを追加
    createdAt: string;
}

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