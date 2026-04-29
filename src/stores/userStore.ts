import { defineStore } from 'pinia';
import type { Role, UserInfo, LoginRequest } from '@/types';
import request from '@/utils/request';

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - base64.length % 4) % 4;
    const paddedBase64 = base64 + '='.repeat(padLength);
    const payload = JSON.parse(atob(paddedBase64));
    const exp = payload.exp;
    if (!exp) return false;
    return Math.floor(Date.now() / 1000) >= exp - 30;
  } catch {
    return false;
  }
}

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  unreadNotificationCount: number;
  applicationCount: number;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null') as UserInfo | null,
    unreadNotificationCount: 0,
    applicationCount: 0
  }),

  getters: {
    isLogin: (state): boolean => {
      return !!state.token && !!state.userInfo;
    },
    isTokenExpired: (state): boolean => {
      if (!state.token) return true;
      return isTokenExpired(state.token);
    },
    userRole: (state): Role | null => {
      return state.userInfo?.role || null;
    },
    isSeeker: (state): boolean => {
      return state.userInfo?.role === 1;
    },
    isHR: (state): boolean => {
      return state.userInfo?.role === 2;
    }
  },

  actions: {
    async login(loginData: LoginRequest): Promise<UserInfo> {
      try {
        const res = await request.post<any>('/api/user/login', loginData);

        if (res.needSwitchRole) {
          throw { needSwitchRole: true, loginResponse: res, currentRole: res.currentRole };
        }

        if (!res.token) {
          throw new Error('登录响应中没有token');
        }

        const userInfo: UserInfo = {
          userId: res.userId,
          phone: loginData.phone,
          role: res.role
        };

        this.token = res.token;
        this.userInfo = userInfo;
        localStorage.setItem('token', res.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        return userInfo;
      } catch (error) {
        throw error;
      }
    },

    async switchRole(switchData: LoginRequest): Promise<UserInfo> {
      try {
        const res = await request.post<any>('/api/user/switch-role', switchData);

        const userInfo: UserInfo = {
          userId: res.userId,
          phone: switchData.phone,
          role: res.role
        };

        this.token = res.token;
        this.userInfo = userInfo;
        localStorage.setItem('token', res.token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        return userInfo;
      } catch (error) {
        throw error;
      }
    },

    logout(): void {
      this.token = null;
      this.userInfo = null;
      this.unreadNotificationCount = 0;
      this.applicationCount = 0;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },

    async refreshCounts(): Promise<void> {
      if (!this.isLogin) return;

      try {
        const promises = [];

        promises.push(request.get('/api/notification/unread-count').then((res: any) => {
          this.unreadNotificationCount = res.count || 0;
        }));

        if (this.isSeeker) {
          promises.push(request.get('/api/application/seeker/list', {
            params: { pageNum: 1, pageSize: 1 }
          }).then((res: any) => {
            this.applicationCount = res.total || 0;
          }));
        }

        await Promise.all(promises);
      } catch {
        // 静默处理刷新失败
      }
    },

    updateUserInfo(userInfo: UserInfo): void {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    clearUserState(): void {
      this.token = null;
      this.userInfo = null;
      this.unreadNotificationCount = 0;
      this.applicationCount = 0;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },

    checkTokenFormat(): boolean {
      if (!this.token) return true;
      try {
        const parts = this.token.split('.');
        return parts.length === 3;
      } catch {
        return false;
      }
    }
  }
});
