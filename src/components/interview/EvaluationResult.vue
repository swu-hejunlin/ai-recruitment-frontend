<template>
  <el-card class="evaluation-card">
    <template #header>
      <div class="card-header">
        <span><el-icon><Star /></el-icon> AI面试评估</span>
      </div>
    </template>
    <div class="evaluation-content">
      <div class="evaluation-score">
        <div class="score-circle">
          <span class="score-number">{{ evaluationResult.score }}</span>
          <span class="score-label">总分</span>
        </div>
        <div class="score-details">
          <div class="score-item">
            <span class="score-name">语言表达</span>
            <el-progress :percentage="evaluationResult.languageScore" :stroke-width="10" />
          </div>
          <div class="score-item">
            <span class="score-name">逻辑思维</span>
            <el-progress :percentage="evaluationResult.logicScore" :stroke-width="10" />
          </div>
          <div class="score-item">
            <span class="score-name">专业能力</span>
            <el-progress :percentage="evaluationResult.professionalScore" :stroke-width="10" />
          </div>
          <div class="score-item">
            <span class="score-name">整体表现</span>
            <el-progress :percentage="evaluationResult.overallScore" :stroke-width="10" />
          </div>
        </div>
      </div>
      <div class="evaluation-feedback">
        <h4>AI反馈</h4>
        <p>{{ evaluationResult.feedback }}</p>
      </div>
      <div class="evaluation-suggestions">
        <h4>改进建议</h4>
        <ul>
          <li v-for="(suggestion, index) in evaluationResult.suggestions" :key="index">{{ suggestion }}</li>
        </ul>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'

const props = defineProps({
  evaluationResult: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.evaluation-card {
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

.evaluation-content {
  padding: 16px 0;
}

.evaluation-score {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 40px;

  .score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff, #66b1ff);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;

    .score-number {
      font-size: 32px;
      font-weight: 700;
    }

    .score-label {
      font-size: 14px;
      margin-top: 4px;
    }
  }

  .score-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .score-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .score-name {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.evaluation-feedback,
.evaluation-suggestions {
  margin-top: 24px;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }

  ul {
    padding-left: 20px;
    margin: 0;

    li {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>