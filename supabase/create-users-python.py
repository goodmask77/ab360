#!/usr/bin/env python3
"""
使用 Supabase Management API 批量建立 Auth 使用者

使用說明：
1. 在 Supabase Dashboard → Settings → API → 複製 service_role key
2. 設定環境變數：export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
3. 執行：python3 supabase/create-users-python.py
"""

import os
import requests
import json
import time

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://hhwkxjqjpnejozbytaow.supabase.co")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SERVICE_ROLE_KEY:
    print("❌ 錯誤：請設定 SUPABASE_SERVICE_ROLE_KEY 環境變數")
    print("\n📝 取得 service_role key 的方法：")
    print("1. 前往 Supabase Dashboard → Settings → API")
    print("2. 複製 service_role key（secret）")
    print("3. 執行：export SUPABASE_SERVICE_ROLE_KEY='your_key'")
    print("4. 然後再次執行此腳本\n")
    exit(1)

users = [
    {"email": "zhang@ab360.com", "password": "zhang123"},
    {"email": "li@ab360.com", "password": "li123"},
    {"email": "wang@ab360.com", "password": "wang123"},
    {"email": "chen@ab360.com", "password": "chen123"},
    {"email": "lin@ab360.com", "password": "lin123"},
    {"email": "huang@ab360.com", "password": "huang123"},
    {"email": "wu@ab360.com", "password": "wu123"},
    {"email": "zhou@ab360.com", "password": "zhou123"},
    {"email": "manager@ab360.com", "password": "manager123"},
]

def create_user(email, password):
    """建立單個使用者"""
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "email": email,
        "password": password,
        "email_confirm": True,
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        return response.status_code == 200, response.json()
    except Exception as e:
        return False, {"error": str(e)}

def main():
    print("🚀 開始批量建立 Auth 使用者...\n")
    print(f"📍 Supabase URL: {SUPABASE_URL}\n")
    
    results = []
    
    for user in users:
        print(f"📝 建立使用者: {user['email']}...")
        success, data = create_user(user["email"], user["password"])
        
        if success:
            print(f"✅ 成功建立: {user['email']}")
            results.append({"email": user["email"], "status": "success"})
        else:
            error_msg = data.get("message", "") or data.get("error_description", "") or str(data)
            if "already" in error_msg.lower() or "exists" in error_msg.lower():
                print(f"⚠️  已存在: {user['email']} (跳過)")
                results.append({"email": user["email"], "status": "exists"})
            else:
                print(f"❌ 建立失敗: {user['email']}")
                print(f"   錯誤: {error_msg}")
                results.append({"email": user["email"], "status": "failed", "error": data})
        print("")
        
        # 避免請求過快
        time.sleep(0.5)
    
    # 顯示總結
    print("=" * 50)
    print("📊 建立結果總結")
    print("=" * 50)
    
    success_count = len([r for r in results if r["status"] == "success"])
    exists_count = len([r for r in results if r["status"] == "exists"])
    failed_count = len([r for r in results if r["status"] == "failed"])
    
    print(f"✅ 成功建立: {success_count} 個")
    print(f"⚠️  已存在: {exists_count} 個")
    print(f"❌ 失敗: {failed_count} 個")
    print("")
    
    if success_count > 0 or exists_count == len(users):
        print("✨ 所有使用者已準備就緒！")
        print("\n📋 下一步：執行 supabase/quick-setup.sql 建立員工資料和測試資料")

if __name__ == "__main__":
    main()

