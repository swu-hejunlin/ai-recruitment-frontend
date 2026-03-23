/**
 * API 服务层
 * 封装所有与后端交互的接口
 */

import request from '@/utils/request';
import type {
  JobSeekerInfo,
  UpdateJobSeekerRequest,
  CompanyInfo,
  UpdateCompanyRequest,
  FileUploadResponse,
  FileType
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

/**
 * 删除文件
 * @param fileUrl - 要删除的文件URL
 */
export const deleteFile = (fileUrl: string) => {
  return toData<null>(request.delete('/api/file/delete', { params: { fileUrl } }));
};
