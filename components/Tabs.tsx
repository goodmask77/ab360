"use client";

import { ReactNode, useState } from "react";

interface Tab {
  id: string;
  label: string;
  content?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

/**
 * Tabs 元件
 * 可重用的 Tab 切換元件
 * 支援兩種模式：
 * 1. 受控模式：提供 activeTab 和 onTabChange
 * 2. 非受控模式：內部管理狀態
 */
export default function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id || ""
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab 標籤 */}
      <div className="border-b border-gray-200 overflow-x-auto bg-white rounded-t-lg">
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 內容 */}
      {activeTabContent && <div className="mt-4">{activeTabContent}</div>}
    </div>
  );
}

