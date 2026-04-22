/**
 * Axios 封装
 * 提供统一的 HTTP 请求配置、拦截器和错误处理
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import type { Result } from '@/types';

// ==================== 基础配置 ====================
/**
 * API 基础 URL（开发环境）
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 请求超时时间（毫秒）
 */
const REQUEST_TIMEOUT = 30000;

// ==================== 创建 Axios 实例 ====================
const request = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// 扩展 request 方法的返回类型，使其返回拦截器处理后的类型
interface RequestInstance extends AxiosInstance {
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const typedRequest = request as RequestInstance;

// ==================== 请求拦截器 ====================
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    
    // 如果存在 token，添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 记录请求日志（仅开发环境且简略）
    if (import.meta.env.DEV) {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== 响应拦截器 ====================
request.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const { code, message, data } = response.data;

    // 业务状态码 200 表示成功
    if (code === 200) {
      return data;
    }

    // 处理认证失效情况
    if (code === 401) {
      clearLocalAuth();
      ElMessage.error(message || '登录已过期，请重新登录');
      return Promise.reject(new Error(message || 'Unauthorized'));
    }

    // 处理其他业务错误
    ElMessage.error(message || '请求失败');
    return Promise.reject(new Error(message || 'Business Error'));
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = data?.message || '请求失败';

      switch (status) {
        case 401:
          clearLocalAuth();
          errorMessage = '登录已过期，请重新登录';
          break;
        case 403:
          errorMessage = '无权访问此资源';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
      }
      
      ElMessage.error(errorMessage);
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络');
    } else {
      ElMessage.error('网络错误，请稍后重试');
    }
    
    return Promise.reject(error);
  }
);

/**
 * 清除本地认证信息
 */
function clearLocalAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  // 如果在组件外使用，可以通过 import 动态获取 store
  import('@/stores/userStore').then(({ useUserStore }) => {
    const userStore = useUserStore();
    userStore.logout();
  });
}

// ==================== 导出 ====================
export default typedRequest;

/**
 * 导出 Axios 原始类型，用于泛型约束
 */
export type { AxiosRequestConfig, AxiosResponse, AxiosInstance, InternalAxiosRequestConfig };
