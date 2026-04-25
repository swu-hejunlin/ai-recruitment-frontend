<template>
  <div class="interview-header">
    <div class="header-left">
      <el-button @click="goBack" type="primary" plain :icon="ArrowLeft">
        返回
      </el-button>
      <div class="header-title">
        <h2>{{ title }}</h2>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    default: '面试'
  },
  subtitle: {
    type: String,
    default: ''
  },
  backRoute: {
    type: String,
    default: ''
  }
})

const goBack = () => {
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.interview-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-title {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>