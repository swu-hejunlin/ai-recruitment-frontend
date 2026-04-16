/**
 * 通知中心组件
 */

<template>
  <div class="notification-center">
    <div class="notification-header">
      <h3 class="notification-title">
        <el-icon><BellFilled /></el-icon>
        消息通知
      </h3>
      <el-button 
        v-if="unreadCount > 0" 
        type="primary" 
        size="small" 
        @click="markAllAsRead"
      >
        全部已读
      </el-button>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list">
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="notifications.length === 0" class="empty-notifications">
        <el-empty description="暂无通知" />
      </div>
      
      <div v-else>
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          :class="['notification-item', { 'unread': notification.isRead === 0 }]"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <el-icon v-if="notification.type === 1"><Message /></el-icon>
            <el-icon v-else-if="notification.type === 2"><ChatLineRound /></el-icon>
            <el-icon v-else><Bell /></el-icon>
          </div>
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-text">{{ notification.content }}</p>
            <span class="notification-time">{{ formatTime(notification.createTime) }}</span>
          </div>
          <div v-if="notification.isRead === 0" class="unread-dot"></div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && notifications.length > 0" class="notification-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { BellFilled, Message, ChatLineRound, Bell } from '@element-plus/icons-vue';
import { getNotifications } from '../utils/api';
import type { NotificationInfo } from '../types';

// 状态
const loading = ref(false);
const notifications = ref<NotificationInfo[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const unreadCount = ref(0);

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true;
  try {
    const response = await getNotifications({ pageNum: currentPage.value, pageSize: pageSize.value });
    if (response) {
      notifications.value = response.records || [];
      total.value = response.total || 0;
      // 计算未读数量
      unreadCount.value = notifications.value.filter(n => n.isRead === 0).length;
    }
  } catch (error) {
    console.error('获取通知列表失败:', error);
    ElMessage.error('获取通知列表失败');
  } finally {
    loading.value = false;
  }
};

defineExpose({
  loadNotifications
});

// 标记单条通知为已读
const markAsRead = async (id: number) => {
  try {
    await markAsRead(id);
    // 更新本地状态
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.isRead = 1;
      unreadCount.value--;
    }
  } catch (error) {
    console.error('标记通知已读失败:', error);
    ElMessage.error('标记通知已读失败');
  }
};

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    await markAllAsRead();
    // 更新本地状态
    notifications.value.forEach(n => {
      n.isRead = 1;
    });
    unreadCount.value = 0;
    ElMessage.success('已全部标记为已读');
  } catch (error) {
    console.error('标记全部已读失败:', error);
    ElMessage.error('标记全部已读失败');
  }
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadNotifications();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadNotifications();
};

// 格式化时间
const formatTime = (timeString: string) => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return '刚刚';
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.getMonth() + 1 + '月' + date.getDate() + '日';
      }
    }
  } catch (error) {
    return timeString;
  }
};

// 组件挂载时加载通知
onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notification-center {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-list {
  margin-bottom: 20px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  background-color: #fafafa;
}

.notification-item:hover {
  background-color: #f0f9f8;
}

.notification-item.unread {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.notification-icon {
  font-size: 20px;
  color: #409eff;
  margin-right: 12px;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.unread-dot {
  position: absolute;
  top: 16px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.loading-wrapper {
  padding: 20px 0;
}

.empty-notifications {
  padding: 40px 0;
  text-align: center;
}

.notification-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
