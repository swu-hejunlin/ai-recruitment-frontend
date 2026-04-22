<template>
  <AppLayout>
    <div class="resume-analyzer-container">
      <h1 class="page-title">简历AI智能分析</h1>
      <p class="page-subtitle">上传您的简历，获取专业的分析和改进建议</p>

      <!-- 上传区域 -->
      <div class="upload-section">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <el-icon><Upload /></el-icon>
              <span>上传简历</span>
            </div>
          </template>
          
          <div class="upload-content">
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="true"
              :file-list="fileList"
              accept=".pdf,.doc,.docx"
              :limit="1"
              :on-exceed="handleExceed"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon>
                {{ uploading ? '上传中...' : '选择文件' }}
              </el-button>
              <template #tip>
                <div class="upload-tip">
                  支持 PDF、Word 格式，文件大小不超过 10MB
                </div>
              </template>
            </el-upload>
            
            <el-button
              type="success"
              :disabled="!fileList.length || uploading"
              @click="analyzeResume"
              class="analyze-button"
            >
              <el-icon><DataAnalysis /></el-icon>
              开始AI智能分析
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 分析结果区域 -->
      <div v-if="analysisResult" class="result-section">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <el-icon><Star /></el-icon>
              <span>分析结果</span>
            </div>
          </template>
          
          <div class="result-content">
            <!-- 整体评价 -->
            <div class="rating-section">
              <h3>整体评价</h3>
              <div class="rating-container">
                <el-rate
                  v-model="analysisResult.overallRating"
                  :max="5"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
                <span class="rating-description">{{ analysisResult.ratingDescription }}</span>
              </div>
            </div>

            <!-- 原始分析结果 -->
            <div class="section">
              <h3>
                <el-icon class="section-icon"><DocumentChecked /></el-icon>
                分析结果
              </h3>
              <div class="analysis-content" v-html="formatAnalysisContent(analysisResult.highlights[0])"></div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 加载状态 -->
      <div v-if="analyzing" class="loading-section">
        <el-card class="loading-card">
          <div class="loading-content">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>正在分析简历，请稍候...</span>
          </div>
        </el-card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElUpload, type UploadFile, type UploadRawFile } from 'element-plus'
import { Upload, DataAnalysis, Star, Check, Close, Edit, DocumentChecked, Loading } from '@element-plus/icons-vue'
import { defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
import { uploadAndAnalyzeResume } from '../utils/api'

// 状态
const fileList = ref<UploadFile[]>([])
const uploading = ref(false)
const analyzing = ref(false)
const analysisResult = ref<any>(null)
const route = useRoute();

// 检查是否有分析结果参数
onMounted(() => {
  const analysisResultParam = route.query.analysisResult;
  if (analysisResultParam) {
    try {
      analysisResult.value = JSON.parse(analysisResultParam as string);
    } catch (error) {
      console.error('解析分析结果失败:', error);
    }
  }
});

// 处理文件选择
const handleFileChange = (file: UploadFile, files: UploadFile[]) => {
  // 使用Element Plus提供的fileList
  fileList.value = files
  console.log('文件选择成功:', file.name, 'fileList长度:', fileList.value.length)
  console.log('fileList内容:', fileList.value)
}

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 分析简历
const analyzeResume = async () => {
  if (!fileList.value.length) {
    ElMessage.warning('请选择要分析的简历文件')
    return
  }

  const file = fileList.value[0].raw
  if (!file) {
    ElMessage.warning('文件无效')
    return
  }

  try {
    analyzing.value = true
    uploading.value = true

    const formData = new FormData()
    formData.append('file', file)

    const response = await uploadAndAnalyzeResume(formData)
    
    // 检查响应是否成功
    if (response.success) {
      analysisResult.value = response
      ElMessage.success('简历分析成功')
    } else {
      // 处理后端返回的错误
      ElMessage.error('简历分析失败: ' + (response.errorMessage || '未知错误'))
    }
  } catch (error) {
    console.error('简历分析失败:', error)
    ElMessage.error('简历分析失败，请重试')
  } finally {
    uploading.value = false
    analyzing.value = false
  }
}

// 格式化分析内容，将Markdown转换为HTML
const formatAnalysisContent = (content: string): string => {
  if (!content) return ''
  
  // 替换Markdown标题
  content = content.replace(/^### (.*$)/gim, '<h3 style="margin-top: 20px; margin-bottom: 10px; font-weight: 600;">$1</h3>')
  content = content.replace(/^## (.*$)/gim, '<h2 style="margin-top: 24px; margin-bottom: 12px; font-weight: 600;">$1</h2>')
  
  // 替换Markdown列表
  content = content.replace(/^- (.*$)/gim, '<li style="margin-bottom: 8px;">$1</li>')
  content = content.replace(/(<li.*<\/li>)/s, '<ul style="padding-left: 20px; margin-bottom: 16px;">$1</ul>')
  
  // 替换Markdown粗体
  content = content.replace(/\*\*(.*)\*\*/gim, '<strong style="font-weight: 600;">$1</strong>')
  
  // 替换换行符
  content = content.replace(/\n/g, '<br>')
  
  return content
}
</script>

<style scoped>
.resume-analyzer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
}

.upload-section {
  margin-bottom: 32px;
}

.upload-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.upload-content {
  padding: 40px;
  text-align: center;
}

.upload-demo {
  margin-bottom: 24px;
}

.upload-tip {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.analyze-button {
  margin-top: 16px;
  font-size: 16px;
  padding: 12px 32px;
}

.result-section {
  margin-top: 32px;
}

.result-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.result-content {
  padding: 24px;
}

.rating-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.rating-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rating-description {
  font-size: 16px;
  font-weight: 500;
  color: #409eff;
}

.section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  color: #409eff;
}

.loading-section {
  margin-top: 32px;
}

.loading-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.loading-content {
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: spin 1.5s linear infinite;
}

.analysis-content {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.analysis-content h2 {
  color: #303133;
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 600;
}

.analysis-content h3 {
  color: #303133;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 600;
}

.analysis-content ul {
  padding-left: 20px;
  margin-bottom: 16px;
}

.analysis-content li {
  margin-bottom: 8px;
}

.analysis-content strong {
  font-weight: 600;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .resume-analyzer-container {
    padding: 16px;
  }

  .upload-content {
    padding: 24px;
  }

  .result-content {
    padding: 16px;
  }

  .rating-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>