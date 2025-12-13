"use client";

interface StatusBadgeProps {
  children: React.ReactNode;
  status: "success" | "warning" | "info" | "pending";
  size?: "sm" | "md";
}

/**
 * 狀態標籤元件
 * 用於顯示進行中、已完成、待處理等狀態
 */
export default function StatusBadge({
  children,
  status,
  size = "md",
}: StatusBadgeProps) {
  const statusClasses = {
    success: "status-success",
    warning: "status-warning",
    info: "status-info",
    pending: "status-badge bg-dark-surface text-text-secondary border border-dark-border",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span className={`${statusClasses[status]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}

