<template>
  <div class="login-container">
    <div class="login-bg-animation">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
      <div class="bg-grid" />
    </div>

    <div class="login-box">
      <div class="login-header">
        <div class="login-logo">
          <img src="/images/logo.png" alt="智能招聘平台" class="logo-image" />
        </div>
        <div class="login-title">
          <h1>智能招聘平台</h1>
          <div class="title-underline" />
        </div>
        <p>AI驱动的智能人才匹配系统</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="formRules"
        label-position="top"
        class="login-form"
      >
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

        <el-form-item label="登录身份" prop="role">
          <el-radio-group v-model="loginForm.role">
            <el-radio :value="1">
              <el-icon><User /></el-icon>
              求职者
            </el-radio>
            <el-radio :value="2">
              <el-icon><OfficeBuilding /></el-icon>
              企业HR
            </el-radio>
          </el-radio-group>
        </el-form-item>

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

      <div class="login-footer">
        <p>首次登录将自动注册账号</p>
      </div>
    </div>

    <el-dialog
      v-model="showRoleSwitchDialog"
      title="切换身份"
      width="420px"
      :close-on-click-modal="false"
      class="role-switch-dialog"
    >
      <div class="role-switch-content">
        <el-icon class="warning-icon" :size="44"><WarningFilled /></el-icon>
        <p class="warning-title">检测到身份冲突</p>
        <p>
          该手机号已注册为 <strong>{{ ROLE_MAP[currentRole] }}</strong> 身份，
          您正在尝试登录为 <strong>{{ ROLE_MAP[attemptedRole] }}</strong> 身份
        </p>
        <p class="switch-question">是否切换到新身份？</p>
        <p class="switch-note">切换后将使用新身份登录</p>
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
import { Iphone, Message, WarningFilled, User, OfficeBuilding } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/userStore';
import type { LoginForm as LoginFormType, LoginRequest, Role } from '../types';
import { ROLE_MAP } from '../types';
import request from '../utils/request';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const showRoleSwitchDialog = ref(false);
const loginResponseData = ref<any>(null);
const currentRole = ref<Role>(1);
const attemptedRole = ref<Role>(1);

const confirmSwitchRole = async () => {
  showRoleSwitchDialog.value = false;
  try {
    await request.post('/api/user/send-code', {
      phone: loginForm.phone,
      role: attemptedRole.value
    });
    loginForm.code = '';
    startCountdown();
    window.isSwitchingRole = true;
    ElMessage.success(`已发送${ROLE_MAP[attemptedRole.value]}身份验证码，请查收并重新输入`);
  } catch {
    // 错误已在拦截器中处理
  }
};

const cancelSwitchRole = () => {
  showRoleSwitchDialog.value = false;
  loginForm.code = '';
  loginForm.role = currentRole.value;
  ElMessage.info('已取消切换，请重新选择登录身份');
};

const loginForm = reactive<LoginFormType>({
  phone: '',
  code: '',
  role: 1
});

const validatePhone = (_rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入手机号'));
  if (!/^1[3-9]\d{9}$/.test(value)) return callback(new Error('手机号格式不正确'));
  callback();
};

const validateCode = (_rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入验证码'));
  if (!/^\d{6}$/.test(value)) return callback(new Error('验证码格式不正确'));
  callback();
};

const formRules: FormRules<LoginFormType> = {
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  code: [{ validator: validateCode, trigger: 'blur' }],
  role: [{ required: true, message: '请选择登录身份', trigger: 'change' }]
};

const loginFormRef = ref<FormInstance>();
const sendCodeLoading = ref(false);
const loginLoading = ref(false);
const countdown = ref(0);
const isCountingDown = computed(() => countdown.value > 0);

const sendCodeButtonText = computed(() => {
  return isCountingDown.value ? `${countdown.value}秒后重试` : '发送验证码';
});

const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(loginForm.phone));

const handlePhoneInput = (value: string) => {
  loginForm.phone = value.replace(/\D/g, '');
};

const handleSendCode = async () => {
  if (!isPhoneValid.value) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  try {
    sendCodeLoading.value = true;
    await request.post('/api/user/send-code', { phone: loginForm.phone });
    ElMessage.success('验证码已发送，请注意查收');
    startCountdown();
  } catch {
    // 错误已在请求拦截器中处理
  } finally {
    sendCodeLoading.value = false;
  }
};

const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) clearInterval(timer);
  }, 1000);
};

onMounted(() => {
  const phoneFromQuery = route.query.phone as string;
  if (phoneFromQuery) loginForm.phone = phoneFromQuery;
  const roleFromQuery = route.query.role as string;
  if (roleFromQuery && (roleFromQuery === '1' || roleFromQuery === '2')) {
    loginForm.role = parseInt(roleFromQuery) as Role;
  }
});

const handleLogin = async () => {
  const valid = await loginFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  try {
    loginLoading.value = true;
    attemptedRole.value = loginForm.role;

    if (window.isSwitchingRole) {
      const switchData: LoginRequest = {
        phone: loginForm.phone,
        code: loginForm.code,
        role: loginForm.role
      };
      try {
        await userStore.switchRole(switchData);
        window.isSwitchingRole = false;
        ElMessage.success('身份切换成功');
        setTimeout(() => router.push('/'), 500);
        return;
      } catch {
        return;
      }
    }

    const loginData: LoginRequest = {
      phone: loginForm.phone,
      code: loginForm.code,
      role: loginForm.role
    };

    try {
      await userStore.login(loginData);
      ElMessage.success('登录成功');
      setTimeout(() => router.push('/'), 500);
    } catch (error: any) {
      if (error?.needSwitchRole) {
        loginResponseData.value = error.loginResponse;
        currentRole.value = error.currentRole as Role;
        showRoleSwitchDialog.value = true;
      }
    }
  } finally {
    loginLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/images/loginBackbround.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.login-bg-animation {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: orb-float 8s ease-in-out infinite;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.3) 0%, transparent 70%);
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 190, 170, 0.2) 0%, transparent 70%);
  bottom: -100px;
  left: -100px;
  animation-delay: -3s;
}

.bg-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(114, 46, 209, 0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -6s;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(64, 158, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 30px) scale(1.02); }
}

.login-box {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
  z-index: 1;
  animation: ai-scale-in 0.5s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.login-logo .logo-image {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(64, 158, 255, 0.3));
}

.login-title {
  position: relative;
  margin-bottom: 12px;
}

.login-title h1 {
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(135deg, #409eff 0%, #00beaa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  margin: 0;
}

.title-underline {
  width: 40px;
  height: 3px;
  background: var(--ai-gradient-primary);
  margin: 12px auto 0;
  border-radius: 2px;
}

.login-header p {
  font-size: 14px;
  color: var(--ai-text-secondary);
  letter-spacing: 1px;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--ai-text-primary);
  margin-bottom: 6px;
}

.login-form :deep(.el-input__wrapper) {
  background: var(--ai-bg-primary);
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  padding: 6px 12px;
  box-shadow: none;
  transition: all var(--ai-animation-normal);
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--ai-primary);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--ai-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
}

.login-form :deep(.el-input__inner) {
  color: var(--ai-text-primary);
}

.login-form :deep(.el-input__inner::placeholder) {
  color: var(--ai-text-placeholder);
}

.login-form :deep(.el-input__prefix) {
  color: var(--ai-icon-secondary);
}

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
  background: rgba(0, 190, 170, 0.1);
  border: 1px solid var(--ai-secondary);
  color: var(--ai-secondary);
  transition: all var(--ai-animation-fast);
  white-space: nowrap;
}

.code-input-wrapper :deep(.el-button:hover) {
  background: var(--ai-secondary);
  color: white;
  border-color: var(--ai-secondary);
}

.code-input-wrapper :deep(.el-button.is-disabled) {
  background: var(--ai-bg-tertiary);
  border-color: var(--ai-border);
  color: var(--ai-text-placeholder);
}

.login-form :deep(.el-radio-group) {
  width: 100%;
  display: flex;
  gap: 12px;
}

.login-form :deep(.el-radio) {
  flex: 1;
  margin-right: 0;
  height: 48px;
  border-radius: 10px;
  border: 1px solid var(--ai-border);
  padding: 0 16px;
  display: flex;
  justify-content: center;
  transition: all var(--ai-animation-fast);
  background: var(--ai-bg-primary);
}

.login-form :deep(.el-radio.is-checked) {
  border-color: var(--ai-primary);
  background: var(--ai-primary-light);
}

.login-form :deep(.el-radio__input) {
  display: none;
}

.login-form :deep(.el-radio__label) {
  padding-left: 0;
  font-weight: 600;
  color: var(--ai-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.login-form :deep(.el-radio.is-checked .el-radio__label) {
  color: var(--ai-primary);
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff 0%, #3a7bd5 100%);
  border: none;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  transition: all var(--ai-animation-fast);
  letter-spacing: 2px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  margin-top: 28px;
  text-align: center;
}

.login-footer p {
  font-size: 13px;
  color: var(--ai-text-tertiary);
}

.role-switch-content {
  text-align: center;
  padding: 16px 0;
}

.warning-icon {
  color: var(--ai-warning);
  margin-bottom: 16px;
}

.warning-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ai-text-primary);
  margin-bottom: 16px;
}

.role-switch-content p {
  font-size: 14px;
  color: var(--ai-text-secondary);
  margin: 8px 0;
  line-height: 1.6;
}

.role-switch-content strong {
  color: var(--ai-text-primary);
}

.switch-question {
  font-size: 16px;
  font-weight: 600;
  color: var(--ai-primary);
  margin-top: 16px;
}

.switch-note {
  font-size: 13px;
  color: var(--ai-text-tertiary);
  margin-top: 8px;
}
</style>
