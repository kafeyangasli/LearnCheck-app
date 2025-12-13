const SkeletonLoader = () => {
    return (
        <div className="w-full flex justify-center">
            <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full mb-8" />
                    <div className="space-y-3 mb-8">
                        <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                        ))}
                    </div>
                </div>
                <div className="p-6 md:p-8 pt-0 mt-8 flex justify-end">
                    <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
