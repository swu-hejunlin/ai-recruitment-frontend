<template>
  <AppLayout>
    <div class="job-finder-container">
      <!-- 页面标题和切换标签 -->
      <div class="page-header">
        <h2>岗位发现</h2>
        <p class="subtitle">探索适合您的职业机会</p>

        <!-- 切换标签 -->
        <el-tabs v-model="activeTab" class="tab-container" @tab-click="handleTabChange">
          <el-tab-pane label="智能推荐" name="recommendations">
            <span class="tab-desc">基于AI算法的个性化岗位推荐</span>
          </el-tab-pane>
          <el-tab-pane label="职位搜索" name="discovery">
            <span class="tab-desc">搜索和浏览所有职位</span>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 推荐内容 -->
      <div v-show="activeTab === 'recommendations'" class="recommendations-section">
        <div class="recommendations-header">
          <h3>为您推荐</h3>
          <el-button type="primary" @click="handleRefresh" :loading="loadingRecommendations">
            <el-icon><Refresh /></el-icon>
            刷新推荐
          </el-button>
        </div>

        <div v-if="loadingRecommendations" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div v-else-if="recommendations.length > 0" class="recommendations-content">
          <div class="recommendation-list">
            <JobCard
              v-for="item in recommendations"
              :key="item.positionId"
              :position="item"
              @click="handleViewRecommendDetail(item)"
            />
          </div>
        </div>

        <div v-else class="empty-container">
          <el-empty description="暂无推荐岗位">
            <el-button type="primary" @click="handleRefresh">
              刷新推荐
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 职位搜索内容 -->
      <div v-show="activeTab === 'discovery'" class="discovery-section">
        <!-- 基本搜索 -->
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索职位名称、描述或要求"
            clearable
            @keyup.enter="fetchPositions"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="fetchPositions">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>

        <!-- 高级筛选 -->
        <div class="filter-section">
          <el-collapse>
            <el-collapse-item title="高级筛选">
              <div class="filter-content">
                <el-row :gutter="20">
                  <!-- 城市筛选 -->
                  <el-col :span="8">
                    <el-form-item label="工作城市">
                      <el-select
                        v-model="filterForm.city"
                        placeholder="选择城市"
                        clearable
                        filterable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="city in cityOptions"
                          :key="city.value"
                          :label="city.label"
                          :value="city.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <!-- 职位类别 -->
                  <el-col :span="8">
                    <el-form-item label="职位类别">
                      <el-cascader
                        v-model="filterForm.category"
                        :options="categoryOptions"
                        :props="{ expandTrigger: 'hover', emitPath: false }"
                        placeholder="选择类别"
                        clearable
                        filterable
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  
                  <!-- 工作经验 -->
                  <el-col :span="8">
                    <el-form-item label="工作经验">
                      <el-select v-model="filterForm.workYearsMin" placeholder="工作经验" clearable style="width: 100%">
                        <el-option label="不限" value="" />
                        <el-option label="应届生" value="0" />
                        <el-option label="1年以下" value="1" />
                        <el-option label="1-3年" value="3" />
                        <el-option label="3-5年" value="5" />
                        <el-option label="5-10年" value="10" />
                        <el-option label="10年以上" value="10" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <!-- 学历要求 -->
                  <el-col :span="8">
                    <el-form-item label="学历要求">
                      <el-select v-model="filterForm.educationMin" placeholder="学历要求" clearable style="width: 100%">
                        <el-option label="不限" value="" />
                        <el-option label="高中及以下" value="1" />
                        <el-option label="大专" value="2" />
                        <el-option label="本科" value="3" />
                        <el-option label="硕士" value="4" />
                        <el-option label="博士" value="5" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <!-- 薪资范围 -->
                  <el-col :span="16">
                    <el-form-item label="薪资范围">
                      <div class="salary-range-filter">
                        <el-slider
                          v-model="filterForm.salaryRange"
                          range
                          :min="0"
                          :max="100"
                          :step="5"
                          :format-tooltip="value => `${value}K`"
                        />
                        <div class="salary-display">
                          {{ filterForm.salaryRange[0] }}K - {{ filterForm.salaryRange[1] }}K
                        </div>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <!-- 搜索类型 -->
                <div class="search-type-filter">
                  <el-form-item label="搜索范围">
                    <el-checkbox-group v-model="filterForm.searchType">
                      <el-checkbox label="title">职位名称</el-checkbox>
                      <el-checkbox label="description">职位描述</el-checkbox>
                      <el-checkbox label="requirement">任职要求</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
                
                <!-- 筛选操作 -->
                <div class="filter-actions">
                  <el-button type="primary" @click="fetchPositions">应用筛选</el-button>
                  <el-button @click="resetFilter">重置筛选</el-button>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div v-if="loadingDiscovery" class="loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="positionList.length === 0" class="empty">
          <el-empty description="暂无职位">
            <p>暂无职位信息，请稍后查看</p>
          </el-empty>
        </div>

        <div v-else class="jobs-list">
          <JobCard
            v-for="position in positionList"
            :key="position.id"
            :position="position"
            @click="viewJobDetail(position)"
          />
        </div>

        <div v-if="positionList.length > 0" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            layout="total, prev, pager, next"
            :total="totalPositions"
            @current-change="fetchPositions"
          />
        </div>
      </div>



      <!-- 职位详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="selectedPosition?.title || '职位详情'"
        width="800px"
        class="job-detail-dialog"
      >
        <div v-if="selectedPosition" class="job-detail-content">
          <!-- 职位标题和薪资 -->
          <div class="detail-header">
            <div class="detail-title-section">
              <h2>{{ selectedPosition.title }}</h2>
              <div class="detail-salary">
                {{ selectedPosition.salaryMin ? `${selectedPosition.salaryMin}k` : '面议' }}
                {{ selectedPosition.salaryMax ? `- ${selectedPosition.salaryMax}k` : '' }}
              </div>
            </div>

            <!-- 公司信息 -->
            <div class="detail-company-info">
              <div class="company-logo-name">
                <img
                  v-if="selectedPosition.companyLogo"
                  :src="selectedPosition.companyLogo"
                  alt="公司Logo"
                  class="company-logo"
                  @error="handleDetailLogoError"
                  :data-company-name="selectedPosition.companyName || ''"
                />
                <h3 @click="viewCompanyDetail(selectedPosition.companyId)">
                  {{ selectedPosition.companyName || '未指定公司' }}
                </h3>
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
                  <span class="info-value">{{ selectedPosition.category || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">工作城市：</span>
                  <span class="info-value">{{ selectedPosition.city || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">工作地址：</span>
                  <span class="info-value">{{ selectedPosition.address || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">学历要求：</span>
                  <span class="info-value">{{ formatEducation(selectedPosition.educationMin) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">工作经验：</span>
                  <span class="info-value">{{ formatExperience(selectedPosition.workYearsMin) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">职位状态：</span>
                  <span class="info-value status-tag" :class="{'status-closed': selectedPosition.status === 0, 'status-open': selectedPosition.status === 1}">
                    {{ selectedPosition.status === 1 ? '招聘中' : '已关闭' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="info-item">
                  <span class="info-label">发布时间：</span>
                  <span class="info-value">{{ formatDate(selectedPosition.createTime) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 岗位职责 -->
          <div class="detail-section">
            <h3>岗位职责</h3>
            <div class="detail-content">
              <pre>{{ selectedPosition.description || '暂无岗位职责描述' }}</pre>
            </div>
          </div>

          <!-- 任职要求 -->
          <div class="detail-section">
            <h3>任职要求</h3>
            <div class="detail-content">
              <pre>{{ selectedPosition.requirement || '暂无任职要求' }}</pre>
            </div>
          </div>

          <!-- 福利标签 -->
          <div v-if="parseTags(selectedPosition.tags).length > 0" class="detail-section">
            <h3>公司福利</h3>
            <div class="benefits-container">
              <el-tag v-for="tag in parseTags(selectedPosition.tags)" :key="tag" class="benefit-tag">
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
            <el-button @click="detailDialogVisible = false">关闭</el-button>
            <el-button
              type="primary"
              @click="applyJob(selectedPosition!)"
              :disabled="!selectedPosition || selectedPosition.status !== 1"
            >
              立即投递
            </el-button>
          </span>
        </template>
      </el-dialog>

    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Loading, Refresh, Location, Clock } from '@element-plus/icons-vue'
import { defineAsyncComponent } from 'vue';
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
const JobCard = defineAsyncComponent(() => import('../components/position/JobCard.vue'));
import { useUserStore } from '../stores/userStore'
import { getPositionList, getPositionDetail, applyPosition, getJobRecommendations } from '@/utils/api'
import type { PositionInfo, PositionDetail, EducationLevel } from '@/types'
import { CITY_OPTIONS, CATEGORY_OPTIONS } from '@/types'

// 城市选项
const cityOptions = CITY_OPTIONS

// 职位类别选项
const categoryOptions = CATEGORY_OPTIONS

// 标签页状态
const activeTab = ref('recommendations')

// 推荐相关状态
const loadingRecommendations = ref(false)
const recommendations = ref<any[]>([])

// 搜索相关状态
const searchKeyword = ref('')
const loadingDiscovery = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const positionList = ref<PositionInfo[]>([])
const totalPositions = ref(0)

// 筛选表单
const filterForm = ref({
  city: '',
  category: '',
  workYearsMin: '',
  educationMin: '',
  salaryRange: [0, 100],
  searchType: ['title', 'description', 'requirement']
})

// 职位详情相关
const detailDialogVisible = ref(false)
const selectedPosition = ref<PositionDetail | null>(null)
const loadingDetail = ref(false)

// 路由
const router = useRouter()
const route = useRoute()

// 学历映射
const educationMap: Record<EducationLevel, string> = {
  1: '高中及以下',
  2: '大专',
  3: '本科',
  4: '硕士',
  5: '博士'
}

// 切换标签
const handleTabChange = (tab: any) => {
  const tabName = tab.props.name
  if (tabName === 'discovery') {
    fetchPositions()
  } else if (tabName === 'recommendations') {
    fetchRecommendations()
  }
}

// 获取推荐
const fetchRecommendations = async () => {
  loadingRecommendations.value = true
  try {
    const data = await getJobRecommendations(10)
    if (data) {
      recommendations.value = data
    }
  } catch (error) {
    console.error('获取岗位推荐失败:', error)
    ElMessage.error('获取岗位推荐失败')
  } finally {
    loadingRecommendations.value = false
  }
}

// 刷新推荐
const handleRefresh = () => {
  fetchRecommendations()
}

// 查看推荐详情
const handleViewRecommendDetail = async (item: any) => {
  try {
    loadingDetail.value = true
    detailDialogVisible.value = true

    const positionId = item.id || item.positionId
    const response = await getPositionDetail(positionId)
    selectedPosition.value = response

  } catch (error) {
    console.error('获取职位详情失败:', error)
    ElMessage.error('获取职位详情失败')
    // 如果获取详情失败，使用基本职位信息
    selectedPosition.value = {
      ...item,
      id: item.id || item.positionId,
      title: item.title || item.jobName,
      city: item.city || item.location,
      bossId: 0 // 使用默认值
    }
  } finally {
    loadingDetail.value = false
  }
}

// 申请岗位
const handleApply = () => {
  ElMessage.success('申请功能开发中')
  detailDialogVisible.value = false
}

// 从后端获取职位列表
const fetchPositions = async () => {
  try {
    loadingDiscovery.value = true
    const response = await getPositionList({
      title: searchKeyword.value.trim() || undefined,
      city: filterForm.value.city || undefined,
      category: filterForm.value.category || undefined,
      workYearsMin: filterForm.value.workYearsMin || undefined,
      educationMin: filterForm.value.educationMin || undefined,
      salaryMin: filterForm.value.salaryRange[0] || undefined,
      salaryMax: filterForm.value.salaryRange[1] || undefined,
      searchType: filterForm.value.searchType.join(',') || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    positionList.value = response.records || []
    totalPositions.value = response.total || 0

    if (positionList.value.length === 0) {
      ElMessage.info('未找到符合条件的职位')
    }
  } catch (error) {
    console.error('获取职位列表失败:', error)
    ElMessage.error('获取职位列表失败，请稍后重试')
    positionList.value = []
    totalPositions.value = 0
  } finally {
    loadingDiscovery.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    city: '',
    category: '',
    workYearsMin: '',
    educationMin: '',
    salaryRange: [0, 100],
    searchType: ['title', 'description', 'requirement']
  }
  currentPage.value = 1
  fetchPositions()
}

// 查看职位详情
const viewJobDetail = async (position: PositionInfo) => {
  try {
    loadingDetail.value = true
    detailDialogVisible.value = true

    const response = await getPositionDetail(position.id)
    selectedPosition.value = response

  } catch (error) {
    console.error('获取职位详情失败:', error)
    ElMessage.error('获取职位详情失败')
    // 如果获取详情失败，使用基本职位信息
    selectedPosition.value = {
      ...position,
      bossId: 0 // 使用默认值
    }
  } finally {
    loadingDetail.value = false
  }
}

// 投递职位
const applyJob = async (position: PositionInfo) => {
  if (position.status !== 1) {
    ElMessage.warning('该职位已关闭，无法投递')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要投递"${position.title}"职位吗？`,
      '确认投递',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    // 调用后端API投递职位
    await applyPosition({ positionId: position.id })

    ElMessage.success(`已成功投递"${position.title}"职位`)

    // 立即刷新角标计数
    const userStore = useUserStore()
    userStore.refreshCounts()

    // 关闭对话框
    detailDialogVisible.value = false
  } catch (error: any) {
    // 用户取消投递或API错误
    if (error.message && typeof error.message === 'string') {
      if (error.message.includes('已投递过该职位')) {
        ElMessage.warning('您已经投递过该职位，请不要重复投递')
      } else if (error.message.includes('停止招聘')) {
        ElMessage.error('该职位已停止招聘')
      } else {
        ElMessage.error(`投递失败: ${error.message}`)
      }
    } else {
      console.log('用户取消投递')
    }
  }
}

// 工具方法：格式化学历
const formatEducation = (educationLevel?: EducationLevel): string => {
  if (!educationLevel) return '不限'
  return educationMap[educationLevel] || '未知'
}

// 工具方法：格式化工作经验
const formatExperience = (years?: number): string => {
  if (years === undefined || years === null) return '不限'
  if (years === 0) return '应届生'
  if (years === 1) return '1年以下'
  if (years < 3) return '1-3年'
  if (years < 5) return '3-5年'
  if (years < 10) return '5-10年'
  return '10年以上'
}

// 工具方法：格式化日期
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

// 工具方法：处理公司Logo加载错误（职位详情对话框）
const handleDetailLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    const companyName = (img.dataset.companyName || '').trim()
    // 为详情对话框创建更大的占位符
    parent.innerHTML = `
      <div class="company-logo-placeholder-detail">
        ${getCompanyInitial(companyName)}
      </div>
    `
  }
}

// 工具方法：获取公司名称首字母
const getCompanyInitial = (companyName?: string): string => {
  if (!companyName || companyName.trim().length === 0) return '公'
  // 提取中文字符或英文字符的首字符
  const firstChar = companyName.trim().charAt(0)
  return firstChar.toUpperCase()
}

// 查看公司详情
const viewCompanyDetail = (companyId?: number) => {
  if (!companyId) {
    ElMessage.warning('暂无法查看该公司详情')
    return
  }

  // 直接跳转到公司详情页面
  router.push({
    path: `/company/${companyId}`
  })
}

// 工具方法：解析标签JSON
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

onMounted(async () => {
  // 检查是否有职位ID参数，如果有则打开详情
  const positionId = route.query.positionId
  if (positionId) {
    activeTab.value = 'discovery'
    try {
      const id = parseInt(positionId as string)
      // 先加载职位列表
      await fetchPositions()
      // 查找对应的职位信息
      const position = positionList.value.find(p => p.id === id)
      if (position) {
        viewJobDetail(position)
      }
    } catch (error) {
      console.error('处理职位ID参数失败:', error)
    }
  } else {
    // 初始加载推荐
    fetchRecommendations()
  }
})
</script>

<style scoped>
.job-finder-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin-bottom: 10px;
  color: #303133;
}

.subtitle {
  color: #909399;
  margin-bottom: 20px;
}

/* 标签页 */
.tab-container {
  margin-top: 20px;
}

.tab-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 推荐部分 */
.recommendations-section {
  margin-bottom: 40px;
}

.recommendations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recommendations-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.recommendation-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.job-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.company-info {
  display: flex;
  gap: 12px;
  color: #606266;
  font-size: 14px;
}

.location {
  color: #909399;
}

.salary-range {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-tag {
  font-size: 12px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 搜索部分 */
.discovery-section {
  margin-bottom: 40px;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-section .el-input {
  flex: 1;
}

/* 筛选部分 */
.filter-section {
  margin-bottom: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.filter-content {
  margin-top: 16px;
}

.salary-range-filter {
  margin: 16px 0;
}

.salary-display {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}

.search-type-filter {
  margin: 16px 0;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #409eff;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.jobs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 推荐详情对话框 */
.details-content {
  padding: 10px 0;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.details-section {
  margin-bottom: 20px;
}

.details-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  margin-right: 8px;
}

.info-item .value {
  color: #303133;
}

/* 职位详情对话框 */
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

.company-logo-placeholder-detail {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  min-width: 40px;
}

.detail-company-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #409eff;
}

.detail-company-info h3 {
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.detail-company-info h3:hover {
  color: #1d68ce;
  text-decoration: underline;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 滚动条优化 */
.job-detail-content::-webkit-scrollbar {
  width: 6px;
}

.job-detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.job-detail-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.job-detail-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .job-finder-container {
    padding: 10px;
  }

  .recommendation-list,
  .jobs-list {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .match-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>