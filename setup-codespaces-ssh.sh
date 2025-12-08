#!/bin/bash

# Codespaces SSH 設定腳本
# 在 Codespaces 終端中執行：bash setup-codespaces-ssh.sh

set -e

echo "🔑 開始設定 Codespaces SSH 金鑰..."

# 1. 生成 SSH 金鑰（如果不存在）
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "📝 生成新的 SSH 金鑰..."
    ssh-keygen -t ed25519 -C "codespace@github" -f ~/.ssh/id_ed25519 -N "" -q
    echo "✅ SSH 金鑰已生成"
else
    echo "ℹ️  SSH 金鑰已存在，跳過生成步驟"
fi

# 2. 啟動 ssh-agent
echo "🚀 啟動 ssh-agent..."
eval "$(ssh-agent -s)" > /dev/null

# 3. 添加金鑰到 ssh-agent
echo "➕ 添加金鑰到 ssh-agent..."
ssh-add ~/.ssh/id_ed25519 2>/dev/null || true

# 4. 顯示公鑰
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 請複製以下 SSH 公鑰內容："
echo "═══════════════════════════════════════════════════════════"
echo ""
cat ~/.ssh/id_ed25519.pub
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📌 下一步操作："
echo "1. 前往：https://github.com/settings/ssh/new"
echo "2. Title 填寫：Codespaces ab360"
echo "3. Key 貼上上面的公鑰內容"
echo "4. 點擊 'Add SSH key'"
echo ""
echo "完成後，按 Enter 繼續測試連接..."
read

# 5. 測試 GitHub 連接
echo "🔍 測試 GitHub SSH 連接..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ GitHub SSH 連接成功！"
    
    # 6. 設定 Git remote
    echo "🔗 設定 Git remote..."
    cd /workspaces/ab360 2>/dev/null || cd "$(pwd)"
    git remote set-url origin git@github.com:goodmask77/ab360.git 2>/dev/null || \
    git remote add origin git@github.com:goodmask77/ab360.git
    
    # 7. 拉取最新代碼
    echo "📥 拉取最新代碼..."
    git pull origin main --no-rebase 2>/dev/null || echo "ℹ️  已是最新或需要手動處理"
    
    # 8. 顯示狀態
    echo ""
    echo "✅ 設定完成！"
    echo "📊 當前 Git 狀態："
    git status --short
    echo ""
    echo "🚀 現在可以執行：git push origin main"
else
    echo "❌ GitHub SSH 連接失敗，請確認已添加 SSH 公鑰到 GitHub"
    exit 1
fi

