/**
 * 全局类型定义文件
 * 用于智能招聘平台前后端交互的 TypeScript 类型约束
 */

// ==================== 角色类型定义 ====================
/**
 * 用户角色枚举
 * 1: 求职者
 * 2: 企业HR
 */
export type Role = 1 | 2;

/**
 * 角色映射关系（用于显示）
 */
export const ROLE_MAP: Record<Role, string> = {
  1: '求职者',
  2: '企业HR'
};

// ==================== 统一返回格式 ====================
/**
 * 后端统一返回格式
 * @template T - 返回数据的类型
 */
export interface Result<T = any> {
  /** 状态码，200-成功，其他-失败 */
  code: number;
  /** 返回消息描述 */
  message: string;
  /** 返回数据 */
  data: T;
  /** 时间戳（毫秒） */
  timestamp: number;
}

// ==================== 用户相关类型 ====================
/**
 * 用户基本信息
 */
export interface UserInfo {
  /** 用户ID */
  userId: number;
  /** 手机号 */
  phone: string;
  /** 用户角色 */
  role: Role;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 手机号 */
  phone: string;
  /** 验证码 */
  code: string;
  /** 用户角色 */
  role: Role;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** JWT令牌 */
  token: string | null;
  /** 用户ID */
  userId: number;
  /** 用户角色 */
  role: Role;
  /** 是否需要切换角色 */
  needSwitchRole?: boolean;
  /** 当前角色（当需要切换时，返回用户已有的角色） */
  currentRole?: Role;
}

// ==================== 发送验证码类型 ====================
/**
 * 发送验证码请求参数
 */
export interface SendCodeRequest {
  /** 手机号 */
  phone: string;
}

// ==================== 页面状态类型 ====================
/**
 * 登录表单数据
 */
export interface LoginForm {
  /** 手机号 */
  phone: string;
  /** 验证码 */
  code: string;
  /** 用户角色 */
  role: Role;
}

// ==================== 角色切换相关类型 ====================
/**
 * 用户拥有的角色信息
 */
export interface UserRoles {
  /** 手机号 */
  phone: string;
  /** 拥有的角色列表 */
  roles: Role[];
}

// ==================== 路由元信息类型 ====================
/**
 * 路由元信息
 */
export interface RouteMeta {
  /** 页面标题 */
  title?: string;
  /** 是否需要登录 */
  requiresAuth?: boolean;
  /** 允许访问的角色 */
  roles?: Role[];
}
