import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig({
  plugins: [
    vue(),
    ElementPlus({})
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
