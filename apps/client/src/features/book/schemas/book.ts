export interface BookRequest {
    isbn: string;
    ccode: string;
}

export interface BookResponse {
    id: number;
    isbn: string;
    ccode: string;
    ccodeClassification?: string;
    price?: number;
    title: string;
    authors: string[];
    imageUrl?: string;
}