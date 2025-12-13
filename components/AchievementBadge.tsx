"use client";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function AchievementBadge({
  icon,
  title,
  description,
  unlocked,
}: AchievementBadgeProps) {
  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all ${
        unlocked
          ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-md"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`text-3xl ${unlocked ? "" : "grayscale opacity-50"}`}
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
          <div className="text-green-500 text-xl">✓</div>
        )}
      </div>
    </div>
  );
}

