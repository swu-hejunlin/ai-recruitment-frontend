/**
 * 首页组件（占位）
 * 后续会根据角色显示不同的内容
 */

<template>
  <div class="home-container">
    <div class="home-header">
      <h1>欢迎来到智能招聘平台</h1>
      <p>AI驱动的智能人才匹配系统</p>
    </div>

    <div class="home-content">
      <el-card class="user-info-card">
        <template #header>
          <div class="card-header">
            <span>用户信息</span>
          </div>
        </template>
        <div class="user-info">
          <p><strong>手机号：</strong>{{ userStore.userInfo?.phone }}</p>
          <p><strong>角色：</strong>{{ userStore.userInfo?.role === 1 ? '求职者' : '企业HR' }}</p>
          <p><strong>用户ID：</strong>{{ userStore.userInfo?.userId }}</p>
        </div>
      </el-card>

      <el-card class="feature-card">
        <template #header>
          <div class="card-header">
            <span>即将上线功能</span>
          </div>
        </template>
        <div class="feature-list">
          <el-empty description="功能开发中..." />
        </div>
      </el-card>
    </div>

    <div class="home-footer">
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();

/**
 * 退出登录
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 清除用户状态
    userStore.logout();

    // 跳转到登录页
    router.push('/login');
  } catch (error) {
    // 用户取消操作
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 40px;
  background: #f5f5f5;
}

.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.home-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.home-header p {
  font-size: 16px;
  color: #666;
}

.home-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  line-height: 2;
}

.home-footer {
  margin-top: 40px;
  text-align: center;
}
</style>
