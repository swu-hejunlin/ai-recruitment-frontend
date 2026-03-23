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
import { useUserStore } from '@/stores/userStore';
import type { LoginForm as LoginFormType, LoginResponse, Role, UserInfo } from '@/types';
import { ROLE_MAP } from '@/types';
import request from '@/utils/request';

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
      // 调用身份切换接口
      const res = await request.post('/api/user/switch-role', {
        phone: loginForm.phone,
        code: loginForm.code,
        role: loginForm.role
      }) as unknown as LoginResponse;

      console.log('身份切换响应数据:', res);

      // 清除切换标记
      window.isSwitchingRole = false;

      // 保存用户信息
      const userInfo: UserInfo = {
        userId: res.userId,
        phone: loginForm.phone,
        role: res.role
      };

      userStore.token = res.token || '';
      userStore.userInfo = userInfo;
      localStorage.setItem('token', res.token || '');
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      ElMessage.success('身份切换成功');

      // 跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 500);
      return;
    }

    // 正常登录流程
    const res = await request.post('/api/user/login', {
      phone: loginForm.phone,
      code: loginForm.code,
      role: loginForm.role
    }) as unknown as LoginResponse;

    console.log('登录响应数据:', res);

    // 检查是否需要切换角色
    if (res.needSwitchRole) {
      console.log('检测到角色冲突，弹出对话框');
      // 角色冲突，弹出切换确认对话框
      loginResponseData.value = res;
      currentRole.value = res.currentRole as Role;
      showRoleSwitchDialog.value = true;
      return;
    }

    // 正常登录流程
    // 保存用户信息
    const userInfo: UserInfo = {
      userId: res.userId,
      phone: loginForm.phone,
      role: res.role
    };

    userStore.token = res.token || '';
    userStore.userInfo = userInfo;
    localStorage.setItem('token', res.token || '');
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    ElMessage.success('登录成功');

    // 跳转到首页
    setTimeout(() => {
      router.push('/');
    }, 500);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* ==================== 登录框 ==================== */
.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* ==================== 页面标题 ==================== */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: #999;
}

/* ==================== 登录表单 ==================== */
.login-form {
  margin-top: 20px;
}

/* 验证码输入框组合 */
.code-input-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;
}

.code-input-wrapper :deep(.el-input) {
  flex: 1;
}

/* ==================== 登录按钮 ==================== */
.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin-top: 10px;
}

/* ==================== 页脚提示 ==================== */
.login-footer {
  margin-top: 20px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: #999;
}

/* ==================== 角色切换对话框 ==================== */
.role-switch-content {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  color: #e6a23c;
  margin-bottom: 15px;
}

.warning-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.role-switch-content p {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
}

.role-switch-content .question {
  font-size: 15px;
  font-weight: 500;
  color: #409eff;
  margin-top: 15px;
}

.role-switch-content .note {
  font-size: 12px;
  color: #999;
  margin-top: 15px;
}
</style>
