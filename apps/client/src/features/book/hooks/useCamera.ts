import { useEffect, useRef, useState } from 'react';

// 🌟 設定値（マジックナンバー・マジックストリングをここに集約）
const CAMERA_CONFIG = {
    // ステータスメッセージ
    STATUS: {
        INITIALIZING: 'カメラを起動中...',
        SCANNING: 'スキャン中...',
        ERROR: 'カメラの起動に失敗しました。',
    },
    // カメラの制約（解像度・フレームレートなど）
    CONSTRAINTS: {
        FACING_MODE: 'environment', // アウトカメラを優先
        WIDTH_IDEAL: 1920,          // 1080pを第一希望に
        HEIGHT_IDEAL: 1080,
        FRAMERATE_IDEAL: 30,
        FRAMERATE_MAX: 60,
    }
} as const;

export const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraStatus, setCameraStatus] = useState<string>(CAMERA_CONFIG.STATUS.INITIALIZING);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: CAMERA_CONFIG.CONSTRAINTS.FACING_MODE,
                        width: { ideal: CAMERA_CONFIG.CONSTRAINTS.WIDTH_IDEAL },
                        height: { ideal: CAMERA_CONFIG.CONSTRAINTS.HEIGHT_IDEAL },
                        // 古いWebカメラでも、解像度を優先させるための制約
                        frameRate: {
                            ideal: CAMERA_CONFIG.CONSTRAINTS.FRAMERATE_IDEAL,
                            max: CAMERA_CONFIG.CONSTRAINTS.FRAMERATE_MAX
                        }
                    }
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setCameraStatus(CAMERA_CONFIG.STATUS.SCANNING);
                    };
                }
            } catch (err) {
                setCameraStatus(CAMERA_CONFIG.STATUS.ERROR);
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