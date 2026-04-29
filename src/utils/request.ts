import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import type { Result } from '@/types';
import { getFromCache, setCache, invalidateCache, getCacheKey, invalidateAllCache } from './cache';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const REQUEST_TIMEOUT = 300000;

const CACHE_PREFIXES = ['/api/position/latest', '/api/position/hot', '/api/statistics', '/api/job-recommend', '/api/talent-recommend']
const INVALIDATE_PREFIXES = ['/api/position', '/api/application', '/api/notification', '/api/job-seeker', '/api/company', '/api/interview', '/api/favorite']

const request = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

interface RequestInstance extends AxiosInstance {
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const typedRequest = request as RequestInstance;

function shouldCache(url: string): boolean {
  return CACHE_PREFIXES.some(p => url.includes(p))
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const config = response.config
    const method = (config.method || 'get').toLowerCase()
    const url = config.url || ''
    const { code, message, data } = response.data;

    if (method === 'get' && code === 200 && shouldCache(url)) {
      const cacheKey = getCacheKey(url, config.params)
      const cached = getFromCache(cacheKey)
      if (cached !== null) {
        return cached
      }
      setCache(cacheKey, data)
    }

    if (method !== 'get') {
      for (const prefix of INVALIDATE_PREFIXES) {
        if (url.includes(prefix)) {
          invalidateCache(prefix)
        }
      }
    }

    if (code === 200) {
      return data;
    }

    if (code === 401) {
      clearLocalAuth();
      ElMessage.error(message || '登录已过期，请重新登录');
      return Promise.reject(new Error(message || 'Unauthorized'));
    }

    ElMessage.error(message || '请求失败');
    return Promise.reject(new Error(message || 'Business Error'));
  },
  (error) => {
    invalidateAllCache()
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

function clearLocalAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  invalidateAllCache()
  import('@/stores/userStore').then(({ useUserStore }) => {
    const userStore = useUserStore();
    userStore.logout();
  });
}

export default typedRequest;

export type { AxiosRequestConfig, AxiosResponse, AxiosInstance, InternalAxiosRequestConfig };
