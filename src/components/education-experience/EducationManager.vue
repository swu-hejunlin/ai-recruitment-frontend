<template>
  <div class="education-manager">
    <!-- 标题和操作按钮 -->
    <div :class="['section-header', { 'integrated-header': hideHeader }]" v-if="!hideHeader">
      <div class="section-title-wrapper">
        <h4 class="section-title">
          <el-icon :size="20" color="#00beaa"><School /></el-icon>
          教育经历
        </h4>
        <el-tag v-if="!localIsEditing && educations.length > 0" type="info" size="small" class="count-tag">
          共 {{ educations.length }} 项
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
          编辑教育经历
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
          添加教育经历
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

    <!-- 集成模式下的编辑按钮（没有标题时显示） -->
    <div v-else :class="['section-header', 'integrated-header']">
      <div v-if="!localIsEditing" class="section-actions">
        <el-button 
          type="primary" 
          size="large" 
          @click="enterEditMode"
          class="edit-btn"
        >
          <el-icon><Edit /></el-icon>
          编辑教育经历
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
          添加教育经历
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
    <div v-else-if="educations.length === 0" class="empty-state">
      <el-empty description="暂无教育经历" :image-size="100">
        <div v-if="!localIsEditing" class="view-mode-actions">
          <el-button type="primary" @click="enterEditMode">编辑教育经历</el-button>
        </div>
        <div v-else class="edit-mode-actions">
          <el-button type="primary" @click="handleAdd">添加第一条教育经历</el-button>
          <el-button type="warning" @click="exitEditMode">完成编辑</el-button>
        </div>
      </el-empty>
    </div>

    <!-- 教育经历列表 -->
    <div v-else class="education-list">
      <el-timeline>
        <el-timeline-item
          v-for="education in educations"
          :key="education.id"
          placement="top"
          :color="getEducationColor(education.educationLevel)"
        >
          <el-card class="education-card" shadow="hover">
            <div class="education-header">
              <div class="education-title">
                <span class="school-name">{{ education.schoolName }}</span>
                <!-- 学历标签 -->
                <el-tag type="primary" size="small" class="education-level-tag">
                  {{ EDUCATION_MAP[education.educationLevel] || '未知' }}
                </el-tag>
                <!-- 专业标签 -->
                <el-tag v-if="education.major" type="info" size="small" class="major-tag">
                  <el-icon><Tickets /></el-icon>
                  {{ education.major }}
                </el-tag>
                <!-- 时间标签 -->
                <el-tag size="small" class="time-tag">
                  <el-icon><Clock /></el-icon>
                  {{ getDateRange(education) }}
                </el-tag>
              </div>
              <div class="education-actions" v-if="localIsEditing">
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="handleEdit(education)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="handleDelete(education.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <div class="education-content">
              <div v-if="education.description" class="description">
                <h5>在校经历：</h5>
                <p>{{ education.description }}</p>
              </div>
            </div>

            <div class="education-footer">
              <span class="time-info">
                更新时间：{{ formatDate(education.updateTime) }}
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
        <el-form-item label="学校名称" prop="schoolName">
          <el-input
            v-model="formData.schoolName"
            placeholder="请输入学校名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="educationLevel">
              <el-select
                v-model="formData.educationLevel"
                placeholder="请选择学历"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, value) in EDUCATION_MAP"
                  :key="value"
                  :label="label"
                  :value="Number(value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input
                v-model="formData.major"
                placeholder="请输入专业"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="起止时间" required>
          <el-date-picker
            v-model="dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="入学时间"
            end-placeholder="毕业时间"
            format="YYYY/MM"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="在校经历" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请描述您的在校经历、主要课程、项目经验或相关活动等"
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
import { Plus, Edit, Delete, School, Tickets, Clock, Close } from '@element-plus/icons-vue';
import {
  getEducationExperiences,
  addEducationExperience,
  updateEducationExperience,
  deleteEducationExperience
} from '@/utils/api';
import type {
  EducationExperience,
  AddEducationExperienceRequest,
  UpdateEducationExperienceRequest
} from '@/types';
import { EDUCATION_MAP } from '@/types';

// ==================== Props ====================
const props = withDefaults(defineProps<{
  isEditing?: boolean; // 是否编辑模式
  hideHeader?: boolean; // 是否隐藏顶部标题区域
}>(), {
  isEditing: false,
  hideHeader: false
});

// ==================== 状态管理 ====================
const loading = ref(false);
const localIsEditing = ref(false); // 本地编辑状态
const submitting = ref(false);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const educations = ref<EducationExperience[]>([]);
const formRef = ref<FormInstance>();
const dateRange = ref<[string, string]>(['', '']); // 日期范围数组

// 表单数据
const formData = reactive<AddEducationExperienceRequest>({
  schoolName: '',
  major: '',
  educationLevel: 3, // 默认为本科
  startDate: '',
  endDate: '',
  description: ''
});

// ==================== 计算属性 ====================
const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加教育经历' : '编辑教育经历';
});

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  schoolName: [
    { required: true, message: '请输入学校名称', trigger: 'blur' },
    { max: 100, message: '学校名称不能超过100个字符', trigger: 'blur' }
  ],
  educationLevel: [
    { required: true, message: '请选择学历', trigger: 'blur' }
  ],
  major: [
    { max: 100, message: '专业不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 2000, message: '在校经历描述不能超过2000个字符', trigger: 'blur' }
  ]
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchEducations();
});

// ==================== 数据操作 ====================
/**
 * 获取教育经历列表
 */
const fetchEducations = async () => {
  try {
    loading.value = true;
    const res = await getEducationExperiences();
    educations.value = res || [];
  } catch (error) {
    console.error('获取教育经历失败:', error);
    ElMessage.error('获取教育经历失败，请重试');
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
 * 添加教育经历按钮点击
 */
const handleAdd = () => {
  resetForm();
  dialogType.value = 'add';
  dialogVisible.value = true;
};

/**
 * 编辑教育经历
 */
const handleEdit = (education: EducationExperience) => {
  resetForm();
  Object.assign(formData, education);
  // 从完整日期中提取年月部分用于日期选择器
  dateRange.value = [
    extractMonthYear(education.startDate || ''),
    extractMonthYear(education.endDate || '')
  ];
  dialogType.value = 'edit';
  dialogVisible.value = true;
};

/**
 * 删除教育经历
 */
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条教育经历吗？删除后无法恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteEducationExperience(id);
    ElMessage.success('删除成功');
    fetchEducations();
  } catch (error) {
    // 用户取消删除
  }
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  // 检查日期范围是否已填写
  if (!dateRange.value || dateRange.value.length !== 2 || !dateRange.value[0]) {
    ElMessage.error('请至少选择入学时间');
    return;
  }

  // 处理日期范围 - 结束时间可以为空（表示至今）
  // 转换为完整的yyyy-MM-dd格式，后端LocalDate需要完整日期
  formData.startDate = convertToLocalDate(dateRange.value[0]);
  formData.endDate = dateRange.value[1] ? convertToLocalDate(dateRange.value[1]) : '';

  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  
  try {
    submitting.value = true;
    
    if (dialogType.value === 'add') {
      await addEducationExperience(formData as AddEducationExperienceRequest);
      ElMessage.success('添加成功');
    } else {
      await updateEducationExperience(formData as UpdateEducationExperienceRequest);
      ElMessage.success('更新成功');
    }
    
    dialogVisible.value = false;
    fetchEducations();
  } catch (error) {
    console.error('保存教育经历失败:', error);
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
    schoolName: '',
    major: '',
    educationLevel: 3, // 默认为本科
    startDate: '',
    endDate: '',
    description: ''
  });
  dateRange.value = ['', ''];
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
  const hasChanges = Object.values(formData).some(value => value) || 
                     (dateRange.value[0] || dateRange.value[1]);
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
 * 将YYYY-MM格式转换为YYYY-MM-01格式（后端LocalDate需要完整格式）
 */
const convertToLocalDate = (monthString: string): string => {
  if (!monthString || monthString.trim() === '') {
    return '';
  }
  // 如果已经是YYYY-MM-DD格式，直接返回
  if (monthString.length === 10 && monthString.includes('-')) {
    return monthString;
  }
  // 如果是YYYY-MM格式，添加-01
  if (monthString.length === 7 && monthString.includes('-')) {
    return `${monthString}-01`;
  }
  return monthString;
};

/**
 * 从YYYY-MM-DD格式中提取YYYY-MM格式用于显示
 */
const extractMonthYear = (localDateString: string): string => {
  if (!localDateString || localDateString.trim() === '') {
    return '';
  }
  // 如果是YYYY-MM-DD格式，提取前7位
  if (localDateString.length >= 7 && localDateString.includes('-')) {
    return localDateString.slice(0, 7);
  }
  return localDateString;
};

/**
 * 格式化日期范围
 */
const getDateRange = (education: EducationExperience): string => {
  // 从完整日期中提取年月部分用于显示
  const start = extractMonthYear(education.startDate || '');
  
  if (!start || start === '') {
    return '未设置时间';
  }
  
  const end = education.endDate ? extractMonthYear(education.endDate) : '至今';
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
 * 获取学历对应的颜色
 */
const getEducationColor = (level: number): string => {
  const colors = ['#909399', '#E6A23C', '#409EFF', '#F56C6C', '#67C23A'];
  return colors[level - 1] || colors[0];
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

.education-manager {
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
.education-card {
  background: var(--color-white);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  transition: var(--transition);
  overflow: hidden;
}

.education-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.education-card::before {
  display: none;
}

/* ==================== 卡片头部 ==================== */
.education-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.education-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.school-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
}

/* 各种标签样式 */
.education-title .education-level-tag {
  background: linear-gradient(135deg, var(--color-primary-light), rgba(0, 190, 170, 0.1)) !important;
  border: 1px solid rgba(0, 190, 170, 0.2) !important;
  color: var(--color-primary-dark) !important;
  font-weight: 500;
}

.education-title .major-tag {
  background: rgba(99, 161, 247, 0.1) !important;
  border: 1px solid rgba(99, 161, 247, 0.2) !important;
  color: #409EFF !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.education-title .major-tag .el-icon {
  color: #409EFF !important;
  font-size: 14px;
}

.education-title .time-tag {
  background: linear-gradient(135deg, #f0faf8, rgba(240, 250, 248, 0.5)) !important;
  border: 1px solid rgba(0, 190, 170, 0.1) !important;
  color: var(--color-text-2) !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.education-title .time-tag .el-icon {
  color: var(--color-text-3) !important;
  font-size: 14px;
}

/* ==================== 编辑按钮（hover 显示） ==================== */
.education-actions {
  opacity: 0;
  transition: var(--transition);
}
.education-card:hover .education-actions {
  opacity: 1;
}

/* ==================== 内容 ==================== */
.education-content {
  background: transparent;
  border: none;
  padding: 0;
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
  line-height: 1.6;
}

/* ==================== 底部 ==================== */
.education-footer {
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

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .education-title {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .section-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .action-btn,
  .edit-btn {
    height: 36px !important;
    font-size: 14px !important;
    padding: 0 12px !important;
  }
}
</style>