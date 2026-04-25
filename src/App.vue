/**
 * 应用根组件
 */

<template>
  <div id="app">
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from './stores/userStore';

// 初始化应用时检查认证状态
onMounted(() => {
  const userStore = useUserStore();
  
  // 只在应用启动时检查一次是否有不一致的状态
  const hasTokenInStorage = !!localStorage.getItem('token');
  const hasUserInfoInStorage = !!localStorage.getItem('userInfo');
  
  // 如果localStorage中有token但没有用户信息（只检查一次，不重复清理）
  if (hasTokenInStorage && !hasUserInfoInStorage) {
    console.log('启动时检测到不一致的认证状态：有token但没有用户信息，清理状态');
    userStore.clearUserState();
  }
  
  // 不再使用定时器重复检查，避免干扰正常的登录流程
  // token的有效性由后端API验证（401响应时自动处理）
});
</script>

<style>
/* ==================== AI智能招聘系统全局样式 ==================== */

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
}

/* AI智能主题设计系统变量 */
:root {
  /* 主色调 - 科技蓝 */
  --ai-primary: #409eff;
  --ai-primary-hover: #66b1ff;
  --ai-primary-active: #3a8ee6;
  
  /* 辅助色 - 智能绿 */
  --ai-secondary: #00beaa;
  --ai-secondary-hover: #33cbbe;
  --ai-secondary-active: #00a896;
  
  /* 文字颜色 */
  --ai-text-primary: #222222;
  --ai-text-secondary: #666666;
  --ai-text-tertiary: #999999;
  --ai-text-white: #FFFFFF;
  
  /* 背景颜色 */
  --ai-bg-primary: #FFFFFF;
  --ai-bg-secondary: #F0F2F5;
  --ai-bg-tertiary: #E8E8E8;
  --ai-bg-gradient: linear-gradient(135deg, #f6f8fa 0%, #e9ecef 100%);
  
  /* 边框颜色 */
  --ai-border: #E8E8E8;
  --ai-border-light: #F0F0F0;
  --ai-border-hover: #D9D9D9;
  
  /* 图标颜色 */
  --ai-icon-primary: #666666;
  --ai-icon-secondary: #999999;
  --ai-icon-active: #409eff;
  
  /* 圆角 */
  --ai-radius-sm: 4px;
  --ai-radius-md: 8px;
  --ai-radius-lg: 12px;
  --ai-radius-xl: 16px;
  
  /* 阴影 */
  --ai-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.04);
  --ai-shadow-md: 0 4px 12px rgba(64, 158, 255, 0.12);
  --ai-shadow-lg: 0 8px 24px rgba(64, 158, 255, 0.16);
  --ai-shadow-glow: 0 0 20px rgba(64, 158, 255, 0.1);
  
  /* 间距 */
  --ai-spacing-xs: 4px;
  --ai-spacing-sm: 8px;
  --ai-spacing-md: 16px;
  --ai-spacing-lg: 24px;
  --ai-spacing-xl: 32px;
  --ai-spacing-xxl: 48px;
  
  /* 字体大小 */
  --ai-font-xs: 12px;
  --ai-font-sm: 14px;
  --ai-font-md: 16px;
  --ai-font-lg: 18px;
  --ai-font-xl: 20px;
  --ai-font-xxl: 24px;
  --ai-font-title: 28px;
  
  /* 行高 */
  --ai-line-height: 1.5;
  --ai-line-height-tight: 1.3;
  --ai-line-height-loose: 1.7;
  
  /* 动画 */
  --ai-animation-fast: 0.2s;
  --ai-animation-normal: 0.3s;
  --ai-animation-slow: 0.5s;
}

/* 设置全局字体（现代科技风格） */
#app {
  width: 100%;
  height: 100%;
  font-family: 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', 'Hiragino Sans GB', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  color: var(--ai-text-primary);
  background-color: var(--ai-bg-secondary);
  font-size: var(--ai-font-md);
  line-height: var(--ai-line-height);
}

/* 全局链接样式 */
a {
  color: var(--ai-primary);
  text-decoration: none;
  transition: color var(--ai-animation-fast) ease;
}

a:hover {
  color: var(--ai-primary-hover);
}

/* 全局按钮基础样式 */
button {
  font-family: inherit;
  transition: all var(--ai-animation-fast) ease;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--ai-bg-tertiary);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--ai-border);
  border-radius: 3px;
  transition: background var(--ai-animation-fast) ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ai-text-tertiary);
}

/* 全局聚焦样式 */
:focus {
  outline: 2px solid var(--ai-primary);
  outline-offset: 2px;
}

/* 全局动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 智能效果类 */
.ai-glow {
  box-shadow: var(--ai-shadow-glow);
  animation: pulse 2s infinite;
}

.ai-gradient {
  background: linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-secondary) 100%);
  background-size: 200% 200%;
  animation: gradient-flow 3s ease infinite;
}

.ai-hover-float:hover {
  animation: float 2s ease-in-out infinite;
}

/* ==================== Element Plus 主题定制 ==================== */
:root {
  /* 主色调覆盖 - AI科技蓝 */
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #66b1ff;
  --el-color-primary-light-5: #99c4ff;
  --el-color-primary-light-7: #bbdefb;
  --el-color-primary-light-8: #e1f5fe;
  --el-color-primary-light-9: #f0f9ff;
  --el-color-primary-dark-2: #3a8ee6;

  /* 成功色 */
  --el-color-success: #00beaa;

  /* 警告色 */
  --el-color-warning: #faad14;

  /* 危险色 */
  --el-color-danger: #ff4d4f;

  /* 信息色 */
  --el-color-info: #909399;

  /* 文字颜色 */
  --el-text-color-primary: #222222;
  --el-text-color-regular: #333333;
  --el-text-color-secondary: #666666;
  --el-text-color-placeholder: #999999;

  /* 边框颜色 */
  --el-border-color: #e8e8e8;
  --el-border-color-light: #f0f0f0;
  --el-border-color-lighter: #f5f5f5;
  --el-border-color-extra-light: #fafafa;

  /* 背景色 */
  --el-bg-color: #ffffff;
  --el-bg-color-page: #f0f2f5;
  --el-bg-color-overlay: #ffffff;

  /* 阴影 */
  --el-box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  --el-box-shadow-light: 0 2px 12px rgba(64, 158, 255, 0.12);
  --el-box-shadow-lighter: 0 4px 20px rgba(64, 158, 255, 0.16);

  /* 圆角 */
  --el-border-radius-base: 8px;
  --el-border-radius-small: 4px;
  --el-border-radius-round: 20px;
}

/* 按钮样式 */
.el-button--primary {
  --el-button-bg-color: #409eff;
  --el-button-border-color: #409eff;
  --el-button-hover-bg-color: #66b1ff;
  --el-button-hover-border-color: #66b1ff;
  --el-button-active-bg-color: #3a8ee6;
  --el-button-active-border-color: #3a8ee6;
}

.el-button--primary:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

.el-button--primary:active {
  background-color: #3a8ee6 !important;
  border-color: #3a8ee6 !important;
}

/* 卡片样式 */
.el-card {
  border-radius: 12px !important;
  border: 1px solid #f0f0f0 !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08) !important;
  transition: all 0.3s ease !important;
  background: var(--ai-bg-primary) !important;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.16) !important;
  border-color: #e6f1ff !important;
  transform: translateY(-2px);
}

/* 输入框样式 */
.el-input__wrapper {
  border-radius: 8px !important;
  box-shadow: 0 0 0 1px #e8e8e8 inset !important;
  transition: all 0.3s ease !important;
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #d9d9d9 inset !important;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

/* 选择器样式 */
.el-select .el-input.is-focus .el-input__wrapper {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

/* 标签样式 */
.el-tag--primary {
  --el-tag-bg-color: #e6f1ff !important;
  --el-tag-border-color: #b3d9ff !important;
  --el-tag-text-color: #409eff !important;
}

/* 复选框样式 */
.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

.el-checkbox__input.is-checked + .el-checkbox__label {
  color: #409eff !important;
}

/* 单选框样式 */
.el-radio__input.is-checked .el-radio__inner {
  border-color: #409eff !important;
  background: #409eff !important;
}

.el-radio__input.is-checked + .el-radio__label {
  color: #409eff !important;
}

/* 开关样式 */
.el-switch.is-checked .el-switch__core {
  border-color: #409eff !important;
  background-color: #409eff !important;
}

/* 分页样式 */
.el-pagination.is-background .el-pager li:not(.is-disabled).is-active {
  background-color: #409eff !important;
}

/* 标签页样式 */
.el-tabs__item.is-active {
  color: #409eff !important;
}

.el-tabs__active-bar {
  background-color: #409eff !important;
}

/* 链接样式 */
.el-link--primary {
  --el-link-text-color: #409eff;
  --el-link-hover-text-color: #66b1ff;
}

/* 下拉菜单样式 */
.el-dropdown-menu__item:hover {
  background-color: #f0f9ff !important;
  color: #409eff !important;
}

/* 对话框样式 */
.el-dialog {
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.16) !important;
}

.el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
}

/* 头像样式 */
.el-avatar {
  background-color: #f0f9ff !important;
  color: #409eff !important;
}

/* 骨架屏样式 */
.el-skeleton.is-animated .el-skeleton__item {
  background: linear-gradient(90deg, #f5f7fa 25%, #e8e8e8 37%, #f5f7fa 63%);
  background-size: 400% 100%;
}

/* 空状态样式 */
.el-empty__description {
  color: #999999 !important;
}

/* 消息提示样式 */
.el-message--success {
  background-color: #f6ffed !important;
  border-color: #b7eb8f !important;
}
</style>
