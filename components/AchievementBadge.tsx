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
      className={`rounded-xl p-4 border transition-all ${
        unlocked
          ? "bg-dark-card border-gold/50 shadow-lg"
          : "bg-dark-surface border-dark-border opacity-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`text-3xl ${unlocked ? "" : "grayscale opacity-30"}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              unlocked ? "text-gray-100" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm ${
              unlocked ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        </div>
        {unlocked && (
          <div className="text-gold text-xl">✓</div>
        )}
      </div>
    </div>
  );
}

