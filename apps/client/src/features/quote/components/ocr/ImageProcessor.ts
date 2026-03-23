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
