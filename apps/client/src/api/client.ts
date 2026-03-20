// src/api/client.ts
import axios from 'axios';

// 1. 今開いているページが「localhost」かどうか判定
const isLocal = window.location.hostname === 'localhost';
// src/api/client.ts

const client = axios.create({
    baseURL: isLocal
        ? 'http://localhost:5009/api'
        : 'https://vwks7463-5009.jpe1.devtunnels.ms/api',
    headers: {
        'Content-Type': 'application/json',
        // 👇 これを追加：Dev Tunnelの警告ページをスキップさせる
        'X-Tunnel-Skip-AntiPhishing-Page': 'true',
    },
});

export default client;