import React, { useState } from 'react';

interface Props {
    onOpenBookModal: () => void;
    onOpenTagModal: () => void;
}

export const Header = ({ onOpenBookModal, onOpenTagModal }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            height: '60px',
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #333',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#646cff' }}>
                読書メモアプリ
            </div>

            <div style={{ position: 'relative' }}>
                {/* ハンバーガーボタン */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '10px'
                    }}
                >
                    ☰
                </button>

                {/* ドロップダウンメニュー */}
                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        backgroundColor: '#252525',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        width: '180px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                        overflow: 'hidden'
                    }}>
                        <div
                            onClick={() => { onOpenBookModal(); setIsOpen(false); }}
                            style={menuItemStyle}
                        >
                            📖 本を登録
                        </div>
                        <div
                            onClick={() => { onOpenTagModal(); setIsOpen(false); }}
                            style={menuItemStyle}
                        >
                            🏷️ タグ管理
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

const menuItemStyle: React.CSSProperties = {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#fff',
    transition: 'background 0.2s',
    borderBottom: '1px solid #333'
};