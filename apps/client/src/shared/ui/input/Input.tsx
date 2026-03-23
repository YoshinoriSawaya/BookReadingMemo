import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = ({ className, ...props }: InputProps) => {
    return (
        <input
            {...props}
            className={`common-input ${className || ''}`}
            style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#111',
                color: '#fff'
            }}
        />
    );
};