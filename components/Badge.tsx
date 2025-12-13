"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles = {
  primary: "bg-dark-card text-gold border border-gold/30",
  secondary: "bg-dark-surface text-gray-300 border border-dark-border",
  success: "bg-dark-card text-gold border border-gold/50",
  warning: "bg-dark-card text-gold-dark border border-gold-dark/50",
  danger: "bg-dark-card text-red-400 border border-red-400/30",
  info: "bg-dark-card text-gray-300 border border-dark-border",
};

const sizeStyles = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

