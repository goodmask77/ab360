"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * 統一卡片元件
 * 全站所有卡片必須使用此元件，禁止直接使用 className 定義卡片樣式
 */
export default function Card({ children, hover = false, className = "", onClick }: CardProps) {
  const baseClasses = hover ? "card-hover" : "card";
  const interactiveClasses = onClick ? "cursor-pointer" : "";

  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} ${interactiveClasses} ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}

