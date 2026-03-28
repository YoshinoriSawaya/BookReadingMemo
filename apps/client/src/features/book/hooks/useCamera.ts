import { useEffect, useRef, useState } from 'react';

export const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraStatus, setCameraStatus] = useState<string>('カメラを起動中...');
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1920 }, // 1080pを第一希望に
                        height: { ideal: 1080 },
                        // 古いWebカメラでも、解像度を優先させるための制約
                        frameRate: { ideal: 30, max: 60 }
                    }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setCameraStatus('スキャン中...');
                    };
                }
            } catch (err) {
                setCameraStatus('カメラの起動に失敗しました。');
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return { videoRef, cameraStatus, setCameraStatus };
};