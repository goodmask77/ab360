"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

/**
 * ProgressBar 元件
 * 顯示進度條，用於評鑑填寫進度
 */
export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm text-gray-400">
            {current} / {total}
          </span>
        </div>
      )}
      <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden border border-dark-border">
        <div
          className="bg-gradient-to-r from-gold-dark to-gold h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="text-xs font-semibold text-dark-base">{percentage}%</span>
          )}
        </div>
      </div>
    </div>
  );
}


