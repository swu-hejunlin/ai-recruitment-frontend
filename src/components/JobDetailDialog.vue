<template>
  <el-dialog
    v-model="visible"
    :title="position?.title || '职位详情'"
    width="800px"
    top="5vh"
  >
    <div v-if="position" class="job-detail-content">
      <!-- 职位标题和薪资 -->
      <div class="detail-header">
        <div class="detail-title-section">
          <h2>{{ position.title }}</h2>
          <div class="detail-salary">
            {{ position.salaryMin ? `${position.salaryMin}k` : '面议' }}
            {{ position.salaryMax ? `- ${position.salaryMax}k` : '' }}
          </div>
        </div>
        
        <!-- 公司信息 -->
        <div class="detail-company-info">
          <div class="company-logo-name">
            <img v-if="position.companyLogo" :src="position.companyLogo" alt="公司Logo" class="company-logo" />
            <h3>{{ position.companyName || '未指定公司' }}</h3>
          </div>
        </div>
      </div>

      <!-- 基本信息表格 -->
      <div class="detail-basic-info">
        <h3>基本信息</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">职位类别：</span>
              <span class="info-value">{{ position.category || '未指定' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">工作城市：</span>
              <span class="info-value">{{ position.city || '未指定' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">工作地址：</span>
              <span class="info-value">{{ position.address || '未指定' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">学历要求：</span>
              <span class="info-value">{{ formatEducation(position.educationMin) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">工作经验：</span>
              <span class="info-value">{{ formatExperience(position.workYearsMin) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">职位状态：</span>
              <span class="info-value status-tag" :class="{'status-closed': position.status === 0, 'status-open': position.status === 1}">
                {{ position.status === 1 ? '招聘中' : '已关闭' }}
              </span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">发布时间：</span>
              <span class="info-value">{{ formatDate(position.createTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 岗位职责 -->
      <div class="detail-section">
        <h3>岗位职责</h3>
        <div class="detail-content">
          <pre>{{ position.description || '暂无岗位职责描述' }}</pre>
        </div>
      </div>

      <!-- 任职要求 -->
      <div class="detail-section">
        <h3>任职要求</h3>
        <div class="detail-content">
          <pre>{{ position.requirement || '暂无任职要求' }}</pre>
        </div>
      </div>

      <!-- 福利标签 -->
      <div v-if="parseTags(position.tags).length > 0" class="detail-section">
        <h3>公司福利</h3>
        <div class="benefits-container">
          <el-tag v-for="tag in parseTags(position.tags)" :key="tag" class="benefit-tag">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
    <div v-else class="loading-detail">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="showApplyButton"
          type="primary"
          @click="handleApply"
          :disabled="position && position.status !== 1"
        >
          立即投递
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import type { PositionInfo, EducationLevel } from '@/types'

interface Props {
  modelValue: boolean
  position: PositionInfo | null
  showApplyButton?: boolean
}

interface Emits {
  (event: 'update:modelValue', value: boolean): void
  (event: 'apply', position: PositionInfo): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 学历映射
const educationMap: Record<EducationLevel, string> = {
  1: '高中及以下',
  2: '大专',
  3: '本科',
  4: '硕士',
  5: '博士'
}

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const handleApply = () => {
  if (props.position) {
    if (props.position.status !== 1) {
      ElMessage.warning('该职位已关闭，无法投递')
      return
    }
    emit('apply', props.position)
  }
}

// 工具函数
const formatEducation = (educationLevel?: EducationLevel): string => {
  if (!educationLevel) return '不限'
  return educationMap[educationLevel] || '未知'
}

const formatExperience = (years?: number): string => {
  if (years === undefined || years === null) return '不限'
  if (years === 0) return '应届生'
  if (years === 1) return '1年以下'
  if (years < 3) return '1-3年'
  if (years < 5) return '3-5年'
  if (years < 10) return '5-10年'
  return '10年以上'
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

const parseTags = (tagsString?: string): string[] => {
  if (!tagsString) return []
  try {
    const tags = JSON.parse(tagsString)
    return Array.isArray(tags) ? tags : []
  } catch (error) {
    console.error('解析标签失败:', error)
    return []
  }
}
</script>

<style scoped>
.job-detail-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.detail-title-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  flex: 1;
}

.detail-salary {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
  margin-left: 20px;
}

.company-logo-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.detail-company-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #409eff;
}

.detail-basic-info {
  margin: 24px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-basic-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.el-row {
  margin-bottom: 0 !important;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  min-height: 32px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  flex: 1;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.status-open {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.status-closed {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.detail-section {
  margin: 24px 0;
}

.detail-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.detail-content {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.detail-content pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.benefits-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.benefit-tag {
  font-size: 14px;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
}

.loading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #409eff;
}

.loading-detail .loading-icon {
  font-size: 40px;
  margin-bottom: 10px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>