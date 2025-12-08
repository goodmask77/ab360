/**
 * 使用 Supabase Management API 批量建立 Auth 使用者
 * 
 * 使用說明：
 * 1. 在 Supabase Dashboard → Settings → API → 複製 service_role key
 * 2. 設定環境變數：export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
 * 3. 執行：node supabase/create-users-api.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hhwkxjqjpnejozbytaow.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ 錯誤：請設定 SUPABASE_SERVICE_ROLE_KEY 環境變數");
  console.log("\n📝 取得 service_role key 的方法：");
  console.log("1. 前往 Supabase Dashboard → Settings → API");
  console.log("2. 複製 service_role key（secret）");
  console.log("3. 執行：export SUPABASE_SERVICE_ROLE_KEY='your_key'");
  console.log("4. 然後再次執行此腳本\n");
  process.exit(1);
}

const users = [
  { email: "zhang@ab360.com", password: "zhang123" },
  { email: "li@ab360.com", password: "li123" },
  { email: "wang@ab360.com", password: "wang123" },
  { email: "chen@ab360.com", password: "chen123" },
  { email: "lin@ab360.com", password: "lin123" },
  { email: "huang@ab360.com", password: "huang123" },
  { email: "wu@ab360.com", password: "wu123" },
  { email: "zhou@ab360.com", password: "zhou123" },
  { email: "manager@ab360.com", password: "manager123" },
];

async function createUser(email, password) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {},
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data };
    } else {
      return { success: false, error: data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("🚀 開始批量建立 Auth 使用者...\n");
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  const results = [];

  for (const user of users) {
    console.log(`📝 建立使用者: ${user.email}...`);
    const result = await createUser(user.email, user.password);

    if (result.success) {
      console.log(`✅ 成功建立: ${user.email}`);
      results.push({ email: user.email, status: "success" });
    } else {
      if (result.error?.message?.includes("already registered") || result.error?.error_description?.includes("already")) {
        console.log(`⚠️  已存在: ${user.email} (跳過)`);
        results.push({ email: user.email, status: "exists" });
      } else {
        console.log(`❌ 建立失敗: ${user.email}`);
        console.log(`   錯誤: ${JSON.stringify(result.error)}`);
        results.push({ email: user.email, status: "failed", error: result.error });
      }
    }
    console.log("");
    
    // 避免請求過快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 顯示總結
  console.log("\n" + "=".repeat(50));
  console.log("📊 建立結果總結");
  console.log("=".repeat(50));
  
  const successCount = results.filter(r => r.status === "success").length;
  const existsCount = results.filter(r => r.status === "exists").length;
  const failedCount = results.filter(r => r.status === "failed").length;

  console.log(`✅ 成功建立: ${successCount} 個`);
  console.log(`⚠️  已存在: ${existsCount} 個`);
  console.log(`❌ 失敗: ${failedCount} 個`);
  console.log("\n");

  if (successCount > 0 || existsCount === users.length) {
    console.log("✨ 所有使用者已準備就緒！");
    console.log("\n📋 下一步：執行 supabase/quick-setup.sql 建立員工資料和測試資料");
  }
}

main().catch(console.error);

