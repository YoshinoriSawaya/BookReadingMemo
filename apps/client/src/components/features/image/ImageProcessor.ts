export class ImageProcessor {
    static async processForOcr(file: File): Promise<string> {
        const img = await this.loadImage(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Canvas context not found');

        // 【改善】解像度を 3 倍に引き上げる
        const scale = 3.0;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // スムージングを無効にして、輪郭のボケを防ぐ（ドット感を維持）
        ctx.imageSmoothingEnabled = false;

        // 拡大して描画
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'contrast(1.4)';

        // 二値化は一旦せず、ブラウザに任せた高品質な拡大画像を送る
        return canvas.toDataURL('image/png');
    }

    private static loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
}

// // imageProcessor.ts
// export class ImageProcessor {
//     /**
//      * 画像を高コントラストな二値化（白黒）に変換する
//      */
//     static async processForOcr(file: File): Promise<string> {
//         const img = await this.loadImage(file);
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');

//         if (!ctx) throw new Error('Canvas context not found');

//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0);

//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         // const data = imageData.data;

//         // // 二値化の閾値（0-255）。
//         // const threshold = 128;

//         // for (let i = 0; i < data.length; i += 4) {
//         //     // 輝度の計算 (Rec. 601 係数)
//         //     const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

//         //     // コントラストを最大化して白か黒に振り分ける
//         //     const v = brightness > threshold ? 255 : 0;

//         //     data[i] = data[i + 1] = data[i + 2] = v;
//         //     // data[i + 3] (Alpha) はそのまま
//         // }

//         ctx.putImageData(imageData, 0, 0);
//         // PNGとして出力（軽量化を優先するなら第2引数で品質調整も可能）
//         return canvas.toDataURL('image/png');
//     }

//     private static loadImage(file: File): Promise<HTMLImageElement> {
//         return new Promise((resolve, reject) => {
//             const img = new Image();
//             img.onload = () => resolve(img);
//             img.onerror = reject;
//             img.src = URL.createObjectURL(file);
//         });
//     }
// }