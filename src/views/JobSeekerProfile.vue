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
          <h2>个人信息管理</h2>
          <p>完善您的个人资料，让更多企业看到优秀的您</p>
        </div>
        <div class="header-right">
          <!-- 预览模式：显示编辑按钮 -->
          <el-button v-if="!isEditing" type="primary" @click="enterEditMode">
            <el-icon><Edit /></el-icon>
            编辑信息
          </el-button>
          <!-- 编辑模式：显示操作按钮组 -->
          <div v-else class="edit-actions">
            <el-button type="danger" text @click="exitEditMode">
              <el-icon><Close /></el-icon>
              取消编辑
            </el-button>
            <el-button type="warning" @click="handleReset">
              <el-icon><RefreshRight /></el-icon>
              重置信息
            </el-button>
            <el-button type="primary" :loading="saving" @click="handleSave">
              <el-icon><Select /></el-icon>
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
          <el-card class="avatar-card">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="formData.avatar">
                <el-icon :size="40"><User /></el-icon>
              </el-avatar>
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
          <el-card class="resume-card">
            <template #header>
              <div class="card-header">
                <span>简历附件</span>
              </div>
            </template>
            <div v-if="formData.resumeUrl" class="resume-info">
              <el-icon :size="24" color="#67c23a"><Document /></el-icon>
              <span class="resume-name">已上传简历</span>
              <el-button 
                type="danger" 
                size="small" 
                text 
                @click="handleRemoveResume"
                :disabled="!isEditing"
              >删除</el-button>
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
              <input
                ref="resumeInputRef"
                type="file"
                accept=".pdf,.doc,.docx"
                style="display: none"
                @change="handleResumeChange"
              />
              <p class="upload-tip">支持 PDF、Word 格式</p>
            </div>
          </el-card>
        </div>

        <!-- 右侧：详细信息表单 -->
        <div class="profile-right">
          <el-card>
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

              <!-- 教育背景 -->
              <div class="form-section">
                <h4 class="section-title">教育背景</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学历" prop="educationLevel">
                      <el-select v-model="formData.educationLevel" placeholder="请选择学历" style="width: 100%">
                        <el-option :value="1" label="高中及以下" />
                        <el-option :value="2" label="大专" />
                        <el-option :value="3" label="本科" />
                        <el-option :value="4" label="硕士" />
                        <el-option :value="5" label="博士" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="毕业院校" prop="graduateSchool">
                      <el-input v-model="formData.graduateSchool" placeholder="请输入毕业院校" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="专业" prop="major">
                      <el-input v-model="formData.major" placeholder="请输入专业" />
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
                      <el-input v-model="formData.currentSalary" placeholder="单位：万元/年">
                        <template #append>万元/年</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="期望薪资" prop="expectedSalary">
                      <el-input v-model="formData.expectedSalary" placeholder="单位：万元/年">
                        <template #append>万元/年</template>
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
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Upload, Document, Plus, RefreshRight, Select, Edit, Close } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import AppLayout from '@/components/AppLayout.vue';
import {
  getJobSeekerInfo,
  updateJobSeekerInfo,
  uploadAvatar,
  uploadResume,
  uploadFile
} from '@/utils/api';
import type { UpdateJobSeekerRequest } from '@/types';
import { GENDER_MAP } from '@/types';

// ==================== 表单数据 ====================
const loading = ref(true);
const saving = ref(false);
const isEditing = ref(false); // 编辑模式状态
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  id: 0,
  name: '',
  gender: undefined as number | undefined,
  email: '',
  age: undefined as number | undefined,
  educationLevel: undefined as number | undefined,
  graduateSchool: '',
  major: '',
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

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

// ==================== 技能标签相关 ====================
const skillList = ref<string[]>([]);
const skillInputVisible = ref(false);
const skillInputValue = ref('');
const skillInputRef = ref<HTMLInputElement>();

/**
 * 添加技能标签
 */
const showSkillInput = () => {
  skillInputVisible.value = true;
  nextTick(() => {
    skillInputRef.value?.focus();
  });
};

/**
 * 确认添加技能
 */
const handleSkillInputConfirm = () => {
  if (skillInputValue.value) {
    skillList.value.push(skillInputValue.value);
  }
  skillInputVisible.value = false;
  skillInputValue.value = '';
  // 更新 formData 中的 skills
  formData.skills = JSON.stringify(skillList.value);
};

/**
 * 删除技能标签
 */
const removeSkill = (index: number) => {
  skillList.value.splice(index, 1);
  formData.skills = JSON.stringify(skillList.value);
};

// ==================== 头像上传相关 ====================
const avatarInputRef = ref<HTMLInputElement>();

/**
 * 触发头像上传
 */
const triggerAvatarUpload = () => {
  avatarInputRef.value?.click();
};

/**
 * 处理头像选择
 */
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

// ==================== 简历上传相关 ====================
const resumeInputRef = ref<HTMLInputElement>();

/**
 * 触发简历上传
 */
const triggerResumeUpload = () => {
  resumeInputRef.value?.click();
};

/**
 * 处理简历选择
 */
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

/**
 * 删除简历
 */
const handleRemoveResume = () => {
  formData.resumeUrl = '';
  // TODO: 如果后端支持删除简历，可以调用删除接口
};

// ==================== 获取和保存数据 ====================

/**
 * 获取求职者信息
 */
const fetchData = async () => {
  try {
    loading.value = true;
    
    // 检查用户是否已登录且是求职者角色
    const userStore = useUserStore();
    if (!userStore.isLogin || userStore.userInfo?.role !== 1) {
      console.warn('用户未登录或不是求职者角色');
      loading.value = false;
      return;
    }
    
    const res = await getJobSeekerInfo();

    // 填充表单数据
    Object.assign(formData, res);

    // 解析技能标签
    if (res.skills) {
      try {
        skillList.value = JSON.parse(res.skills);
      } catch {
        skillList.value = [];
      }
    }
  } catch (error) {
    console.error('获取求职者信息失败:', error);
    // 显示错误信息
    ElMessage.error('获取个人信息失败，请检查网络连接');
  } finally {
    loading.value = false;
    // 保存原始数据用于比较更改
    originalData.value = JSON.parse(JSON.stringify(formData));
  }
};

/**
 * 重置表单
 */
import { ElMessageBox } from 'element-plus';

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
    formData.gender = undefined;
    formData.email = '';
    formData.age = undefined;
    formData.educationLevel = undefined;
    formData.graduateSchool = '';
    formData.major = '';
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

/**
 * 判断是否为首次填写（没有关联的求职者信息）
 */
const isFirstTime = computed(() => !formData.id || formData.id === 0);

/**
 * 进入编辑模式
 */
const enterEditMode = () => {
  isEditing.value = true;
};

/**
 * 退出编辑模式
 */
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

/**
 * 检查是否有未保存的更改
 */
const hasUnsavedChanges = () => {
  if (!originalData.value) return false;
  
  // 简单比较对象字符串化后的结果
  return JSON.stringify(formData) !== JSON.stringify(originalData.value);
};

/**
 * 原始数据备份（用于比较是否有更改）
 */
const originalData = ref<any>(null);

/**
 * 保存修改
 */
const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  try {
    saving.value = true;

    // 构建请求数据
    const requestData = {
      id: formData.id,
      name: formData.name,
      gender: formData.gender,
      email: formData.email,
      age: formData.age,
      educationLevel: formData.educationLevel,
      graduateSchool: formData.graduateSchool,
      major: formData.major,
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

// ==================== 生命周期 ====================
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* ==================== 页面容器 ==================== */
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== 页面标题 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-left h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 8px 0;
}

.header-left p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

/* ==================== 表单禁用状态样式 ==================== */
.profile-form:deep(.el-form-item.is-disabled .el-form-item__label) {
  color: #909399;
}

.profile-form:deep(.el-form-item.is-disabled .el-input .el-input__wrapper),
.profile-form:deep(.el-form-item.is-disabled .el-select .el-input__wrapper),
.profile-form:deep(.el-form-item.is-disabled .el-textarea .el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
}

.profile-form:deep(.el-form-item.is-disabled .el-radio),
.profile-form:deep(.el-form-item.is-disabled .el-checkbox) {
  color: #909399;
  cursor: not-allowed;
}

/* ==================== 加载状态 ==================== */
.loading-wrapper {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

/* ==================== 内容布局 ==================== */
.profile-content {
  display: flex;
  gap: 20px;
}

.profile-left {
  width: 280px;
  flex-shrink: 0;
}

.profile-right {
  flex: 1;
  min-width: 0;
}

/* ==================== 头像卡片 ==================== */
.avatar-card {
  margin-bottom: 20px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.avatar-upload {
  margin-top: 16px;
}

.basic-info {
  text-align: center;
  margin-top: 16px;
}

.basic-info h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 8px;
}

.basic-info p {
  font-size: 14px;
  color: #909399;
  margin: 4px 0;
}

/* ==================== 简历卡片 ==================== */
.resume-card :deep(.el-card__body) {
  padding-top: 0;
}

.resume-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.resume-name {
  flex: 1;
  font-size: 14px;
  color: #67c23a;
}

.resume-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

/* ==================== 表单样式 ==================== */
.profile-form {
  padding: 10px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #ebeef5;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

/* ==================== 技能标签 ==================== */
.skills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  font-size: 14px;
}

.skill-input {
  width: 100px;
}



/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-left {
    width: 100%;
  }
}
</style>
