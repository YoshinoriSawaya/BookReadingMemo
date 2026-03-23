import React from 'react';
import './modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    // 【最重要】isOpen が false なら何も描画しない（これで「常に表示」を防ぐ）
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* ストッププロパゲーションで、中身をクリックしても閉じないようにする */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};