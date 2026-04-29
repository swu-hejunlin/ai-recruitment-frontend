import request from '@/utils/request';
import type {
  JobSeekerInfo, JobSeekerFullInfo, UpdateJobSeekerRequest,
  CompanyInfo, UpdateCompanyRequest,
  FileUploadResponse, FileType,
  WorkExperience, AddWorkExperienceRequest, UpdateWorkExperienceRequest,
  ProjectExperience, AddProjectExperienceRequest, UpdateProjectExperienceRequest,
  EducationExperience, AddEducationExperienceRequest, UpdateEducationExperienceRequest,
  PositionInfo, PositionDetail, AddPositionRequest, UpdatePositionRequest,
  QueryPositionRequest, PaginatedResponse,
  ApplicationInfo, ApplicationDetail, ApplyPositionRequest,
  UpdateApplicationStatusRequest, QueryBossApplicationRequest, QuerySeekerApplicationRequest,
  PositionFromApplication, CompanyFromApplication, JobSeekerFromApplication,
  NotificationInfo, UnreadNotificationCount, QueryNotificationRequest, MarkNotificationReadRequest,
  JobProfileResponse, TalentProfileResponse,
  JobRecommendResponse, TalentRecommendResponse,
  InterviewInfo, InterviewDetail, MockInterviewResponse, InterviewEvaluationData,
  SeekerStatistics, BossStatistics, WordCloudData,
  SmartFillResponse
} from '@/types';

function toData<T>(promise: Promise<T>): Promise<T> {
  return promise;
}

export const getJobSeekerInfo = () => toData<JobSeekerFullInfo>(request.get('/api/job-seeker/info'));

export const updateJobSeekerInfo = (data: UpdateJobSeekerRequest) => toData<null>(request.put('/api/job-seeker/update', data));

export const uploadAvatar = (avatarUrl: string) => {
  const formData = new FormData();
  formData.append('avatarUrl', avatarUrl);
  return toData<null>(request.post('/api/job-seeker/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

export const getAvatar = () => toData<string | null>(request.get('/api/job-seeker/avatar'));

export const uploadResume = (resumeUrl: string) => {
  const formData = new FormData();
  formData.append('resumeUrl', resumeUrl);
  return toData<null>(request.post('/api/job-seeker/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

export const getResume = () => toData<string | null>(request.get('/api/job-seeker/resume'));

export const getCompanyInfo = () => toData<CompanyInfo>(request.get('/api/company/info'));

export const updateCompanyInfo = (data: UpdateCompanyRequest) => toData<null>(request.put('/api/company/update', data));

export const uploadCompanyLogo = (logoUrl: string) => {
  const formData = new FormData();
  formData.append('logoUrl', logoUrl);
  return toData<null>(request.post('/api/company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

export const uploadBusinessLicense = (licenseUrl: string) => {
  const formData = new FormData();
  formData.append('licenseUrl', licenseUrl);
  return toData<null>(request.post('/api/company/license', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

export const uploadFile = (file: File, fileType: FileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  return toData<FileUploadResponse>(request.post('/api/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

export const uploadFilesBatch = (files: File[], fileType: FileType) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('fileType', fileType);
  return toData<FileUploadResponse[]>(request.post('/api/file/upload-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

export const getCompanyById = (id: number) => toData<CompanyInfo>(request.get(`/api/company/${id}`));

export const deleteFile = (fileUrl: string) => toData<null>(request.delete('/api/file/delete', { params: { fileUrl } }));

export const getWorkExperiences = () => toData<WorkExperience[]>(request.get('/api/experience/list'));

export const addWorkExperience = (data: AddWorkExperienceRequest) => toData<null>(request.post('/api/experience/add', data));

export const updateWorkExperience = (data: UpdateWorkExperienceRequest) => toData<null>(request.put('/api/experience/update', data));

export const deleteWorkExperience = (id: number) => toData<null>(request.delete('/api/experience/delete', { params: { id } }));

export const getProjectExperiences = () => toData<ProjectExperience[]>(request.get('/api/project/list'));

export const addProjectExperience = (data: AddProjectExperienceRequest) => toData<null>(request.post('/api/project/add', data));

export const updateProjectExperience = (data: UpdateProjectExperienceRequest) => toData<null>(request.put('/api/project/update', data));

export const deleteProjectExperience = (id: number) => toData<null>(request.delete('/api/project/delete', { params: { id } }));

export const getEducationExperiences = () => toData<EducationExperience[]>(request.get('/api/education/list'));

export const addEducationExperience = (data: AddEducationExperienceRequest) => toData<null>(request.post('/api/education/add', data));

export const updateEducationExperience = (data: UpdateEducationExperienceRequest) => toData<null>(request.put('/api/education/update', data));

export const deleteEducationExperience = (id: number) => toData<null>(request.delete('/api/education/delete', { params: { id } }));

export const getBossPositionList = (pageNum?: number, pageSize?: number) => toData<PaginatedResponse<PositionInfo>>(
  request.get('/api/position/boss/list', { params: { pageNum, pageSize } })
);

export const getPositionList = (params?: QueryPositionRequest) => toData<PaginatedResponse<PositionInfo>>(
  request.get('/api/position/list', { params })
);

export const getPositionDetail = (id: number) => toData<PositionDetail>(request.get('/api/position/detail', { params: { id } }));

export const getPositionsByCompany = (companyId: number) => toData<PositionInfo[]>(request.get('/api/position/company', { params: { companyId } }));

export const getPositionDetailWithCompany = (id: number) => toData<{ position: PositionInfo; company: CompanyInfo }>(
  request.get('/api/position/detail-with-company', { params: { id } })
);

export const getLatestPositions = (limit?: number) => toData<PositionInfo[]>(request.get('/api/position/latest', { params: { limit } }));

export const getHotPositions = (limit?: number) => toData<PositionInfo[]>(request.get('/api/position/hot', { params: { limit } }));

export const addPosition = (data: AddPositionRequest) => toData<null>(request.post('/api/position/add', data));

export const updatePosition = (data: UpdatePositionRequest) => toData<null>(request.put('/api/position/update', data));

export const deletePosition = (id: number) => toData<null>(request.delete('/api/position/delete', { params: { id } }));

export const closePosition = (id: number) => toData<null>(request.put('/api/position/close', null, { params: { id } }));

export const openPosition = (id: number) => toData<null>(request.put('/api/position/open', null, { params: { id } }));

export const applyPosition = (data: ApplyPositionRequest) => {
  const formData = new URLSearchParams();
  formData.append('positionId', data.positionId.toString());
  return toData<null>(request.post('/api/application/apply', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }));
};

export const getBossApplications = (params?: QueryBossApplicationRequest) => toData<PaginatedResponse<ApplicationInfo>>(
  request.get('/api/application/boss/list', { params })
);

export const getSeekerApplications = (params?: QuerySeekerApplicationRequest) => toData<PaginatedResponse<ApplicationInfo>>(
  request.get('/api/application/seeker/list', { params })
);

export const getApplicationDetail = (id: number) => toData<ApplicationDetail>(request.get('/api/application/detail', { params: { id } }));

export const getPositionFromApplication = (id: number) => toData<PositionFromApplication>(request.get('/api/application/position', { params: { id } }));

export const getCompanyFromApplication = (id: number) => toData<CompanyFromApplication>(request.get('/api/application/company', { params: { id } }));

export const getJobSeekerSimpleFromApplication = (id: number) => toData<JobSeekerFromApplication>(request.get('/api/application/job-seeker/simple', { params: { id } }));

export const getJobSeekerFromApplication = (id: number) => getJobSeekerSimpleFromApplication(id);

export const getJobSeekerFullResume = (id: number) => toData<JobSeekerFullInfo>(request.get('/api/application/job-seeker/resume', { params: { id } }));

export const markApplicationAsRead = (id: number) => toData<null>(request.put('/api/application/read', null, { params: { id } }));

export const updateApplicationStatus = (params: UpdateApplicationStatusRequest) => toData<null>(request.put('/api/application/status', null, { params }));

export const getNotifications = (params?: QueryNotificationRequest) => toData<PaginatedResponse<NotificationInfo>>(
  request.get('/api/notification/list', { params })
);

export const getUnreadNotificationCount = () => toData<UnreadNotificationCount>(request.get('/api/notification/unread-count'));

export const markNotificationRead = (params: MarkNotificationReadRequest) => toData<null>(request.put('/api/notification/read', null, { params }));

export const markAllNotificationsRead = () => toData<null>(request.put('/api/notification/read-all'));

export const createInterview = (data: {
  applicationId: number; interviewTime: string; interviewType: number;
  interviewAddress?: string; interviewLink?: string; remark?: string
}) => toData<number>(request.post('/api/interview/create', data));

export const updateInterviewStatus = (id: number, status: number) => toData<null>(request.put(`/api/interview/${id}/status`, null, { params: { status } }));

export const getCompanyInterviews = () => toData<InterviewInfo[]>(request.get('/api/interview/company/list'));

export const getJobSeekerInterviews = () => toData<InterviewInfo[]>(request.get('/api/interview/job-seeker/list'));

export const getInterviewDetail = (id: number) => toData<InterviewDetail>(request.get(`/api/interview/${id}`));

export const deleteInterview = (id: number) => toData<null>(request.delete(`/api/interview/${id}`));

export const addFavorite = (targetType: number, targetId: number) => toData<null>(request.post('/api/favorite/add', null, { params: { targetType, targetId } }));

export const removeFavorite = (targetType: number, targetId: number) => toData<null>(request.delete('/api/favorite/remove', { params: { targetType, targetId } }));

export const getFavorites = (targetType: number) => toData<any[]>(request.get('/api/favorite/list', { params: { targetType } }));

export const checkFavorite = (targetType: number, targetId: number) => toData<{ isFavorite: boolean }>(request.get('/api/favorite/check', { params: { targetType, targetId } }));

export const uploadAndAnalyzeResume = (formData: FormData) => toData<SmartFillResponse>(request.post('/api/resume/upload-and-analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }, timeout: 0
}));

export const analyzeResume = (requestData: Record<string, unknown>) => toData<SmartFillResponse>(request.post('/api/resume/analyze', requestData, { timeout: 0 }));

export const smartFillResume = (formData: FormData) => toData<SmartFillResponse>(request.post('/api/resume/smart-fill', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }, timeout: 0
}));

export const generateJobProfile = (positionId: number) => toData<JobProfileResponse>(request.post(`/api/job-profile/generate/${positionId}`));

export const getJobProfile = (positionId: number) => toData<JobProfileResponse>(request.get(`/api/job-profile/${positionId}`));

export const updateJobProfile = (positionId: number) => toData<JobProfileResponse>(request.put(`/api/job-profile/update/${positionId}`));

export const deleteJobProfile = (positionId: number) => toData<null>(request.delete(`/api/job-profile/${positionId}`));

export const generateTalentProfile = () => toData<TalentProfileResponse>(request.post('/api/talent-profile/generate'));

export const getTalentProfile = () => toData<TalentProfileResponse>(request.get('/api/talent-profile'));

export const updateTalentProfile = () => toData<TalentProfileResponse>(request.put('/api/talent-profile/update'));

export const deleteTalentProfile = () => toData<null>(request.delete('/api/talent-profile'));

export const getJobRecommendations = (limit?: number) => toData<JobRecommendResponse[]>(request.get('/api/job-recommend', { params: { limit } }));

export const getMatchDetails = (positionId: number) => toData<JobRecommendResponse>(request.get(`/api/job-recommend/match/${positionId}`));

export const batchGenerateMatchRecords = () => toData<null>(request.post('/api/job-recommend/batch-generate'));

export const markAsViewed = (recordId: number) => toData<null>(request.put(`/api/job-recommend/viewed/${recordId}`));

export const getTalentRecommendations = (positionId?: number, limit?: number) => toData<TalentRecommendResponse[]>(request.get('/api/talent-recommend', {
  params: { positionId, limit }
}));

export const getTalentMatchDetails = (jobSeekerId: number, positionId: number) => toData<TalentRecommendResponse>(request.get('/api/talent-recommend/match', {
  params: { jobSeekerId, positionId }
}));

export const batchGenerateTalentMatchRecords = (positionId: number) => toData<null>(request.post('/api/talent-recommend/batch-generate', {}, { params: { positionId } }));

export const markTalentAsViewed = (recordId: number) => toData<null>(request.put(`/api/talent-recommend/viewed/${recordId}`));

export const getSeekerStatistics = () => toData<SeekerStatistics>(request.get('/api/statistics/seeker'));

export const getBossStatistics = () => toData<BossStatistics>(request.get('/api/statistics/boss'));

export const getWordCloudData = () => toData<WordCloudData>(request.get('/api/statistics/wordcloud'));

export const submitMockInterview = (formData: FormData, interviewId?: number, sessionKey?: string) => toData<MockInterviewResponse>(request.post('/api/interview/mock', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  params: { ...(interviewId && { interviewId }), ...(sessionKey && { sessionKey }) }
}));

export const generateMockInterviewQuestions = (
  interviewId?: number, positionName?: string, positionCategory?: string,
  city?: string, description?: string, requirement?: string
) => toData<MockInterviewResponse>(request.get('/api/interview/mock/questions', {
  params: { interviewId, positionName, positionCategory, city, description, requirement }
}));

export const finishInterview = (formData: FormData) => toData<MockInterviewResponse>(request.post('/api/interview/finish', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}));

export const getInterviewEvaluation = (interviewId: number) => toData<InterviewEvaluationData>(request.get(`/api/interview/evaluation/${interviewId}`));

export const checkInterviewEvaluationExists = (interviewId: number) => toData<{ exists: boolean }>(request.get(`/api/interview/evaluation/${interviewId}/exists`));
