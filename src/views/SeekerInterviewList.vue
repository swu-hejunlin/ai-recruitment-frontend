<template>
  <AppLayout>
    <div class="seeker-interview-list">
      <h1 class="page-title">我的面试</h1>
      
      <!-- 面试列表 -->
      <div class="interview-list">
        <el-table :data="interviews" style="width: 100%" border>
          <el-table-column prop="id" label="面试ID" width="80" />
          <el-table-column prop="companyName" label="公司" width="120" />
          <el-table-column prop="positionTitle" label="面试职位" width="180" />
          <el-table-column prop="interviewTime" label="面试时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.interviewTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="interviewType" label="面试类型" width="100">
            <template #default="scope">
              <el-tag :type="getInterviewTypeTagType(scope.row.interviewType)">
                {{ getInterviewTypeLabel(scope.row.interviewType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="面试状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="interviewAddress" label="面试地址" min-width="150" />
          <el-table-column prop="interviewLink" label="面试链接" min-width="150">
            <template #default="scope">
              <a v-if="scope.row.interviewLink" :href="scope.row.interviewLink" target="_blank" class="link">
                {{ scope.row.interviewLink }}
              </a>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleViewInterview(scope.row.id)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleUpdateStatus(scope.row.id, 2)"
                :disabled="scope.row.status !== 1"
              >
                确认面试
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleUpdateStatus(scope.row.id, 3)"
                :disabled="scope.row.status !== 1"
              >
                拒绝面试
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="interviews.length === 0" class="empty-state">
        <el-empty description="暂无面试记录">
          <p>您还没有收到面试邀请</p>
        </el-empty>
      </div>
      
      <!-- 面试详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="面试详情"
        width="800px"
      >
        <div v-if="currentInterview" class="interview-detail">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">面试ID：</span>
                <span class="value">{{ currentInterview.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">公司：</span>
                <span class="value">{{ currentInterview.companyName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">面试职位：</span>
                <span class="value">{{ currentInterview.positionTitle }}</span>
              </div>
              <div class="detail-item">
                <span class="label">面试时间：</span>
                <span class="value">{{ formatDate(currentInterview.interviewTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">面试类型：</span>
                <span class="value">{{ getInterviewTypeLabel(currentInterview.interviewType) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">面试状态：</span>
                <span class="value">{{ getStatusLabel(currentInterview.status) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>面试信息</h3>
            <div class="detail-grid">
              <div class="detail-item" v-if="currentInterview.interviewAddress">
                <span class="label">面试地址：</span>
                <span class="value">{{ currentInterview.interviewAddress }}</span>
              </div>
              <div class="detail-item" v-if="currentInterview.interviewLink">
                <span class="label">面试链接：</span>
                <a :href="currentInterview.interviewLink" target="_blank" class="link">{{ currentInterview.interviewLink }}</a>
              </div>
              <div class="detail-item" v-if="currentInterview.remark">
                <span class="label">备注：</span>
                <span class="value">{{ currentInterview.remark }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="currentInterview.status === 1">
            <h3>面试确认</h3>
            <div class="status-buttons">
              <el-button type="primary" @click="handleUpdateStatus(currentInterview.id, 2)">
                确认面试
              </el-button>
              <el-button type="danger" @click="handleUpdateStatus(currentInterview.id, 3)">
                拒绝面试
              </el-button>
            </div>
          </div>
        </div>
        <div v-else class="loading-state">
          <el-loading :fullscreen="true" text="加载中..." />
        </div>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import { View } from '@element-plus/icons-vue'
// 动态导入AppLayout组件
import { defineAsyncComponent } from 'vue'
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'))
import { getJobSeekerInterviews, getInterviewDetail, updateInterviewStatus } from '../utils/api'

// 状态
const interviews = ref<any[]>([])
const detailDialogVisible = ref(false)
const currentInterview = ref<any>(null)

// 面试状态选项
const statusOptions = {
  1: '待确认',
  2: '已确认',
  3: '已拒绝',
  4: '已完成'
}

// 加载面试列表
const loadInterviews = async () => {
  try {
    const response = await getJobSeekerInterviews()
    interviews.value = response || []
  } catch (error) {
    console.error('加载面试列表失败:', error)
    ElMessage.error('加载面试列表失败')
  }
}

// 初始化
onMounted(() => {
  loadInterviews()
})

// 处理查看面试
const handleViewInterview = async (id: number) => {
  try {
    currentInterview.value = null
    detailDialogVisible.value = true
    const response = await getInterviewDetail(id)
    currentInterview.value = response
  } catch (error) {
    console.error('获取面试详情失败:', error)
    ElMessage.error('获取面试详情失败')
    detailDialogVisible.value = false
  }
}

// 处理更新面试状态
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    const message = status === 2 ? '确认面试' : '拒绝面试'
    await ElMessageBox.confirm(`确定要${message}吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: status === 2 ? 'success' : 'warning'
    })
    await updateInterviewStatus(id, status)
    ElMessage.success(`${message}成功`)
    loadInterviews()
    if (currentInterview.value && currentInterview.value.id === id) {
      currentInterview.value.status = status
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新面试状态失败:', error)
      ElMessage.error('更新面试状态失败')
    }
  }
}

// 工具函数
const formatDate = (dateString: string): string => {
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

const getInterviewTypeLabel = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: '线下',
    2: '线上',
    3: 'AI面试'
  }
  return typeMap[type] || '未知'
}

const getInterviewTypeTagType = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: 'info',
    2: 'warning',
    3: 'success'
  }
  return typeMap[type] || ''
}

const getStatusLabel = (status: number): string => {
  return (statusOptions as Record<number, string>)[status] || '未知'
}

const getStatusTagType = (status: number): string => {
  const typeMap: Record<number, string> = {
    1: 'danger',
    2: 'success',
    3: 'info',
    4: 'warning'
  }
  return typeMap[status] || ''
}
</script>

<style scoped>
.seeker-interview-list {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #303133;
}

.interview-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.empty-state {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 60px 20px;
  text-align: center;
  margin-top: 20px;
}

.interview-detail {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-item .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.detail-item .value {
  font-size: 14px;
  color: #303133;
  flex: 1;
}

.detail-item .link {
  color: #409eff;
  text-decoration: underline;
}

.status-buttons {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.loading-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>