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
  1: '牛人',
  2: 'boss'
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

// ==================== 求职者相关类型 ====================
/**
 * 性别枚举
 */
export type Gender = number;

/**
 * 性别映射
 */
export const GENDER_MAP: Record<Gender, string> = {
  0: '未知',
  1: '男',
  2: '女'
};

/**
 * 学历枚举
 */
export type EducationLevel = number;

/**
 * 学历映射
 */
export const EDUCATION_MAP: Record<EducationLevel, string> = {
  1: '高中及以下',
  2: '大专',
  3: '本科',
  4: '硕士',
  5: '博士'
};

/**
 * 当前状态枚举
 */
export type CurrentStatus = number;

/**
 * 当前状态映射
 */
export const STATUS_MAP: Record<CurrentStatus, string> = {
  1: '在职',
  2: '离职',
  3: '在读学生'
};

/**
 * 求职者信息
 */
export interface JobSeekerInfo {
  /** 求职者ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 姓名 */
  name: string;
  /** 性别 */
  gender: Gender;
  /** 头像URL */
  avatar: string;
  /** 邮箱地址 */
  email: string;
  /** 年龄 */
  age: number;
  /** 学历层次 */
  educationLevel: EducationLevel;
  /** 毕业院校 */
  graduateSchool: string;
  /** 专业 */
  major: string;
  /** 工作年限 */
  workYears: number;
  /** 当前薪资（万元/年） */
  currentSalary: number;
  /** 期望薪资（万元/年） */
  expectedSalary: number;
  /** 当前状态 */
  currentStatus: CurrentStatus;
  /** 所在城市 */
  city: string;
  /** 详细地址 */
  address: string;
  /** 个人简介 */
  introduction: string;
  /** 技能标签（JSON数组格式） */
  skills: string;
  /** 简历附件URL */
  resumeUrl: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 求职者信息更新请求
 */
export interface UpdateJobSeekerRequest {
  /** 求职者ID */
  id: number;
  /** 姓名 */
  name: string;
  /** 性别 */
  gender?: Gender;
  /** 邮箱地址 */
  email?: string;
  /** 年龄 */
  age?: number;
  /** 学历层次 */
  educationLevel?: EducationLevel;
  /** 毕业院校 */
  graduateSchool?: string;
  /** 专业 */
  major?: string;
  /** 工作年限 */
  workYears?: number;
  /** 当前薪资（万元/年） */
  currentSalary?: number;
  /** 期望薪资（万元/年） */
  expectedSalary?: number;
  /** 当前状态 */
  currentStatus?: CurrentStatus;
  /** 所在城市 */
  city?: string;
  /** 详细地址 */
  address?: string;
  /** 个人简介 */
  introduction?: string;
  /** 技能标签（JSON数组格式） */
  skills?: string;
}

// ==================== 企业相关类型 ====================
/**
 * 企业规模枚举
 */
export type CompanyScale = number;

/**
 * 企业规模映射
 */
export const SCALE_MAP: Record<CompanyScale, string> = {
  1: '0-20人',
  2: '20-99人',
  3: '100-499人',
  4: '500-999人',
  5: '1000-9999人',
  6: '10000人以上'
};

/**
 * 融资阶段枚举
 */
export type FinancingStage = number;

/**
 * 融资阶段映射
 */
export const FINANCING_MAP: Record<FinancingStage, string> = {
  1: '未融资',
  2: '天使轮',
  3: 'A轮',
  4: 'B轮',
  5: 'C轮',
  6: 'D轮及以上',
  7: '已上市',
  8: '不需要融资'
};

/**
 * 企业信息
 */
export interface CompanyInfo {
  /** 企业ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 企业名称 */
  companyName: string;
  /** 企业logo */
  logo: string;
  /** 法人代表 */
  legalPerson: string;
  /** 所属行业 */
  industry: string;
  /** 企业规模 */
  scale: CompanyScale;
  /** 融资阶段 */
  financingStage: FinancingStage;
  /** 所在城市 */
  city: string;
  /** 详细地址 */
  address: string;
  /** 企业邮箱 */
  email: string;
  /** 企业联系电话 */
  phone: string;
  /** 企业官网 */
  website: string;
  /** 企业简介 */
  description: string;
  /** 福利待遇（JSON数组格式） */
  welfare: string;
  /** 营业执照URL */
  businessLicense: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 企业信息更新请求
 */
export interface UpdateCompanyRequest {
  /** 企业ID */
  id: number;
  /** 企业名称 */
  companyName: string;
  /** 法人代表 */
  legalPerson?: string;
  /** 所属行业 */
  industry?: string;
  /** 企业规模 */
  scale?: CompanyScale;
  /** 融资阶段 */
  financingStage?: FinancingStage;
  /** 所在城市 */
  city?: string;
  /** 详细地址 */
  address?: string;
  /** 企业邮箱 */
  email?: string;
  /** 企业联系电话 */
  phone?: string;
  /** 企业官网 */
  website?: string;
  /** 企业简介 */
  description?: string;
  /** 福利待遇（JSON数组格式） */
  welfare?: string;
}

// ==================== 文件上传相关类型 ====================
/**
 * 文件类型
 */
export type FileType = 'avatar' | 'resume' | 'logo' | 'license';

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  /** 文件URL */
  fileUrl: string;
  /** 原始文件名 */
  fileName: string;
  /** 文件大小（字节） */
  fileSize: number;
}

/**
 * 文件上传请求参数
 */
export interface FileUploadRequest {
  /** 上传的文件 */
  file: File;
  /** 文件类型 */
  fileType: FileType;
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
  /** 允许添加其他属性 */
  [key: string]: any;
}

// ==================== 全局类型扩展 ====================
/**
 * Window 对象扩展
 * 用于登录页面角色切换状态标记
 */
declare global {
  interface Window {
    /** 是否正在进行角色切换 */
    isSwitchingRole?: boolean;
  }
}
