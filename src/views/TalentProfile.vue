<template>
  <div class="profile-container">
    <div class="page-header">
      <h2>我的画像</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          <el-icon><Refresh /></el-icon>
          {{ hasProfile ? '更新画像' : '生成画像' }}
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="profileData" class="profile-content">
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ profileData.userName }}</span>
          </div>
          <div class="info-item">
            <span class="label">学历：</span>
            <span class="value">{{ profileData.education }}</span>
          </div>
          <div class="info-item">
            <span class="label">工作年限：</span>
            <span class="value">{{ profileData.workYears }}年</span>
          </div>
          <div class="info-item">
            <span class="label">期望薪资：</span>
            <span class="value">{{ profileData.salaryExpectation }}K/月</span>
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>技能标签</span>
          </div>
        </template>
        <div class="tags-container">
          <el-tag
            v-for="(skill, index) in profileData.skills"
            :key="index"
            type="primary"
            class="skill-tag"
          >
            {{ skill }}
          </el-tag>
          <div v-if="!profileData.skills?.length" class="empty-text">
            暂无技能标签
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>人才标签</span>
          </div>
        </template>
        <div class="tags-container">
          <el-tag
            v-for="(tag, index) in profileData.talentTags"
            :key="index"
            type="success"
            class="talent-tag"
          >
            {{ tag }}
          </el-tag>
          <div v-if="!profileData.talentTags?.length" class="empty-text">
            暂无人才标签
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>个人简介</span>
          </div>
        </template>
        <div class="description-content">
          {{ profileData.descriptionSummary || '暂无个人简介' }}
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>优势亮点</span>
          </div>
        </template>
        <div class="description-content">
          {{ profileData.strengthsSummary || '暂无优势亮点' }}
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>职业目标</span>
          </div>
        </template>
        <div class="description-content">
          {{ profileData.careerGoals || '暂无职业目标' }}
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>AI综合评估</span>
          </div>
        </template>
        <div class="description-content ai-evaluation">
          {{ profileData.aiEvaluation || '暂无AI评估' }}
        </div>
      </el-card>
    </div>

    <div v-else class="empty-container">
      <el-empty description="暂无人才画像">
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          生成画像
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getTalentProfile, generateTalentProfile } from '@/utils/api';

const loading = ref(false);
const generating = ref(false);
const profileData = ref<any>(null);

const hasProfile = ref(false);

const fetchProfile = async () => {
  loading.value = true;
  try {
    const data = await getTalentProfile();
    if (data) {
      profileData.value = data;
      hasProfile.value = true;
    }
  } catch (error) {
    console.error('获取人才画像失败:', error);
    ElMessage.error('获取人才画像失败');
  } finally {
    loading.value = false;
  }
};

const handleGenerate = async () => {
  generating.value = true;
  try {
    const data = await generateTalentProfile();
    if (data) {
      profileData.value = data;
      hasProfile.value = true;
      ElMessage.success('画像生成成功');
    }
  } catch (error) {
    console.error('生成人才画像失败:', error);
    ElMessage.error('生成人才画像失败');
  } finally {
    generating.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  border-radius: 8px;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
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
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag,
.talent-tag {
  font-size: 14px;
  padding: 6px 12px;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.description-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.ai-evaluation {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
