import { type Thought } from '../../thought/schemas/thought';

export interface Quote {
    id: number;
    bookId: number;
    pageNumber?: number;
    text: string;
    thoughts?: Thought[]; // 感想のリストを追加
    createdAt: string;
}