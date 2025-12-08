/**
 * 假資料生成工具
 * 用於快速建立測試資料，展示評鑑與積分系統
 */

// 台灣常見姓名列表
const FIRST_NAMES = [
  "大強", "小綠", "佩真", "志明", "雅婷", "建宏", "淑芬", "俊傑",
  "怡君", "家豪", "美玲", "文雄", "雅雯", "志偉", "淑娟", "建志",
  "佳蓉", "明華", "麗華", "志強",
];

const LAST_NAMES = [
  "王", "林", "陳", "李", "張", "黃", "吳", "劉",
  "周", "蔡", "楊", "許", "鄭", "謝", "洪", "郭",
  "邱", "曾", "廖", "賴",
];

// 評語模板
const POSITIVE_COMMENTS = [
  "很積極、願意幫忙，是團隊的好幫手",
  "工作態度認真，值得學習",
  "在忙碌時主動支援，讓團隊運作更順暢",
  "服務態度很好，客人反應都不錯",
  "學習速度快，很快就上手了",
  "情緒穩定，能帶動團隊氣氛",
];

const NEUTRAL_COMMENTS = [
  "可再加強細節處理",
  "整體表現穩定，持續保持",
  "還有進步空間，繼續努力",
  "建議可以多主動溝通",
  "時間管理可以再優化",
];

const GROWTH_COMMENTS = [
  "在高峰期應更注意動線安排",
  "建議多練習出餐速度",
  "可以嘗試更主動協助同事",
  "溝通技巧可以再提升",
  "細節處理需要更仔細",
];

/**
 * 生成隨機中文姓名
 */
export function generateRandomName(): string {
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  return `${lastName}${firstName}`;
}

/**
 * 生成隨機 email
 */
export function generateRandomEmail(index: number): string {
  return `user${String(index).padStart(3, "0")}@test.com`;
}

/**
 * 生成隨機評語
 */
export function generateRandomComment(): string {
  const type = Math.random();
  if (type < 0.4) {
    // 40% 正向
    return POSITIVE_COMMENTS[Math.floor(Math.random() * POSITIVE_COMMENTS.length)];
  } else if (type < 0.7) {
    // 30% 中性
    return NEUTRAL_COMMENTS[Math.floor(Math.random() * NEUTRAL_COMMENTS.length)];
  } else {
    // 30% 成長建議
    return GROWTH_COMMENTS[Math.floor(Math.random() * GROWTH_COMMENTS.length)];
  }
}

/**
 * 生成隨機分數（1-5，稍微偏向高分）
 */
export function generateRandomScore(): number {
  // 使用加權隨機，讓分數分布更合理
  const rand = Math.random();
  if (rand < 0.1) return 1; // 10% 機率 1 分
  if (rand < 0.2) return 2; // 10% 機率 2 分
  if (rand < 0.4) return 3; // 20% 機率 3 分
  if (rand < 0.7) return 4; // 30% 機率 4 分
  return 5; // 30% 機率 5 分
}

/**
 * 生成隨機積分點數
 */
export function generateRandomPoints(): number {
  const options = [5, 10, 20, 30];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * 生成隨機類別 key
 */
export function generateRandomCategory(): string {
  const categories = [
    "team_player",
    "firefighter",
    "mood_maker",
    "growth_master",
    "service_star",
    "kitchen_star",
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}


