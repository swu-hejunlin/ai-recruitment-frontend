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
// 根组件，不需要额外的逻辑
</script>

<style>
/* ==================== BOSS直聘风格全局样式 ==================== */

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

/* BOSS直聘风格设计系统变量 */
:root {
  /* 主色调 */
  --boss-primary: #00beaa;
  --boss-primary-hover: #00a896;
  --boss-primary-active: #009688;
  
  /* 文字颜色 */
  --boss-text-primary: #222222;
  --boss-text-secondary: #666666;
  --boss-text-tertiary: #999999;
  --boss-text-white: #FFFFFF;
  
  /* 背景颜色 */
  --boss-bg-primary: #FFFFFF;
  --boss-bg-secondary: #F5F7FA;
  --boss-bg-tertiary: #F0F2F5;
  
  /* 边框颜色 */
  --boss-border: #E8E8E8;
  --boss-border-light: #F0F0F0;
  --boss-border-hover: #D9D9D9;
  
  /* 图标颜色 */
  --boss-icon-primary: #666666;
  --boss-icon-secondary: #999999;
  --boss-icon-active: #00beaa;
  
  /* 圆角 */
  --boss-radius-sm: 4px;
  --boss-radius-md: 8px;
  --boss-radius-lg: 12px;
  
  /* 阴影 */
  --boss-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.04);
  --boss-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --boss-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);
  
  /* 间距 */
  --boss-spacing-xs: 4px;
  --boss-spacing-sm: 8px;
  --boss-spacing-md: 16px;
  --boss-spacing-lg: 24px;
  --boss-spacing-xl: 32px;
  --boss-spacing-xxl: 48px;
  
  /* 字体大小 */
  --boss-font-xs: 12px;
  --boss-font-sm: 14px;
  --boss-font-md: 16px;
  --boss-font-lg: 18px;
  --boss-font-xl: 20px;
  --boss-font-xxl: 24px;
  --boss-font-title: 28px;
  
  /* 行高 */
  --boss-line-height: 1.5;
  --boss-line-height-tight: 1.3;
  --boss-line-height-loose: 1.7;
}

/* 设置全局字体（BOSS直聘风格） */
#app {
  width: 100%;
  height: 100%;
  font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', 'Hiragino Sans GB', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  color: var(--boss-text-primary);
  background-color: var(--boss-bg-secondary);
  font-size: var(--boss-font-md);
  line-height: var(--boss-line-height);
}

/* 全局链接样式 */
a {
  color: var(--boss-primary);
  text-decoration: none;
}

a:hover {
  color: var(--boss-primary-hover);
}

/* 全局按钮基础样式 */
button {
  font-family: inherit;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--boss-bg-tertiary);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--boss-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--boss-text-tertiary);
}

/* 全局聚焦样式 */
:focus {
  outline: 2px solid var(--boss-primary);
  outline-offset: 2px;
}

/* ==================== Element Plus 主题定制 ==================== */
:root {
  /* 主色调覆盖 - BOSS直聘青绿色 */
  --el-color-primary: #00beaa;
  --el-color-primary-light-3: #33cbbe;
  --el-color-primary-light-5: #66d8d2;
  --el-color-primary-light-7: #99e5e5;
  --el-color-primary-light-8: #b3ecec;
  --el-color-primary-light-9: #ccf3f3;
  --el-color-primary-dark-2: #009880;

  /* 成功色 */
  --el-color-success: #52c41a;

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
  --el-bg-color-page: #f5f7fa;
  --el-bg-color-overlay: #ffffff;

  /* 阴影 */
  --el-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  --el-box-shadow-light: 0 2px 12px rgba(0, 0, 0, 0.06);
  --el-box-shadow-lighter: 0 4px 20px rgba(0, 0, 0, 0.08);

  /* 圆角 */
  --el-border-radius-base: 8px;
  --el-border-radius-small: 4px;
  --el-border-radius-round: 20px;
}

/* 按钮样式 */
.el-button--primary {
  --el-button-bg-color: #00beaa;
  --el-button-border-color: #00beaa;
  --el-button-hover-bg-color: #00a896;
  --el-button-hover-border-color: #00a896;
  --el-button-active-bg-color: #009688;
  --el-button-active-border-color: #009688;
}

.el-button--primary:hover {
  background-color: #00a896 !important;
  border-color: #00a896 !important;
}

.el-button--primary:active {
  background-color: #009688 !important;
  border-color: #009688 !important;
}

/* 卡片样式 */
.el-card {
  border-radius: 12px !important;
  border: 1px solid #f0f0f0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.3s ease !important;
}

.el-card:hover {
  box-shadow: 0 4px 16px rgba(0, 190, 170, 0.12) !important;
  border-color: #e6f9f6 !important;
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
  box-shadow: 0 0 0 1px #00beaa inset !important;
}

/* 选择器样式 */
.el-select .el-input.is-focus .el-input__wrapper {
  box-shadow: 0 0 0 1px #00beaa inset !important;
}

/* 标签样式 */
.el-tag--primary {
  --el-tag-bg-color: #e6f9f6 !important;
  --el-tag-border-color: #b3ece5 !important;
  --el-tag-text-color: #00beaa !important;
}

/* 复选框样式 */
.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #00beaa !important;
  border-color: #00beaa !important;
}

.el-checkbox__input.is-checked + .el-checkbox__label {
  color: #00beaa !important;
}

/* 单选框样式 */
.el-radio__input.is-checked .el-radio__inner {
  border-color: #00beaa !important;
  background: #00beaa !important;
}

.el-radio__input.is-checked + .el-radio__label {
  color: #00beaa !important;
}

/* 开关样式 */
.el-switch.is-checked .el-switch__core {
  border-color: #00beaa !important;
  background-color: #00beaa !important;
}

/* 分页样式 */
.el-pagination.is-background .el-pager li:not(.is-disabled).is-active {
  background-color: #00beaa !important;
}

/* 标签页样式 */
.el-tabs__item.is-active {
  color: #00beaa !important;
}

.el-tabs__active-bar {
  background-color: #00beaa !important;
}

/* 链接样式 */
.el-link--primary {
  --el-link-text-color: #00beaa;
  --el-link-hover-text-color: #00a896;
}

/* 下拉菜单样式 */
.el-dropdown-menu__item:hover {
  background-color: #f5f7fa !important;
  color: #00beaa !important;
}

/* 对话框样式 */
.el-dialog {
  border-radius: 12px !important;
}

.el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
}

/* 头像样式 */
.el-avatar {
  background-color: #f5f7fa !important;
  color: #00beaa !important;
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
