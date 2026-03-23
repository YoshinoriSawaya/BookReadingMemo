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