/**
 * Axios 封装
 * 提供统一的 HTTP 请求配置、拦截器和错误处理
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
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
const REQUEST_TIMEOUT = 10000;

// ==================== 创建 Axios 实例 ====================
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// ==================== 请求拦截器 ====================
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');

    // 如果存在 token，添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 记录请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`[请求] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('[请求错误]', error);
    return Promise.reject(error);
  }
);

// ==================== 响应拦截器 ====================
request.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const { code, message, data } = response.data;

    // 记录响应日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`[响应] ${response.config.url}`, response.data);
    }

    // 业务状态码 200 表示成功
    if (code === 200) {
      // 直接返回完整的 data（包含 needSwitchRole、currentRole 等字段）
      return data;
    }

    // 业务失败，显示错误提示
    ElMessage.error(message || '请求失败');
    return Promise.reject(new Error(message || '请求失败'));
  },
  (error) => {
    console.error('[响应错误]', error);

    // 处理不同的 HTTP 错误状态码
    let errorMessage = '网络错误，请稍后重试';

    if (error.response) {
      // 服务器返回了错误响应
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除 token 并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = '拒绝访问，权限不足';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接';
      } else {
        errorMessage = '网络错误，请检查网络连接';
      }
    } else {
      // 请求配置出错
      errorMessage = error.message || '未知错误';
    }

    ElMessage.error(errorMessage);
    return Promise.reject(error);
  }
);

// ==================== 导出 ====================
export default request;

/**
 * 导出 Axios 原始类型，用于泛型约束
 */
export type { AxiosRequestConfig, AxiosResponse, AxiosInstance };
