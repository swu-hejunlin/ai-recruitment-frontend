<template>
  <AppLayout>
    <div class="company-detail-page">
      <!-- 页面头部导航（始终显示） -->
      <div class="page-header-nav">
        <el-button 
          type="primary" 
          plain 
          @click="goBack"
          class="back-button"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="5" animated />
        <div style="text-align: center; margin-top: 20px; color: #909399;">
          正在加载公司信息...
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-wrapper">
        <el-empty description="加载公司信息失败">
          <p>{{ errorMessage }}</p>
          <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px;">
            <el-button type="primary" @click="loadCompanyDetail">重试</el-button>
            <el-button @click="goBack">返回</el-button>
          </div>
        </el-empty>
      </div>

      <!-- 公司详情内容 -->
      <div v-else-if="companyDetail" class="company-detail-content">
        <!-- 公司头部信息 -->
        <div class="company-header">
          <div class="company-basic-info">
            <div class="company-logo-wrapper">
              <img
                v-if="companyDetail.logo"
                :src="companyDetail.logo"
                alt="公司Logo"
                class="company-logo-large"
                @error="handleLogoError"
              />
              <div v-else class="company-logo-placeholder-large">
                {{ getCompanyInitial(companyDetail.companyName) }}
              </div>
            </div>
            
            <div class="company-info-main">
              <h1 class="company-name">{{ companyDetail.companyName }}</h1>
              
              <div class="company-badges">
                <el-tag v-if="companyDetail.industry" size="medium">
                  {{ companyDetail.industry }}
                </el-tag>
                <el-tag v-if="companyDetail.scale" type="info" size="medium">
                  {{ getCompanyScale(companyDetail.scale) }}
                </el-tag>
                <el-tag v-if="companyDetail.financingStage" type="warning" size="medium">
                  {{ getFinancingStage(companyDetail.financingStage) }}
                </el-tag>
              </div>
              
              <div class="company-location">
                <el-icon><Location /></el-icon>
                <span>{{ companyDetail.city }}</span>
                <span v-if="companyDetail.address" class="address-detail">
                  · {{ companyDetail.address }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 公司联系方式卡片 -->
          <div class="company-contact-card">
            <h3 class="contact-title">联系方式</h3>
            <div class="contact-list">
              <div v-if="companyDetail.email" class="contact-item">
                <el-icon><Message /></el-icon>
                <span>{{ companyDetail.email }}</span>
              </div>
              <div v-if="companyDetail.phone" class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>{{ companyDetail.phone }}</span>
              </div>
              <div v-if="companyDetail.website" class="contact-item">
                <el-icon><Link /></el-icon>
                <a :href="companyDetail.website" target="_blank" class="website-link">
                  {{ companyDetail.website }}
                </a>
              </div>
            </div>
            
            <!-- 收藏按钮 -->
            <div class="company-actions">
              <el-button 
                @click="handleFavorite" 
                :type="isFavorite ? 'warning' : 'primary'"
                plain
                size="medium"
                class="favorite-button"
              >
                <el-icon><Star /></el-icon>
                {{ isFavorite ? '已收藏' : '收藏公司' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 公司详情网格 -->
        <div class="company-detail-grid">
          <!-- 公司介绍 -->
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <h3>公司简介</h3>
              </div>
            </template>
            
            <div class="description-content">
              <p v-if="companyDetail.description">
                {{ companyDetail.description }}
              </p>
              <p v-else class="no-content">暂无公司简介</p>
            </div>
          </el-card>

          <!-- 公司福利 -->
          <el-card v-if="companyWelfare.length > 0" class="detail-card">
            <template #header>
              <div class="card-header">
                <h3>公司福利</h3>
              </div>
            </template>
            
            <div class="welfare-list">
              <div v-for="welfare in companyWelfare" :key="welfare" class="welfare-item">
                <el-icon color="#00beaa" style="margin-right: 8px;"><CircleCheck /></el-icon>
                <span>{{ welfare }}</span>
              </div>
            </div>
          </el-card>

          <!-- 公司信息详情 -->
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <h3>公司信息</h3>
              </div>
            </template>
            
            <div class="company-info-list">
              <div class="info-item" v-if="companyDetail.legalPerson">
                <span class="info-label">法人代表：</span>
                <span class="info-value">{{ companyDetail.legalPerson }}</span>
              </div>
              <div class="info-item" v-if="companyDetail.email">
                <span class="info-label">企业邮箱：</span>
                <span class="info-value">{{ companyDetail.email }}</span>
              </div>
              <div class="info-item" v-if="companyDetail.phone">
                <span class="info-label">联系电话：</span>
                <span class="info-value">{{ companyDetail.phone }}</span>
              </div>
              <div class="info-item" v-if="companyDetail.website">
                <span class="info-label">官方网站：</span>
                <span class="info-value">
                  <a :href="companyDetail.website" target="_blank" class="website-link">
                    {{ companyDetail.website }}
                  </a>
                </span>
              </div>
              <div class="info-item" v-if="companyDetail.createTime">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ formatDate(companyDetail.createTime) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 公司招聘职位 -->
          <el-card class="detail-card positions-card">
            <template #header>
              <div class="card-header">
                <h3>正在招聘的职位</h3>
                <span class="positions-count">
                  {{ companyPositions.length }} 个职位
                </span>
              </div>
            </template>
            
            <div class="positions-list">
              <!-- 加载中 -->
              <div v-if="positionsLoading" class="positions-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>正在加载职位列表...</p>
              </div>
              
              <!-- 职位列表 -->
              <div v-else-if="companyPositions.length > 0" class="positions-container">
                <div 
                  v-for="position in companyPositions" 
                  :key="position.id" 
                  class="position-item"
                  @click="viewPosition(position)"
                >
                  <div class="position-header">
                    <h4 class="position-title">{{ position.title }}</h4>
                    <div class="position-salary">
                      {{ formatSalary(position.salaryMin, position.salaryMax) }}
                    </div>
                  </div>
                  <div class="position-meta">
                    <el-tag v-if="position.category" size="small">
                      {{ position.category }}
                    </el-tag>
                    <el-tag v-if="position.educationMin" size="small" type="info">
                      {{ formatEducation(position.educationMin) }}
                    </el-tag>
                    <span class="position-experience">
                      {{ position.workYearsMin }}年以上
                    </span>
                  </div>
                  <div class="position-footer">
                    <span class="position-status">
                      <el-tag 
                        :type="position.status === 1 ? 'success' : 'info'" 
                        size="mini"
                      >
                        {{ getPositionStatus(position.status) }}
                      </el-tag>
                    </span>
                    <span class="position-update">
                      发布于 {{ formatDate(position.createTime) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 无职位 -->
              <div v-else class="no-positions">
                <el-empty description="暂无招聘职位" :image-size="80">
                  <p class="no-positions-tip">该公司目前没有正在招聘的职位</p>
                </el-empty>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Message, Phone, Link, CircleCheck, Loading, ArrowLeft, Star } from '@element-plus/icons-vue'
// 动态导入组件
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'))
import { getCompanyById, getPositionsByCompany, addFavorite, removeFavorite, checkFavorite } from '../utils/api'
import type { CompanyInfo, PositionInfo } from '../types'
import { SCALE_MAP, FINANCING_MAP, EDUCATION_MAP, POSITION_STATUS_MAP } from '../types'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const companyDetail = ref<CompanyInfo | null>(null)
const companyPositions = ref<PositionInfo[]>([])
const positionsLoading = ref(false)
const isFavorite = ref(false)

// 获取路由参数中的公司ID
const companyId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : 0
})

// 解析公司福利
const companyWelfare = computed(() => {
  if (!companyDetail.value?.welfare) return []
  try {
    const welfare = JSON.parse(companyDetail.value.welfare)
    return Array.isArray(welfare) ? welfare : []
  } catch {
    return []
  }
})

// 加载公司详情
const loadCompanyDetail = async () => {
  if (!companyId.value) {
    error.value = true
    errorMessage.value = '未指定公司ID'
    loading.value = false
    return
  }
  
  try {
    loading.value = true
    error.value = false
    
    // 加载公司基本信息
    companyDetail.value = await getCompanyById(companyId.value)
    
    // 检查收藏状态
    await checkFavoriteStatus()
    
    // 同时加载公司职位
    await loadCompanyPositions()
    
  } catch (err: any) {
    console.error('加载公司详情失败:', err)
    error.value = true
    errorMessage.value = err.message || '加载公司详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!companyId.value) return
  
  try {
    const response = await checkFavorite(2, companyId.value)
    isFavorite.value = response.isFavorite
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 处理收藏操作
const handleFavorite = async () => {
  if (!companyId.value) return
  
  try {
    if (isFavorite.value) {
      // 取消收藏
      await removeFavorite(2, companyId.value)
      isFavorite.value = false
      ElMessage.success('已取消收藏该公司')
    } else {
      // 添加收藏
      await addFavorite(2, companyId.value)
      isFavorite.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('处理收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 加载公司职位列表
const loadCompanyPositions = async () => {
  if (!companyId.value) return
  
  try {
    positionsLoading.value = true
    const positions = await getPositionsByCompany(companyId.value)
    companyPositions.value = positions || []
  } catch (err) {
    console.error('加载公司职位失败:', err)
    ElMessage.error('加载公司职位列表失败')
  } finally {
    positionsLoading.value = false
  }
}

// 工具函数
const getCompanyScale = (scale: number): string => {
  return SCALE_MAP[scale] || '未知规模'
}

const getFinancingStage = (stage: number): string => {
  return FINANCING_MAP[stage] || '未知融资阶段'
}

const formatSalary = (min: number, max: number): string => {
  return `${min}K - ${max}K`
}

const formatEducation = (level: number): string => {
  return EDUCATION_MAP[level] || '不限'
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
  } catch {
    return dateString
  }
}

// Logo处理函数
const handleLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    const companyName = companyDetail.value?.companyName || ''
    parent.innerHTML = `
      <div class="company-logo-placeholder-large">
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

// 查看职位详情
const viewPosition = (position: PositionInfo) => {
  router.push({ path: '/discover', query: { positionId: position.id } })
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 组件挂载时加载数据
onMounted(() => {
  loadCompanyDetail()
})
</script>

<style scoped lang="scss">
.company-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 页面头部导航 */
.page-header-nav {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #409eff;
    color: #409eff;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    padding: 8px 16px;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    outline: none;
    
    .el-icon {
      font-size: 14px;
      transition: transform 0.2s ease;
    }
    
    &:hover {
      background: rgba(64, 158, 255, 0.08);
      border-color: #1d68ce;
      color: #1d68ce;
      transform: translateX(-4px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      
      .el-icon {
        transform: translateX(-2px);
      }
    }
    
    &:active {
      transform: translateX(-2px);
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
    }
    
    &:focus {
      outline: 2px solid rgba(64, 158, 255, 0.3);
      outline-offset: 2px;
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding-bottom: 12px;
    
    .back-button {
      padding: 6px 12px;
      font-size: 14px;
      
      &:hover {
        transform: translateX(-2px);
        
        .el-icon {
          transform: translateX(-1px);
        }
      }
    }
  }
}

/* 加载和错误状态 */
.loading-wrapper,
.error-wrapper {
  margin-top: 40px;
}

.error-wrapper {
  text-align: center;
}

/* 公司头部信息 */
.company-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.company-basic-info {
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 576px) {
    flex-direction: column;
  }
}

.company-logo-wrapper {
  flex-shrink: 0;
  
  .company-logo-large {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid #f0f0f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .company-logo-placeholder-large {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00beaa, #00c9b7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 600;
    border: 2px solid #f0f0f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.company-info-main {
  flex: 1;
  
  .company-name {
    font-size: 32px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 16px 0;
    line-height: 1.2;
  }
  
  .company-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .company-location {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: #606266;
    
    .el-icon {
      color: #409eff;
    }
    
    .address-detail {
      color: #909399;
    }
  }
}

/* 公司联系方式卡片 */
.company-contact-card {
  background: linear-gradient(135deg, #f8f9fa, #f1f3f4);
  border-radius: 12px;
  padding: 20px;
  width: 280px;
  
  .contact-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }
  
  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #606266;
      
      .el-icon {
        color: #00beaa;
        font-size: 16px;
        flex-shrink: 0;
      }
      
      span {
        word-break: break-word;
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
  
  .company-actions {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    
    .favorite-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      .el-icon {
        font-size: 16px;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
}

/* 公司详情网格 */
.company-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.detail-card {
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

/* 公司介绍 */
.description-content {
  p {
    font-size: 15px;
    line-height: 1.8;
    color: #606266;
    margin: 0;
    white-space: pre-wrap;
    
    &.no-content {
      color: #c0c4cc;
      font-style: italic;
    }
  }
}

/* 公司福利 */
.welfare-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .welfare-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #303133;
    
    .el-icon {
      flex-shrink: 0;
    }
    
    span {
      flex: 1;
    }
  }
}

/* 公司信息列表 */
.company-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .info-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .info-label {
      font-size: 14px;
      color: #909399;
      min-width: 80px;
      flex-shrink: 0;
    }
    
    .info-value {
      font-size: 14px;
      color: #303133;
      word-break: break-word;
      
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

/* 公司职位卡片 */
.positions-card {
  .card-header {
    .positions-count {
      font-size: 14px;
      color: #00beaa;
      font-weight: 500;
      background: rgba(0, 190, 170, 0.08);
      padding: 4px 12px;
      border-radius: 12px;
    }
  }
}

.positions-list {
  .positions-loading {
    padding: 40px 0;
    text-align: center;
    color: #409eff;
    
    .loading-icon {
      font-size: 32px;
      margin-bottom: 12px;
      animation: spin 1.5s linear infinite;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

.positions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.position-item {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f2f5;
    border-color: #e0e0e0;
    transform: translateX(4px);
  }
  
  .position-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;
    
    .position-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      flex: 1;
    }
    
    .position-salary {
      font-size: 18px;
      font-weight: 700;
      color: #f56c6c;
      white-space: nowrap;
    }
  }
  
  .position-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    
    .position-experience {
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
    }
  }
  
  .position-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    
    .position-update {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

.no-positions {
  padding: 40px 0;
  text-align: center;
  
  .no-positions-tip {
    font-size: 14px;
    color: #909399;
    margin-top: 8px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>