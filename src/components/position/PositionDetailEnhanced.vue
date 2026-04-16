<template>
  <div class="position-detail-enhanced">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>加载职位详情中...</p>
    </div>

    <!-- 职位详情内容 -->
    <div v-else-if="positionDetail" class="detail-content">
      <!-- 职位头部信息 -->
      <div class="detail-header">
        <div class="position-header-section">
          <h2 class="position-title">{{ positionDetail.position.title }}</h2>
          
          <!-- 公司信息头部 -->
          <div class="company-header-section">
            <div class="company-logo-wrapper">
              <img
                v-if="positionDetail.company.logo"
                :src="positionDetail.company.logo"
                alt="公司Logo"
                class="company-logo-medium"
                @error="handleCompanyLogoError"
              />
              <div v-else class="company-logo-placeholder-medium">
                {{ getCompanyInitial(positionDetail.company.companyName) }}
              </div>
            </div>
            
            <div class="company-info-header">
              <h3 class="company-name-large">
                {{ positionDetail.company.companyName }}
              </h3>
              <div class="company-meta">
                <el-tag v-if="positionDetail.company.industry" size="small">
                  {{ positionDetail.company.industry }}
                </el-tag>
                <el-tag v-if="positionDetail.company.scale" size="small" type="info">
                  {{ getCompanyScale(positionDetail.company.scale) }}
                </el-tag>
                <el-tag v-if="positionDetail.company.financingStage" size="small" type="warning">
                  {{ getFinancingStage(positionDetail.company.financingStage) }}
                </el-tag>
                <el-tag v-if="positionDetail.company.city" size="small" type="success">
                  <el-icon><Location /></el-icon>
                  {{ positionDetail.company.city }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 薪资和状态信息 -->
        <div class="position-metadata">
          <div class="salary-info">
            <div class="salary-display">
              <span class="salary-text">
                {{ formatSalary(positionDetail.position.salaryMin, positionDetail.position.salaryMax) }}
              </span>
              <span class="salary-label">薪资范围</span>
            </div>
          </div>
          
          <div class="status-info">
            <el-tag 
              :type="positionDetail.position.status === 1 ? 'success' : 'info'" 
              size="large"
              effect="plain"
            >
              {{ getPositionStatus(positionDetail.position.status) }}
            </el-tag>
            <p class="publish-time">
              发布于 {{ formatDate(positionDetail.position.createTime) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 职位基本信息卡片 -->
      <el-card class="basic-info-card">
        <template #header>
          <div class="card-header">
            <h3>职位信息</h3>
          </div>
        </template>
        
        <div class="basic-info-grid">
          <div class="basic-info-item">
            <span class="info-label">工作城市</span>
            <span class="info-value">
              {{ positionDetail.position.city }}
            </span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">职位类别</span>
            <span class="info-value">
              {{ positionDetail.position.category }}
            </span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">学历要求</span>
            <span class="info-value">
              {{ formatEducation(positionDetail.position.educationMin) }}
            </span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">经验要求</span>
            <span class="info-value">
              {{ positionDetail.position.workYearsMin }}年以上
            </span>
          </div>
        </div>
      </el-card>

      <!-- 公司信息详情卡片 -->
      <el-card class="company-detail-card">
        <template #header>
          <div class="card-header">
            <h3>公司介绍</h3>
          </div>
        </template>
        
        <div class="company-detail-content">
          <div class="company-description">
            <h4>公司简介</h4>
            <p v-if="positionDetail.company.description">
              {{ positionDetail.company.description }}
            </p>
            <p v-else class="no-content">暂无公司简介</p>
          </div>
          
          <div class="company-contact" v-if="positionDetail.company.email || positionDetail.company.phone || positionDetail.company.website">
            <h4>联系方式</h4>
            <div class="contact-list">
              <div class="contact-item" v-if="positionDetail.company.email">
                <el-icon><Message /></el-icon>
                <span>{{ positionDetail.company.email }}</span>
              </div>
              <div class="contact-item" v-if="positionDetail.company.phone">
                <el-icon><Phone /></el-icon>
                <span>{{ positionDetail.company.phone }}</span>
              </div>
              <div class="contact-item" v-if="positionDetail.company.website">
                <el-icon><Link /></el-icon>
                <a :href="positionDetail.company.website" target="_blank" class="website-link">
                  {{ positionDetail.company.website }}
                </a>
              </div>
            </div>
          </div>
          
          <div class="company-welfare" v-if="positionDetail.company.welfare">
            <h4>公司福利</h4>
            <div class="welfare-tags">
              <el-tag
                v-for="welfare in parseWelfare(positionDetail.company.welfare)"
                :key="welfare"
                type="primary"
                effect="plain"
                size="small"
                class="welfare-tag"
              >
                {{ welfare }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 职位详细说明 -->
      <div class="position-detail-sections">
        <el-card class="position-section-card">
          <template #header>
            <div class="card-header">
              <h3>岗位职责</h3>
            </div>
          </template>
          
          <div class="section-content">
            <pre>{{ positionDetail.position.description }}</pre>
          </div>
        </el-card>
        
        <el-card class="position-section-card">
          <template #header>
            <div class="card-header">
              <h3>任职要求</h3>
            </div>
          </template>
          
          <div class="section-content">
            <pre>{{ positionDetail.position.requirement }}</pre>
          </div>
        </el-card>

        <!-- 职位福利标签 -->
        <div class="position-tags-section" v-if="positionDetail.position.tags">
          <h3>职位福利</h3>
          <div class="position-tags">
            <el-tag
              v-for="tag in parseTags(positionDetail.position.tags)"
              :key="tag"
              type="primary"
              effect="plain"
              size="medium"
              class="position-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="加载职位详情失败">
        <p>无法加载职位详情，请稍后重试</p>
        <el-button type="primary" @click="loadPositionDetail">重试</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Location, Message, Phone, Link } from '@element-plus/icons-vue'
import { getPositionDetailWithCompany } from '../../utils/api'
import type { PositionInfo, CompanyInfo } from '../../types'
import { EDUCATION_MAP, SCALE_MAP, FINANCING_MAP, POSITION_STATUS_MAP } from '../../types'

interface Props {
  positionId: number
}

interface PositionDetailWithCompany {
  position: PositionInfo
  company: CompanyInfo
}

const props = defineProps<Props>()

// 状态
const loading = ref(true)
const positionDetail = ref<PositionDetailWithCompany | null>(null)

// 加载职位详情（包含公司信息）
const loadPositionDetail = async () => {
  try {
    loading.value = true
    const response = await getPositionDetailWithCompany(props.positionId)
    positionDetail.value = response
  } catch (error) {
    console.error('加载职位详情失败:', error)
    ElMessage.error('加载职位详情失败')
  } finally {
    loading.value = false
  }
}

// 工具函数
const formatSalary = (min: number, max: number): string => {
  return `${min}K - ${max}K`
}

const formatEducation = (level: number): string => {
  return EDUCATION_MAP[level] || '不限'
}

const getCompanyScale = (scale: number): string => {
  return SCALE_MAP[scale] || '未知规模'
}

const getFinancingStage = (stage: number): string => {
  return FINANCING_MAP[stage] || '未知融资阶段'
}

const getPositionStatus = (status: number): string => {
  return POSITION_STATUS_MAP[status as 0 | 1] || '未知状态'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

const parseWelfare = (welfareString: string): string[] => {
  if (!welfareString) return []
  try {
    const welfare = JSON.parse(welfareString)
    return Array.isArray(welfare) ? welfare : []
  } catch (error) {
    console.error('解析公司福利失败:', error)
    return []
  }
}

const parseTags = (tagsString: string): string[] => {
  if (!tagsString) return []
  try {
    const tags = JSON.parse(tagsString)
    return Array.isArray(tags) ? tags : []
  } catch (error) {
    console.error('解析职位标签失败:', error)
    return []
  }
}

// Logo处理函数
const handleCompanyLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    const companyName = positionDetail.value?.company.companyName || ''
    parent.innerHTML = `
      <div class="company-logo-placeholder-medium">
        ${getCompanyInitial(companyName)}
      </div>
    `
  }
}

const getCompanyInitial = (companyName?: string): string => {
  if (!companyName || companyName.trim().length === 0) return '公'
  const firstChar = companyName.trim().charAt(0)
  return firstChar.toUpperCase()
}

// 组件挂载时加载数据
onMounted(() => {
  loadPositionDetail()
})

// 公开方法供父组件调用
const refreshDetail = () => {
  loadPositionDetail()
}

defineExpose({
  refreshDetail
})
</script>

<style scoped lang="scss">
.position-detail-enhanced {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 加载状态 */
.loading-container {
  padding: 60px 20px;
  text-align: center;
  color: #409eff;
  
  .loading-icon {
    font-size: 40px;
    margin-bottom: 12px;
    animation: spin 1.5s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  padding: 40px 20px;
  text-align: center;
}

/* 详情头部 */
.detail-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  
  .position-header-section {
    margin-bottom: 20px;
    
    .position-title {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 20px 0;
      line-height: 1.3;
    }
    
    .company-header-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      
      .company-logo-wrapper {
        .company-logo-medium {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #ebeef5;
        }
        
        .company-logo-placeholder-medium {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00beaa, #00c9b7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          border: 1px solid #ebeef5;
        }
      }
      
      .company-info-header {
        .company-name-large {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 12px 0;
        }
        
        .company-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }
  }
  
  .position-metadata {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 20px;
    
    .salary-info {
      .salary-display {
        display: flex;
        flex-direction: column;
        
        .salary-text {
          font-size: 32px;
          font-weight: 700;
          color: #f56c6c;
          margin-bottom: 4px;
        }
        
        .salary-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
    
    .status-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      
      .publish-time {
        font-size: 12px;
        color: #c0c4cc;
        margin: 0;
      }
    }
  }
}

/* 卡片通用样式 */
.basic-info-card,
.company-detail-card,
.position-section-card {
  margin-bottom: 24px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  
  .card-header {
    display: flex;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

/* 基本信息网格 */
.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px 32px;
  
  .basic-info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}

/* 公司详情内容 */
.company-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }
  
  .company-description p {
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
    margin: 0;
    white-space: pre-wrap;
    
    &.no-content {
      color: #c0c4cc;
      font-style: italic;
    }
  }
  
  .company-contact {
    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #303133;
        
        .el-icon {
          color: #409eff;
          font-size: 16px;
        }
        
        .website-link {
          color: #409eff;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .company-welfare {
    .welfare-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .welfare-tag {
        font-size: 12px;
        border-radius: 6px;
        padding: 4px 8px;
      }
    }
  }
}

/* 职位详情部分 */
.position-detail-sections {
  .position-section-card {
    margin-bottom: 20px;
    
    .section-content {
      pre {
        font-size: 14px;
        line-height: 1.8;
        color: #606266;
        margin: 0;
        font-family: inherit;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
  }
  
  .position-tags-section {
    margin-top: 24px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
    }
    
    .position-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .position-tag {
        border-radius: 8px;
        padding: 8px 12px;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .company-header-section {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .position-metadata {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .status-info {
    align-items: flex-start !important;
  }
  
  .basic-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>