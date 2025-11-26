import React from 'react';
import Card from './Card';

const SkeletonLoading: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-300 dark:bg-slate-600 h-2 rounded-full w-1/3"></div>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-3">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>

                    <div className="space-y-4 mt-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32"></div>
                </div>
            </Card>

            <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                    Memuat soal dari cache...
                </p>
            </div>
        </div>
    );
};

export default SkeletonLoading;
