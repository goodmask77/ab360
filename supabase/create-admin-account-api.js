/**
 * 使用 Supabase Admin API 建立管理員帳號
 * 
 * 執行方式：
 * 1. 安裝依賴：npm install @supabase/supabase-js dotenv
 * 2. 設定環境變數：.env.local
 *    SUPABASE_URL=your-project-url
 *    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * 3. 執行：node create-admin-account-api.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 錯誤：缺少環境變數');
  console.error('請設定：');
  console.error('  NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 使用 Service Role Key 建立 Admin Client（可以繞過 RLS）
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@ab360.test';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = '系統管理員';

async function createAdminAccount() {
  try {
    console.log('🚀 開始建立管理員帳號...\n');

    // 1. 檢查是否已存在用戶
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ 檢查用戶失敗:', checkError);
      return;
    }

    const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL);
    
    let userId;
    
    if (existingUser) {
      console.log('ℹ️  用戶已存在，使用現有用戶 ID:', existingUser.id);
      userId = existingUser.id;
      
      // 更新密碼（如果需要）
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: ADMIN_PASSWORD }
      );
      
      if (updateError) {
        console.warn('⚠️  更新密碼失敗:', updateError.message);
      } else {
        console.log('✅ 密碼已更新');
      }
    } else {
      // 2. 建立新用戶
      console.log('📝 建立新用戶...');
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // 自動確認 email
      });

      if (createError) {
        console.error('❌ 建立用戶失敗:', createError);
        return;
      }

      userId = newUser.user.id;
      console.log('✅ 用戶已建立，ID:', userId);
    }

    // 3. 建立或更新員工記錄
    console.log('\n📝 建立員工記錄...');
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .upsert({
        auth_user_id: userId,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'owner',
        department: 'front',
      }, {
        onConflict: 'auth_user_id'
      })
      .select()
      .single();

    if (employeeError) {
      console.error('❌ 建立員工記錄失敗:', employeeError);
      return;
    }

    console.log('✅ 員工記錄已建立/更新');
    console.log('   員工 ID:', employee.id);
    console.log('   姓名:', employee.name);
    console.log('   角色:', employee.role);

    // 4. 顯示登入資訊
    console.log('\n' + '='.repeat(50));
    console.log('🎉 管理員帳號建立完成！');
    console.log('='.repeat(50));
    console.log('📝 登入資訊：');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   Role: owner (擁有者)');
    console.log('\n✅ 現在可以使用此帳號登入並訪問測試工具頁面');
    console.log('   測試工具頁面：/admin/debug-tools');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
  }
}

createAdminAccount();

