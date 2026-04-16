<template>
  <div class="work-experience-manager">
    <!-- 标题和操作按钮 -->
    <!-- 常规模式：显示完整标题和编辑按钮 -->
    <div v-if="!hideHeader" :class="['section-header']">
      <div class="section-title-wrapper">
        <h4 class="section-title">
          <el-icon :size="20" color="#00beaa"><Briefcase /></el-icon>
          工作/实习经历
        </h4>
        <el-tag v-if="!localIsEditing && experiences.length > 0" type="info" size="small" class="count-tag">
          共 {{ experiences.length }} 项
        </el-tag>
        <el-tag v-else-if="!localIsEditing" type="warning" size="small" class="count-tag">
          暂无经历
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
          编辑工作经历
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
          添加经历
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
          编辑工作经历
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
          添加经历
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
    <div v-else-if="experiences.length === 0" class="empty-state">
      <el-empty description="暂无工作/实习经历" :image-size="100">
        <div v-if="!localIsEditing" class="view-mode-actions">
          <el-button type="primary" @click="enterEditMode">编辑工作经历</el-button>
        </div>
        <div v-else class="edit-mode-actions">
          <el-button type="primary" @click="handleAdd">添加第一条经历</el-button>
          <el-button type="warning" @click="exitEditMode">完成编辑</el-button>
        </div>
      </el-empty>
    </div>

    <!-- 经历列表 -->
    <div v-else class="experience-list">
      <el-timeline>
        <el-timeline-item
          v-for="experience in experiences"
          :key="experience.id"
          :color="experience.isInternship ? '#E6A23C' : '#409EFF'"
        >
          <el-card class="experience-card" shadow="hover">
            <div class="experience-header">
              <div class="experience-title">
                <span class="company-name">{{ experience.companyName }}</span>
                <el-tag
                  v-if="experience.companyIndustry"
                  type="info"
                  size="small"
                >
                  {{ experience.companyIndustry }}
                </el-tag>
                <el-tag
                  v-if="experience.isInternship === 1"
                  type="warning"
                  size="small"
                >
                  实习
                </el-tag>
                <!-- 添加时间标签到卡片内部 -->
                <el-tag type="" size="small" class="time-tag">
                  <el-icon><Clock /></el-icon>
                  {{ getDateRange(experience) }}
                </el-tag>
              </div>
              <div class="experience-actions" v-if="localIsEditing">
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="handleEdit(experience)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="handleDelete(experience.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <div class="experience-content">
              <p class="position">
                <el-icon><Briefcase /></el-icon>
                {{ experience.position }}
              </p>
              
              <div v-if="experience.description" class="description">
                <h5>工作内容：</h5>
                <p>{{ experience.description }}</p>
              </div>
            </div>

            <div class="experience-footer">
              <span class="time-info">
                更新时间：{{ formatDate(experience.updateTime) }}
              </span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
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
        <el-form-item label="公司名称" prop="companyName">
          <el-input
            v-model="formData.companyName"
            placeholder="请输入公司名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司行业" prop="companyIndustry">
              <el-input
                v-model="formData.companyIndustry"
                placeholder="如：互联网、金融"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input
                v-model="formData.position"
                placeholder="请输入职位"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

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

        <el-form-item label="是否为实习" prop="isInternship">
          <el-radio-group v-model="formData.isInternship">
            <el-radio :label="0">正式工作</el-radio>
            <el-radio :label="1">实习经历</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="工作描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请描述您的工作内容、职责、成就等"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Edit, Delete, Briefcase, Close, Clock } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import {
  getWorkExperiences,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience
} from '@/utils/api';
import type {
  WorkExperience,
  AddWorkExperienceRequest,
  UpdateWorkExperienceRequest
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
const dialogType = ref<'add' | 'edit'>('add');
const experiences = ref<WorkExperience[]>([]);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<AddWorkExperienceRequest>({
  companyName: '',
  companyIndustry: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  isInternship: 0
});

// ==================== 计算属性 ====================
const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加工作/实习经历' : '编辑工作/实习经历';
});

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { max: 100, message: '公司名称不能超过100个字符', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' },
    { max: 100, message: '职位不能超过100个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'blur' }
  ],
  isInternship: [
    { required: true, message: '请选择经历类型', trigger: 'blur' }
  ],
  description: [
    { max: 2000, message: '工作描述不能超过2000个字符', trigger: 'blur' }
  ]
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchExperiences();
});

// ==================== 数据操作 ====================
/**
 * 获取工作经历列表
 */
const fetchExperiences = async () => {
  try {
    // 检查用户是否登录且是求职者
    if (!userStore.isLogin || userStore.userInfo?.role !== 1) {
      console.log('用户未登录或不是求职者，跳过程工作经历获取');
      experiences.value = [];
      loading.value = false;
      return;
    }

    loading.value = true;
    const res = await getWorkExperiences();
    experiences.value = res || [];
  } catch (error) {
    console.error('获取工作经历失败:', error);
    // 401错误已经在request.ts中处理，这里不需要再显示错误消息
    // 仅处理非认证错误
    if ((error as any)?.status !== 401) {
      ElMessage.error('获取工作经历失败，请重试');
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
 * 添加经历按钮点击
 */
const handleAdd = () => {
  resetForm();
  dialogType.value = 'add';
  dialogVisible.value = true;
};

/**
 * 编辑经历
 */
const handleEdit = (experience: WorkExperience) => {
  resetForm();
  Object.assign(formData, experience);
  dialogType.value = 'edit';
  dialogVisible.value = true;
};

/**
 * 删除经历
 */
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条工作经历吗？删除后无法恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteWorkExperience(id);
    ElMessage.success('删除成功');
    fetchExperiences();
  } catch (error) {
    // 用户取消删除
  }
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
      await addWorkExperience(formData as AddWorkExperienceRequest);
      ElMessage.success('添加成功');
    } else {
      await updateWorkExperience(formData as UpdateWorkExperienceRequest);
      ElMessage.success('更新成功');
    }
    
    dialogVisible.value = false;
    fetchExperiences();
  } catch (error) {
    console.error('保存工作经历失败:', error);
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
    companyName: '',
    companyIndustry: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    isInternship: 0
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
const getDateRange = (experience: WorkExperience): string => {
  const start = experience.startDate;
  const end = experience.endDate || '至今';
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
</script>

<style scoped>
/* ==================== BOSS 直聘风格 · 极简清爽版 ==================== */
:root {
  --color-primary: #00beaa;
  --color-primary-light: #f0faf8;
  --color-primary-dark: #009d8a;
  --color-white: #ffffff;
  --color-bg: #f7f8fa;
  --color-text-1: #111111;
  --color-text-2: #333333;
  --color-text-3: #666666;
  --color-border: #e5e6eb;
  --color-border-light: #f0f0f0;
  --color-bg-light: #fafafa;
  --radius: 12px;
  --radius-sm: 8px;
  --spacing: 20px;
  --spacing-sm: 16px;
  --spacing-xs: 12px;
  --transition: 0.2s ease;
}

.work-experience-manager {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--color-text-2);
  line-height: 1.55;
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
  gap: 12px;
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

.count-tag {
  transform: translateY(0px);
}

/* ==================== 按钮 ==================== */
.section-actions {
  display: flex;
  gap: 12px;
}

.action-btn,
.edit-btn {
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

/* ==================== 时间轴 ==================== */
:deep(.el-timeline) {
  padding-left: 2px;
}

:deep(.el-timeline-item__node) {
  background: var(--color-primary) !important;
  border-color: var(--color-primary-light) !important;
}

:deep(.el-timeline-item__timestamp) {
  color: var(--color-text-3);
  font-size: 13px;
  margin-bottom: 8px;
}

/* ==================== 卡片 ==================== */
.experience-card {
  background: var(--color-white);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  transition: var(--transition);
  overflow: hidden;
}

.experience-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.experience-card::before {
  display: none;
}

/* ==================== 卡片头部 ==================== */
.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.experience-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 时间标签样式 */
.experience-title .time-tag {
  background: linear-gradient(135deg, var(--color-primary-light), rgba(0, 190, 170, 0.1)) !important;
  border: 1px solid rgba(0, 190, 170, 0.2) !important;
  color: var(--color-text-2) !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.experience-title .time-tag .el-icon {
  color: var(--color-primary) !important;
  font-size: 14px;
}

.company-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
}

/* ==================== 编辑按钮（hover 显示） ==================== */
.experience-actions {
  opacity: 0;
  transition: var(--transition);
}
.experience-card:hover .experience-actions {
  opacity: 1;
}

/* ==================== 内容 ==================== */
.experience-content {
  background: transparent;
  border: none;
  padding: 0;
}

.position {
  font-size: 14px;
  color: var(--color-text-2);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.position .el-icon {
  color: var(--color-primary);
  background: var(--color-primary-light);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.description h5 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 6px;
}

.description p {
  font-size: 14px;
  color: var(--color-text-3);
  background: transparent;
  border-left: 3px solid var(--color-primary);
  padding: 2px 12px;
  border-radius: 4px;
}

/* ==================== 底部 ==================== */
.experience-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-text-3);
}

/* ==================== 表单 / 弹框 清爽化 ==================== */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-date-picker__input) {
  border-radius: var(--radius-sm);
  border-color: var(--color-border);
  box-shadow: none;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 190, 170, 0.15);
}

:deep(.el-dialog) {
  border-radius: var(--radius);
}

.dialog-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  justify-content: flex-end;
}

/* ==================== 小提示 ==================== */
.tip-text {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 6px;
}
</style>