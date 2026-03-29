import { useEffect, useRef, useCallback } from 'react';
import {
    MultiFormatReader,
    BarcodeFormat,
    DecodeHintType,
    HTMLCanvasElementLuminanceSource,
    BinaryBitmap,
    HybridBinarizer
} from '@zxing/library';

export const useBarcodeDecoder = () => {
    const codeReaderRef = useRef<MultiFormatReader | null>(null);

    useEffect(() => {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
        const reader = new MultiFormatReader();
        reader.setHints(hints);
        codeReaderRef.current = reader;
    }, []);

    // useCallbackでラップする
    const decodeCanvas = useCallback((canvas: HTMLCanvasElement): string | null => {
        if (!codeReaderRef.current) return null;
        try {
            const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
            const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
            const result = codeReaderRef.current.decode(bitmap);
            return result.getText();
        } catch (err) {
            return null;
        }
    }, []);

    return { decodeCanvas };
};