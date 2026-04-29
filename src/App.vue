<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from './stores/userStore';

onMounted(() => {
  const userStore = useUserStore();
  const hasToken = !!localStorage.getItem('token');
  const hasUserInfo = !!localStorage.getItem('userInfo');

  if (hasToken && !hasUserInfo) {
    userStore.clearUserState();
  }
});
</script>

<style>
@import './style.css';
</style>
