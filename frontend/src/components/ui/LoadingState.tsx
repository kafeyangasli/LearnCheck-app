import React, { useState, useEffect } from 'react';

const LoadingState: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          // Slow down near completion for smoother UX
          return Math.min(prev + 1, 95);
        }
        // Faster initial progress for better perceived performance
        return prev + 8;
      });
    }, 200); // Smooth 200ms updates

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-4 -mt-16">
      <div className="w-full max-w-md px-4 space-y-4">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary dark:bg-primary-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            AI kami sedang berpikir keras!
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Soal-soal keren akan segera hadir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
