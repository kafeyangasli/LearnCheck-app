import React from 'react';

interface ProgressBarProps {
    value: number;
    max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
            <div
                className="bg-primary dark:bg-primary-400 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
