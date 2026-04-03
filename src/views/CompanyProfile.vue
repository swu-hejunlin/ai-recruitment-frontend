/**
 * 企业信息管理页面
 * 提供企业信息的增删改查功能
 */

<template>
  <AppLayout>
    <div class="company-container">
      <!-- 页面标题和操作按钮 -->
      <div class="page-header">
        <div class="header-left">
          <h2>企业信息管理</h2>
          <p>完善企业资料，让求职者更好地了解您的公司</p>
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
      <div v-else class="company-content">
        <!-- 企业信息内容 -->
        <div>
          <!-- 首次填写提示 -->
          <el-alert
            v-if="isFirstTime"
            title="首次填写"
            type="info"
            description="您正在首次填写企业信息，请完善以下信息后提交"
            show-icon
            :closable="false"
style="margin-bottom: 20px"
        />
      </div>

      <!-- 左侧：企业Logo和资质卡片 -->
        <div class="company-left">
          <!-- Logo卡片 -->
          <el-card class="logo-card">
            <template #header>
              <div class="card-header">
                <span>企业Logo</span>
              </div>
            </template>
            <div class="logo-wrapper">
              <el-avatar :size="120" :src="formData.logo">
                <el-icon :size="40"><OfficeBuilding /></el-icon>
              </el-avatar>
              <div class="logo-upload">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="triggerLogoUpload"
                  :disabled="!isEditing"
                >
                  <el-icon><Upload /></el-icon>
                  更换Logo
                </el-button>
                <input
                  ref="logoInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleLogoChange"
                />
              </div>
            </div>
          </el-card>

          <!-- 营业执照卡片 -->
          <el-card class="license-card">
            <template #header>
              <div class="card-header">
                <span>营业执照</span>
              </div>
            </template>
            <div v-if="formData.businessLicense" class="license-preview">
              <el-image
                :src="formData.businessLicense"
                :preview-src-list="[formData.businessLicense]"
                fit="cover"
                class="license-image"
              />
              <el-button 
                type="danger" 
                size="small" 
                text 
                @click="handleRemoveLicense"
                :disabled="!isEditing"
              >删除</el-button>
            </div>
            <div v-else class="license-upload">
              <el-button 
                type="primary" 
                @click="triggerLicenseUpload"
                :disabled="!isEditing"
              >
                <el-icon><Upload /></el-icon>
                上传营业执照
              </el-button>
              <input
                ref="licenseInputRef"
                type="file"
                accept="image/*,.pdf"
                style="display: none"
                @change="handleLicenseChange"
              />
              <p class="upload-tip">支持 JPG、PNG、PDF 格式</p>
            </div>
          </el-card>
        </div>

        <!-- 右侧：详细信息表单 -->
        <div class="company-right">
          <el-card>
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="company-form" :disabled="!isEditing">
              <!-- 基本信息 -->
              <div class="form-section">
                <h4 class="section-title">基本信息</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="企业名称" prop="companyName">
                      <el-input v-model="formData.companyName" placeholder="请输入企业名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="法人代表" prop="legalPerson">
                      <el-input v-model="formData.legalPerson" placeholder="请输入法人代表" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所属行业" prop="industry">
                      <el-select v-model="formData.industry" placeholder="请选择所属行业" style="width: 100%">
                        <el-option v-for="item in industryOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="企业邮箱" prop="email">
                      <el-input v-model="formData.email" placeholder="请输入企业邮箱" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone">
                      <el-input v-model="formData.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="企业官网" prop="website">
                      <el-input v-model="formData.website" placeholder="https://www.example.com" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 企业规模 -->
              <div class="form-section">
                <h4 class="section-title">企业规模</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="企业规模" prop="scale">
                      <el-select v-model="formData.scale" placeholder="请选择企业规模" style="width: 100%">
                        <el-option :value="1" label="0-20人" />
                        <el-option :value="2" label="20-99人" />
                        <el-option :value="3" label="100-499人" />
                        <el-option :value="4" label="500-999人" />
                        <el-option :value="5" label="1000-9999人" />
                        <el-option :value="6" label="10000人以上" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="融资阶段" prop="financingStage">
                      <el-select v-model="formData.financingStage" placeholder="请选择融资阶段" style="width: 100%">
                        <el-option :value="1" label="未融资" />
                        <el-option :value="2" label="天使轮" />
                        <el-option :value="3" label="A轮" />
                        <el-option :value="4" label="B轮" />
                        <el-option :value="5" label="C轮" />
                        <el-option :value="6" label="D轮及以上" />
                        <el-option :value="7" label="已上市" />
                        <el-option :value="8" label="不需要融资" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所在城市" prop="city">
                      <el-input v-model="formData.city" placeholder="请输入所在城市" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="详细地址" prop="address">
                      <el-input v-model="formData.address" placeholder="请输入详细地址" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 福利待遇 -->
              <div class="form-section">
                <h4 class="section-title">福利待遇</h4>
                <el-form-item prop="welfare">
                  <div class="welfare-wrapper">
                    <el-tag
                      v-for="(item, index) in welfareList"
                      :key="index"
                      closable
                      type="success"
                      @close="removeWelfare(index)"
                      class="welfare-tag"
                    >
                      {{ item }}
                    </el-tag>
                    <el-input
                      v-if="welfareInputVisible"
                      ref="welfareInputRef"
                      v-model="welfareInputValue"
                      class="welfare-input"
                      size="small"
                      @keyup.enter="handleWelfareInputConfirm"
                      @blur="handleWelfareInputConfirm"
                    />
                    <el-button v-else size="small" @click="showWelfareInput">
                      <el-icon><Plus /></el-icon>
                      添加福利
                    </el-button>
                  </div>
                </el-form-item>
              </div>

              <!-- 企业简介 -->
              <div class="form-section">
                <h4 class="section-title">企业简介</h4>
                <el-form-item prop="description">
                  <el-input
                    v-model="formData.description"
                    type="textarea"
                    :rows="5"
                    placeholder="请介绍公司的发展历程、业务范围、企业文化等"
                    maxlength="1000"
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
import { OfficeBuilding, Upload, Plus, RefreshRight, Select, Edit, Close } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import AppLayout from '@/components/AppLayout.vue';
import {
  getCompanyInfo,
  updateCompanyInfo,
  uploadCompanyLogo,
  uploadBusinessLicense,
  uploadFile
} from '@/utils/api';

// ==================== 行业选项 ====================
const industryOptions = [
  '互联网',
  '电子商务',
  '金融',
  '房地产',
  '教育培训',
  '医疗健康',
  '制造业',
  '零售',
  '物流',
  '旅游',
  '传媒',
  '其他'
];

// ==================== 表单数据 ====================
const loading = ref(true);
const saving = ref(false);
const isEditing = ref(false); // 编辑模式状态
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  id: 0,
  companyName: '',
  legalPerson: '',
  industry: '',
  scale: undefined as number | undefined,
  financingStage: undefined as number | undefined,
  city: '',
  address: '',
  email: '',
  phone: '',
  website: '',
  description: '',
  welfare: '',
  logo: '',
  businessLicense: ''
});

// ==================== 表单校验规则 ====================
const formRules: FormRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  website: [
    { type: 'url', message: '请输入正确的网址格式', trigger: 'blur' }
  ]
};

// ==================== 福利待遇相关 ====================
const welfareList = ref<string[]>([]);
const welfareInputVisible = ref(false);
const welfareInputValue = ref('');
const welfareInputRef = ref<HTMLInputElement>();

/**
 * 添加福利待遇
 */
const showWelfareInput = () => {
  welfareInputVisible.value = true;
  nextTick(() => {
    welfareInputRef.value?.focus();
  });
};

/**
 * 确认添加福利
 */
const handleWelfareInputConfirm = () => {
  if (welfareInputValue.value) {
    welfareList.value.push(welfareInputValue.value);
  }
  welfareInputVisible.value = false;
  welfareInputValue.value = '';
  // 更新 formData 中的 welfare
  formData.welfare = JSON.stringify(welfareList.value);
};

/**
 * 删除福利
 */
const removeWelfare = (index: number) => {
  welfareList.value.splice(index, 1);
  formData.welfare = JSON.stringify(welfareList.value);
};

// ==================== Logo上传相关 ====================
const logoInputRef = ref<HTMLInputElement>();

/**
 * 触发Logo上传
 */
const triggerLogoUpload = () => {
  logoInputRef.value?.click();
};

/**
 * 处理Logo选择
 */
const handleLogoChange = async (event: Event) => {
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
    const uploadRes = await uploadFile(file, 'logo');
    const fileUrl = uploadRes.fileUrl;

    // 再调用接口保存Logo URL
    await uploadCompanyLogo(fileUrl);

    // 更新本地显示
    formData.logo = fileUrl;
    ElMessage.success('Logo上传成功');
  } catch (error) {
    console.error('Logo上传失败:', error);
  }

  // 清空 input，允许重复选择同一文件
  target.value = '';
};

// ==================== 营业执照上传相关 ====================
const licenseInputRef = ref<HTMLInputElement>();

/**
 * 触发营业执照上传
 */
const triggerLicenseUpload = () => {
  licenseInputRef.value?.click();
};

/**
 * 处理营业执照选择
 */
const handleLicenseChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 校验文件类型（营业执照支持图片格式和PDF）
  const allowedLicenseTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',
    'application/pdf'
  ];
  if (!allowedLicenseTypes.includes(file.type.toLowerCase())) {
    ElMessage.warning('请上传图片文件（JPEG、PNG、GIF、WebP）或PDF文件');
    return;
  }

  // 校验文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('文件大小不能超过5MB');
    return;
  }

  try {
    // 先上传文件到OSS
    const uploadRes = await uploadFile(file, 'license');
    const fileUrl = uploadRes.fileUrl;

    // 再调用接口保存营业执照 URL
    await uploadBusinessLicense(fileUrl);

    // 更新本地显示
    formData.businessLicense = fileUrl;
    ElMessage.success('营业执照上传成功');
  } catch (error) {
    console.error('营业执照上传失败:', error);
  }

  // 清空 input
  target.value = '';
};

/**
 * 删除营业执照
 */
const handleRemoveLicense = () => {
  formData.businessLicense = '';
  // TODO: 如果后端支持删除营业执照，可以调用删除接口
};

// ==================== 获取和保存数据 ====================

/**
 * 获取企业信息
 */
const fetchData = async () => {
  try {
    loading.value = true;
    
    // 检查用户是否已登录且是企业HR角色
    const userStore = useUserStore();
    if (!userStore.isLogin || userStore.userInfo?.role !== 2) {
      console.warn('用户未登录或不是企业HR角色');
      loading.value = false;
      return;
    }
    
    const res = await getCompanyInfo();

    // 填充表单数据
    Object.assign(formData, res);

    // 解析福利待遇
    if (res.welfare) {
      try {
        welfareList.value = JSON.parse(res.welfare);
      } catch {
        welfareList.value = [];
      }
    }
  } catch (error) {
    console.error('获取企业信息失败:', error);
    // 显示错误信息
    ElMessage.error('获取企业信息失败，请检查网络连接');
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
    formData.companyName = '';
    formData.legalPerson = '';
    formData.industry = '';
    formData.scale = undefined;
    formData.financingStage = undefined;
    formData.city = '';
    formData.address = '';
    formData.email = '';
    formData.phone = '';
    formData.website = '';
    formData.description = '';
    formData.welfare = '';
    formData.logo = '';
    formData.businessLicense = '';
    welfareList.value = [];

    // 重置表单验证
    formRef.value?.clearValidate();

    ElMessage.success('信息已重置');
  } catch {
    // 用户取消操作
  }
};

/**
 * 判断是否为首次填写（没有关联的企业信息）
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
      companyName: formData.companyName,
      legalPerson: formData.legalPerson,
      industry: formData.industry,
      scale: formData.scale,
      financingStage: formData.financingStage,
      city: formData.city,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      description: formData.description,
      welfare: formData.welfare
    };

    await updateCompanyInfo(requestData);
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
.company-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== 标签切换 ==================== */
/* 已移除标签切换样式，现在通过左侧导航栏切换 */

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
.company-form:deep(.el-form-item.is-disabled .el-form-item__label) {
  color: #909399;
}

.company-form:deep(.el-form-item.is-disabled .el-input .el-input__wrapper),
.company-form:deep(.el-form-item.is-disabled .el-select .el-input__wrapper),
.company-form:deep(.el-form-item.is-disabled .el-textarea .el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
}

.company-form:deep(.el-form-item.is-disabled .el-radio),
.company-form:deep(.el-form-item.is-disabled .el-checkbox) {
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
.company-content {
  display: flex;
  gap: 20px;
}

.company-left {
  width: 300px;
  flex-shrink: 0;
}

.company-right {
  flex: 1;
  min-width: 0;
}

/* ==================== Logo卡片 ==================== */
.logo-card :deep(.el-card__body) {
  padding-top: 10px;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.logo-upload {
  margin-top: 16px;
}

/* ==================== 营业执照卡片 ==================== */
.license-card :deep(.el-card__body) {
  padding-top: 0;
}

.license-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.license-image {
  width: 100%;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.license-upload {
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
.company-form {
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

/* ==================== 福利标签 ==================== */
.welfare-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.welfare-tag {
  font-size: 14px;
}

.welfare-input {
  width: 120px;
}



/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .company-content {
    flex-direction: column;
  }

  .company-left {
    width: 100%;
  }
}
</style>
