<template>
  <AppLayout>
    <div class="boss-position-manager">
      <!-- 职位管理列表组件 -->
      <boss-position-list />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import BossPositionList from '@/components/position/BossPositionList.vue'
</script>

<style scoped lang="scss">
.boss-position-manager {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 64px);
  
  @media (max-width: 1200px) {
    padding: 16px;
  }
}
</style>