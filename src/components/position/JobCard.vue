<template>
  <div class="job-card" @click="handleClick">
    <!-- 卡片顶部 -->
    <div class="card-header">
      <div class="company-info">
        <!-- 公司Logo -->
        <div v-if="job.companyLogo" class="company-logo">
          <el-avatar :size="48" :src="job.companyLogo" />
        </div>
        <div v-else class="company-logo-placeholder">
          <el-avatar :size="48" :style="{ backgroundColor: '#00beaa', color: 'white' }">
            {{ getCompanyInitial(job.companyName || job.companyShortName || '') }}
          </el-avatar>
        </div>
        
        <!-- 公司名称和职位标题 -->
        <div class="company-text">
          <h3 class="job-title">{{ job.title }}</h3>
          <div class="company-name">
            {{ job.companyName || job.companyShortName || '未知公司' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 薪资信息 -->
    <div class="salary-info">
      <span class="salary-text">{{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
    </div>

    <!-- 职位基本信息 -->
    <div class="job-meta">
      <div class="meta-item">
        <el-icon size="16"><Location /></el-icon>
        <span class="meta-text">{{ job.city }}</span>
      </div>
      <div class="meta-item">
        <el-icon size="16"><Briefcase /></el-icon>
        <span class="meta-text">{{ job.category }}</span>
      </div>
      <div class="meta-item">
        <el-icon size="16"><School /></el-icon>
        <span class="meta-text">{{ formatEducation(job.educationMin) }}</span>
      </div>
      <div class="meta-item">
        <el-icon size="16"><Clock /></el-icon>
        <span class="meta-text">{{ formatTime(job.createTime) }}</span>
      </div>
    </div>

    <!-- 福利标签 -->
    <div v-if="tags.length > 0" class="benefits-tags">
      <el-tag
        v-for="tag in tags.slice(0, 3)"
        :key="tag"
        size="small"
        type="primary"
        effect="plain"
        class="benefit-tag"
      >
        {{ tag }}
      </el-tag>
      <!-- 更多标签提示 -->
      <span v-if="tags.length > 3" class="more-tags">+{{ tags.length - 3 }}</span>
    </div>

    <!-- 卡片底部 -->
    <div class="card-actions">
      <el-button type="primary" @click.stop="handleViewDetail" size="small">
        查看详情
      </el-button>
      <el-button @click.stop="handleFavorite" size="small">
        <el-icon>
          <Star v-if="isFavorite" style="color: #fadb14" />
          <Star v-else />
        </el-icon>
        {{ isFavorite ? '已收藏' : '收藏' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Location, Briefcase, School, Clock, Star } from '@element-plus/icons-vue'
import { EDUCATION_MAP } from '../../types'
import type { PositionInfo, EducationLevel } from '../../types'
import { addFavorite, removeFavorite, checkFavorite } from '../../utils/api'

interface Props {
  job: PositionInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

// 收藏状态
const isFavorite = ref(false)

// 检查收藏状态
const checkFavoriteStatus = async () => {
  try {
    const response = await checkFavorite(1, props.job.id)
    isFavorite.value = response.isFavorite
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 处理收藏操作
const handleFavorite = async () => {
  try {
    if (isFavorite.value) {
      // 取消收藏
      await removeFavorite(1, props.job.id)
      isFavorite.value = false
    } else {
      // 添加收藏
      await addFavorite(1, props.job.id)
      isFavorite.value = true
    }
  } catch (error) {
    console.error('处理收藏操作失败:', error)
  }
}

// 初始化时检查收藏状态
onMounted(() => {
  checkFavoriteStatus()
})

// 解析标签列表
const tags = computed(() => {
  if (!props.job.tags) return []
  try {
    return JSON.parse(props.job.tags)
  } catch {
    return []
  }
})

// 获取公司名称首字母
const getCompanyInitial = (name: string): string => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 格式化薪资
const formatSalary = (min: number, max: number): string => {
  return `${min}K - ${max}K/月`
}

// 格式化学历
const formatEducation = (level: EducationLevel): string => {
  return EDUCATION_MAP[level] || '不限'
}

// 格式化发布时间
const formatTime = (dateStr: string): string => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}月前`
  } else {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}-${month.toString().padStart(2, '0')}`
  }
}

// 处理卡片点击
const handleClick = () => {
  emit('click')
}

// 处理查看详情（阻止事件冒泡）
const handleViewDetail = (e: Event) => {
  e.stopPropagation()
  emit('click')
}
</script>

<style scoped lang="scss">
.job-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 190, 170, 0.12);
    border-color: #e6f9f6;
  }

  &:active {
    transform: translateY(-2px);
  }
}

.card-header {
  margin-bottom: 16px;

  .company-info {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .company-logo,
    .company-logo-placeholder {
      flex-shrink: 0;
    }

    .company-text {
      flex: 1;

      .job-title {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #222;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        display: -moz-box;
        -moz-line-clamp: 2;
        -moz-box-orient: vertical;
        display: box;
        line-clamp: 2;
        box-orient: vertical;
        overflow: hidden;
      }

      .company-name {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
    }
  }
}

.salary-info {
  margin-bottom: 16px;

  .salary-text {
    font-size: 24px;
    font-weight: 600;
    color: #ff4d4f;
    line-height: 1.2;
  }
}

.job-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #999;
      flex-shrink: 0;
    }

    .meta-text {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }
}

.benefits-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  min-height: 28px;

  .benefit-tag {
    margin: 0;
    font-size: 12px;
    border-radius: 4px;
    padding: 0 8px;
    height: 24px;
  }

  .more-tags {
    font-size: 12px;
    color: #999;
    line-height: 24px;
    margin-left: 4px;
  }
}

.card-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;

  .el-button {
    min-width: 100px;
  }
}
</style>