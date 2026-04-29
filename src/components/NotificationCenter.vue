/**
 * 通知中心组件
 * 支持通知列表展示、标记已读、全部已读、点击跳转
 */

<template>
  <div class="notification-center">
    <div class="notification-header">
      <h3 class="notification-title-text">
        <el-icon><BellFilled /></el-icon>
        消息通知
        <span v-if="totalUnread > 0" class="unread-summary">{{ totalUnread }}条未读</span>
      </h3>
      <el-button
        v-if="totalUnread > 0"
        type="primary"
        size="small"
        :loading="markingAll"
        @click="handleMarkAllAsRead"
      >
        全部已读
      </el-button>
    </div>

    <div class="notification-list">
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="notifications.length === 0" class="empty-notifications">
        <el-empty description="暂无通知" :image-size="60" />
      </div>

      <div v-else>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification-item', { 'unread': notification.isRead === 0 }]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :class="getIconClass(notification.type)">
            <el-icon v-if="notification.type === 1"><Message /></el-icon>
            <el-icon v-else-if="notification.type === 2"><ChatLineRound /></el-icon>
            <el-icon v-else><Bell /></el-icon>
          </div>
          <div class="notification-content">
            <h4 class="notification-item-title">{{ notification.title }}</h4>
            <p class="notification-text">{{ notification.content }}</p>
            <span class="notification-time">{{ formatTime(notification.createTime) }}</span>
          </div>
          <div v-if="notification.isRead === 0" class="unread-dot"></div>
        </div>
      </div>
    </div>

    <div v-if="!loading && notifications.length > 0" class="notification-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        small
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { BellFilled, Message, ChatLineRound, Bell } from '@element-plus/icons-vue';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../utils/api';
import { useUserStore } from '../stores/userStore';
import type { NotificationInfo } from '../types';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const markingAll = ref(false);
const notifications = ref<NotificationInfo[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const totalUnread = computed(() => userStore.unreadNotificationCount);

const loadNotifications = async () => {
  loading.value = true;
  try {
    const response = await getNotifications({ pageNum: currentPage.value, pageSize: pageSize.value });
    if (response) {
      notifications.value = response.records || [];
      total.value = response.total || 0;
    }
  } catch (error) {
    console.error('获取通知列表失败:', error);
    ElMessage.error('获取通知列表失败');
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (notification: NotificationInfo) => {
  if (notification.isRead === 0) {
    try {
      await markNotificationRead({ id: notification.id });
      notification.isRead = 1;
      await userStore.refreshCounts();
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  }

  if (notification.type === 1 && notification.businessId) {
    router.push('/boss/applications');
  } else if (notification.type === 2 && notification.businessId) {
    if (userStore.isSeeker) {
      router.push('/applications');
    } else {
      router.push('/boss/applications');
    }
  }
};

const handleMarkAllAsRead = async () => {
  markingAll.value = true;
  try {
    await markAllNotificationsRead();
    notifications.value.forEach(n => {
      n.isRead = 1;
    });
    await userStore.refreshCounts();
    ElMessage.success('已全部标记为已读');
  } catch (error) {
    console.error('标记全部已读失败:', error);
    ElMessage.error('标记全部已读失败');
  } finally {
    markingAll.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadNotifications();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadNotifications();
};

const getIconClass = (type: number) => {
  switch (type) {
    case 1: return 'icon-apply';
    case 2: return 'icon-status';
    default: return 'icon-system';
  }
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }
    }
  } catch {
    return timeString;
  }
};

defineExpose({ loadNotifications });

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notification-center {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-title-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unread-summary {
  font-size: 12px;
  font-weight: 400;
  color: #f56c6c;
  background: #fef0f0;
  padding: 1px 6px;
  border-radius: 10px;
}

.notification-list {
  margin-bottom: 16px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
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
  font-size: 18px;
  margin-right: 10px;
  margin-top: 2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.icon-apply {
  color: #409eff;
  background: #ecf5ff;
}

.notification-icon.icon-status {
  color: #e6a23c;
  background: #fdf6ec;
}

.notification-icon.icon-system {
  color: #67c23a;
  background: #f0f9eb;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-text {
  font-size: 12px;
  color: #606266;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 11px;
  color: #909399;
}

.unread-dot {
  position: absolute;
  top: 14px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.loading-wrapper {
  padding: 16px 0;
}

.empty-notifications {
  padding: 30px 0;
  text-align: center;
}

.notification-pagination {
  margin-top: 12px;
  text-align: center;
}

.notification-pagination :deep(.el-pagination) {
  justify-content: center;
}
</style>
