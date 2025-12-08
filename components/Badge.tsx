"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "primary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Badge 元件
 * 用於顯示徽章、標籤等
 */
export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
    primary: "bg-orange-100 text-orange-800",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

