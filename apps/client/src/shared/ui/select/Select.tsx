import React from 'react';

// 汎用的な props を定義
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string | number; label: string }[];
}

export const Select = ({ options, style, ...props }: SelectProps) => {
    return (
        <select
            {...props}
            className="common-select" // CSSクラスで管理
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};