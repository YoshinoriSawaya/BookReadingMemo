import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'success' | 'danger';
}

export const Button = ({ children, variant = 'primary', style, ...props }: ButtonProps) => {
    const getBackgroundColor = () => {
        switch (variant) {
            case 'success': return '#2e7d32';
            case 'danger': return '#d32f2f';
            default: return '#646cff';
        }
    };

    return (
        <button
            {...props}
            style={{
                backgroundColor: getBackgroundColor(),
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                ...style
            }}
        >
            {children}
        </button>
    );
};