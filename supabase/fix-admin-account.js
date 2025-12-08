/**
 * 修復/建立管理員帳號
 * 使用現有的 manager@ab360.com 或建立新的 admin@ab360.test
 * 
 * 執行方式：
 * node supabase/fix-admin-account.js
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

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminAccount() {
  try {
    console.log('🔍 檢查現有用戶...\n');

    // 1. 列出所有用戶
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 無法列出用戶:', listError);
      return;
    }

    console.log(`找到 ${usersData.users.length} 個用戶：`);
    usersData.users.forEach(u => {
      console.log(`  - ${u.email} (${u.id})`);
    });
    console.log('');

    // 2. 檢查 manager@ab360.com 是否存在
    const managerUser = usersData.users.find(u => u.email === 'manager@ab360.com');
    
    if (managerUser) {
      console.log('✅ 找到 manager@ab360.com，更新為 owner 權限...');
      
      // 更新密碼
      const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
        managerUser.id,
        { password: 'admin123' }
      );
      
      if (updatePasswordError) {
        console.warn('⚠️  更新密碼失敗:', updatePasswordError.message);
      } else {
        console.log('✅ 密碼已更新為: admin123');
      }

      // 更新員工記錄為 owner
      const { data: employee, error: employeeError } = await supabaseAdmin
        .from('employees')
        .upsert({
          auth_user_id: managerUser.id,
          name: '系統管理員',
          email: 'manager@ab360.com',
          role: 'owner',
          department: 'front',
        }, {
          onConflict: 'auth_user_id'
        })
        .select()
        .single();

      if (employeeError) {
        console.error('❌ 更新員工記錄失敗:', employeeError);
      } else {
        console.log('✅ 員工記錄已更新為 owner');
        console.log('\n' + '='.repeat(50));
        console.log('🎉 管理員帳號已修復！');
        console.log('='.repeat(50));
        console.log('📝 登入資訊：');
        console.log('   Email: manager@ab360.com');
        console.log('   Password: admin123');
        console.log('   Role: owner (擁有者)');
        console.log('='.repeat(50));
        return;
      }
    }

    // 3. 如果沒有 manager@ab360.com，嘗試建立 admin@ab360.test
    console.log('📝 建立新管理員帳號 admin@ab360.test...');
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@ab360.test',
      password: 'Admin123!',
      email_confirm: true,
    });

    if (createError) {
      console.error('❌ 建立用戶失敗:', createError);
      
      // 如果用戶已存在，嘗試更新
      const existingUser = usersData.users.find(u => u.email === 'admin@ab360.test');
      if (existingUser) {
        console.log('ℹ️  用戶已存在，更新密碼和權限...');
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password: 'Admin123!' }
        );
        
        if (updateError) {
          console.error('❌ 更新密碼失敗:', updateError);
        } else {
          console.log('✅ 密碼已更新');
        }

        // 更新員工記錄
        const { data: employee, error: employeeError } = await supabaseAdmin
          .from('employees')
          .upsert({
            auth_user_id: existingUser.id,
            name: '系統管理員',
            email: 'admin@ab360.test',
            role: 'owner',
            department: 'front',
          }, {
            onConflict: 'auth_user_id'
          })
          .select()
          .single();

        if (employeeError) {
          console.error('❌ 更新員工記錄失敗:', employeeError);
        } else {
          console.log('✅ 員工記錄已更新');
          console.log('\n' + '='.repeat(50));
          console.log('🎉 管理員帳號已修復！');
          console.log('='.repeat(50));
          console.log('📝 登入資訊：');
          console.log('   Email: admin@ab360.test');
          console.log('   Password: Admin123!');
          console.log('   Role: owner (擁有者)');
          console.log('='.repeat(50));
        }
      }
      return;
    }

    // 4. 建立員工記錄
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .upsert({
        auth_user_id: newUser.user.id,
        name: '系統管理員',
        email: 'admin@ab360.test',
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

    console.log('✅ 員工記錄已建立');
    console.log('\n' + '='.repeat(50));
    console.log('🎉 管理員帳號建立完成！');
    console.log('='.repeat(50));
    console.log('📝 登入資訊：');
    console.log('   Email: admin@ab360.test');
    console.log('   Password: Admin123!');
    console.log('   Role: owner (擁有者)');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
  }
}

fixAdminAccount();

