<template>
  <div class="project-experience-manager">
    <!-- 标题和操作按钮 -->
    <!-- 常规模式：显示完整标题和编辑按钮 -->
    <div v-if="!hideHeader" :class="['section-header']">
      <div class="section-title-wrapper">
        <h4 class="section-title">
          <el-icon :size="20" color="#00beaa"><Briefcase /></el-icon>
          项目经历
        </h4>
        <el-tag v-if="!localIsEditing && projects.length > 0" type="info" size="small" class="count-tag">
          共 {{ projects.length }} 项
        </el-tag>
        <el-tag v-else-if="!localIsEditing" type="warning" size="small" class="count-tag">
          暂无项目
        </el-tag>
      </div>
      <div v-if="!localIsEditing" class="section-actions">
        <el-button 
          type="primary" 
          size="large" 
          @click="enterEditMode"
          class="edit-btn"
        >
          <el-icon><Edit /></el-icon>
          编辑项目经历
        </el-button>
      </div>
      <div v-else class="section-actions edit-mode">
        <el-button 
          type="primary" 
          size="large" 
          @click="handleAdd"
          class="action-btn"
        >
          <el-icon><Plus /></el-icon>
          添加项目
        </el-button>
        <el-button 
          type="warning" 
          size="large" 
          @click="exitEditMode"
          class="action-btn"
        >
          <el-icon><Close /></el-icon>
          完成编辑
        </el-button>
      </div>
    </div>
    
    <!-- 集成模式：只显示编辑区域，没有标题 -->
    <div v-else :class="['section-header', 'integrated-header']">
      <div v-if="!localIsEditing" class="section-actions">
        <el-button 
          type="primary" 
          size="large" 
          @click="enterEditMode"
          class="edit-btn"
        >
          <el-icon><Edit /></el-icon>
          编辑项目经历
        </el-button>
      </div>
      <div v-else class="section-actions edit-mode">
        <el-button 
          type="primary" 
          size="large" 
          @click="handleAdd"
          class="action-btn"
        >
          <el-icon><Plus /></el-icon>
          添加项目
        </el-button>
        <el-button 
          type="warning" 
          size="large" 
          @click="exitEditMode"
          class="action-btn"
        >
          <el-icon><Close /></el-icon>
          完成编辑
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="projects.length === 0" class="empty-state">
      <el-empty description="暂无项目经历" :image-size="100">
        <div v-if="!localIsEditing" class="view-mode-actions">
          <el-button type="primary" @click="enterEditMode">编辑项目经历</el-button>
        </div>
        <div v-else class="edit-mode-actions">
          <el-button type="primary" @click="handleAdd">添加第一个项目</el-button>
          <el-button type="warning" @click="exitEditMode">完成编辑</el-button>
        </div>
      </el-empty>
    </div>

    <!-- 项目列表 -->
    <div v-else class="project-list">
      <el-row :gutter="20">
        <el-col
          v-for="project in projects"
          :key="project.id"
          :xs="24"
          :sm="12"
          :md="8"
          class="project-col"
        >
          <el-card class="project-card" shadow="hover">
            <div class="project-header">
              <h5 class="project-name">{{ project.projectName }}</h5>
              <div class="project-actions" v-if="localIsEditing">
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="handleEdit(project)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="handleDelete(project.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="project-info">
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>角色：{{ project.projectRole }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>时间：{{ getDateRange(project) }}</span>
              </div>
            </div>

            <div v-if="project.description" class="project-description">
              <h6>项目描述：</h6>
              <p>{{ truncateText(project.description, 120) }}</p>
            </div>

            <div class="project-footer">
              <span class="update-time">
                更新：{{ formatDate(project.updateTime) }}
              </span>
              <el-button
                v-if="project.description && project.description.length > 120"
                type="text"
                size="small"
                @click="showProjectDetail(project)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="projectName">
          <el-input
            v-model="formData.projectName"
            placeholder="请输入项目名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="项目角色" prop="projectRole">
          <el-input
            v-model="formData.projectRole"
            placeholder="如：技术负责人、核心开发"
            maxlength="100"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择开始时间"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择结束时间（为空表示至今）"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
              <div class="tip-text">如为空则表示至今</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="5"
            placeholder="请描述项目背景、您的职责、技术栈、项目成果等"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
          >
            {{ dialogType === 'add' ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 项目详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailTitle"
      width="700px"
    >
      <div v-if="currentProject" class="project-detail">
        <div class="detail-header">
          <h4>{{ currentProject.projectName }}</h4>
          <el-tag type="info">{{ currentProject.projectRole }}</el-tag>
        </div>
        
        <div class="detail-info">
          <div class="info-item">
            <strong>项目时间：</strong>
            <span>{{ getDateRange(currentProject) }}</span>
          </div>
        </div>
        
        <div class="detail-description">
          <h5>项目描述：</h5>
          <div class="description-content">
            {{ currentProject.description }}
          </div>
        </div>
        
        <div class="detail-footer">
          <span class="time-info">
            最后更新：{{ formatDate(currentProject.updateTime) }}
          </span>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="localIsEditing"
            type="primary"
            @click="currentProject && handleEdit(currentProject)"
          >
            编辑项目
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Edit, Delete, User, Calendar, Close, Briefcase } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import {
  getProjectExperiences,
  addProjectExperience,
  updateProjectExperience,
  deleteProjectExperience
} from '@/utils/api';
import type {
  ProjectExperience,
  AddProjectExperienceRequest,
  UpdateProjectExperienceRequest
} from '@/types';

// ==================== Props ====================
// 组件不再需要外部编辑状态，改为本地管理
// 保留可选参数以兼容旧代码（实际上不再使用）
const props = withDefaults(defineProps<{
  isEditing?: boolean; // 弃用，但保留为可选以兼容旧代码
  hideHeader?: boolean; // 是否隐藏顶部标题区域
}>(), {
  isEditing: false,
  hideHeader: false
});

// ==================== 状态管理 ====================
const userStore = useUserStore();
const loading = ref(false);
const localIsEditing = ref(false); // 本地编辑状态
const submitting = ref(false);
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const projects = ref<ProjectExperience[]>([]);
const currentProject = ref<ProjectExperience | null>(null);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<AddProjectExperienceRequest>({
  projectName: '',
  projectRole: '',
  startDate: '',
  endDate: '',
  description: ''
});

// ==================== 计算属性 ====================
const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加项目经历' : '编辑项目经历';
});

const detailTitle = computed(() => {
  return currentProject.value ? currentProject.value.projectName : '项目详情';
});

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { max: 100, message: '项目名称不能超过100个字符', trigger: 'blur' }
  ],
  projectRole: [
    { required: true, message: '请输入项目角色', trigger: 'blur' },
    { max: 100, message: '项目角色不能超过100个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'blur' }
  ],
  description: [
    { max: 2000, message: '项目描述不能超过2000个字符', trigger: 'blur' }
  ]
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchProjects();
});

// ==================== 数据操作 ====================
/**
 * 获取项目经历列表
 */
const fetchProjects = async () => {
  try {
    // 检查用户是否登录且是求职者
    if (!userStore.isLogin || userStore.userInfo?.role !== 1) {
      console.log('用户未登录或不是求职者，跳过项目经历获取');
      projects.value = [];
      loading.value = false;
      return;
    }

    loading.value = true;
    const res = await getProjectExperiences();
    projects.value = res || [];
  } catch (error) {
    console.error('获取项目经历失败:', error);
    // 401错误已经在request.ts中处理，这里不需要再显示错误消息
    // 仅处理非认证错误
    if ((error as any)?.status !== 401) {
      ElMessage.error('获取项目经历失败，请重试');
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 进入编辑模式
 */
const enterEditMode = () => {
  localIsEditing.value = true;
};

/**
 * 退出编辑模式
 */
const exitEditMode = () => {
  localIsEditing.value = false;
};

/**
 * 添加项目按钮点击
 */
const handleAdd = () => {
  resetForm();
  dialogType.value = 'add';
  dialogVisible.value = true;
};

/**
 * 编辑项目
 */
const handleEdit = (project: ProjectExperience) => {
  detailDialogVisible.value = false;
  resetForm();
  Object.assign(formData, project);
  dialogType.value = 'edit';
  dialogVisible.value = true;
};

/**
 * 删除项目
 */
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个项目经历吗？删除后无法恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteProjectExperience(id);
    ElMessage.success('删除成功');
    fetchProjects();
  } catch (error) {
    // 用户取消删除
  }
};

/**
 * 显示项目详情
 */
const showProjectDetail = (project: ProjectExperience) => {
  currentProject.value = project;
  detailDialogVisible.value = true;
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  
  try {
    submitting.value = true;
    
    if (dialogType.value === 'add') {
      await addProjectExperience(formData as AddProjectExperienceRequest);
      ElMessage.success('添加成功');
    } else {
      await updateProjectExperience(formData as UpdateProjectExperienceRequest);
      ElMessage.success('更新成功');
    }
    
    dialogVisible.value = false;
    fetchProjects();
  } catch (error) {
    console.error('保存项目经历失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    submitting.value = false;
  }
};

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    projectName: '',
    projectRole: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  formRef.value?.clearValidate();
};

/**
 * 处理对话框关闭
 */
const handleDialogClose = (done: () => void) => {
  if (submitting.value) {
    ElMessage.warning('正在保存，请稍后...');
    return;
  }
  
  // 如果有未保存的更改，提示用户确认
  const hasChanges = Object.values(formData).some(value => value);
  if (hasChanges) {
    ElMessageBox.confirm(
      '您有未保存的更改，确定要关闭吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      done();
    }).catch(() => {
      // 用户取消操作
    });
  } else {
    done();
  }
};

// ==================== 工具函数 ====================
/**
 * 格式化日期范围
 */
const getDateRange = (project: ProjectExperience): string => {
  const start = project.startDate;
  const end = project.endDate || '至今';
  return `${start} - ${end}`;
};

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * 截断文本
 */
const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};
</script>

<style scoped>
/* ==================== BOSS直聘风格 · 极简清爽 · 项目经历 ==================== */
:root {
  --color-primary: #00beaa;
  --color-primary-light: #f0faf8;
  --color-primary-dark: #009d8a;
  --color-white: #fff;
  --color-bg: #f7f8fa;
  --color-text-1: #111;
  --color-text-2: #333;
  --color-text-3: #666;
  --color-border: #e5e6eb;
  --color-border-light: #f0f0f0;
  --color-bg-light: #fafafa;
  --radius: 12px;
  --radius-sm: 8px;
  --transition: 0.25s ease;
}

.project-experience-manager {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.55;
  color: var(--color-text-2);
  width: 100%;  /* 自适应父容器宽度 */
}

/* ==================== 顶部标题栏 ==================== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-white);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 20px;
  border: 1px solid var(--color-border);
}

/* 集成模式下的头部样式（简化版） */
.section-header.integrated-header {
  padding: 0;
  margin-bottom: 20px;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.section-header.integrated-header .section-title-wrapper {
  display: none;
}

/* 集成模式下的编辑按钮样式 */
.section-header.integrated-header .edit-btn {
  background: linear-gradient(135deg, #00beaa, #00d4be) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 190, 170, 0.2) !important;
}

.section-header.integrated-header .action-btn:first-of-type {
  background: linear-gradient(135deg, #00beaa, #00d4be) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 190, 170, 0.2) !important;
}

.section-header.integrated-header .action-btn:last-of-type {
  background: var(--color-white) !important;
  border: 1px solid var(--color-primary) !important;
  color: var(--color-primary) !important;
  box-shadow: none !important;
}

.section-header.integrated-header .edit-btn:hover,
.section-header.integrated-header .action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 190, 170, 0.3) !important;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==================== 按钮 ==================== */
.section-actions {
  display: flex;
  gap: 12px;
}

.edit-btn,
.action-btn {
  border-radius: var(--radius-sm) !important;
  height: 38px !important;
  font-weight: 500 !important;
  padding: 0 16px !important;
}

.edit-btn {
  background: var(--color-primary) !important;
  border: none !important;
}

/* ==================== 空状态 ==================== */
.empty-state {
  background: var(--color-white);
  border-radius: var(--radius);
  padding: 60px 20px;
  text-align: center;
  border: 1px dashed var(--color-border);
}

/* ==================== 项目卡片 ==================== */
.project-card {
  height: 100%;
  width: 300%;
  background: var(--color-white);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  transition: var(--transition);
  overflow: hidden;
  position: relative;
}

.project-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.project-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--color-primary);
  opacity: 0.8;
}

/* ==================== 卡片头部 ==================== */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.project-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0;
  line-height: 1.4;
}

.project-actions {
  opacity: 0;
  transition: var(--transition);
}
.project-card:hover .project-actions {
  opacity: 1;
}

/* ==================== 项目信息 ==================== */
.project-info {
  margin-bottom: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: 6px;
}

.info-item .el-icon {
  color: var(--color-primary);
  font-size: 16px;
  width: 20px;
}

/* ==================== 项目描述 ==================== */
.project-description {
  margin-bottom: 16px;
}

.project-description h6 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-2);
  margin: 0 0 6px 0;
}

.project-description p {
  font-size: 14px;
  color: var(--color-text-3);
  line-height: 1.5;
  background: transparent;
  border-left: 3px solid var(--color-primary-light);
  padding: 4px 12px;
  border-radius: 4px;
}

/* ==================== 底部 ==================== */
.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  font-size: 12px;
  color: var(--color-text-3);
}

.project-footer .el-button {
  color: var(--color-primary);
  font-weight: 500;
}

/* ==================== 详情弹窗 ==================== */
.project-detail {
  padding: 8px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 14px;
  margin-bottom: 16px;
}

.detail-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0;
}

.detail-info {
  margin-bottom: 16px;
}

.detail-description h5 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 8px;
}

.description-content {
  background: var(--color-bg);
  padding: 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  line-height: 1.6;
  border-left: 3px solid var(--color-primary);
}

.detail-footer {
  text-align: right;
  font-size: 12px;
  color: var(--color-text-3);
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

/* ==================== 表单 / 弹窗优化 ==================== */
.tip-text {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 6px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: var(--radius-sm);
  border-color: var(--color-border);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 190, 170, 0.15);
}

.dialog-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  justify-content: flex-end;
}
</style>