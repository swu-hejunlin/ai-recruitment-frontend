<template>
  <AppLayout>
    <div class="boss-interview-manager">
      <h1 class="page-title">面试管理</h1>
      
      <!-- 操作区域 -->
      <div class="operation-area">
        <el-button type="primary" @click="handleCreateInterview">
          <el-icon><Plus /></el-icon>
          安排面试
        </el-button>
      </div>
      
      <!-- 面试列表 -->
      <div class="interview-list">
        <el-table :data="interviews" style="width: 100%" border>
          <el-table-column prop="id" label="面试ID" width="80" />
          <el-table-column prop="jobSeekerName" label="求职者" width="120" />
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
          <el-table-column prop="interviewLink" label="面试链接" min-width="150" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleViewInterview(scope.row.id)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteInterview(scope.row.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 空状态 -->
      <div v-if="interviews.length === 0" class="empty-state">
        <el-empty description="暂无面试记录">
          <el-button type="primary" @click="handleCreateInterview">安排面试</el-button>
        </el-empty>
      </div>
      
      <!-- 创建面试对话框 -->
      <el-dialog
        v-model="createDialogVisible"
        title="安排面试"
        width="600px"
      >
        <div class="create-interview-form">
          <el-form :model="createForm" label-width="100px">
            <el-form-item label="投递记录">
              <el-select v-model="createForm.applicationId" placeholder="请选择投递记录" style="width: 100%">
                <el-option
                  v-for="app in applications"
                  :key="app.id"
                  :label="`${app.jobSeekerName} - ${app.positionTitle}`"
                  :value="app.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="面试时间">
              <el-date-picker
                v-model="createForm.interviewTime"
                type="datetime"
                placeholder="选择面试时间"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
            <el-form-item label="面试类型">
              <el-radio-group v-model="createForm.interviewType">
                <el-radio :label="1">线下</el-radio>
                <el-radio :label="2">线上</el-radio>
                <el-radio :label="3">AI面试</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="面试地址" v-if="createForm.interviewType === 1">
              <el-input v-model="createForm.interviewAddress" placeholder="请输入面试地址" />
            </el-form-item>
            <el-form-item label="面试链接" v-if="createForm.interviewType === 2 || createForm.interviewType === 3">
              <el-input v-model="createForm.interviewLink" placeholder="请输入面试链接" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="createForm.remark"
                type="textarea"
                placeholder="请输入备注信息"
                :rows="3"
              />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="createDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitCreateInterview" :loading="createLoading">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
      
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
                <span class="label">求职者：</span>
                <span class="value">{{ currentInterview.jobSeekerName }}</span>
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
          
          <div class="detail-section">
            <h3>状态管理</h3>
            <div class="status-buttons">
            <el-button
              v-for="(label, value) in statusOptions"
              :key="value"
              :type="getStatusButtonType(Number(value))"
              size="small"
              @click="handleUpdateStatus(currentInterview.id, Number(value))"
              :disabled="currentInterview.status === Number(value)"
            >
              {{ label }}
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
import { Plus, View, Delete } from '@element-plus/icons-vue'
// 动态导入AppLayout组件
import { defineAsyncComponent } from 'vue';
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
import { 
  getCompanyInterviews, 
  createInterview, 
  getInterviewDetail, 
  updateInterviewStatus, 
  deleteInterview,
  getBossApplications
} from '../utils/api';

// 状态
const interviews = ref<any[]>([])
const applications = ref<any[]>([])
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const createLoading = ref(false)
const currentInterview = ref<any>(null)

// 表单数据
const createForm = ref({
  applicationId: 0,
  interviewTime: '',
  interviewType: 1,
  interviewAddress: '',
  interviewLink: '',
  remark: ''
})

// 面试状态选项
const statusOptions: Record<number, string> = {
  1: '待确认',
  2: '已确认',
  3: '已拒绝',
  4: '已完成'
}

// 加载面试列表
const loadInterviews = async () => {
  try {
    const response = await getCompanyInterviews()
    interviews.value = response || []
  } catch (error) {
    console.error('加载面试列表失败:', error)
    ElMessage.error('加载面试列表失败')
  }
}

// 加载投递记录
const loadApplications = async () => {
  try {
    const response = await getBossApplications()
    applications.value = response.records || []
  } catch (error) {
    console.error('加载投递记录失败:', error)
    ElMessage.error('加载投递记录失败')
  }
}

// 初始化
onMounted(() => {
  loadInterviews()
  loadApplications()
})

// 处理创建面试
const handleCreateInterview = () => {
  createForm.value = {
    applicationId: 0,
    interviewTime: '',
    interviewType: 1,
    interviewAddress: '',
    interviewLink: '',
    remark: ''
  }
  createDialogVisible.value = true
}

// 提交创建面试
const submitCreateInterview = async () => {
  if (!createForm.value.applicationId) {
    ElMessage.error('请选择投递记录')
    return
  }
  if (!createForm.value.interviewTime) {
    ElMessage.error('请选择面试时间')
    return
  }
  if (createForm.value.interviewType === 1 && !createForm.value.interviewAddress) {
    ElMessage.error('请输入面试地址')
    return
  }
  if ((createForm.value.interviewType === 2 || createForm.value.interviewType === 3) && !createForm.value.interviewLink) {
    ElMessage.error('请输入面试链接')
    return
  }
  
  try {
    createLoading.value = true
    await createInterview({
      applicationId: createForm.value.applicationId,
      interviewTime: createForm.value.interviewTime,
      interviewType: createForm.value.interviewType,
      interviewAddress: createForm.value.interviewAddress,
      interviewLink: createForm.value.interviewLink,
      remark: createForm.value.remark
    })
    ElMessage.success('创建面试邀请成功')
    createDialogVisible.value = false
    loadInterviews()
  } catch (error) {
    console.error('创建面试失败:', error)
    ElMessage.error('创建面试失败')
  } finally {
    createLoading.value = false
  }
}

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
    await updateInterviewStatus(id, status)
    ElMessage.success('更新面试状态成功')
    loadInterviews()
    if (currentInterview.value && currentInterview.value.id === id) {
      currentInterview.value.status = status
    }
  } catch (error) {
    console.error('更新面试状态失败:', error)
    ElMessage.error('更新面试状态失败')
  }
}

// 处理删除面试
const handleDeleteInterview = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该面试记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteInterview(id)
    ElMessage.success('删除面试成功')
    loadInterviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除面试失败:', error)
      ElMessage.error('删除面试失败')
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
  return statusOptions[status] || '未知'
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

const getStatusButtonType = (status: number): string => {
  const typeMap: Record<number, string> = {
    1: 'danger',
    2: 'success',
    3: 'info',
    4: 'warning'
  }
  return typeMap[status] || ''
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 不能选择过去的时间
}
</script>

<style scoped>
.boss-interview-manager {
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

.operation-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
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

.create-interview-form {
  padding: 20px 0;
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
  gap: 8px;
  flex-wrap: wrap;
}

.loading-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>