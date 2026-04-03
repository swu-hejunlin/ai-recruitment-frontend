<template>
  <div class="position-detail-view">
    <!-- 职位头部信息 -->
    <div class="position-header">
      <div class="header-content">
        <h2 class="position-title">{{ position.title }}</h2>
        <div class="position-meta">
          <div class="company-info">
            <span v-if="position.companyLogo" class="company-logo">
              <el-avatar :size="32" :src="position.companyLogo" />
            </span>
            <span class="company-name">{{ position.companyName || '未知公司' }}</span>
          </div>
          <div class="location-info">
            <span class="location-item">
              <el-icon><Location /></el-icon>
              {{ position.city }}
              <template v-if="position.address">
                · {{ position.address }}
              </template>
            </span>
            <span class="location-item">
              <el-icon><OfficeBuilding /></el-icon>
              {{ position.category }}
            </span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <el-tag
          :type="position.status === 1 ? 'success' : 'info'"
          effect="plain"
          size="large"
        >
          {{ POSITION_STATUS_MAP[position.status] }}
        </el-tag>
      </div>
    </div>

    <!-- 薪资信息 -->
    <div class="salary-section">
      <div class="salary-display">
        <span class="salary-text">{{ formatSalary(position.salaryMin, position.salaryMax) }}</span>
        <span class="salary-desc">薪资范围</span>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="info-card-header">
          <h3>职位要求</h3>
        </div>
      </template>

      <div class="info-list">
        <div class="info-item">
          <span class="label">学历要求</span>
          <span class="value">{{ formatEducation(position.educationMin) }}</span>
        </div>
        <div class="info-item">
          <span class="label">工作经验</span>
          <span class="value">{{ position.workYearsMin }}年以上</span>
        </div>
        <div class="info-item">
          <span class="label">发布时间</span>
          <span class="value">{{ formatDate(position.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">最后更新</span>
          <span class="value">{{ formatDate(position.updateTime) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 岗位职责 -->
    <el-card class="content-card">
      <template #header>
        <div class="content-card-header">
          <h3>岗位职责</h3>
        </div>
      </template>

      <div class="content-text">
        <pre>{{ position.description }}</pre>
      </div>
    </el-card>

    <!-- 任职要求 -->
    <el-card class="content-card">
      <template #header>
        <div class="content-card-header">
          <h3>任职要求</h3>
        </div>
      </template>

      <div class="content-text">
        <pre>{{ position.requirement }}</pre>
      </div>
    </el-card>

    <!-- 公司福利 -->
    <div v-if="position.tags" class="benefits-section">
      <h3>公司福利</h3>
      <div class="benefits-tags">
        <el-tag
          v-for="tag in tagsList"
          :key="tag"
          type="primary"
          effect="plain"
          size="large"
          class="benefit-tag"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="mode === 'manage'" class="action-buttons">
      <el-button
        @click="handleEdit"
        type="primary"
        size="large"
      >
        编辑职位
      </el-button>
      <el-button
        @click="handleToggleStatus"
        :type="position.status === 1 ? 'warning' : 'success'"
        size="large"
      >
        {{ position.status === 1 ? '关闭招聘' : '开启招聘' }}
      </el-button>
      <el-button
        @click="handleDelete"
        type="danger"
        size="large"
      >
        删除职位
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Location, OfficeBuilding } from '@element-plus/icons-vue'
import { closePosition, openPosition, deletePosition } from '@/utils/api'
import { POSITION_STATUS_MAP, EDUCATION_MAP } from '@/types'
import type { PositionInfo, EducationLevel } from '@/types'

interface Props {
  position: PositionInfo
  mode?: 'view' | 'manage'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'view'
})

const emit = defineEmits<{
  edit: [position: PositionInfo]
  delete: []
  close: []
}>()

// 解析标签列表
const tagsList = computed(() => {
  if (!props.position.tags) return []
  try {
    return JSON.parse(props.position.tags)
  } catch {
    return []
  }
})

// 格式化薪资
const formatSalary = (min: number, max: number): string => {
  return `${min}K - ${max}K/月`
}

// 格式化学历
const formatEducation = (level: EducationLevel): string => {
  return EDUCATION_MAP[level] || '不限'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理编辑
const handleEdit = () => {
  emit('edit', props.position)
}

// 处理状态切换
const handleToggleStatus = async () => {
  try {
    if (props.position.status === 1) {
      await closePosition(props.position.id)
    } else {
      await openPosition(props.position.id)
    }
    emit('close')
  } catch (error) {
    console.error('切换职位状态失败:', error)
  }
}

// 处理删除
const handleDelete = async () => {
  try {
    await deletePosition(props.position.id)
    emit('delete')
  } catch (error) {
    console.error('删除职位失败:', error)
  }
}
</script>

<style scoped lang="scss">
.position-detail-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;

  .header-content {
    flex: 1;

    .position-title {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
      color: #222;
      line-height: 1.3;
    }

    .position-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .company-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .company-logo {
          display: flex;
          align-items: center;
        }

        .company-name {
          font-size: 16px;
          font-weight: 500;
          color: #666;
        }
      }

      .location-info {
        display: flex;
        gap: 24px;

        .location-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #999;

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }

  .header-actions {
    .el-tag {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.salary-section {
  .salary-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, #00beaa 0%, #00a896 100%);
    border-radius: 12px;
    padding: 20px;
    color: white;

    .salary-text {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .salary-desc {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.info-card, .content-card {
  .info-card-header, .content-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #222;
    }
  }
}

.info-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 14px;
      color: #999;
    }

    .value {
      font-size: 14px;
      color: #222;
      font-weight: 500;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.content-text {
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  word-break: break-word;

  pre {
    margin: 0;
    font-family: inherit;
    white-space: pre-wrap;
  }
}

.benefits-section {
  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #222;
  }

  .benefits-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .benefit-tag {
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 8px;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  .el-button {
    flex: 1;
  }
}
</style>