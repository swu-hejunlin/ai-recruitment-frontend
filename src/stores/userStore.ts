/**
 * 用户状态管理 Store
 * 管理用户登录状态、用户信息、token 等
 */

import { defineStore } from 'pinia';
import type { Role, UserInfo, LoginRequest } from '@/types';
import request from '@/utils/request';

/**
 * 检查JWT Token是否过期
 * @param token - JWT Token字符串
 * @returns 布尔值，true表示已过期或无效，false表示有效
 */
function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }
  
  try {
    // JWT Token格式：header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token格式错误，不是有效的JWT格式');
      return false; // 不视为过期，让后端处理
    }
    
    // JWT使用URL安全的base64编码
    // 简单的Base64Url转换为标准Base64
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 补齐Base64的padding
    const padLength = (4 - base64.length % 4) % 4;
    const paddedBase64 = base64 + '='.repeat(padLength);
    
    // 解码Base64
    const decodedStr = atob(paddedBase64);
    
    // 尝试解析JSON
    const payload = JSON.parse(decodedStr);
    const exp = payload.exp; // JWT标准使用exp字段
    
    if (!exp) {
      console.log('Token没有过期时间字段(exp)，视为永久有效');
      return false; // 没有过期时间，视为永久有效
    }
    
    // 检查是否已过期（留出30秒缓冲时间）
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now >= exp - 30;
    
    if (isExpired) {
      console.log(`Token已过期，exp: ${exp}, now: ${now}, 剩余: ${exp - now}秒`);
    } else {
      console.log(`Token有效，exp: ${exp}, now: ${now}, 剩余: ${exp - now}秒`);
    }
    
    return isExpired;
  } catch (error) {
    console.warn('解析Token失败，但不视为过期（让后端验证）:', (error as Error).message || 'Unknown error');
    // 解析失败时，不视为过期，而是让后端验证
    // 这样前端不会因为token格式问题而错误地清理登录状态
    return false;
  }
}

/**
 * 用户状态管理接口
 */
interface UserState {
  /** JWT 令牌 */
  token: string | null;
  /** 用户信息 */
  userInfo: UserInfo | null;
  /** 未读通知数量（角标数据） */
  unreadNotificationCount: number;
  /** 投递总数（针对求职者） */
  applicationCount: number;
}

/**
 * 用户 Store
 * 使用 Pinia 管理用户登录状态，支持持久化
 */
export const useUserStore = defineStore('user', {
  // ==================== 状态定义 ====================
  state: (): UserState => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null') as UserInfo | null,
    unreadNotificationCount: 0,
    applicationCount: 0
  }),

  // ==================== 计算属性 ====================
  getters: {
    /**
     * 判断用户是否已登录（仅检查token和用户信息是否存在）
     * Token有效性由后端验证，前端只做基本检查
     */
    isLogin: (state): boolean => {
      // 仅检查是否存在token和用户信息
      // Token有效性让后端API去验证（返回401时再处理）
      return !!state.token && !!state.userInfo;
    },

    /**
     * 判断token是否过期（仅作参考，不用于路由守卫）
     * 主要用于调试和状态检查
     */
    isTokenExpired: (state): boolean => {
      if (!state.token) return true;
      return isTokenExpired(state.token);
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
     * @returns Promise<UserInfo> - 返回用户信息，如果需要角色切换，抛出特殊错误
     */
    async login(loginData: LoginRequest): Promise<UserInfo> {
      try {
        console.log('[userStore.login] 开始登录，参数:', loginData);
        
        // 调用登录接口 - 响应拦截器已经返回data部分
        const res = await request.post<any>('/api/user/login', loginData) as any;
        
        console.log('[userStore.login] 登录响应:', res);

        // 检查是否需要切换角色
        if (res.needSwitchRole) {
          console.log('[userStore.login] 检测到需要角色切换，抛出特殊错误');
          // 抛出特殊错误，让Login.vue处理角色切换对话框
          throw {
            needSwitchRole: true,
            loginResponse: res,
            currentRole: res.currentRole
          };
        }

        // 检查token是否存在
        if (!res.token) {
          console.error('[userStore.login] 错误：响应中没有token');
          throw new Error('登录响应中没有token');
        }

        // 从响应中提取用户信息（正常登录情况）
        const userInfo: UserInfo = {
          userId: res.userId,
          phone: loginData.phone,
          role: res.role
        };

        // 保存 token 和用户信息
        this.token = res.token;
        this.userInfo = userInfo;

        // 同步到 localStorage（持久化）
        localStorage.setItem('token', res.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        console.log('[userStore.login] 登录成功! token已保存到localStorage');
        console.log('[userStore.login] localStorage token:', localStorage.getItem('token')?.substring(0, 30) + '...');
        
        // 立即验证store状态
        console.log('[userStore.login] 立即验证store状态:');
        console.log('  - store.token:', this.token ? this.token.substring(0, 30) + '...' : 'null');
        console.log('  - store.userInfo:', this.userInfo);
        console.log('  - store.isLogin:', this.isLogin);
        console.log('  - localStorage.token:', localStorage.getItem('token')?.substring(0, 30) + '...');

        return userInfo;
      } catch (error) {
        console.error('[userStore.login] 登录失败:', error);
        throw error;
      }
    },

    /**
     * 切换角色
     * @param switchData - 切换角色请求参数（手机号、验证码、角色）
     * @returns Promise<UserInfo> - 返回用户信息
     */
    async switchRole(switchData: LoginRequest): Promise<UserInfo> {
      try {
        console.log('[userStore.switchRole] 开始切换角色，参数:', switchData);
        
        // 调用切换角色接口
        const res = await request.post<any>('/api/user/switch-role', switchData) as any;
        
        console.log('[userStore.switchRole] 切换角色响应:', res);

        // 从响应中提取用户信息
        const userInfo: UserInfo = {
          userId: res.userId,
          phone: switchData.phone,
          role: res.role
        };

        console.log('[userStore.switchRole] 提取用户信息:', userInfo);

        // 保存 token 和用户信息
        this.token = res.token;
        this.userInfo = userInfo;

        // 同步到 localStorage（持久化）
        localStorage.setItem('token', res.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        console.log('[userStore.switchRole] 切换成功，store状态:', {
          isLogin: this.isLogin,
          token: this.token ? `${this.token.substring(0, 20)}...` : null,
          userInfo: this.userInfo
        });

        return userInfo;
      } catch (error) {
        console.error('[userStore.switchRole] 切换角色失败:', error);
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
      this.unreadNotificationCount = 0;
      this.applicationCount = 0;

      // 清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      console.log('[userStore.logout] 已退出登录，清除状态');
    },

    /**
     * 刷新角标计数（未读通知、投递总数）
     */
    async refreshCounts(): Promise<void> {
      if (!this.isLogin) return;

      try {
        // 并发获取各种计数
        const promises = [];
        
        // 1. 未读通知计数
        promises.push(request.get('/api/notification/unread-count').then((res: any) => {
          this.unreadNotificationCount = res.count || 0;
        }));

        // 2. 投递总数（仅针对求职者）
        if (this.isSeeker) {
          promises.push(request.get('/api/application/seeker/list', { 
            params: { pageNum: 1, pageSize: 1 } 
          }).then((res: any) => {
            this.applicationCount = res.total || 0;
          }));
        }

        await Promise.all(promises);
        console.log('[userStore.refreshCounts] 角标数据刷新成功:', {
          unread: this.unreadNotificationCount,
          applications: this.applicationCount
        });
      } catch (error) {
        console.error('[userStore.refreshCounts] 刷新角标失败:', error);
      }
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
      this.token = null;
      this.userInfo = null;
      this.unreadNotificationCount = 0;
      this.applicationCount = 0;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },

    /**
     * 检查token格式（不清理，仅用于调试）
     * 注意：前端不应该主动清理token，应让后端验证
     * @returns 布尔值，true表示格式看起来有效，false表示格式可能有误
     */
    checkTokenFormat(): boolean {
      // 如果根本没有token，返回true（因为没有需要检查的）
      if (!this.token) return true;
      
      // 仅检查token格式是否明显错误，不清理状态
      try {
        const parts = this.token.split('.');
        if (parts.length !== 3) {
          console.warn('Token格式明显错误（3段式JWT格式）');
          return false;
        }
        return true;
      } catch (error) {
        console.warn('Token检查出错，格式可能异常:', (error as Error).message || 'Unknown error');
        return false;
      }
    }
  },

  // ==================== 持久化配置 ====================
  // 我们自己实现了localStorage持久化，所以禁用pinia-plugin-persist
  // persist: true
});
