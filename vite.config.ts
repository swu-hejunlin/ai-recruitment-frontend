import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 设置 @ 别名指向 src 目录
    },
  },
  server: {
    port: 5173, // 开发服务器端口
    open: true, // 自动打开浏览器
    proxy: {
      // 代理后端 API 请求
      '/api': {
        target: 'http://localhost:8080', // 后端服务地址
        changeOrigin: true, // 跨域
        rewrite: (path) => path, // 保持路径不变
      },
    },
  },
});
