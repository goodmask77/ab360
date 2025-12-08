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
    "bg-red-100 hover:bg-red-200 border-red-300",
    "bg-orange-100 hover:bg-orange-200 border-orange-300",
    "bg-yellow-100 hover:bg-yellow-200 border-yellow-300",
    "bg-emerald-100 hover:bg-emerald-200 border-emerald-300",
    "bg-green-100 hover:bg-green-200 border-green-300",
  ];
  const activeColors = [
    "bg-red-500 text-white border-red-600",
    "bg-orange-500 text-white border-orange-600",
    "bg-yellow-500 text-white border-yellow-600",
    "bg-emerald-500 text-white border-emerald-600",
    "bg-green-500 text-white border-green-600",
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
          <p className="text-sm font-medium text-gray-700">{labels[value - 1]}</p>
        </div>
      )}
    </div>
  );
}


