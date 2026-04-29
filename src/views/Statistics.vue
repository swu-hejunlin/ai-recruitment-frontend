<template>
  <AppLayout>
    <div class="statistics-container">
      <div class="page-header">
        <div class="header-left">
          <el-button @click="goBack" type="primary" plain :icon="ArrowLeft">
            返回
          </el-button>
          <div class="header-title">
            <h2>数据统计</h2>
            <p class="subtitle">{{ isHR ? '招聘数据分析概览' : '就业行情分析' }}</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else class="statistics-content">
        <div v-if="!isHR" class="seeker-stats">
          <el-row :gutter="20" class="stat-cards">
            <el-col :span="6">
              <div class="stat-card primary">
                <div class="stat-icon"><el-icon><Briefcase /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ seekerStats.totalPositions || 0 }}</div>
                  <div class="stat-label">总职位数</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card success">
                <div class="stat-icon"><el-icon><Plus /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ seekerStats.todayNewPositions || 0 }}</div>
                  <div class="stat-label">今日新增</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card warning">
                <div class="stat-icon"><el-icon><Document /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ seekerStats.myApplications || 0 }}</div>
                  <div class="stat-label">我的投递</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card info">
                <div class="stat-icon"><el-icon><Calendar /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ seekerStats.myInterviews || 0 }}</div>
                  <div class="stat-label">面试邀请</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="market-analysis">
            <el-col :span="12">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><Location /></el-icon> 热门城市TOP5</span>
                  </div>
                </template>
                <div class="distribution-list">
                  <div v-for="(city, index) in seekerStats.hotCities" :key="city.city" class="distribution-item">
                    <div class="item-header">
                      <span class="rank">{{ index + 1 }}</span>
                      <span class="name">{{ city.city }}</span>
                      <span class="count">{{ city.count }} 个职位</span>
                    </div>
                    <el-progress :percentage="city.percentage || 0" :stroke-width="8" :show-text="false" />
                  </div>
                  <el-empty v-if="!seekerStats.hotCities?.length" description="暂无数据" :image-size="60" />
                </div>
              </el-card>
            </el-col>

            <el-col :span="12">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><Grid /></el-icon> 热门职位类别TOP5</span>
                  </div>
                </template>
                <div class="distribution-list">
                  <div v-for="(cat, index) in seekerStats.hotCategories" :key="cat.category" class="distribution-item">
                    <div class="item-header">
                      <span class="rank">{{ index + 1 }}</span>
                      <span class="name">{{ cat.category }}</span>
                      <span class="count">{{ cat.count }} 个职位</span>
                    </div>
                    <el-progress :percentage="cat.percentage || 0" :stroke-width="8" :show-text="false" color="#67C23A" />
                  </div>
                  <el-empty v-if="!seekerStats.hotCategories?.length" description="暂无数据" :image-size="60" />
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="competition-section">
            <el-col :span="12">
              <el-card class="competition-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><TrendCharts /></el-icon> 求职竞争指数</span>
                  </div>
                </template>
                <div class="competition-content">
                  <div class="competition-value">
                    <span class="number">{{ seekerStats.competitionIndex || 0 }}</span>
                    <span class="unit">人/职位</span>
                  </div>
                  <div class="competition-tip">
                    平均每个职位有 {{ seekerStats.competitionIndex || 0 }} 人投递
                  </div>
                  <div class="competition-level">
                    <el-tag :type="getCompetitionType(seekerStats.competitionIndex)">
                      {{ getCompetitionLevel(seekerStats.competitionIndex) }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>

            <el-col :span="12">
              <el-card class="salary-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><Money /></el-icon> 高薪职位占比</span>
                  </div>
                </template>
                <div class="salary-content">
                  <div class="salary-value">
                    <span class="number">{{ seekerStats.highSalaryPercentage || 0 }}</span>
                    <span class="unit">%</span>
                  </div>
                  <div class="salary-tip">
                    薪资 ≥ 20K 的职位占比
                  </div>
                  <el-progress :percentage="seekerStats.highSalaryPercentage || 0" :stroke-width="10" color="#E6A23C" />
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="wordcloud-section">
            <el-col :span="24">
              <el-card class="wordcloud-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><TrendCharts /></el-icon> 热门词云</span>
                    <el-radio-group v-model="wordcloudType" size="small" @change="updateWordcloud">
                      <el-radio-button label="skills">热门技能</el-radio-button>
                      <el-radio-button label="positions">热门岗位</el-radio-button>
                      <el-radio-button label="requirements">招聘要求</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div ref="wordcloudRef" class="wordcloud-container"></div>
                <el-empty v-if="!currentWordcloudData?.length" description="暂无词云数据" :image-size="60" />
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div v-else class="boss-stats">
          <el-row :gutter="20" class="stat-cards">
            <el-col :span="6">
              <div class="stat-card primary">
                <div class="stat-icon"><el-icon><Briefcase /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ bossStats.myPositions || 0 }}</div>
                  <div class="stat-label">我发布的职位</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card success">
                <div class="stat-icon"><el-icon><Document /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ bossStats.myApplications || 0 }}</div>
                  <div class="stat-label">收到投递</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card warning">
                <div class="stat-icon"><el-icon><Clock /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ bossStats.pendingApplications || 0 }}</div>
                  <div class="stat-label">待处理</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card info">
                <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
                <div class="stat-info">
                  <div class="stat-value">{{ bossStats.hiredCount || 0 }}</div>
                  <div class="stat-label">已录用</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="status-section">
            <el-col :span="24">
              <el-card class="status-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><PieChart /></el-icon> 投递状态分布</span>
                  </div>
                </template>
                <div class="status-grid">
                  <div class="status-item">
                    <div class="status-circle pending">
                      <span class="count">{{ bossStats.pendingApplications || 0 }}</span>
                    </div>
                    <div class="status-label">待处理</div>
                  </div>
                  <div class="status-item">
                    <div class="status-circle interviewing">
                      <span class="count">{{ bossStats.interviewingCount || 0 }}</span>
                    </div>
                    <div class="status-label">面试中</div>
                  </div>
                  <div class="status-item">
                    <div class="status-circle hired">
                      <span class="count">{{ bossStats.hiredCount || 0 }}</span>
                    </div>
                    <div class="status-label">已录用</div>
                  </div>
                  <div class="status-item">
                    <div class="status-circle rejected">
                      <span class="count">{{ bossStats.rejectedCount || 0 }}</span>
                    </div>
                    <div class="status-label">不合适</div>
                  </div>
                </div>
                <div class="conversion-rate">
                  <span>整体转化率：</span>
                  <strong>{{ bossStats.conversionRate || 0 }}%</strong>
                  <el-tag type="success" size="small">录用/投递</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="position-section">
            <el-col :span="24">
              <el-card class="position-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><DataAnalysis /></el-icon> 职位效果分析</span>
                  </div>
                </template>
                <el-table :data="bossStats.positionStats" stripe style="width: 100%">
                  <el-table-column prop="positionTitle" label="职位名称" min-width="150" />
                  <el-table-column prop="applicationCount" label="投递数" width="100" align="center" />
                  <el-table-column label="转化率" width="150" align="center">
                    <template #default="{ row }">
                      <el-progress :percentage="row.conversionRate || 0" :stroke-width="6" :show-text="true" :format="(pct: number) => `${pct}%`" />
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="!bossStats.positionStats?.length" description="暂无职位数据" :image-size="60" />
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="wordcloud-section">
            <el-col :span="24">
              <el-card class="wordcloud-card">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><TrendCharts /></el-icon> 热门词云</span>
                    <el-radio-group v-model="wordcloudType" size="small" @change="updateWordcloud">
                      <el-radio-button label="skills">热门技能</el-radio-button>
                      <el-radio-button label="positions">热门岗位</el-radio-button>
                      <el-radio-button label="requirements">招聘要求</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div ref="wordcloudRef" class="wordcloud-container"></div>
                <el-empty v-if="!currentWordcloudData?.length" description="暂无词云数据" :image-size="60" />
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Loading,
  Briefcase,
  Plus,
  Document,
  Calendar,
  Location,
  Grid,
  TrendCharts,
  Money,
  Clock,
  CircleCheck,
  PieChart,
  DataAnalysis,
  ArrowLeft
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { getSeekerStatistics, getBossStatistics, getWordCloudData } from '@/utils/api'
import { useUserStore } from '@/stores/userStore'
import type { WordCloudData } from '@/types'

const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'))
const router = useRouter()
const userStore = useUserStore()
const isHR = computed(() => userStore.isHR)
const loading = ref(false)
const wordcloudRef = ref<HTMLElement>()
let wordcloudChart: echarts.ECharts | null = null

interface HotCityItem {
  city: string; count: number; percentage: number
}
interface HotCategoryItem {
  category: string; count: number; percentage: number
}
interface PositionStatItem {
  positionTitle: string; applicationCount: number; conversionRate: number
}

const seekerStats = ref<{
  totalPositions: number; todayNewPositions: number; myApplications: number; myInterviews: number;
  hotCities: HotCityItem[]; hotCategories: HotCategoryItem[]; competitionIndex: number; highSalaryPercentage: number
}>({
  totalPositions: 0, todayNewPositions: 0, myApplications: 0, myInterviews: 0,
  hotCities: [], hotCategories: [], competitionIndex: 0, highSalaryPercentage: 0
})

const bossStats = ref<{
  myPositions: number; myApplications: number; pendingApplications: number;
  interviewingCount: number; hiredCount: number; rejectedCount: number;
  conversionRate: number; positionStats: PositionStatItem[]
}>({
  myPositions: 0, myApplications: 0, pendingApplications: 0,
  interviewingCount: 0, hiredCount: 0, rejectedCount: 0,
  conversionRate: 0, positionStats: []
})

const wordcloudType = ref<keyof WordCloudData>('skills')
const wordcloudData = ref<WordCloudData>({
  skills: [], positions: [], requirements: []
})

const currentWordcloudData = computed(() => {
  return wordcloudData.value[wordcloudType.value]
})

const getCompetitionLevel = (index: number) => {
  if (!index) return '数据不足'
  if (index < 2) return '竞争较低'
  if (index < 5) return '竞争一般'
  if (index < 10) return '竞争激烈'
  return '竞争非常激烈'
}

const getCompetitionType = (index: number) => {
  if (!index) return 'info'
  if (index < 2) return 'success'
  if (index < 5) return 'warning'
  return 'danger'
}

const getWordcloudColors = () => {
  return [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
    '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'
  ]
}

const initWordcloud = () => {
  if (!wordcloudRef.value) return
  
  wordcloudChart = echarts.init(wordcloudRef.value)
  
  wordcloudChart.setOption({
    tooltip: {
      show: true,
      formatter: (params: any) => {
        return `${params.name}: ${params.value}`
      }
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      right: null,
      bottom: null,
      sizeRange: [14, 50],
      rotationRange: [-45, 45],
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          const colors = getWordcloudColors()
          return colors[Math.floor(Math.random() * colors.length)]
        }
      },
      emphasis: {
        textStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      data: []
    }]
  })
  
  wordcloudChart.on('click', (params: any) => {
    ElMessage.info(`点击了: ${params.name}`)
  })
}

const updateWordcloud = () => {
  if (!wordcloudChart) return
  
  const data = currentWordcloudData.value.map((item: any) => ({
    name: item.name,
    value: item.value
  }))
  
  wordcloudChart.setOption({
    series: [{
      data: data
    }]
  })
}

const fetchStatistics = async () => {
  loading.value = true
  try {
    if (isHR.value) {
      const response = await getBossStatistics()
      bossStats.value = response || {}
    } else {
      const response = await getSeekerStatistics()
      seekerStats.value = response || {}
    }
    
    const wordcloudResponse = await getWordCloudData()
    wordcloudData.value = wordcloudResponse || { skills: [], positions: [], requirements: [] }
    
    await nextTick()
    if (!wordcloudChart) {
      initWordcloud()
    }
    updateWordcloud()
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  wordcloudChart?.resize()
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (wordcloudChart) {
    wordcloudChart.dispose()
    wordcloudChart = null
  }
  window.removeEventListener('resize', handleResize)
})

watch(wordcloudType, () => {
  updateWordcloud()
})
</script>
<style scoped lang="scss">
.statistics-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-title {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #409eff;

  .el-icon {
    font-size: 32px;
    margin-bottom: 16px;
  }
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;

    .el-icon {
      font-size: 28px;
      color: #fff;
    }
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }

  &.primary .stat-icon {
    background: linear-gradient(135deg, #409eff, #66b1ff);
  }

  &.success .stat-icon {
    background: linear-gradient(135deg, #67c23a, #85ce61);
  }

  &.warning .stat-icon {
    background: linear-gradient(135deg, #e6a23c, #ebb563);
  }

  &.info .stat-icon {
    background: linear-gradient(135deg, #909399, #a6a9ad);
  }
}

.market-analysis,
.competition-section,
.status-section,
.position-section {
  margin-bottom: 20px;
}

.analysis-card,
.competition-card,
.salary-card,
.status-card,
.position-card {
  border-radius: 12px;
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;

    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

.distribution-list {
  padding: 8px 0;
}

.distribution-item {
  padding: 12px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .item-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .rank {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #409eff;
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
    }

    .name {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }

    .count {
      font-size: 12px;
      color: #909399;
    }
  }
}

.competition-content,
.salary-content {
  text-align: center;
  padding: 20px 0;

  .competition-value,
  .salary-value {
    margin-bottom: 12px;

    .number {
      font-size: 48px;
      font-weight: 700;
      color: #303133;
    }

    .unit {
      font-size: 16px;
      color: #909399;
      margin-left: 4px;
    }
  }

  .competition-tip,
  .salary-tip {
    font-size: 14px;
    color: #909399;
    margin-bottom: 16px;
  }

  .competition-level {
    margin-top: 16px;
  }
}

.status-grid {
  display: flex;
  justify-content: space-around;
  padding: 30px 0;
}

.status-item {
  text-align: center;

  .status-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;

    .count {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    &.pending {
      background: linear-gradient(135deg, #e6a23c, #ebb563);
    }

    &.interviewing {
      background: linear-gradient(135deg, #409eff, #66b1ff);
    }

    &.hired {
      background: linear-gradient(135deg, #67c23a, #85ce61);
    }

    &.rejected {
      background: linear-gradient(135deg, #909399, #a6a9ad);
    }
  }

  .status-label {
    font-size: 14px;
    color: #606266;
  }
}

.conversion-rate {
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
  color: #606266;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;

  strong {
    font-size: 20px;
    color: #67c23a;
    margin: 0 8px;
  }
}

.wordcloud-section {
  margin-bottom: 20px;
}

.wordcloud-card {
  border-radius: 12px;
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

.wordcloud-container {
  width: 100%;
  height: 400px;
  padding: 20px 0;
}
</style>