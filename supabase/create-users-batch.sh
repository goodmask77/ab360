#!/bin/bash

# ============================================
# ab360 批量建立 Auth 使用者腳本
# ============================================
# 
# 使用說明：
# 1. 確保已安裝 Supabase CLI: npm install -g supabase
# 2. 登入 Supabase: supabase login
# 3. 連結專案: supabase link --project-ref YOUR_PROJECT_REF
# 4. 執行此腳本: bash create-users-batch.sh
#
# ============================================

# Supabase 專案設定（需要替換）
PROJECT_REF="hhwkxjqjpnejozbytaow"  # 你的專案 ID
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

# 使用者列表（Email / Password / Role）
declare -a USERS=(
  "zhang@ab360.com:zhang123:staff"
  "li@ab360.com:li123:staff"
  "wang@ab360.com:wang123:staff"
  "chen@ab360.com:chen123:staff"
  "lin@ab360.com:lin123:staff"
  "huang@ab360.com:huang123:staff"
  "wu@ab360.com:wu123:staff"
  "zhou@ab360.com:zhou123:staff"
  "manager@ab360.com:manager123:manager"
)

echo "🚀 開始批量建立 Auth 使用者..."
echo ""

# 建立每個使用者
for user_info in "${USERS[@]}"; do
  IFS=':' read -r email password role <<< "$user_info"
  
  echo "📝 建立使用者: $email"
  
  # 使用 Supabase CLI 建立使用者
  supabase auth users create \
    --email "$email" \
    --password "$password" \
    --email-confirm true \
    --project-ref "$PROJECT_REF"
  
  if [ $? -eq 0 ]; then
    echo "✅ 成功建立: $email"
  else
    echo "❌ 建立失敗: $email (可能已存在)"
  fi
  echo ""
done

echo "✨ 完成！所有使用者已建立"
echo ""
echo "📋 下一步：執行 setup-existing-users.sql 或 quick-setup.sql 建立員工資料"

