<template>
  <AppLayout>
    <div class="favorite-manager">
      <h1 class="page-title">我的收藏</h1>
      
      <!-- 收藏类型标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="职位收藏" name="1">
          <div class="favorite-list">
            <el-table :data="positionFavorites" style="width: 100%" border>
              <el-table-column prop="id" label="收藏ID" width="80" />
              <el-table-column prop="positionTitle" label="职位名称" min-width="120" />
              <el-table-column prop="companyName" label="公司名称" width="180" />
              <el-table-column prop="salaryMin" label="薪资范围" width="120">
                <template #default="scope">
                  {{ scope.row.salaryMin }}k-{{ scope.row.salaryMax }}k
                </template>
              </el-table-column>
              <el-table-column prop="city" label="城市" width="80" />
              <el-table-column prop="createTime" label="收藏时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleViewPosition(scope.row.positionId)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button size="small" type="danger" @click="handleRemoveFavorite(1, scope.row.positionId)">
                    <el-icon><Delete /></el-icon>
                    取消收藏
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="positionFavorites.length === 0" class="empty-state">
            <el-empty description="暂无职位收藏" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="公司收藏" name="2">
          <div class="favorite-list">
            <el-table :data="companyFavorites" style="width: 100%" border>
              <el-table-column prop="id" label="收藏ID" width="80" />
              <el-table-column prop="companyName" label="公司名称" min-width="150" />
              <el-table-column prop="industry" label="行业" width="120" />
              <el-table-column prop="scale" label="公司规模" width="120" />
              <el-table-column prop="createTime" label="收藏时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleViewCompany(scope.row.companyId)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button size="small" type="danger" @click="handleRemoveFavorite(2, scope.row.companyId)">
                    <el-icon><Delete /></el-icon>
                    取消收藏
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="companyFavorites.length === 0" class="empty-state">
            <el-empty description="暂无公司收藏" />
          </div>
        </el-tab-pane>
        
        <!-- 只有HR角色才显示人才收藏 -->
        <el-tab-pane v-if="isHR" label="人才收藏" name="3">
          <div class="favorite-list">
            <el-table :data="jobSeekerFavorites" style="width: 100%" border>
              <el-table-column prop="id" label="收藏ID" width="80" />
              <el-table-column prop="jobSeekerName" label="求职者姓名" width="120" />
              <el-table-column prop="gender" label="性别" width="60">
                <template #default="scope">
                  {{ scope.row.gender === 1 ? '男' : '女' }}
                </template>
              </el-table-column>
              <el-table-column prop="workYears" label="工作经验" width="100" />
              <el-table-column prop="createTime" label="收藏时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleViewJobSeeker(scope.row.jobSeekerId)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button size="small" type="danger" @click="handleRemoveFavorite(3, scope.row.jobSeekerId)">
                    <el-icon><Delete /></el-icon>
                    取消收藏
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="jobSeekerFavorites.length === 0" class="empty-state">
            <el-empty description="暂无人才收藏" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import { View, Delete } from '@element-plus/icons-vue'
// 动态导入AppLayout组件
import { defineAsyncComponent } from 'vue';
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
import { getFavorites, removeFavorite } from '../utils/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态
const activeTab = ref('1')
const positionFavorites = ref<any[]>([])
const companyFavorites = ref<any[]>([])
const jobSeekerFavorites = ref<any[]>([])

// 计算属性：判断是否为HR角色
const isHR = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
  if (!userInfo) return false
  try {
    const parsedInfo = JSON.parse(userInfo)
    return parsedInfo.role === 2 // 2 表示HR角色
  } catch {
    return false
  }
})

// 加载收藏列表
const loadFavorites = async (targetType: number) => {
  try {
    const response = await getFavorites(targetType)
    switch (targetType) {
      case 1:
        positionFavorites.value = response || []
        break
      case 2:
        companyFavorites.value = response || []
        break
      case 3:
        jobSeekerFavorites.value = response || []
        break
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败')
  }
}

// 初始化
onMounted(() => {
  loadFavorites(1)
})

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  loadFavorites(parseInt(tabName))
}

// 处理取消收藏
const handleRemoveFavorite = async (targetType: number, targetId: number) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeFavorite(targetType, targetId)
    ElMessage.success('取消收藏成功')
    loadFavorites(targetType)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }
}

// 处理查看职位
const handleViewPosition = (positionId: number) => {
  // 跳转到职位发现页面并传入职位ID
  router.push({ path: '/discover', query: { positionId: positionId.toString() } })
}

// 处理查看公司
const handleViewCompany = (companyId: number) => {
  // 跳转到公司详情页面
  router.push(`/company/${companyId}`)
}

// 处理查看求职者
const handleViewJobSeeker = (id: number) => {
  // 这里需要根据实际路由配置调整
  ElMessage.info('查看求职者功能待实现')
};

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
</script>

<style scoped>
.favorite-manager {
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

.favorite-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.empty-state {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 60px 20px;
  text-align: center;
  margin-top: 20px;
}
</style>