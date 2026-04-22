<template>
  <div class="boss-position-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>职位管理</h2>
        <p class="header-subtitle">管理您发布的招聘职位，开启或关闭招聘状态</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddPosition">
          <el-icon><Plus /></el-icon>发布职位
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 数据表格 -->
    <div v-else class="table-container">
      <el-table
        :data="tableData"
        v-loading="tableLoading"
        stripe
        style="width: 100%"
        :border="true"
      >
        <el-table-column prop="title" label="职位名称" min-width="200">
          <template #default="{ row }">
            <div class="position-title">
              <span class="title-text">{{ row.title }}</span>
              <span v-if="row.status === 1" class="status-badge status-online">招聘中</span>
              <span v-else class="status-badge status-offline">已关闭</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="职位类别" width="120" />
        <el-table-column prop="city" label="工作城市" width="100" />
        <el-table-column label="公司名称" width="180">
          <template #default="{ row }">
            <div class="company-info">
              <span>{{ row.companyName || `公司-${row.companyId}` }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="薪资范围" width="150">
          <template #default="{ row }">
            <span class="salary-text">{{ formatSalary(row.salaryMin, row.salaryMax) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :loading="row.switchLoading"
              :active-value="1"
              :inactive-value="0"
              active-text="开启"
              inactive-text="关闭"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
              <el-button type="info" size="small" @click="handleView(row)">
                查看
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.current"
          :page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无职位数据" />

    <!-- 职位详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="职位详情"
      size="40%"
      :with-header="true"
      :before-close="handleDetailDrawerClose"
    >
      <PositionDetailView
        v-if="currentPosition"
        :position="currentPosition"
        mode="view"
        @close="detailDrawerVisible = false"
      />
    </el-drawer>

    <!-- 编辑/添加职位弹窗 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formMode === 'add' ? '发布职位' : '编辑职位'"
      width="600px"
      :before-close="handleFormDialogClose"
    >
      <PositionForm
        v-if="formDialogVisible"
        :mode="formMode"
        :position="editingPosition"
        @success="handleFormSuccess"
        @cancel="formDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
// 动态导入组件
import { defineAsyncComponent } from 'vue'
const PositionForm = defineAsyncComponent(() => import('./PositionForm.vue'))
const PositionDetailView = defineAsyncComponent(() => import('./PositionDetailView.vue'))
import { getBossPositionList, deletePosition, closePosition, openPosition } from '../../utils/api'
import type { PositionInfo } from '../../types'

// 表格数据
interface TableRow extends PositionInfo {
  switchLoading?: boolean
}

const tableData = ref<TableRow[]>([])
const loading = ref(false)
const tableLoading = ref(false)

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 抽屉和弹窗状态
const detailDrawerVisible = ref(false)
const formDialogVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')

// 当前选中数据
const currentPosition = ref<PositionInfo | null>(null)
const editingPosition = ref<PositionInfo | null>(null)

// 格式化薪资显示
const formatSalary = (min: number, max: number): string => {
  return `${min}K - ${max}K`
}

// 格式化日期显示
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 处理职位状态切换
const handleStatusChange = async (row: any) => {
  try {
    row.switchLoading = true
    const newStatus = row.status
    if (newStatus === 1) {
      // 开启职位
      await openPosition(row.id)
      ElMessage.success('职位已开启')
    } else {
      // 关闭职位
      await closePosition(row.id)
      ElMessage.success('职位已关闭')
    }
  } catch (error) {
    // 切换失败，恢复原状态
    row.status = row.status === 1 ? 0 : 1
    console.error('切换职位状态失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    row.switchLoading = false
  }
}

// 处理编辑职位
const handleEdit = (row: PositionInfo) => {
  formMode.value = 'edit'
  editingPosition.value = { ...row }
  formDialogVisible.value = true
}

// 处理删除职位
const handleDelete = async (row: PositionInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除职位 "${row.title}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deletePosition(row.id)
    ElMessage.success('删除成功')
    fetchPositionList()
  } catch (error) {
    console.error('删除职位失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 处理查看职位详情
const handleView = (row: PositionInfo) => {
  currentPosition.value = row
  detailDrawerVisible.value = true
}

// 处理发布新职位
const handleAddPosition = () => {
  formMode.value = 'add'
  editingPosition.value = null
  formDialogVisible.value = true
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchPositionList()
}

// 处理页码变化
const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchPositionList()
}

// 表单成功回调
const handleFormSuccess = () => {
  formDialogVisible.value = false
  fetchPositionList()
}

// 抽屉关闭回调
const handleDetailDrawerClose = (done: () => void) => {
  currentPosition.value = null
  done()
}

// 表单弹窗关闭回调
const handleFormDialogClose = (done: () => void) => {
  editingPosition.value = null
  done()
}

// 获取职位列表
const fetchPositionList = async () => {
  try {
    tableLoading.value = true
    const response = await getBossPositionList(pagination.current, pagination.size)
    console.log('Boss职位列表API响应数据:', response.records.map(item => ({
      id: item.id,
      title: item.title,
      companyId: item.companyId,
      companyName: item.companyName,
      city: item.city
    })))
    tableData.value = response.records.map(item => ({
      ...item,
      switchLoading: false
    }))
    pagination.total = response.total
  } catch (error) {
    console.error('获取职位列表失败:', error)
    ElMessage.error('获取职位列表失败')
    tableData.value = []
  } finally {
    loading.value = false
    tableLoading.value = false
  }
}

// 初始化加载数据
onMounted(() => {
  fetchPositionList()
})
</script>

<style scoped lang="scss">
.boss-position-list {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #222;
    }

    .header-subtitle {
      margin: 0;
      font-size: 14px;
      color: #666;
      font-weight: 400;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.loading-container {
  padding: 40px 0;
}

.table-container {
  .position-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .title-text {
      font-weight: 500;
      font-size: 14px;
    }
    
    .status-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      
      &.status-online {
        background: #e6f9f6;
        color: #00beaa;
        border: 1px solid #b3ece5;
      }
      
      &.status-offline {
        background: #f5f5f5;
        color: #999;
        border: 1px solid #e8e8e8;
      }
    }
  }

  .salary-text {
    color: #ff4d4f;
    font-weight: 500;
    font-size: 14px;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}
</style>