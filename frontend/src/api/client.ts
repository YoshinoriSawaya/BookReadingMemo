// src/api/client.ts
import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:5009/api', // バックエンドのポートに合わせて変更
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;