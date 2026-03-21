/**
 * 应用入口文件
 * 初始化 Vue 应用、路由、状态管理、UI组件库等
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import App from './App.vue';
import router from './router';
import './style.css';

// ==================== 创建 Vue 应用实例 ====================
const app = createApp(App);

// ==================== 创建 Pinia 实例 ====================
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// ==================== 注册插件 ====================
app.use(pinia); // 注册状态管理
app.use(router); // 注册路由
app.use(ElementPlus, { locale: zhCn }); // 注册 Element Plus UI 组件库

// ==================== 挂载应用 ====================
app.mount('#app');
