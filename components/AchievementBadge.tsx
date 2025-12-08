"use client";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

/**
 * AchievementBadge 元件
 * 顯示成就徽章
 */
export default function AchievementBadge({
  icon,
  title,
  description,
  unlocked,
}: AchievementBadgeProps) {
  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-md"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`text-4xl ${unlocked ? "" : "grayscale opacity-50"}`}
          role="img"
          aria-label={title}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              unlocked ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              unlocked ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {description}
          </p>
        </div>
        {unlocked && (
          <div className="absolute top-2 right-2">
            <span className="text-emerald-500 text-xl">✓</span>
          </div>
        )}
      </div>
    </div>
  );
}

