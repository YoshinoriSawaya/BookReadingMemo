//サーバーのBookDTOに従う
// src/features/book/dto.ts

export interface BookRequest {
    isbn: string;
    ccode: string;
}

export interface BookResponse {
    id: number;
    isbn: string;
    ccode: string; // 13桁の生データ
    ccodeClassification?: string; // サーバーが計算して返してくれるなら
    price?: number;               // サーバーが計算して返してくれるなら
    title: string;
    authors: string[];
    imageUrl?: string;
}