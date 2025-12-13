"use client";

interface RatingScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  labels?: string[];
}

/**
 * RatingScale 元件
 * 1-5 分數評分，使用大按鈕和表情符號
 */
export default function RatingScale({
  value,
  onChange,
  labels = ["非常不同意", "不同意", "普通", "同意", "非常同意"],
}: RatingScaleProps) {
  const emojis = ["😞", "😐", "🙂", "😊", "🤩"];
  const colors = [
    "bg-dark-surface hover:bg-dark-card border-dark-border text-gray-400",
    "bg-dark-surface hover:bg-dark-card border-dark-border text-gray-400",
    "bg-dark-surface hover:bg-dark-card border-dark-border text-gray-400",
    "bg-dark-surface hover:bg-dark-card border-dark-border text-gray-400",
    "bg-dark-surface hover:bg-dark-card border-dark-border text-gray-400",
  ];
  const activeColors = [
    "bg-dark-card text-gold border-gold shadow-lg",
    "bg-dark-card text-gold border-gold shadow-lg",
    "bg-dark-card text-gold border-gold shadow-lg",
    "bg-dark-card text-gold border-gold shadow-lg",
    "bg-dark-card text-gold border-gold shadow-lg",
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all active:scale-95 ${
              value === score
                ? activeColors[score - 1] + " shadow-lg scale-105"
                : colors[score - 1] + " text-gray-700"
            }`}
          >
            <span className="text-2xl mb-1">{emojis[score - 1]}</span>
            <span className="text-lg font-bold">{score}</span>
          </button>
        ))}
      </div>
      {value && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-300">{labels[value - 1]}</p>
        </div>
      )}
    </div>
  );
}


