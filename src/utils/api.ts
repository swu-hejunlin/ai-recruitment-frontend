/**
 * API 服务层
 * 封装所有与后端交互的接口
 */

import request from '@/utils/request';
import type {
  JobSeekerInfo,
  JobSeekerFullInfo,
  UpdateJobSeekerRequest,
  CompanyInfo,
  UpdateCompanyRequest,
  FileUploadResponse,
  FileType,
  WorkExperience,
  AddWorkExperienceRequest,
  UpdateWorkExperienceRequest,
  ProjectExperience,
  AddProjectExperienceRequest,
  UpdateProjectExperienceRequest,
  EducationExperience,
  AddEducationExperienceRequest,
  UpdateEducationExperienceRequest,
  PositionInfo,
  PositionDetail,
  AddPositionRequest,
  UpdatePositionRequest,
  QueryPositionRequest,
  PaginatedResponse,
  EducationLevel,
  ApplicationInfo,
  ApplicationDetail,
  ApplyPositionRequest,
  UpdateApplicationStatusRequest,
  QueryBossApplicationRequest,
  QuerySeekerApplicationRequest,
  PositionFromApplication,
  CompanyFromApplication,
  JobSeekerFromApplication,
  NotificationInfo,
  UnreadNotificationCount,
  QueryNotificationRequest,
  MarkNotificationReadRequest
} from '@/types';

// ==================== 工具函数 ====================
/**
 * 类型断言：响应拦截器返回的是data部分
 */
function toData<T>(promise: Promise<any>): Promise<T> {
  return promise as Promise<T>;
}

// ==================== 求职者 API ====================

/**
 * 获取求职者信息
 */
export const getJobSeekerInfo = () => {
  return toData<JobSeekerInfo>(request.get('/api/job-seeker/info'));
};

/**
 * 更新求职者信息
 */
export const updateJobSeekerInfo = (data: UpdateJobSeekerRequest) => {
  return toData<null>(request.put('/api/job-seeker/update', data));
};

/**
 * 上传头像
 * @param avatarUrl - 头像URL（需先通过文件上传接口获取）
 */
export const uploadAvatar = (avatarUrl: string) => {
  const formData = new FormData();
  formData.append('avatarUrl', avatarUrl);
  
  return toData<null>(request.post('/api/job-seeker/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
};

/**
 * 查看头像
 * 获取当前求职者的头像URL
 */
export const getAvatar = () => {
  return toData<string | null>(request.get('/api/job-seeker/avatar'));
};

/**
 * 上传简历
 * @param resumeUrl - 简历URL（需先通过文件上传接口获取）
 */
export const uploadResume = (resumeUrl: string) => {
  const formData = new FormData();
  formData.append('resumeUrl', resumeUrl);
  
  return toData<null>(request.post('/api/job-seeker/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
};

/**
 * 查看简历
 * 获取当前求职者的简历URL
 */
export const getResume = () => {
  return toData<string | null>(request.get('/api/job-seeker/resume'));
};

// ==================== 企业 API ====================

/**
 * 获取企业信息
 */
export const getCompanyInfo = () => {
  return toData<CompanyInfo>(request.get('/api/company/info'));
};

/**
 * 更新企业信息
 */
export const updateCompanyInfo = (data: UpdateCompanyRequest) => {
  return toData<null>(request.put('/api/company/update', data));
};

/**
 * 上传企业Logo
 * @param logoUrl - Logo URL（需先通过文件上传接口获取）
 */
export const uploadCompanyLogo = (logoUrl: string) => {
  const formData = new FormData();
  formData.append('logoUrl', logoUrl);
  
  return toData<null>(request.post('/api/company/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
};

/**
 * 上传营业执照
 * @param licenseUrl - 营业执照URL（需先通过文件上传接口获取）
 */
export const uploadBusinessLicense = (licenseUrl: string) => {
  const formData = new FormData();
  formData.append('licenseUrl', licenseUrl);
  
  return toData<null>(request.post('/api/company/license', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
};

// ==================== 文件上传 API ====================

/**
 * 上传文件到OSS
 * @param file - 要上传的文件
 * @param fileType - 文件类型
 */
export const uploadFile = (file: File, fileType: FileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  return toData<FileUploadResponse>(request.post('/api/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
};

/**
 * 批量上传文件到OSS
 * @param files - 要上传的文件列表
 * @param fileType - 文件类型
 */
export const uploadFilesBatch = (files: File[], fileType: FileType) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('fileType', fileType);

  return toData<FileUploadResponse[]>(request.post('/api/file/upload-batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }));
};

// ==================== 新增公司详情接口 ====================

/**
 * 根据ID查询公司详情
 * @param id - 公司ID
 */
export const getCompanyById = (id: number) => {
  return toData<CompanyInfo>(request.get(`/api/company/${id}`));
};

/**
 * 删除文件
 * @param fileUrl - 要删除的文件URL
 */
export const deleteFile = (fileUrl: string) => {
  return toData<null>(request.delete('/api/file/delete', { params: { fileUrl } }));
};

// ==================== 工作/实习经历 API ====================

/**
 * 获取工作/实习经历列表
 */
export const getWorkExperiences = () => {
  return toData<WorkExperience[]>(request.get('/api/experience/list'));
};

/**
 * 新增工作/实习经历
 * @param data - 经历数据
 */
export const addWorkExperience = (data: AddWorkExperienceRequest) => {
  return toData<null>(request.post('/api/experience/add', data));
};

/**
 * 更新工作/实习经历
 * @param data - 经历数据
 */
export const updateWorkExperience = (data: UpdateWorkExperienceRequest) => {
  return toData<null>(request.put('/api/experience/update', data));
};

/**
 * 删除工作/实习经历
 * @param id - 经历ID
 */
export const deleteWorkExperience = (id: number) => {
  return toData<null>(request.delete('/api/experience/delete', { params: { id } }));
};

// ==================== 项目经历 API ====================

/**
 * 获取项目经历列表
 */
export const getProjectExperiences = () => {
  return toData<ProjectExperience[]>(request.get('/api/project/list'));
};

/**
 * 新增项目经历
 * @param data - 项目数据
 */
export const addProjectExperience = (data: AddProjectExperienceRequest) => {
  return toData<null>(request.post('/api/project/add', data));
};

/**
 * 更新项目经历
 * @param data - 项目数据
 */
export const updateProjectExperience = (data: UpdateProjectExperienceRequest) => {
  return toData<null>(request.put('/api/project/update', data));
};

/**
 * 删除项目经历
 * @param id - 项目ID
 */
export const deleteProjectExperience = (id: number) => {
  return toData<null>(request.delete('/api/project/delete', { params: { id } }));
};

/**
 * 获取教育经历列表
 */
export const getEducationExperiences = () => {
  return toData<EducationExperience[]>(request.get('/api/education/list'));
};

/**
 * 新增教育经历
 * @param data - 教育经历数据
 */
export const addEducationExperience = (data: AddEducationExperienceRequest) => {
  return toData<null>(request.post('/api/education/add', data));
};

/**
 * 更新教育经历
 * @param data - 教育经历数据
 */
export const updateEducationExperience = (data: UpdateEducationExperienceRequest) => {
  return toData<null>(request.put('/api/education/update', data));
};

/**
 * 删除教育经历
 * @param id - 教育经历ID
 */
export const deleteEducationExperience = (id: number) => {
  return toData<null>(request.delete('/api/education/delete', { params: { id } }));
};

// ==================== 职位模块 API ====================

/**
 * Boss查询自己发布的职位列表
 * @param pageNum - 页码，默认1
 * @param pageSize - 每页数量，默认10
 */
export const getBossPositionList = (pageNum?: number, pageSize?: number) => {
  return toData<PaginatedResponse<PositionInfo>>(
    request.get('/api/position/boss/list', { params: { pageNum, pageSize } })
  );
};

/**
 * 求职者查询职位列表
 * @param params - 查询参数
 */
export const getPositionList = (params?: QueryPositionRequest) => {
  return toData<PaginatedResponse<PositionInfo>>(
    request.get('/api/position/list', { params })
  );
};

/**
 * 查询职位详情
 * @param id - 职位ID
 */
export const getPositionDetail = (id: number) => {
  return toData<PositionDetail>(request.get('/api/position/detail', { params: { id } }));
};

/**
 * 根据公司查询职位
 * @param companyId - 公司ID
 */
export const getPositionsByCompany = (companyId: number) => {
  return toData<PositionInfo[]>(request.get('/api/position/company', { params: { companyId } }));
};

/**
 * 获取职位详情（含公司信息）
 * @param id - 职位ID
 */
export const getPositionDetailWithCompany = (id: number) => {
  return toData<{
    position: PositionInfo;
    company: CompanyInfo;
  }>(request.get('/api/position/detail-with-company', { params: { id } }));
};

/**
 * 获取最新职位列表（首页推荐）
 * @param limit - 返回数量限制，默认10
 */
export const getLatestPositions = (limit?: number) => {
  return toData<PositionInfo[]>(request.get('/api/position/latest', { params: { limit } }));
};

/**
 * 获取热门职位列表（首页推荐）
 * @param limit - 返回数量限制，默认10
 */
export const getHotPositions = (limit?: number) => {
  return toData<PositionInfo[]>(request.get('/api/position/hot', { params: { limit } }));
};

/**
 * 发布新职位
 * @param data - 职位数据
 */
export const addPosition = (data: AddPositionRequest) => {
  return toData<null>(request.post('/api/position/add', data));
};

/**
 * 更新职位信息
 * @param data - 职位数据
 */
export const updatePosition = (data: UpdatePositionRequest) => {
  return toData<null>(request.put('/api/position/update', data));
};

/**
 * 删除职位
 * @param id - 职位ID
 */
export const deletePosition = (id: number) => {
  return toData<null>(request.delete('/api/position/delete', { params: { id } }));
};

/**
 * 关闭职位（停止招聘）
 * @param id - 职位ID
 */
export const closePosition = (id: number) => {
  return toData<null>(request.put('/api/position/close', null, { params: { id } }));
};

/**
 * 开启职位（重新开始招聘）
 * @param id - 职位ID
 */
export const openPosition = (id: number) => {
  return toData<null>(request.put('/api/position/open', null, { params: { id } }));
};

// ==================== 投递 API ====================

/**
 * 投递简历
 * @param data - 投递请求数据
 */
export const applyPosition = (data: ApplyPositionRequest) => {
  // 创建URLSearchParams对象来处理form-data
  const formData = new URLSearchParams();
  formData.append('positionId', data.positionId.toString());
  
  return toData<null>(request.post('/api/application/apply', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }));
};

/**
 * Boss查询收到的投递列表
 * @param params - 查询参数
 */
export const getBossApplications = (params?: QueryBossApplicationRequest) => {
  return toData<PaginatedResponse<ApplicationInfo>>(
    request.get('/api/application/boss/list', { params })
  );
};

/**
 * 求职者查询投递列表
 * @param params - 查询参数
 */
export const getSeekerApplications = (params?: QuerySeekerApplicationRequest) => {
  return toData<PaginatedResponse<ApplicationInfo>>(
    request.get('/api/application/seeker/list', { params })
  );
};

/**
 * 查看投递详情
 * @param id - 投递记录ID
 */
export const getApplicationDetail = (id: number) => {
  return toData<ApplicationDetail>(request.get('/api/application/detail', { params: { id } }));
};

/**
 * 根据投递记录查看职位信息
 * @param id - 投递记录ID
 */
export const getPositionFromApplication = (id: number) => {
  return toData<PositionFromApplication>(request.get('/api/application/position', { params: { id } }));
};

/**
 * 根据投递记录查看公司信息
 * @param id - 投递记录ID
 */
export const getCompanyFromApplication = (id: number) => {
  return toData<CompanyFromApplication>(request.get('/api/application/company', { params: { id } }));
};

/**
 * BOSS查看求职者简要信息
 * @param id - 投递记录ID
 */
export const getJobSeekerSimpleFromApplication = (id: number) => {
  return toData<JobSeekerFromApplication>(request.get('/api/application/job-seeker/simple', { params: { id } }));
};

/**
 * BOSS查看求职者信息（简历）- 兼容旧版本
 * @deprecated 使用 getJobSeekerSimpleFromApplication 替代
 * @param id - 投递记录ID
 */
export const getJobSeekerFromApplication = (id: number) => {
  return getJobSeekerSimpleFromApplication(id);
};

/**
 * BOSS查看求职者完整在线简历
 * @param id - 投递记录ID
 */
export const getJobSeekerFullResume = (id: number) => {
  return toData<JobSeekerFullInfo>(request.get('/api/application/job-seeker/resume', { params: { id } }));
};

/**
 * 标记简历为已查看
 * @param id - 投递记录ID
 */
export const markApplicationAsRead = (id: number) => {
  return toData<null>(request.put('/api/application/read', null, { params: { id } }));
};

/**
 * 更新投递状态
 * @param params - 更新参数（id和status）
 */
export const updateApplicationStatus = (params: UpdateApplicationStatusRequest) => {
  return toData<null>(request.put('/api/application/status', null, { params }));
};

// ==================== 通知 API ====================

/**
 * 获取通知列表
 * @param params - 查询参数
 */
export const getNotifications = (params?: QueryNotificationRequest) => {
  return toData<PaginatedResponse<NotificationInfo>>(
    request.get('/api/notification/list', { params })
  );
};

/**
 * 获取未读通知数量
 */
export const getUnreadNotificationCount = () => {
  return toData<UnreadNotificationCount>(request.get('/api/notification/unread-count'));
};

/**
 * 标记通知为已读
 * @param params - 通知ID
 */
export const markNotificationRead = (params: MarkNotificationReadRequest) => {
  return toData<null>(request.put('/api/notification/read', null, { params }));
};

/**
 * 标记通知为已读（简化版本）
 * @param id - 通知ID
 */
export const markAsRead = (id: number) => {
  return toData<null>(request.put('/api/notification/read', null, { params: { id } }));
};

/**
 * 标记所有通知为已读
 */
export const markAllNotificationsRead = () => {
  return toData<null>(request.put('/api/notification/read-all'));
};

/**
 * 标记所有通知为已读（简化版本）
 */
export const markAllAsRead = () => {
  return toData<null>(request.put('/api/notification/read-all'));
};

// ==================== 面试 API ====================

/**
 * 创建面试邀请
 * @param data - 面试请求数据
 */
export const createInterview = (data: { applicationId: number; interviewTime: string; interviewType: number; interviewAddress?: string; interviewLink?: string; remark?: string }) => {
  return toData<number>(request.post('/api/interview/create', data));
};

/**
 * 更新面试状态
 * @param id - 面试ID
 * @param status - 面试状态
 */
export const updateInterviewStatus = (id: number, status: number) => {
  return toData<null>(request.put(`/api/interview/${id}/status`, null, { params: { status } }));
};

/**
 * 获取企业HR的面试列表
 */
export const getCompanyInterviews = () => {
  return toData<any[]>(request.get('/api/interview/company/list'));
};

/**
 * 获取求职者的面试列表
 */
export const getJobSeekerInterviews = () => {
  return toData<any[]>(request.get('/api/interview/job-seeker/list'));
};

/**
 * 获取面试详情
 * @param id - 面试ID
 */
export const getInterviewDetail = (id: number) => {
  return toData<any>(request.get(`/api/interview/${id}`));
};

/**
 * 删除面试
 * @param id - 面试ID
 */
export const deleteInterview = (id: number) => {
  return toData<null>(request.delete(`/api/interview/${id}`));
};

// ==================== 收藏 API ====================

/**
 * 添加收藏
 * @param targetType - 收藏类型：1-职位，2-公司，3-求职者
 * @param targetId - 目标ID
 */
export const addFavorite = (targetType: number, targetId: number) => {
  return toData<null>(request.post('/api/favorite/add', null, { params: { targetType, targetId } }));
};

/**
 * 取消收藏
 * @param targetType - 收藏类型：1-职位，2-公司，3-求职者
 * @param targetId - 目标ID
 */
export const removeFavorite = (targetType: number, targetId: number) => {
  return toData<null>(request.delete('/api/favorite/remove', { params: { targetType, targetId } }));
};

/**
 * 获取收藏列表
 * @param targetType - 收藏类型：1-职位，2-公司，3-求职者
 */
export const getFavorites = (targetType: number) => {
  return toData<any[]>(request.get('/api/favorite/list', { params: { targetType } }));
};

/**
 * 检查是否已收藏
 * @param targetType - 收藏类型：1-职位，2-公司，3-求职者
 * @param targetId - 目标ID
 */
export const checkFavorite = (targetType: number, targetId: number) => {
  return toData<{ isFavorite: boolean }>(request.get('/api/favorite/check', { params: { targetType, targetId } }));
};
