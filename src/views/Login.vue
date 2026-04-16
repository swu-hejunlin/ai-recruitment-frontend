/**
 * 登录页面组件
 * 提供手机号+验证码登录功能
 */

<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 页面标题 -->
      <div class="login-header">
        <h1>智能招聘平台</h1>
        <p>AI驱动的智能人才匹配系统</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="formRules"
        label-position="top"
        class="login-form"
      >
        <!-- 手机号输入 -->
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
            clearable
            @input="handlePhoneInput"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 验证码输入 -->
        <el-form-item label="验证码" prop="code">
          <div class="code-input-wrapper">
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              maxlength="6"
              clearable
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
            <!-- 发送验证码按钮 -->
            <el-button
              type="primary"
              :disabled="!isPhoneValid || isCountingDown"
              :loading="sendCodeLoading"
              @click="handleSendCode"
            >
              {{ sendCodeButtonText }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item label="登录身份" prop="role">
          <el-radio-group v-model="loginForm.role">
            <el-radio :value="1">求职者</el-radio>
            <el-radio :value="2">企业HR</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loginLoading"
            @click="handleLogin"
          >
            {{ loginLoading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <div class="login-footer">
        <p>首次登录将自动注册账号</p>
      </div>
    </div>

    <!-- 角色切换确认对话框 -->
    <el-dialog
      v-model="showRoleSwitchDialog"
      title="切换身份"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="role-switch-content">
        <el-icon class="warning-icon" :size="40"><WarningFilled /></el-icon>
        <p class="warning-text">检测到身份冲突</p>
        <p>
          该手机号已注册为 <strong>{{ ROLE_MAP[currentRole] }}</strong> 身份
        </p>
        <p>您正在尝试登录为 <strong>{{ ROLE_MAP[attemptedRole] }}</strong> 身份</p>
        <p class="question">是否切换到新身份？</p>
        <p class="note">切换后将使用新身份登录</p>
      </div>

      <template #footer>
        <el-button @click="cancelSwitchRole">取消</el-button>
        <el-button type="primary" @click="confirmSwitchRole">确认切换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Iphone, Message, WarningFilled } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/userStore';
import type { LoginForm as LoginFormType, LoginRequest, LoginResponse, Role, UserInfo } from '../types';
import { ROLE_MAP } from '../types';
import request from '../utils/request';

// ==================== 路由和状态管理 ====================
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// ==================== 角色切换相关 ====================
/**
 * 角色切换对话框显示状态
 */
const showRoleSwitchDialog = ref(false);

/**
 * 登录响应数据（用于处理角色冲突）
 */
const loginResponseData = ref<any>(null);

/**
 * 用户当前已存在的角色（后端返回）
 */
const currentRole = ref<Role>(1);

/**
 * 用户尝试登录的角色
 */
const attemptedRole = ref<Role>(1);

/**
 * 确认切换角色
 * 用户确认切换身份后，重新发送验证码并让用户输入
 */
const confirmSwitchRole = async () => {
  // 关闭对话框
  showRoleSwitchDialog.value = false;

  try {
    // 重新发送验证码（带上目标角色）
    await request.post('/api/user/send-code', {
      phone: loginForm.phone,
      role: attemptedRole.value
    });

    // 清空验证码，让用户输入新收到的验证码
    loginForm.code = '';
    
    // 开始倒计时
    startCountdown();
    
    // 设置标记，表示用户已确认切换，下次点击登录时调用切换接口
    window.isSwitchingRole = true;
    
    ElMessage.success(`已发送${ROLE_MAP[attemptedRole.value]}身份验证码，请查收并重新输入验证码`);
  } catch (error) {
    console.error('发送验证码失败:', error);
  }
};

/**
 * 取消切换角色
 * 用户取消切换，关闭对话框并清空验证码
 */
const cancelSwitchRole = () => {
  // 关闭对话框
  showRoleSwitchDialog.value = false;

  // 清空验证码
  loginForm.code = '';
  
  // 恢复为当前已有角色
  loginForm.role = currentRole.value;
  
  ElMessage.info('已取消切换，请重新选择登录身份');
};

// ==================== 表单数据 ====================
/**
 * 登录表单数据
 */
const loginForm = reactive<LoginFormType>({
  phone: '',
  code: '',
  role: 1 // 默认为求职者
});

// ==================== 表单校验规则 ====================
/**
 * 手机号校验规则
 */
const validatePhone = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'));
  } else {
    callback();
  }
};

/**
 * 验证码校验规则
 */
const validateCode = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入验证码'));
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error('验证码格式不正确'));
  } else {
    callback();
  }
};

/**
 * 表单校验规则
 */
const formRules: FormRules<LoginFormType> = {
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  code: [{ validator: validateCode, trigger: 'blur' }],
  role: [{ required: true, message: '请选择登录身份', trigger: 'change' }]
};

// ==================== 表单引用 ====================
const loginFormRef = ref<FormInstance>();

// ==================== 加载状态 ====================
const sendCodeLoading = ref(false); // 发送验证码加载状态
const loginLoading = ref(false); // 登录加载状态

// ==================== 验证码倒计时 ====================
const countdown = ref(0); // 倒计时秒数
const isCountingDown = computed(() => countdown.value > 0); // 是否正在倒计时

/**
 * 发送验证码按钮文本
 */
const sendCodeButtonText = computed(() => {
  return isCountingDown.value ? `${countdown.value}秒后重试` : '发送验证码';
});

/**
 * 手机号是否有效
 */
const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(loginForm.phone));

// ==================== 事件处理 ====================
/**
 * 手机号输入处理
 * 限制只能输入数字
 */
const handlePhoneInput = (value: string) => {
  // 移除非数字字符
  loginForm.phone = value.replace(/\D/g, '');
};

/**
 * 发送验证码
 */
const handleSendCode = async () => {
  // 校验手机号格式
  if (!isPhoneValid.value) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  try {
    sendCodeLoading.value = true;

    // 调用发送验证码接口
    await request.post('/api/user/send-code', { phone: loginForm.phone });

    ElMessage.success('验证码已发送，请注意查收');

    // 开始倒计时
    startCountdown();
  } catch (error) {
    console.error('发送验证码失败:', error);
    // 错误已在 request.ts 中统一处理
  } finally {
    sendCodeLoading.value = false;
  }
};

/**
 * 开始倒计时
 */
const startCountdown = () => {
  countdown.value = 60;

  const timer = setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

/**
 * 页面初始化
 * 从 URL 参数中获取手机号和角色（用于角色切换场景）
 */
onMounted(() => {
  // 从 URL 查询参数中获取手机号
  const phoneFromQuery = route.query.phone as string;
  if (phoneFromQuery) {
    loginForm.phone = phoneFromQuery;
  }

  // 从 URL 查询参数中获取目标角色
  const roleFromQuery = route.query.role as string;
  if (roleFromQuery && (roleFromQuery === '1' || roleFromQuery === '2')) {
    loginForm.role = parseInt(roleFromQuery) as Role;
  }
});

/**
 * 登录
 */
const handleLogin = async () => {
  // 表单校验
  const valid = await loginFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  try {
    loginLoading.value = true;
    attemptedRole.value = loginForm.role; // 记录用户尝试的角色

    // 检查是否正在进行角色切换
    if (window.isSwitchingRole) {
      console.log('[登录调试] 检测到正在进行角色切换');
      
      // 调用userStore.switchRole方法进行角色切换，确保状态一致性
      const switchData: LoginRequest = {
        phone: loginForm.phone,
        code: loginForm.code,
        role: loginForm.role
      };
      
      console.log('[登录调试] 调用userStore.switchRole，参数:', switchData);
      
      try {
        // 调用store的切换角色方法
        const userInfo = await userStore.switchRole(switchData);
        
        console.log('[登录调试] 角色切换成功，userInfo:', userInfo);
        console.log('[登录调试] 当前store状态:', {
          isLogin: userStore.isLogin,
          token: userStore.token,
          userInfo: userStore.userInfo
        });
        
        // 清除切换标记
        window.isSwitchingRole = false;
        
        ElMessage.success('身份切换成功');

        // 跳转到首页
        console.log('[登录调试] 准备跳转到首页');
        setTimeout(() => {
          router.push('/');
        }, 500);
        return;
      } catch (error) {
        console.error('[登录调试] 角色切换失败:', error);
        // 错误已在 request.ts 中统一处理
        return;
      }
    }

    console.log('开始登录流程...');
    
    // 使用userStore.login方法进行登录，确保状态一致性
    const loginData: LoginRequest = {
      phone: loginForm.phone,
      code: loginForm.code,
      role: loginForm.role
    };
    
    try {
      // 调用store的登录方法
      await userStore.login(loginData);
      
      console.log('登录成功!');
      ElMessage.success('登录成功');

      // 跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      // 检查是否是角色切换错误
      if (error.needSwitchRole) {
        console.log('检测到角色冲突，弹出对话框');
        // 角色冲突，弹出切换确认对话框
        loginResponseData.value = error.loginResponse;
        currentRole.value = error.currentRole as Role;
        showRoleSwitchDialog.value = true;
      } else {
        // 其他错误已在 request.ts 中统一处理
        console.error('登录失败:', error);
      }
    }
  } catch (error) {
    console.error('登录失败:', error);
    // 错误已在 request.ts 中统一处理
  } finally {
    loginLoading.value = false;
  }
};
</script>

<style scoped>
/* ==================== 登录页面容器 ==================== */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-container::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 190, 170, 0.1) 0%, rgba(0, 190, 170, 0) 70%);
  top: -200px;
  right: -200px;
  border-radius: 50%;
  z-index: 0;
}

.login-container::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0) 70%);
  bottom: -100px;
  left: -100px;
  border-radius: 50%;
  z-index: 0;
}

/* ==================== 登录框 ==================== */
.login-box {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
}

/* ==================== 页面标题 ==================== */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #00beaa 0%, #409eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.login-header p {
  font-size: 15px;
  color: #606266;
  letter-spacing: 0.5px;
}

/* ==================== 登录表单 ==================== */
.login-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #00beaa inset !important;
}

/* 验证码输入框组合 */
.code-input-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-input-wrapper :deep(.el-input) {
  flex: 1;
}

.code-input-wrapper :deep(.el-button) {
  height: 42px;
  border-radius: 10px;
  padding: 0 20px;
  font-weight: 600;
  background-color: #f0f9f8;
  border-color: #00beaa;
  color: #00beaa;
}

.code-input-wrapper :deep(.el-button:hover) {
  background-color: #00beaa;
  color: white;
}

.code-input-wrapper :deep(.el-button.is-disabled) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

/* 角色选择器优化 */
.login-form :deep(.el-radio-group) {
  width: 100%;
  display: flex;
  gap: 16px;
}

.login-form :deep(.el-radio) {
  flex: 1;
  margin-right: 0;
  height: 48px;
  border-radius: 10px;
  border: 1px solid #dcdfe6;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  transition: all 0.3s;
}

.login-form :deep(.el-radio.is-checked) {
  border-color: #00beaa;
  background-color: #f0f9f8;
}

.login-form :deep(.el-radio__input) {
  display: none;
}

.login-form :deep(.el-radio__label) {
  padding-left: 0;
  font-weight: 600;
}

/* ==================== 登录按钮 ==================== */
.login-button {
  width: 100%;
  height: 50px;
  font-size: 17px;
  font-weight: 700;
  margin-top: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00beaa 0%, #00a896 100%);
  border: none;
  box-shadow: 0 6px 16px rgba(0, 190, 170, 0.25);
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 190, 170, 0.35);
  background: linear-gradient(135deg, #00d2bc 0%, #00beaa 100%);
}

.login-button:active {
  transform: translateY(0);
}

/* ==================== 页脚提示 ==================== */
.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  font-size: 13px;
  color: #909399;
}

/* ==================== 角色切换对话框 ==================== */
.role-switch-content {
  text-align: center;
  padding: 24px 0;
}

.warning-icon {
  color: #e6a23c;
  margin-bottom: 20px;
}

.warning-text {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.role-switch-content p {
  font-size: 15px;
  color: #606266;
  margin: 10px 0;
  line-height: 1.6;
}

.role-switch-content strong {
  color: #303133;
}

.role-switch-content .question {
  font-size: 16px;
  font-weight: 600;
  color: #00beaa;
  margin-top: 20px;
}

.role-switch-content .note {
  font-size: 13px;
  color: #909399;
  margin-top: 20px;
}
</style>
