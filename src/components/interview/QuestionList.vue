<template>
  <el-card class="question-list-card">
    <template #header>
      <div class="card-header">
        <span><el-icon><Document /></el-icon> 面试题列表</span>
        <el-button 
          v-if="showRegenerate" 
          type="warning" 
          size="small" 
          @click="$emit('regenerate')"
          :loading="generating"
        >
          <el-icon><Refresh /></el-icon> 重新生成
        </el-button>
      </div>
    </template>
    <div class="question-list">
      <div 
        v-for="(question, index) in questions" 
        :key="index" 
        class="question-item"
        :class="{ active: currentQuestion === index }"
      >
        <div class="question-header">
          <span class="question-index">{{ index + 1 }}</span>
          <span class="question-text">{{ question }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Document, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  questions: {
    type: Array as () => string[],
    default: () => []
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  showRegenerate: {
    type: Boolean,
    default: true
  },
  generating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['regenerate'])
</script>

<style scoped>
.question-list-card {
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
    justify-content: space-between;

    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

.question-list {
  padding: 16px 0;
}

.question-item {
  padding: 16px;
  border-bottom: 1px dashed #f0f0f0;
  transition: all 0.3s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fa;
  }

  &.active {
    background: #ecf5ff;
    border-left: 4px solid #409eff;
  }

  .question-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;

    .question-index {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #409eff;
      color: #fff;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .question-text {
      flex: 1;
      font-size: 16px;
      color: #303133;
      line-height: 1.5;
    }
  }
}
</style>