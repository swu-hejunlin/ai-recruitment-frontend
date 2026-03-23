/**
 * 用户状态管理 Store
 * 管理用户登录状态、用户信息、token 等
 */

import { defineStore } from 'pinia';
import type { Role, UserInfo, LoginRequest } from '@/types';
import request from '@/utils/request';

/**
 * 用户状态管理接口
 */
interface UserState {
  /** JWT 令牌 */
  token: string | null;
  /** 用户信息 */
  userInfo: UserInfo | null;
}

/**
 * 用户 Store
 * 使用 Pinia 管理用户登录状态，支持持久化
 */
export const useUserStore = defineStore('user', {
  // ==================== 状态定义 ====================
  state: (): UserState => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null') as UserInfo | null
  }),

  // ==================== 计算属性 ====================
  getters: {
    /**
     * 判断用户是否已登录
     */
    isLogin: (state): boolean => {
      return !!state.token && !!state.userInfo;
    },

    /**
     * 获取用户角色
     */
    userRole: (state): Role | null => {
      return state.userInfo?.role || null;
    },

    /**
     * 判断当前用户是否为求职者
     */
    isSeeker: (state): boolean => {
      return state.userInfo?.role === 1;
    },

    /**
     * 判断当前用户是否为企业HR
     */
    isHR: (state): boolean => {
      return state.userInfo?.role === 2;
    }
  },

  // ==================== 方法 ====================
  actions: {
    /**
     * 登录
     * @param loginData - 登录请求参数（手机号、验证码、角色）
     * @returns Promise<UserInfo> - 返回用户信息
     */
    async login(loginData: LoginRequest): Promise<UserInfo> {
      try {
        // 调用登录接口 - 响应拦截器已经返回data部分
        const res = await request.post<any>('/api/user/login', loginData) as any;

        // 从响应中提取用户信息
        const userInfo: UserInfo = {
          userId: res.userId,
          phone: loginData.phone,
          role: loginData.role
        };

        // 保存 token 和用户信息
        this.token = res.token;
        this.userInfo = userInfo;

        // 同步到 localStorage（持久化）
        localStorage.setItem('token', res.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        return userInfo;
      } catch (error) {
        console.error('登录失败:', error);
        throw error;
      }
    },

    /**
     * 登出
     * 清除用户信息和 token
     */
    logout(): void {
      // 清除状态
      this.token = null;
      this.userInfo = null;

      // 清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },

    /**
     * 更新用户信息
     * @param userInfo - 用户信息
     */
    updateUserInfo(userInfo: UserInfo): void {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    /**
     * 清除用户状态
     * 用于处理 token 过期等情况
     */
    clearUserState(): void {
      this.logout();
    }
  },

  // ==================== 持久化配置 ====================
  persist: true
});
