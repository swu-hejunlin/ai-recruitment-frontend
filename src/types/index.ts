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
 * 求职者基本信息（单独更新时使用）
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
  /** 电话 */
  phone: string;
  /** 头像URL */
  avatar: string;
  /** 邮箱地址 */
  email: string;
  /** 年龄 */
  age: number;
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
 * 完整的求职者信息响应（包含个人信息、教育经历、工作经历、项目经历）
 */
export interface JobSeekerFullInfo {
  /** 求职者基本信息 */
  jobSeeker: JobSeekerInfo;
  /** 教育经历列表 */
  educations: EducationExperience[];
  /** 工作/实习经历列表 */
  experiences: WorkExperience[];
  /** 项目经历列表 */
  projects: ProjectExperience[];
}

/**
 * 求职者信息更新请求
 */
export interface UpdateJobSeekerRequest {
  /** 求职者ID */
  id: number;
  /** 姓名 */
  name: string;
  /** 电话 */
  phone?: string;
  /** 性别 */
  gender?: Gender;
  /** 邮箱地址 */
  email?: string;
  /** 年龄 */
  age?: number;
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

// ==================== 工作/实习经历相关类型 ====================
/**
 * 工作/实习经历信息
 */
export interface WorkExperience {
  /** 经历ID */
  id: number;
  /** 求职者ID */
  jobSeekerId: number;
  /** 公司名称 */
  companyName: string;
  /** 公司行业 */
  companyIndustry: string;
  /** 职位 */
  position: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate: string;
  /** 工作描述 */
  description: string;
  /** 是否为实习经历：0-否，1-是 */
  isInternship: 0 | 1;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 新增工作/实习经历请求
 */
export interface AddWorkExperienceRequest {
  /** 公司名称 */
  companyName: string;
  /** 公司行业 */
  companyIndustry?: string;
  /** 职位 */
  position: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate?: string;
  /** 工作描述 */
  description?: string;
  /** 是否为实习经历：0-否，1-是 */
  isInternship: 0 | 1;
}

/**
 * 更新工作/实习经历请求
 */
export interface UpdateWorkExperienceRequest {
  /** 经历ID */
  id: number;
  /** 公司名称 */
  companyName: string;
  /** 公司行业 */
  companyIndustry?: string;
  /** 职位 */
  position: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate?: string;
  /** 工作描述 */
  description?: string;
  /** 是否为实习经历：0-否，1-是 */
  isInternship: 0 | 1;
}

// ==================== 项目经历相关类型 ====================
/**
 * 项目经历信息
 */
export interface ProjectExperience {
  /** 项目ID */
  id: number;
  /** 求职者ID */
  jobSeekerId: number;
  /** 项目名称 */
  projectName: string;
  /** 项目角色 */
  projectRole: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate: string;
  /** 项目描述 */
  description: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

// ==================== 教育经历相关类型 ====================
/**
 * 教育经历信息
 */
export interface EducationExperience {
  /** 教育经历ID */
  id: number;
  /** 求职者ID */
  jobSeekerId: number;
  /** 学校名称 */
  schoolName: string;
  /** 专业 */
  major: string;
  /** 学历层次 */
  educationLevel: EducationLevel;
  /** 入学时间 */
  startDate: string;
  /** 毕业时间 */
  endDate: string;
  /** 在校经历描述 */
  description: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 新增教育经历请求
 */
export interface AddEducationExperienceRequest {
  /** 学校名称 */
  schoolName: string;
  /** 专业 */
  major?: string;
  /** 学历层次 */
  educationLevel: EducationLevel;
  /** 入学时间 */
  startDate?: string;
  /** 毕业时间 */
  endDate?: string;
  /** 在校经历描述 */
  description?: string;
}

/**
 * 更新教育经历请求
 */
export interface UpdateEducationExperienceRequest {
  /** 教育经历ID */
  id: number;
  /** 学校名称 */
  schoolName: string;
  /** 专业 */
  major?: string;
  /** 学历层次 */
  educationLevel: EducationLevel;
  /** 入学时间 */
  startDate?: string;
  /** 毕业时间 */
  endDate?: string;
  /** 在校经历描述 */
  description?: string;
}

/**
 * 新增项目经历请求
 */
export interface AddProjectExperienceRequest {
  /** 项目名称 */
  projectName: string;
  /** 项目角色 */
  projectRole: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate?: string;
  /** 项目描述 */
  description?: string;
}

/**
 * 更新项目经历请求
 */
export interface UpdateProjectExperienceRequest {
  /** 项目ID */
  id: number;
  /** 项目名称 */
  projectName: string;
  /** 项目角色 */
  projectRole: string;
  /** 开始时间 */
  startDate: string;
  /** 结束时间 */
  endDate?: string;
  /** 项目描述 */
  description?: string;
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

// ==================== 职位模块相关类型 ====================

/**
 * 城市选项列表
 */
export const CITY_OPTIONS = [
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '广州', label: '广州' },
  { value: '深圳', label: '深圳' },
  { value: '杭州', label: '杭州' },
  { value: '成都', label: '成都' },
  { value: '武汉', label: '武汉' },
  { value: '西安', label: '西安' },
  { value: '南京', label: '南京' },
  { value: '重庆', label: '重庆' },
  { value: '天津', label: '天津' },
  { value: '苏州', label: '苏州' },
  { value: '郑州', label: '郑州' },
  { value: '长沙', label: '长沙' },
  { value: '东莞', label: '东莞' },
  { value: '青岛', label: '青岛' },
  { value: '沈阳', label: '沈阳' },
  { value: '宁波', label: '宁波' },
  { value: '昆明', label: '昆明' },
  { value: '大连', label: '大连' },
  { value: '厦门', label: '厦门' },
  { value: '福州', label: '福州' },
  { value: '济南', label: '济南' },
  { value: '温州', label: '温州' },
  { value: '长春', label: '长春' },
  { value: '哈尔滨', label: '哈尔滨' },
  { value: '石家庄', label: '石家庄' },
  { value: '合肥', label: '合肥' },
  { value: '南昌', label: '南昌' },
  { value: '贵阳', label: '贵阳' },
  { value: '南宁', label: '南宁' },
  { value: '太原', label: '太原' },
  { value: '嘉兴', label: '嘉兴' },
  { value: '佛山', label: '佛山' },
  { value: '无锡', label: '无锡' },
  { value: '常州', label: '常州' },
  { value: '徐州', label: '徐州' },
  { value: '南通', label: '南通' },
  { value: '烟台', label: '烟台' },
  { value: '珠海', label: '珠海' },
  { value: '中山', label: '中山' },
  { value: '惠州', label: '惠州' },
  { value: '泉州', label: '泉州' },
  { value: '绍兴', label: '绍兴' },
  { value: '金华', label: '金华' },
  { value: '台州', label: '台州' },
  { value: '潍坊', label: '潍坊' },
  { value: '临沂', label: '临沂' },
  { value: '扬州', label: '扬州' },
  { value: '镇江', label: '镇江' }
];

/**
 * 职位类别选项列表
 */
export const CATEGORY_OPTIONS = [
  {
    value: '技术',
    label: '技术',
    children: [
      { value: '后端开发', label: '后端开发' },
      { value: '前端开发', label: '前端开发' },
      { value: '移动开发', label: '移动开发' },
      { value: '测试工程师', label: '测试工程师' },
      { value: '运维工程师', label: '运维工程师' },
      { value: '数据开发', label: '数据开发' },
      { value: '人工智能', label: '人工智能' },
      { value: '产品经理', label: '产品经理' }
    ]
  },
  {
    value: '产品',
    label: '产品',
    children: [
      { value: '产品经理', label: '产品经理' },
      { value: '产品设计师', label: '产品设计师' },
      { value: '用户研究', label: '用户研究' }
    ]
  },
  {
    value: '设计',
    label: '设计',
    children: [
      { value: 'UI设计师', label: 'UI设计师' },
      { value: '交互设计师', label: '交互设计师' },
      { value: '平面设计师', label: '平面设计师' }
    ]
  },
  {
    value: '运营',
    label: '运营',
    children: [
      { value: '产品运营', label: '产品运营' },
      { value: '内容运营', label: '内容运营' },
      { value: '用户运营', label: '用户运营' },
      { value: '活动运营', label: '活动运营' },
      { value: '新媒体运营', label: '新媒体运营' }
    ]
  },
  {
    value: '市场',
    label: '市场',
    children: [
      { value: '市场推广', label: '市场推广' },
      { value: '市场营销', label: '市场营销' },
      { value: '品牌公关', label: '品牌公关' },
      { value: '销售', label: '销售' }
    ]
  },
  {
    value: '职能',
    label: '职能',
    children: [
      { value: '人力资源', label: '人力资源' },
      { value: '行政', label: '行政' },
      { value: '财务', label: '财务' },
      { value: '法务', label: '法务' }
    ]
  },
  {
    value: '金融',
    label: '金融',
    children: [
      { value: '投资', label: '投资' },
      { value: '风控', label: '风控' },
      { value: '审计', label: '审计' }
    ]
  }
];

/**
 * 职位状态枚举
 * 0: 已关闭 (招聘停止)
 * 1: 已发布 (招聘中)
 */
export type PositionStatus = 0 | 1;

/**
 * 职位状态映射
 */
export const POSITION_STATUS_MAP: Record<PositionStatus, string> = {
  0: '已关闭',
  1: '招聘中'
};

/**
 * 职位基本信息（列表/简略展示）
 */
export interface PositionInfo {
  /** 职位ID */
  id: number;
  /** 公司ID */
  companyId: number;
  /** 公司简称 */
  companyShortName?: string;
  /** 公司名称 */
  companyName?: string;
  /** 公司Logo */
  companyLogo?: string;
  /** 职位名称 */
  title: string;
  /** 职位类别 */
  category: string;
  /** 工作城市 */
  city: string;
  /** 详细工作地址 */
  address?: string;
  /** 最低薪资（K） */
  salaryMin: number;
  /** 最高薪资（K） */
  salaryMax: number;
  /** 最低学历要求 */
  educationMin: EducationLevel;
  /** 最低工作年限要求 */
  workYearsMin: number;
  /** 岗位职责 */
  description: string;
  /** 任职要求 */
  requirement: string;
  /** 职位状态 */
  status: PositionStatus;
  /** 福利标签（JSON数组格式） */
  tags: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 职位详情（包含完整的公司和职位信息）
 */
export interface PositionDetail extends PositionInfo {
  /** BOSS用户ID */
  bossId: number;
}

/**
 * 发布职位请求参数
 */
export interface AddPositionRequest {
  /** 公司ID */
  companyId: number;
  /** 职位名称 */
  title: string;
  /** 职位类别 */
  category: string;
  /** 工作城市 */
  city: string;
  /** 详细工作地址 */
  address?: string;
  /** 最低薪资（K） */
  salaryMin?: number;
  /** 最高薪资（K） */
  salaryMax?: number;
  /** 最低学历要求 */
  educationMin?: EducationLevel;
  /** 最低工作年限要求 */
  workYearsMin?: number;
  /** 岗位职责 */
  description: string;
  /** 任职要求 */
  requirement: string;
  /** 福利标签（JSON数组格式） */
  tags?: string;
}

/**
 * 更新职位请求参数
 */
export interface UpdatePositionRequest {
  /** 职位ID */
  id: number;
  /** 公司ID */
  companyId: number;
  /** 职位名称 */
  title: string;
  /** 职位类别 */
  category: string;
  /** 工作城市 */
  city?: string;
  /** 最低薪资（K） */
  salaryMin?: number;
  /** 最高薪资（K） */
  salaryMax?: number;
  /** 最低学历要求 */
  educationMin?: EducationLevel;
  /** 最低工作年限要求 */
  workYearsMin?: number;
  /** 岗位职责 */
  description: string;
  /** 任职要求 */
  requirement: string;
  /** 福利标签（JSON数组格式） */
  tags?: string;
}

/**
 * 查询职位列表请求参数
 */
export interface QueryPositionRequest {
  /** 职位名称（模糊搜索） */
  title?: string;
  /** 工作城市 */
  city?: string;
  /** 职位类别 */
  category?: string;
  /** 最低学历要求 */
  educationMin?: EducationLevel;
  /** 工作年限要求 */
  workYearsMin?: number;
  /** 薪资范围最小值 */
  salaryMin?: number;
  /** 薪资范围最大值 */
  salaryMax?: number;
  /** 搜索范围 */
  searchType?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  records: T[];
  /** 总记录数 */
  total: number;
  /** 每页数量 */
  size: number;
  /** 当前页码 */
  current: number;
  /** 总页数 */
  pages: number;
}

/**
 * 求职者职位信息（用于职位发现页面）
 */
export interface JobInfo {
  /** 职位ID */
  id: number;
  /** 职位名称 */
  title: string;
  /** 公司名称 */
  company: string;
  /** 工作地点 */
  location: string;
  /** 薪资范围 */
  salary: string;
  /** 学历要求 */
  education: string;
  /** 经验要求 */
  experience: string;
  /** 职位类别 */
  category: string;
  /** 发布时间 */
  publishTime: string;
  /** 岗位职责 */
  description: string;
  /** 任职要求 */
  requirement: string;
  /** 职位标签 */
  tags?: string[];
  /** 是否热门 */
  isHot?: boolean;
  /** 是否急招 */
  isUrgent?: boolean;
  /** 详细地址 */
  address?: string;
  /** 公司规模 */
  companySize?: string;
  /** 公司行业 */
  industry?: string;
  /** 公司介绍 */
  companyIntro?: string;
  /** 福利待遇 */
  benefits?: string[];
  /** 职位状态：0-已关闭，1-招聘中 */
  status: number;
}

// ==================== 投递相关类型 ====================
/**
 * 投递状态枚举
 * 1: 待查看
 * 2: 已查看
 * 3: 面试中
 * 4: 不合适
 * 5: 录用
 */
export type ApplicationStatus = 1 | 2 | 3 | 4 | 5;

/**
 * 投递状态映射
 */
export const APPLICATION_STATUS_MAP: Record<ApplicationStatus, string> = {
  1: '待查看',
  2: '已查看',
  3: '面试中',
  4: '不合适',
  5: '录用'
};

/**
 * 投递记录基本信息
 */
export interface ApplicationInfo {
  /** 投递记录ID */
  id: number;
  /** 求职者ID */
  jobSeekerId: number;
  /** 职位ID */
  positionId: number;
  /** 公司ID */
  companyId: number;
  /** BOSS用户ID */
  bossId: number;
  /** 投递状态 */
  status: ApplicationStatus;
  /** AI匹配分数 */
  aiScore?: number | null;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 求职者姓名 */
  jobSeekerName?: string;
  /** 职位标题 */
  positionTitle?: string;
  /** 公司名称 */
  companyName?: string;
  /** 职位详情 */
  position?: PositionInfo;
  /** 求职者详情 */
  jobSeeker?: JobSeekerInfo;
}

/**
 * 投递详情（包含完整的职位和求职者信息）
 */
export interface ApplicationDetail {
  /** 投递记录 */
  application: ApplicationInfo;
}

/**
 * 投递简历请求参数
 */
export interface ApplyPositionRequest {
  /** 职位ID */
  positionId: number;
}

/**
 * 更新投递状态请求参数
 */
export interface UpdateApplicationStatusRequest {
  /** 投递记录ID */
  id: number;
  /** 新状态 */
  status: ApplicationStatus;
}

/**
 * 查询Boss投递列表请求参数
 */
export interface QueryBossApplicationRequest {
  /** 投递状态筛选 */
  status?: ApplicationStatus;
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 查询求职者投递列表请求参数
 */
export interface QuerySeekerApplicationRequest {
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

// ==================== 通知相关类型 ====================
/**
 * 通知类型枚举
 * 1: 新投递提醒
 * 2: 面试状态变更
 * 3: 系统公告
 */
export type NotificationType = 1 | 2 | 3;

/**
 * 通知信息
 */
export interface NotificationInfo {
  /** 通知ID */
  id: number;
  /** 接收者用户ID */
  receiverId: number;
  /** 通知类型 */
  type: NotificationType;
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 业务ID（如投递ID） */
  businessId: number;
  /** 是否已读：0-未读，1-已读 */
  isRead: number;
  /** 创建时间 */
  createTime: string;
}

/**
 * 未读通知数量
 */
export interface UnreadNotificationCount {
  /** 未读通知数量 */
  count: number;
}

/**
 * 查询通知列表请求参数
 */
export interface QueryNotificationRequest {
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 标记通知为已读请求参数
 */
export interface MarkNotificationReadRequest {
  /** 通知ID */
  id: number;
}

// ==================== 新增投递相关详情类型 ====================

/**
 * 通过投递记录查看的简化职位信息
 */
export interface PositionFromApplication {
  /** 职位ID */
  id: number;
  /** 职位名称 */
  title: string;
  /** 职位类别 */
  category: string;
  /** 工作城市 */
  city: string;
  /** 最低薪资（K） */
  salaryMin: number;
  /** 最高薪资（K） */
  salaryMax: number;
  /** 岗位职责 */
  description: string;
  /** 任职要求 */
  requirement: string;
}

/**
 * 通过投递记录查看的简化公司信息
 */
export interface CompanyFromApplication {
  /** 公司ID */
  id: number;
  /** 公司名称 */
  companyName: string;
  /** 公司logo */
  logo: string;
  /** 所属行业 */
  industry: string;
  /** 企业规模 */
  scale: CompanyScale;
  /** 所在城市 */
  city: string;
  /** 公司简介 */
  description: string;
}

/**
 * BOSS通过投递记录查看的求职者信息
 */
export interface JobSeekerFromApplication {
  /** 求职者ID */
  id: number;
  /** 姓名 */
  name: string;
  /** 性别 */
  gender: Gender;
  /** 头像URL */
  avatar: string;
  /** 电话 */
  phone: string;
  /** 邮箱 */
  email: string;
  /** 年龄 */
  age: number;
  /** 工作年限 */
  workYears: number;
  /** 所在城市 */
  city: string;
  /** 个人简介 */
  introduction: string;
  /** 技能标签（JSON数组格式） */
  skills: string;
  /** 简历附件URL */
  resumeUrl: string;
  /** 创建时间 */
  createTime: string;
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

// ==================== 画像相关类型 ====================
export interface JobProfileResponse {
  id: number;
  positionId: number;
  skills: string;
  educationRequire: string;
  experienceRequire: string;
  salaryMin: number;
  salaryMax: number;
  jobTags: string;
  descriptionSummary: string;
  responsibilitiesSummary: string;
  requirementsSummary: string;
  companyBenefits: string;
  matchKeywords: string;
  embeddingVector: string;
}

export interface TalentProfileResponse {
  id: number;
  userId: number;
  skills: string;
  education: string;
  workYears: number;
  salaryExpectation: number;
  currentSalary: number;
  talentTags: string;
  descriptionSummary: string;
  strengthsSummary: string;
  careerGoals: string;
  matchKeywords: string;
  aiEvaluation: string;
  embeddingVector: string;
}

// ==================== 推荐相关类型 ====================
export interface JobRecommendResponse {
  id: number;
  positionId: number;
  matchScore: number;
  skillMatchRate: number;
  experienceMatchRate: number;
  educationMatchRate: number;
  salaryMatchRate: number;
  matchDetails: string;
  position: PositionInfo;
}

export interface TalentRecommendResponse {
  id: number;
  userId: number;
  positionId: number;
  matchScore: number;
  skillMatchRate: number;
  experienceMatchRate: number;
  educationMatchRate: number;
  salaryMatchRate: number;
  matchDetails: string;
  jobSeeker: JobSeekerInfo;
}

// ==================== 面试相关类型 ====================
export interface InterviewInfo {
  id: number;
  applicationId: number;
  jobSeekerId: number;
  positionId: number;
  companyId: number;
  interviewTime: string;
  interviewType: number;
  interviewAddress: string;
  interviewLink: string;
  status: number;
  remark: string;
  aiScore: number;
  aiEvaluation: string;
  createTime: string;
  updateTime: string;
}

export interface InterviewDetail extends InterviewInfo {
  positionTitle: string;
  companyName: string;
  jobSeekerName: string;
}

export interface MockInterviewResponse {
  interviewId: number;
  sessionKey: string;
  questions: string[];
}

export interface SmartFillResponse {
  success: boolean;
  errorMessage?: string;
  name?: string;
  gender?: number;
  age?: number;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  workYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  currentStatus?: number;
  introduction?: string;
  skills?: string[];
  unfilledFields?: string[];
}

export interface InterviewEvaluationData {
  score: number;
  languageScore: number;
  logicScore: number;
  professionalScore: number;
  evaluationText: string;
  suggestions: string[];
  dimensions: { name: string; score: number; comment: string }[];
  summary: string;
}

// ==================== 统计相关类型 ====================
export interface SeekerStatistics {
  totalPositions: number;
  todayNewPositions: number;
  myApplications: number;
  myInterviews: number;
  hotCities: { city: string; count: number; percentage: number }[];
  hotCategories: { category: string; count: number; percentage: number }[];
  competitionIndex: number;
  highSalaryPercentage: number;
}

export interface BossStatistics {
  myPositions: number;
  myApplications: number;
  pendingApplications: number;
  interviewingCount: number;
  hiredCount: number;
  rejectedCount: number;
  conversionRate: number;
  positionStats: { positionTitle: string; applicationCount: number; conversionRate: number }[];
}

export interface WordCloudData {
  skills: { name: string; value: number }[];
  positions: { name: string; value: number }[];
  requirements: { name: string; value: number }[];
}
