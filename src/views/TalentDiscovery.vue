<template>
  <AppLayout>
    <div class="talent-discovery">
      <div class="page-header">
        <h2 class="page-title">
          <el-icon><UserFilled /></el-icon>
          牛人发现
        </h2>
        <p class="page-desc">基于岗位画像与人才画像的智能匹配，为您推荐最合适的候选人</p>
      </div>

      <div class="filter-bar">
        <el-select v-model="selectedPositionId" placeholder="选择岗位查看匹配人才" clearable style="width: 280px" @change="handlePositionChange">
          <el-option v-for="pos in myPositions" :key="pos.id" :label="pos.title" :value="pos.id" />
        </el-select>
        <el-button type="primary" :icon="Refresh" :loading="refreshing" @click="handleRefresh">
          刷新推荐
        </el-button>
      </div>

      <div v-if="!selectedPositionId" class="empty-state">
        <el-empty description="请先选择一个岗位，查看匹配的牛人推荐">
          <template #image>
            <el-icon :size="64" color="#c0c4cc"><UserFilled /></el-icon>
          </template>
        </el-empty>
      </div>

      <div v-else-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="talents.length === 0" class="empty-state">
        <el-empty description="暂无匹配的牛人推荐，请检查：1) 该岗位是否已生成画像；2) 是否有求职者投递；3) 求职者是否已完善简历">
          <el-button type="primary" @click="$router.push('/boss/positions')">管理岗位画像</el-button>
        </el-empty>
      </div>

      <div v-else class="talent-list">
        <div v-for="talent in talents" :key="talent.jobSeekerId" class="talent-card" @click="showTalentDetail(talent)">
          <div class="talent-main">
            <div class="talent-avatar">
              <el-avatar :size="56" :src="talent.avatarUrl">
                {{ talent.name?.charAt(0) || '?' }}
              </el-avatar>
            </div>
            <div class="talent-info">
              <div class="talent-name-row">
                <span class="talent-name">{{ talent.name || '未知' }}</span>
                <el-tag v-if="talent.currentStatus" size="small" :type="getStatusType(talent.currentStatus)">
                  {{ talent.currentStatus }}
                </el-tag>
              </div>
              <div class="talent-meta">
                <span v-if="talent.workYears != null">{{ talent.workYears }}年经验</span>
                <span v-if="talent.education">{{ talent.education }}</span>
                <span v-if="talent.expectedCity">{{ talent.expectedCity }}</span>
              </div>
              <div v-if="talent.strengthsSummary" class="talent-summary">{{ talent.strengthsSummary }}</div>
              <div class="talent-skills">
                <el-tag v-for="skill in displaySkills(talent.skills)" :key="skill" size="small" type="info" class="skill-tag">
                  {{ skill }}
                </el-tag>
                <el-tag v-if="parseSkills(talent.skills).length > 5" size="small" type="info" class="skill-tag">
                  +{{ parseSkills(talent.skills).length - 5 }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-dialog v-model="detailVisible" title="牛人详情" width="680px" destroy-on-close>
      <div v-if="currentTalent" class="talent-detail">
        <div class="detail-header">
          <el-avatar :size="72" :src="currentTalent.avatarUrl">
            {{ currentTalent.name?.charAt(0) || '?' }}
          </el-avatar>
          <div class="detail-header-info">
            <h3>{{ currentTalent.name || '未知' }}</h3>
            <div class="detail-meta">
              <span v-if="currentTalent.workYears != null">{{ currentTalent.workYears }}年经验</span>
              <span v-if="currentTalent.education">{{ currentTalent.education }}</span>
              <span v-if="currentTalent.currentStatus">{{ currentTalent.currentStatus }}</span>
              <span v-if="currentTalent.expectedCity">{{ currentTalent.expectedCity }}</span>
            </div>
            <div v-if="currentTalent.expectedPosition" class="detail-career">
              求职意向：{{ currentTalent.expectedPosition }}
            </div>
          </div>
        </div>

        <div v-if="currentTalent.selfIntroduction" class="detail-section">
          <h4>个人简介</h4>
          <p>{{ currentTalent.selfIntroduction }}</p>
        </div>

        <div v-if="currentTalent.strengthsSummary" class="detail-section">
          <h4>优势亮点</h4>
          <p>{{ currentTalent.strengthsSummary }}</p>
        </div>

        <div class="detail-section">
          <h4>技能标签</h4>
          <div class="detail-skills">
            <el-tag v-for="skill in parseSkills(currentTalent.skills)" :key="skill" size="default" type="info">
              {{ skill }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { ElMessage } from 'element-plus';
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
import { UserFilled, Refresh } from '@element-plus/icons-vue';
import { getTalentRecommendations, getTalentMatchDetails, batchGenerateTalentMatchRecords, getBossPositionList } from '../utils/api';

const loading = ref(false);
const refreshing = ref(false);
const talents = ref<any[]>([]);
const myPositions = ref<any[]>([]);
const selectedPositionId = ref<number | null>(null);
const detailVisible = ref(false);
const currentTalent = ref<any>(null);

const loadMyPositions = async () => {
  try {
    const res = await getBossPositionList(1, 100);
    if (res) {
      myPositions.value = (res.records || []).filter((p: any) => p.status === 1);
    }
  } catch (e) {
    console.error('获取职位列表失败', e);
  }
};

const loadTalents = async () => {
  if (!selectedPositionId.value) return;
  loading.value = true;
  try {
    const res = await getTalentRecommendations(selectedPositionId.value, 20);
    talents.value = res || [];
  } catch (e) {
    console.error('获取人才推荐失败', e);
    ElMessage.error('获取人才推荐失败');
  } finally {
    loading.value = false;
  }
};

const handlePositionChange = () => {
  loadTalents();
};

const handleRefresh = async () => {
  if (!selectedPositionId.value) {
    ElMessage.warning('请先选择一个岗位');
    return;
  }
  refreshing.value = true;
  try {
    await batchGenerateTalentMatchRecords(selectedPositionId.value);
    await loadTalents();
    ElMessage.success('推荐已刷新');
  } catch (e) {
    console.error('刷新推荐失败', e);
    ElMessage.error('刷新推荐失败');
  } finally {
    refreshing.value = false;
  }
};

const showTalentDetail = async (talent: any) => {
  if (selectedPositionId.value) {
    try {
      const detail = await getTalentMatchDetails(talent.userId, selectedPositionId.value);
      currentTalent.value = detail || talent;
    } catch {
      currentTalent.value = talent;
    }
  } else {
    currentTalent.value = talent;
  }
  detailVisible.value = true;
};

const parseSkills = (skills: any): string[] => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  try {
    return JSON.parse(skills);
  } catch {
    return [];
  }
};

const displaySkills = (skills: any): string[] => {
  return parseSkills(skills).slice(0, 5);
};

const getStatusType = (status: string) => {
  if (status?.includes('离职')) return 'success';
  if (status?.includes('考虑')) return 'warning';
  return 'info';
};

onMounted(() => {
  loadMyPositions();
});
</script>

<style scoped>
.talent-discovery {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.loading-state {
  padding: 20px 0;
}

.talent-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.talent-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.talent-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #409eff;
}

.talent-main {
  display: flex;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.talent-info {
  flex: 1;
  min-width: 0;
}

.talent-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.talent-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.talent-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.talent-summary {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.talent-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  border-radius: 12px;
}

.talent-match {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  margin-left: 20px;
}

.match-score-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid;
}

.match-score-ring.score-high {
  border-color: #67c23a;
  color: #67c23a;
}

.match-score-ring.score-medium {
  border-color: #e6a23c;
  color: #e6a23c;
}

.match-score-ring.score-low {
  border-color: #f56c6c;
  color: #f56c6c;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 10px;
  margin-top: 2px;
}

.match-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-item-label {
  font-size: 12px;
  color: #909399;
  width: 28px;
  flex-shrink: 0;
}

.match-item .el-progress {
  flex: 1;
}

.match-item-value {
  font-size: 12px;
  color: #606266;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

.talent-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header-info {
  flex: 1;
}

.detail-header-info h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
}

.detail-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.detail-career {
  font-size: 13px;
  color: #409eff;
}

.detail-score {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  flex-shrink: 0;
}

.detail-score.score-high { border-color: #67c23a; color: #67c23a; }
.detail-score.score-medium { border-color: #e6a23c; color: #e6a23c; }
.detail-score.score-low { border-color: #f56c6c; color: #f56c6c; }

.detail-score-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.detail-score-label {
  font-size: 11px;
  margin-top: 2px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.detail-section p {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.detail-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-match-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-match-item .label {
  font-size: 12px;
  color: #909399;
}

.detail-match-item .value {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.match-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.match-detail-label {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}
</style>
