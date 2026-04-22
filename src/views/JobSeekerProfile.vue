/**
 * 求职者个人信息管理页面
 * 提供个人信息的增删改查功能
 */

<template>
  <AppLayout>
    <div class="profile-container">
      <!-- 页面标题和操作按钮 -->
      <div class="page-header">
        <div class="header-left">
          <div class="title-wrapper">
            <h2>
              <el-icon :size="24" color="#00beaa"><UserFilled /></el-icon>
              个人简历管理
            </h2>
            <div class="title-badge">
              <el-tag type="success" size="small" v-if="!isFirstTime">已完善</el-tag>
              <el-tag type="warning" size="small" v-else>待完善</el-tag>
            </div>
          </div>
          <p>完善您的个人简历，让更多企业看到优秀的您</p>
        </div>
        <div class="header-right">
          <!-- 预览模式：显示编辑按钮 -->
          <el-button 
            v-if="!isEditing" 
            type="primary" 
            size="large" 
            @click="enterEditMode"
            class="edit-btn"
          >
            <el-icon><Edit /></el-icon>
            编辑信息
          </el-button>
          <!-- 编辑模式：显示操作按钮组 -->
          <div v-else class="edit-actions">
            <el-button 
              type="success" 
              @click="handleSmartFill"
              :loading="smartFilling"
              class="action-btn"
            >
              <el-icon><MagicStick /></el-icon>
              AI智能填充个人信息
            </el-button>
            <el-button 
              type="danger" 
              @click="exitEditMode" 
              class="action-btn"
              :disabled="smartFilling"
            >
              <el-icon><Close /></el-icon>
              取消编辑
            </el-button>
            <el-button 
              type="warning" 
              @click="handleReset" 
              class="action-btn"
              :disabled="smartFilling"
            >
              <el-icon><RefreshRight /></el-icon>
              重置信息
            </el-button>
            <el-button 
              type="primary" 
              :loading="saving" 
              @click="handleSave"
              class="action-btn"
              :disabled="smartFilling"
            >
              <el-icon><Check /></el-icon>
              保存修改
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 内容区域 -->
      <div v-else class="profile-content">
        <!-- 首次填写提示 -->
          <el-alert
            v-if="isFirstTime"
            title="首次填写"
            type="info"
            description="您正在首次填写求职信息，请完善以下信息后提交"
            show-icon
            :closable="false"
            style="margin-bottom: 20px"
          />
        <!-- 左侧：基本信息卡片 -->
        <div class="profile-left">
          <!-- 头像卡片 -->
          <el-card class="profile-card avatar-card">
            <div class="avatar-wrapper">
              <!-- 点击头像预览大图 -->
              <div 
                class="avatar-preview-wrapper" 
                @click="previewAvatar"
                style="cursor: pointer"
                title="点击预览头像"
              >
                <el-avatar :size="100" :src="formData.avatar">
                  <el-icon :size="40"><User /></el-icon>
                </el-avatar>
              </div>
              <div class="avatar-upload">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="triggerAvatarUpload"
                  :disabled="!isEditing"
                >
                  <el-icon><Upload /></el-icon>
                  更换头像
                </el-button>
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarChange"
                />
              </div>
            </div>
            <div class="basic-info">
              <h3>{{ formData.name || '请填写姓名' }}</h3>
              <p>{{ GENDER_MAP[formData.gender as 0 | 1 | 2] || '请选择性别' }}</p>
              <p>{{ formData.age ? `${formData.age}岁` : '请填写年龄' }}</p>
            </div>
          </el-card>

          <!-- 简历附件卡片 -->
          <el-card class="profile-card resume-card">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>简历附件</span>
                <el-tag v-if="formData.resumeUrl" type="success" size="small" class="resume-tag">
                  <el-icon :size="12"><CircleCheckFilled /></el-icon>
                  已上传
                </el-tag>
                <el-tag v-else type="warning" size="small" class="resume-tag">
                  <el-icon :size="12"><WarningFilled /></el-icon>
                  未上传
                </el-tag>
              </div>
            </template>
            <div v-if="formData.resumeUrl" class="resume-info">
              <div class="resume-view" @click="openResumePreview" style="cursor: pointer; display: flex; align-items: center; gap: 8px;" title="点击在线查看简历">
                <el-icon :size="24" color="#67c23a"><Document /></el-icon>
                <div style="display: flex; flex-direction: column; line-height: 1.2;">
                  <span class="resume-name" style="color: #409eff; text-decoration: underline;">已上传简历</span>
                  <span style="font-size: 12px; color: #909399;">{{ getResumeFileType(formData.resumeUrl) }}</span>
                </div>
              </div>
              <div class="resume-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  text 
                  @click="analyzeUploadedResume"
                  :loading="analyzingResume"
                >
                  <el-icon><DataAnalysis /></el-icon>
                  分析简历
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  text 
                  @click="handleRemoveResume"
                  :disabled="!isEditing"
                >删除</el-button>
              </div>
            </div>
            <div v-else class="resume-upload">
              <el-button 
                type="primary" 
                @click="triggerResumeUpload"
                :disabled="!isEditing"
              >
                <el-icon><Upload /></el-icon>
                上传简历
              </el-button>
              <p class="upload-tip">支持 PDF、Word 格式</p>
            </div>
            <!-- 始终存在的文件输入元素，用于智能填充 -->
            <input
              ref="resumeInputRef"
              type="file"
              accept=".pdf,.doc,.docx"
              style="display: none"
              @change="handleResumeChange"
            />
          </el-card>
        </div>
        
        <!-- 智能填充加载遮罩层 -->
        <div v-if="showLoadingMask" class="loading-mask">
          <div class="loading-content">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p class="loading-text">正在智能分析简历，请稍候...</p>
            <p class="loading-subtext">系统正在提取个人信息并填充到表单中</p>
          </div>
        </div>

        <!-- 右侧：详细信息表单 -->
        <div class="profile-right">
          <el-card class="profile-form-container">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="profile-form" :disabled="!isEditing">
              <!-- 基本信息 -->
              <div class="form-section">
                <h4 class="section-title">基本信息</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="姓名" prop="name">
                      <el-input v-model="formData.name" placeholder="请输入姓名" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="性别" prop="gender">
                      <el-select v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
                        <el-option :value="0" label="未知" />
                        <el-option :value="1" label="男" />
                        <el-option :value="2" label="女" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="年龄" prop="age">
                      <el-input-number v-model="formData.age" :min="16" :max="65" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="formData.email" placeholder="请输入邮箱" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="电话" prop="phone">
                      <el-input v-model="formData.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <!-- 预留位置，保持布局平衡 -->
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所在城市" prop="city">
                      <el-input v-model="formData.city" placeholder="请输入城市" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="详细地址" prop="address">
                      <el-input v-model="formData.address" placeholder="请输入详细地址" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              

              <!-- 工作信息 -->
              <div class="form-section">
                <h4 class="section-title">工作信息</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="当前状态" prop="currentStatus">
                      <el-select v-model="formData.currentStatus" placeholder="请选择当前状态" style="width: 100%">
                        <el-option :value="1" label="在职" />
                        <el-option :value="2" label="离职" />
                        <el-option :value="3" label="在读学生" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="工作年限" prop="workYears">
                      <el-input-number v-model="formData.workYears" :min="0" :max="50" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="当前薪资" prop="currentSalary">
                      <el-input v-model="formData.currentSalary" placeholder="单位：K/月">
                        <template #append>K/月</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="期望薪资" prop="expectedSalary">
                      <el-input v-model="formData.expectedSalary" placeholder="单位：K/月">
                        <template #append>K/月</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 技能标签 -->
              <div class="form-section">
                <h4 class="section-title">技能标签</h4>
                <el-form-item prop="skills">
                  <div class="skills-wrapper">
                    <el-tag
                      v-for="(skill, index) in skillList"
                      :key="index"
                      closable
                      @close="removeSkill(index)"
                      class="skill-tag"
                    >
                      {{ skill }}
                    </el-tag>
                    <el-input
                      v-if="skillInputVisible"
                      ref="skillInputRef"
                      v-model="skillInputValue"
                      class="skill-input"
                      size="small"
                      @keyup.enter="handleSkillInputConfirm"
                      @blur="handleSkillInputConfirm"
                    />
                    <el-button v-else size="small" @click="showSkillInput">
                      <el-icon><Plus /></el-icon>
                      添加技能
                    </el-button>
                  </div>
                </el-form-item>
              </div>

              <!-- 个人简介 -->
              <div class="form-section">
                <h4 class="section-title">个人简介</h4>
                <el-form-item prop="introduction">
                  <el-input
                    v-model="formData.introduction"
                    type="textarea"
                    :rows="4"
                    placeholder="请简要介绍您的职业背景、技能优势、职业规划等"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </div>
            </el-form>
          </el-card>

          <!-- 工作/实习经历 -->
          <el-card class="experience-container section-margin">
            <div class="experience-content-wrapper">
              <WorkExperienceManager :is-editing="false" :hide-header="true" />
            </div>
          </el-card>

          <!-- 教育经历 -->
          <el-card class="experience-container section-margin">
            <div class="experience-content-wrapper">
              <EducationManager :is-editing="false" :hide-header="true" />
            </div>
          </el-card>

          <!-- 项目经历 -->
          <el-card class="experience-container section-margin">
            <div class="experience-content-wrapper">
              <ProjectExperienceManager :is-editing="false" :hide-header="true" />
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 头像预览组件 -->
    <ElImageViewer
      v-if="avatarPreviewVisible"
      :url-list="formData.avatar ? [formData.avatar] : []"
      @close="avatarPreviewVisible = false"
    />

    <!-- 简历预览对话框 -->
    <el-dialog
      v-model="resumePreviewVisible"
      :title="resumePreviewTitle"
      width="90%"
      top="5vh"
      :before-close="handlePreviewClose"
    >
      <div class="preview-container" v-if="resumePreviewUrl">
        <!-- PDF预览 -->
        <iframe
          v-if="currentPreviewType === 'pdf'"
          :src="resumePreviewUrl"
          class="preview-iframe"
          frameborder="0"
          title="简历预览"
        ></iframe>
        
        <!-- Office文档预览 -->
        <iframe
          v-else-if="currentPreviewType === 'office'"
          :src="resumePreviewUrl"
          class="preview-iframe"
          frameborder="0"
          title="Office文档预览"
        ></iframe>
        
        <!-- 其他格式提示 -->
        <div v-else class="unsupported-format">
          <el-icon :size="48" color="#909399"><Warning /></el-icon>
          <h3>不支持在线预览</h3>
          <p>该文件格式({{ currentPreviewExtension.toUpperCase() }})不支持在线预览</p>
          <el-button type="primary" @click="downloadResumeDirectly">直接下载</el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-else class="loading-preview">
        <el-icon class="is-loading" :size="48"><Loading /></el-icon>
        <p>正在加载预览...</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resumePreviewVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadResume" :loading="downloading">
            下载简历
          </el-button>
        </span>
      </template>
    </el-dialog>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElImageViewer, ElDialog, type FormInstance, type FormRules } from 'element-plus';
import { User, Upload, Document, Plus, RefreshRight, Select, Edit, Close, Warning, Loading, UserFilled, CircleCheckFilled, WarningFilled, DataAnalysis, MagicStick } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import AppLayout from '@/components/AppLayout.vue';
import WorkExperienceManager from '@/components/work-experience/WorkExperienceManager.vue';
import ProjectExperienceManager from '@/components/project-experience/ProjectExperienceManager.vue';
import EducationManager from '@/components/education-experience/EducationManager.vue';
import {
  getJobSeekerInfo,
  updateJobSeekerInfo,
  uploadAvatar,
  uploadResume,
  uploadFile,
  getResume,
  getAvatar,
  analyzeResume,
  smartFillResume
} from '@/utils/api';
import { GENDER_MAP } from '@/types';

// ==================== 表单数据 ====================
const loading = ref(true);
const saving = ref(false);
const isEditing = ref(false); // 编辑模式状态
const formRef = ref<FormInstance>();

// 用户状态
const userStore = useUserStore();
const router = useRouter();

// 表单数据
const formData = reactive({
  id: 0,
  name: '',
  phone: '', // 新增电话字段
  gender: undefined as number | undefined,
  email: '',
  age: undefined as number | undefined,
  workYears: undefined as number | undefined,
  currentSalary: undefined as number | undefined,
  expectedSalary: undefined as number | undefined,
  currentStatus: 1,
  city: '',
  address: '',
  introduction: '',
  skills: '',
  avatar: '',
  resumeUrl: ''
});

// ==================== 简历预览相关 ====================
const resumePreviewVisible = ref(false);
const resumePreviewUrl = ref('');
const resumePreviewTitle = ref('');
const currentPreviewExtension = ref('');
const currentPreviewType = ref(''); // 'pdf', 'office', 'other'
const downloading = ref(false);
const analyzingResume = ref(false);
const smartFilling = ref(false);
const showLoadingMask = ref(false);

// 判断是否是Office文档
const isOfficeDocument = (extension: string): boolean => {
  const officeExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
  return officeExtensions.includes(extension.toLowerCase());
};

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

// ==================== 技能标签相关 ====================
const skillList = ref<string[]>([]);
const skillInputVisible = ref(false);
const skillInputValue = ref('');
const skillInputRef = ref<HTMLInputElement>();

// 添加技能标签
const showSkillInput = () => {
  skillInputVisible.value = true;
  nextTick(() => {
    skillInputRef.value?.focus();
  });
};

// 确认添加技能
const handleSkillInputConfirm = () => {
  if (skillInputValue.value) {
    skillList.value.push(skillInputValue.value);
  }
  skillInputVisible.value = false;
  skillInputValue.value = '';
  // 更新 formData 中的 skills
  formData.skills = JSON.stringify(skillList.value);
};

// 删除技能标签
const removeSkill = (index: number) => {
  skillList.value.splice(index, 1);
  formData.skills = JSON.stringify(skillList.value);
};

// ==================== 头像上传相关 ====================
const avatarInputRef = ref<HTMLInputElement>();

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInputRef.value?.click();
};

// 处理头像选择
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 校验文件类型（图片格式）
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  if (!allowedImageTypes.includes(file.type.toLowerCase())) {
    ElMessage.warning('请上传图片文件（JPEG、PNG、GIF、WebP）');
    return;
  }

  // 校验文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过2MB');
    return;
  }

  try {
    // 先上传文件到OSS
    const uploadRes = await uploadFile(file, 'avatar');
    const fileUrl = uploadRes.fileUrl;

    // 再调用接口保存头像URL
    await uploadAvatar(fileUrl);

    // 更新本地显示
    formData.avatar = fileUrl;
    ElMessage.success('头像上传成功');
  } catch (error) {
    console.error('头像上传失败:', error);
  }

  // 清空 input，允许重复选择同一文件
  target.value = '';
};

// ==================== 头像预览功能 ====================
const avatarPreviewVisible = ref(false);

// 预览头像
const previewAvatar = async () => {
  try {
    // 先检查当前是否有头像URL，如果有则直接使用
    if (formData.avatar) {
      avatarPreviewVisible.value = true;
      return;
    }
    
    // 如果没有，则调用 API 获取头像 URL
    const avatarUrl = await getAvatar();
    
    if (!avatarUrl) {
      ElMessage.warning('您还没有上传头像');
      return;
    }
    
    // 更新表单数据和显示预览
    formData.avatar = avatarUrl;
    avatarPreviewVisible.value = true;
    
  } catch (error) {
    console.error('获取头像URL失败:', error);
    ElMessage.error('获取头像失败，请重试');
  }
};

// ==================== 简历上传相关 ====================
const resumeInputRef = ref<HTMLInputElement>();

// 触发简历上传
const triggerResumeUpload = () => {
  resumeInputRef.value?.click();
};

// 处理简历选择
const handleResumeChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 校验文件类型（简历格式）
  const allowedResumeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf',
    '.doc',
    '.docx'
  ];
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  if (!allowedResumeTypes.includes(fileType) && !allowedResumeTypes.includes(`.${fileExtension}`)) {
    ElMessage.warning('请上传 PDF 或 Word 文档（.pdf, .doc, .docx）');
    return;
  }

  // 校验文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('简历大小不能超过10MB');
    return;
  }

  try {
    // 先上传文件到OSS
    const uploadRes = await uploadFile(file, 'resume');
    const fileUrl = uploadRes.fileUrl;

    // 再调用接口保存简历URL
    await uploadResume(fileUrl);

    // 更新本地显示
    formData.resumeUrl = fileUrl;
    ElMessage.success('简历上传成功');
  } catch (error) {
    console.error('简历上传失败:', error);
  }

  // 清空 input
  target.value = '';
};

// 删除简历
const handleRemoveResume = () => {
  formData.resumeUrl = '';
  // TODO: 如果后端支持删除简历，可以调用删除接口
};

// 获取文件扩展名
const getFileExtension = (url: string): string => {
  try {
    console.log('正在解析URL:', url);
    
    // 检测阿里云OSS的Content-Type参数（支持多种写法）
    // 匹配：response-content-type、response_content_type、RESPONSE-CONTENT-TYPE等
    const contentTypePatterns = [
      /response-content-type=([^&]*)/i,
      /response_content_type=([^&]*)/i,
      /content-type=([^&]*)/i,
      /content_type=([^&]*)/i
    ];
    
    for (const pattern of contentTypePatterns) {
      const contentTypeMatch = url.match(pattern);
      if (contentTypeMatch) {
        const contentType = decodeURIComponent(contentTypeMatch[1]).toLowerCase();
        console.log('从Content-Type参数检测到:', contentType);
        
        // 根据Content-Type返回扩展名
        if (contentType.includes('pdf')) return 'pdf';
        if (contentType.includes('msword') || contentType.includes('wordprocessingml')) return 'docx';
        if (contentType.includes('document') && !contentType.includes('wordprocessingml')) return 'doc';
        if (contentType.includes('excel') || contentType.includes('spreadsheetml')) return 'xlsx';
        if (contentType.includes('presentation') || contentType.includes('presentationml')) return 'pptx';
        if (contentType.includes('powerpoint')) return 'ppt';
        if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) return 'jpg';
        if (contentType.includes('image/png')) return 'png';
        if (contentType.includes('image/gif')) return 'gif';
        if (contentType.includes('image/webp')) return 'webp';
      }
    }
    
    // 尝试解析URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 获取文件名（最后一个斜杠后面的部分）
    const fileName = pathname.split('/').pop() || '';
    console.log('从路径提取的文件名:', fileName);
    
    // 移除查询参数部分（如果有）
    const fileNameWithoutQuery = fileName.split('?')[0];
    
    // 找到最后一个点号位置
    const dotIndex = fileNameWithoutQuery.lastIndexOf('.');
    if (dotIndex === -1) {
      console.log('没有找到扩展名');
      return ''; // 没有扩展名
    }
    
    // 获取扩展名
    const extension = fileNameWithoutQuery.substring(dotIndex + 1).toLowerCase();
    console.log('提取的原始扩展名:', extension);
    
    // 只保留字母和数字（移除任何特殊字符）
    const cleanExtension = extension.replace(/[^a-z0-9]/g, '');
    console.log('清理后的扩展名:', cleanExtension);
    
    return cleanExtension;
    
  } catch (error) {
    console.warn('无法解析URL:', url, error);
    
    // 如果URL解析失败，尝试简单方法
    // 移除查询参数
    const urlWithoutQuery = url.split('?')[0];
    
    // 获取文件名
    const fileName = urlWithoutQuery.split('/').pop() || '';
    
    // 找到扩展名
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) {
      return '';
    }
    
    const extension = fileName.substring(dotIndex + 1).toLowerCase();
    const cleanExtension = extension.replace(/[^a-z0-9]/g, '');
    
    return cleanExtension;
  }
};

// 获取简历文件类型显示文本
const getResumeFileType = (url: string): string => {
  const extension = getFileExtension(url);
  
  const fileTypeMap: Record<string, string> = {
    pdf: 'PDF文档 (支持在线预览)',
    doc: 'Word文档 (支持在线查看)',
    docx: 'Word文档 (支持在线查看)',
    ppt: 'PowerPoint演示文稿',
    pptx: 'PowerPoint演示文稿',
    xls: 'Excel表格',
    xlsx: 'Excel表格',
    // 其他类型
    jpg: '图片文件',
    jpeg: '图片文件',
    png: '图片文件',
    gif: '图片文件',
    txt: '文本文件',
    zip: '压缩文件',
    rar: '压缩文件'
  };
  
  if (!extension) return '未知格式';
  
  const typeName = fileTypeMap[extension.toLowerCase()];
  return typeName ? `${extension.toUpperCase()} - ${typeName}` : `${extension.toUpperCase()} 格式`;
};

// 打开简历预览对话框
const openResumePreview = async () => {
  try {
    // 显示加载状态
    resumePreviewVisible.value = true;
    resumePreviewTitle.value = '正在获取简历...';
    
    // 调用 API 获取简历 URL
    const resumeUrl = await getResume();
    
    if (!resumeUrl) {
      ElMessage.warning('您还没有上传简历');
      resumePreviewVisible.value = false;
      return;
    }
    
    resumePreviewTitle.value = '简历预览';
    
    // 由于阿里云OSS限制，在线预览功能暂时不可用
    // 直接下载简历文件
    ElMessage.info('在线预览功能暂时不可用，正在打开简历文件...');
    
    // 延迟执行，确保用户看到提示
    setTimeout(() => {
      window.open(resumeUrl, '_blank');
    }, 500);
    
  } catch (error) {
    console.error('获取简历URL失败:', error);
    ElMessage.error('获取简历失败，请重试');
    resumePreviewVisible.value = false;
  }
};

// 分析已上传的简历
const analyzeUploadedResume = async () => {
  try {
    // 显示加载状态
    analyzingResume.value = true;
    
    // 调用 API 获取简历 URL
    const resumeUrl = await getResume();
    
    if (!resumeUrl) {
      ElMessage.warning('您还没有上传简历');
      analyzingResume.value = false;
      return;
    }
    
    // 调用分析API
    const analysisResult = await analyzeResume({
      resumeUrl: resumeUrl,
      fileType: getFileExtension(resumeUrl)
    });
    
    // 跳转到简历分析结果页面
    router.push({
      path: '/resume-analyzer',
      query: {
        analysisResult: JSON.stringify(analysisResult)
      }
    });
    
  } catch (error) {
    console.error('分析简历失败:', error);
    ElMessage.error('分析简历失败，请重试');
  } finally {
    analyzingResume.value = false;
  }
};

// 智能填充简历信息
const handleSmartFill = async () => {
  console.log('=== 开始智能填充个人信息 ===');
  try {
    // 确认操作
    console.log('1. 显示确认对话框');
    await ElMessageBox.confirm(
      '即将根据简历内容智能填充个人信息，是否继续？',
      '智能填充',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    smartFilling.value = true;
    showLoadingMask.value = true;
    console.log('2. 开始智能填充流程，显示加载遮罩层');
    
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 1. 检查是否已上传简历
    console.log('3. 检查是否已上传简历:', formData.resumeUrl);
    
    let file: File | null = null;
    
    // 无论是否已上传简历，都触发文件选择
    console.log('3. 触发文件选择对话框');
    const fileInput = resumeInputRef.value;
    if (!fileInput) {
      console.error('3.1 未找到文件输入元素');
            ElMessage.error('文件上传组件未找到');
            smartFilling.value = false;
            showLoadingMask.value = false;
            // 恢复页面滚动
            document.body.style.overflow = '';
            return;
    }
    
    console.log('3.2 触发文件选择对话框');
    // 触发文件选择
    fileInput.click();
    
    // 等待用户选择文件
    console.log('3.3 等待用户选择文件');
    await new Promise((resolve) => {
      const handleFileSelect = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files?.[0]) {
          const selectedFile = target.files[0];
          file = selectedFile;
          console.log('3.4 用户选择了文件:', {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type
          });
          // 移除事件监听器
          target.removeEventListener('change', handleFileSelect);
          resolve(undefined);
        }
      };
      
      fileInput.addEventListener('change', handleFileSelect);
      
      // 设置超时，防止用户长时间不选择文件
      setTimeout(() => {
        if (!file) {
          console.warn('3.5 用户未选择文件，操作超时');
          fileInput.removeEventListener('change', handleFileSelect);
          resolve(undefined);
        }
      }, 30000); // 30秒超时
    });
    
    // 检查是否获取到文件
    if (!file) {
      console.warn('4. 未获取到简历文件');
            ElMessage.warning('请选择简历文件');
            smartFilling.value = false;
            showLoadingMask.value = false;
            // 恢复页面滚动
            document.body.style.overflow = '';
            return;
    }
    
    // 使用类型断言明确指定file的类型
    const selectedFile = file as File;
    console.log('4. 确认获取到简历文件:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });
    
    // 2. 调用智能填充API
    console.log('5. 准备调用智能填充API');
    const apiFormData = new FormData();
    apiFormData.append('file', selectedFile);
    
    console.log('6. 开始调用智能填充API');
    const result = await smartFillResume(apiFormData);
    console.log('7. 智能填充API返回结果:', result);
    
    if (!result.success) {
      console.error('7.1 智能填充API调用失败:', result.errorMessage);
            ElMessage.error(result.errorMessage || '智能填充失败');
            smartFilling.value = false;
            showLoadingMask.value = false;
            // 恢复页面滚动
            document.body.style.overflow = '';
            return;
    }
    
    console.log('7.2 智能填充API返回数据:', result);
    
    // 3. 填充基本信息
    console.log('8. 开始填充基本信息');
    if (result.name) {
      console.log('8.1 填充姓名:', result.name);
      formData.name = result.name;
    }
    if (result.gender) {
      console.log('8.2 填充性别:', result.gender);
      formData.gender = result.gender;
    }
    if (result.age) {
      console.log('8.3 填充年龄:', result.age);
      formData.age = result.age;
    }
    if (result.phone) {
      console.log('8.4 填充电话:', result.phone);
      formData.phone = result.phone;
    }
    if (result.email) {
      console.log('8.5 填充邮箱:', result.email);
      formData.email = result.email;
    }
    if (result.city) {
      console.log('8.6 填充城市:', result.city);
      formData.city = result.city;
    }
    if (result.address) {
      console.log('8.7 填充地址:', result.address);
      formData.address = result.address;
    }
    if (result.workYears) {
      console.log('8.8 填充工作年限:', result.workYears);
      formData.workYears = result.workYears;
    }
    if (result.currentSalary) {
      console.log('8.9 填充当前薪资:', result.currentSalary);
      formData.currentSalary = result.currentSalary;
    }
    if (result.expectedSalary) {
      console.log('8.10 填充期望薪资:', result.expectedSalary);
      formData.expectedSalary = result.expectedSalary;
    }
    if (result.currentStatus) {
      console.log('8.11 填充当前状态:', result.currentStatus);
      formData.currentStatus = result.currentStatus;
    }
    if (result.introduction) {
      console.log('8.12 填充个人简介:', result.introduction.substring(0, 50) + '...');
      formData.introduction = result.introduction;
    }
    
    // 4. 填充技能标签
    if (result.skills && result.skills.length > 0) {
      console.log('9. 填充技能标签:', result.skills);
      skillList.value = result.skills;
      formData.skills = JSON.stringify(result.skills);
    }
    
    // 5. 提示用户确认未填充的字段
    if (result.unfilledFields && result.unfilledFields.length > 0) {
      console.log('10. 未填充的字段:', result.unfilledFields);
      ElMessage.info(`以下字段未能自动识别，请手动填写：${result.unfilledFields.join('、')}`);
    } else {
      console.log('10. 所有字段已成功填充');
      ElMessage.success('智能填充成功，请检查并确认信息');
    }
    
    console.log('11. 智能填充完成，最终表单数据:', {
      name: formData.name,
      gender: formData.gender,
      age: formData.age,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      workYears: formData.workYears,
      skills: skillList.value
    });
    
  } catch (error) {
    console.error('智能填充失败:', error);
    ElMessage.error('智能填充失败，请重试');
  } finally {
    console.log('=== 智能填充流程结束 ===');
    smartFilling.value = false;
    showLoadingMask.value = false;
    // 恢复页面滚动
    document.body.style.overflow = '';
    console.log('11. 智能填充流程结束，关闭加载遮罩层');
  }
};

// ==================== 获取和保存数据 ====================

// 获取求职者信息
const fetchData = async () => {
  try {
    loading.value = true;
    
    console.log('用户存储状态:', {
      isLogin: userStore.isLogin,
      userInfo: userStore.userInfo,
      role: userStore.userInfo?.role
    });
    
    if (!userStore.isLogin || userStore.userInfo?.role !== 1) {
      console.warn('用户未登录或不是求职者角色');
      loading.value = false;
      return;
    }
    
// 检查token状态
    console.log('当前token状态检查:');
    console.log('  - localStorage token:', localStorage.getItem('token')?.substring(0, 30) + '...');
    console.log('  - store token:', userStore.token?.substring(0, 30) + '...');
    console.log('  - store isLogin:', userStore.isLogin);
    
    console.log('开始获取求职者信息...');
    
    let res: any;
    try {
      res = await getJobSeekerInfo();
      console.log('获取到的求职者信息:', res);
    } catch (error: any) {
      console.error('获取求职者信息失败:', error);
      // 如果是401错误，不在这里处理，让request.ts的统一处理
      // 但我们可以记录更多信息
      if (error.response?.status === 401) {
        console.error('API返回401未授权，即将跳转到登录页');
        // 记录当前token状态
        console.log('当前localStorage token:', localStorage.getItem('token'));
        console.log('当前store token:', userStore.token);
      }
      throw error; // 重新抛出错误，让上层处理
    }
    
    // 根据API响应结构，res可能是完整的响应对象
    // 处理不同的响应结构
    let jobSeekerData: any;
    let educationsData: any[] = [];
    let experiencesData: any[] = [];
    let projectsData: any[] = [];
    
    if (res.jobSeeker) {
      // 新结构：{ jobSeeker, educations, experiences, projects }
      jobSeekerData = res.jobSeeker;
      educationsData = res.educations || [];
      experiencesData = res.experiences || [];
      projectsData = res.projects || [];
    } else {
      // 旧结构：直接是求职者信息
      jobSeekerData = res;
      // 记录这是旧结构
      console.log('使用旧API结构（直接返回求职者信息）');
    }
    
    // 填充表单数据
    Object.assign(formData, jobSeekerData);
    
    // 解析技能标签
    if (formData.skills) {
      try {
        skillList.value = JSON.parse(formData.skills);
      } catch {
        skillList.value = [];
      }
    }
    
    // 记录其他数据
    console.log('教育经历数据:', educationsData);
    console.log('工作经历数据:', experiencesData);
    console.log('项目经历数据:', projectsData);
    console.log('表单数据更新后:', formData);
  } catch (error) {
    console.error('获取求职者信息失败:', error);
    ElMessage.error('获取个人信息失败，请检查网络连接');
  } finally {
    console.log('数据加载完成');
    loading.value = false;
  }
};

// 判断是否为首次填写（没有关联的求职者信息）
const isFirstTime = computed(() => !formData.id || formData.id === 0);

// 进入编辑模式
const enterEditMode = () => {
  isEditing.value = true;
};

// 退出编辑模式
import { ElMessageBox } from 'element-plus';

const exitEditMode = async () => {
  try {
    // 如果有未保存的更改，提示用户确认
    if (hasUnsavedChanges()) {
      await ElMessageBox.confirm(
        '有未保存的更改，确认要取消编辑吗？',
        '确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '继续编辑',
          type: 'warning'
        }
      );
    }
    
    // 重置表单到原始数据
    if (originalData.value) {
      Object.assign(formData, originalData.value);
    }
    
    isEditing.value = false;
    ElMessage.info('已退出编辑模式');
  } catch {
    // 用户取消操作或选择继续编辑
  }
};

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  if (!originalData.value) return false;
  
  // 简单比较对象字符串化后的结果
  return JSON.stringify(formData) !== JSON.stringify(originalData.value);
};

// 原始数据备份（用于比较是否有更改）
const originalData = ref<any>(null);

// 重置表单
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清空您填写的信息，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 重置表单数据
    formData.name = '';
    formData.phone = ''; // 重置电话字段
    formData.gender = undefined;
    formData.email = '';
    formData.age = undefined;
    formData.workYears = undefined;
    formData.currentSalary = undefined;
    formData.expectedSalary = undefined;
    formData.currentStatus = 1;
    formData.city = '';
    formData.address = '';
    formData.introduction = '';
    formData.skills = '';
    formData.avatar = '';
    formData.resumeUrl = '';
    skillList.value = [];

    // 重置表单验证
    formRef.value?.clearValidate();

    ElMessage.success('信息已重置');
  } catch {
    // 用户取消操作
  }
};

// 保存修改
const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  try {
    saving.value = true;

    // 构建请求数据
    const requestData = {
      id: formData.id,
      name: formData.name,
      phone: formData.phone, // 新增电话字段
      gender: formData.gender,
      email: formData.email,
      age: formData.age,
      workYears: formData.workYears,
      currentSalary: formData.currentSalary,
      expectedSalary: formData.expectedSalary,
      currentStatus: formData.currentStatus,
      city: formData.city,
      address: formData.address,
      introduction: formData.introduction,
      skills: formData.skills
    };

    await updateJobSeekerInfo(requestData);
    ElMessage.success('保存成功');
    
    // 更新原始数据
    originalData.value = JSON.parse(JSON.stringify(formData));
    // 退出编辑模式
    isEditing.value = false;
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    saving.value = false;
  }
};

// ==================== 预览对话框相关函数 ====================
// 处理预览对话框关闭
const handlePreviewClose = (done: () => void) => {
  // 可以在这里添加确认提示，比如："确定要关闭预览吗？"
  done();
};

// 下载简历
const downloadResume = () => {
  if (!resumePreviewUrl.value) return;
  
  downloading.value = true;
  try {
    // 在新窗口打开下载，这通常会触发下载而不是预览
    const a = document.createElement('a');
    a.href = resumePreviewUrl.value;
    a.download = `resume_${new Date().getTime()}.${currentPreviewExtension.value}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    ElMessage.success('下载已开始');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请重试');
  } finally {
    downloading.value = false;
  }
};

// 直接下载简历（在不支持预览的格式中使用）
const downloadResumeDirectly = () => {
  if (!resumePreviewUrl.value) return;
  
  const a = document.createElement('a');
  a.href = resumePreviewUrl.value;
  a.download = `resume_${new Date().getTime()}.${currentPreviewExtension.value}`;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  resumePreviewVisible.value = false;
  ElMessage.success('简历已开始下载');
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* ==================== BOSS直聘极简清爽版 · 个人信息管理 ==================== */
:root {
  --c-primary: #00beaa;
  --c-primary-light: #f0faf8;
  --c-white: #fff;
  --c-bg: #f7f8fa;
  --c-text-1: #111;
  --c-text-2: #333;
  --c-text-3: #666;
  --c-border: #e5e6eb;
  --radius: 12px;
  --radius-sm: 8px;
  --transition: 0.25s ease;
}

* {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  box-sizing: border-box;
}

/* 页面容器 */
.profile-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  background: var(--c-bg);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--c-white);
  border-radius: var(--radius);
  padding: 18px 24px;
  margin-bottom: 24px;
  border: 1px solid var(--c-border);
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.title-wrapper h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-1);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left p {
  font-size: 14px;
  color: var(--c-text-3);
  margin: 0;
}

/* 按钮组 */
.edit-actions {
  display: flex;
  gap: 12px;
}

.edit-btn,
.action-btn {
  border-radius: var(--radius-sm) !important;
  height: 38px !important;
  font-weight: 500 !important;
}

/* 内容布局 ———— 这里统一宽度！！！ */
.profile-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 1200px;    /* 统一整体宽度 */
  margin: 0 auto;       /* 居中 */
}

.profile-left {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
}

/* 右侧统一宽度 ———— 最关键！！！ */
.profile-right {
  flex: 1;
  min-width: 0;
  max-width: 860px;   /* 让工作/项目经历和这个宽度一致 */
}

/* 卡片通用 */
.profile-card {
  background: var(--c-white);
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  margin-bottom: 20px;
  transition: var(--transition);
  overflow: hidden;
}

.profile-card:hover {
  border-color: var(--c-primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
}

.profile-card:deep(.el-card__header) {
  background: #fafbfc;
  border-bottom: 1px solid var(--c-border);
  padding: 14px 20px;
  font-weight: 500;
  color: var(--c-text-1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* 头像卡片 */
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.avatar-preview-wrapper {
  border-radius: 50%;
  border: 4px solid var(--c-primary-light);
  transition: var(--transition);
  cursor: pointer;
}

.avatar-preview-wrapper:hover {
  transform: scale(1.05);
  border-color: var(--c-primary);
}

.avatar-upload {
  margin-top: 16px;
  width: 100%;
}

.avatar-upload .el-button {
  width: 100%;
  border-radius: var(--radius-sm);
}

.basic-info {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

.basic-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-1);
  margin: 0 0 8px 0;
}

.basic-info p {
  font-size: 14px;
  color: var(--c-text-2);
  margin: 4px 0;
}

/* 简历卡片 */
.resume-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.resume-view {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.resume-upload {
  text-align: center;
  padding: 20px 0;
}

.upload-tip {
  font-size: 12px;
  color: var(--c-text-3);
  margin-top: 8px;
}

/* 主表单容器 */
.profile-form-container {
  background: var(--c-white);
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  padding: 20px;
}

/* 表单区块 */
.form-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--c-border);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-1);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  align-items: center;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 14px;
  background: var(--c-primary);
  border-radius: 2px;
  margin-right: 8px;
}

/* 表单样式 */
.profile-form:deep(.el-form-item__label) {
  font-size: 14px;
  color: var(--c-text-2);
  font-weight: 500;
}

.profile-form:deep(.el-input__wrapper),
.profile-form:deep(.el-select .el-input__wrapper),
.profile-form:deep(.el-textarea__inner) {
  border-radius: var(--radius-sm);
  border-color: var(--c-border);
  transition: var(--transition);
}

.profile-form:deep(.el-input__wrapper.is-focus) {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 2px rgba(0, 190, 170, 0.15);
}

/* 技能标签 */
.skills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #fafbfc;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border);
}

.skill-tag {
  background: var(--c-primary-light) !important;
  color: var(--c-primary) !important;
  border: none !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

/* 子组件间距 */
.section-margin {
  margin-top: 24px;
}

/* 工作/项目经历容器样式 */
.experience-container {
  background: var(--c-white);
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  padding: 20px;
  max-width: 860px; /* 与右侧容器宽度一致 */
}

.experience-content-wrapper {
  width: 100%;
}

/* 集成模式下的头部样式优化 */
.section-header.integrated-header {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  padding: 12px 0;
  margin-bottom: 16px;
}

.section-header.integrated-header .section-actions {
  display: flex;
  gap: 8px;
}

.section-header.integrated-header .edit-btn,
.section-header.integrated-header .action-btn {
  padding: 8px 16px !important;
  border-radius: var(--border-radius) !important;
  font-weight: 500;
  min-width: 100px;
  font-size: 14px;
}

/* 加载 */
.loading-wrapper {
  background: var(--c-white);
  border-radius: var(--radius);
  padding: 40px;
}

/* 预览弹窗 */
.preview-container {
  width: 100%;
  height: 75vh;
  background: #fafbfc;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.unsupported-format {
  text-align: center;
  padding: 60px 20px;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 12px;
}

/* ==================== 响应式 ==================== */
@media (max-width: 992px) {
  .profile-content {
    flex-direction: column;
  }
  .profile-left {
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .profile-container {
    padding: 16px;
  }
}

/* 加载遮罩层样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: spin 1.5s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.loading-subtext {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>