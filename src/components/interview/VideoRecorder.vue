<template>
  <el-card class="video-card">
    <template #header>
      <div class="card-header">
        <span><el-icon><VideoCamera /></el-icon> 视频面试</span>
        <div class="recording-status" v-if="isRecording">
          <el-tag type="danger" effect="dark">录制中</el-tag>
        </div>
      </div>
    </template>
    <div class="video-container">
      <video ref="videoRef" class="preview-video" autoplay muted></video>
      <canvas ref="canvasRef" class="capture-canvas" style="display: none"></canvas>
      <div v-if="!isRecording && !videoUrl" class="video-placeholder">
        <el-icon class="placeholder-icon"><VideoCamera /></el-icon>
        <p>点击开始按钮开始面试</p>
      </div>
      <div v-else-if="videoUrl" class="video-preview">
        <video :src="videoUrl" class="preview-video" controls></video>
      </div>
    </div>
    <div class="video-controls">
      <el-button 
        v-if="!isRecording && !videoUrl" 
        type="primary" 
        size="large"
        @click="startRecording"
        :disabled="!hasCamera"
        class="control-button"
      >
        <el-icon><VideoCamera /></el-icon> 开始面试
      </el-button>
      
      <el-button 
        v-else-if="isRecording" 
        type="danger" 
        size="large"
        @click="stopRecording"
        class="control-button"
      >
        <el-icon><Close /></el-icon> 结束面试
      </el-button>
      
      <el-button 
        v-else-if="videoUrl" 
        type="success" 
        size="large"
        @click="submitInterview"
        :loading="submitting"
        class="control-button submit-button"
      >
        <el-icon><Check /></el-icon> 结束面试
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { VideoCamera, Close, Refresh, Check } from '@element-plus/icons-vue'

const props = defineProps({
  isRealInterview: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['startRecording', 'stopRecording', 'submitInterview', 'error'])

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isRecording = ref(false)
const hasCamera = ref(false)
const videoUrl = ref('')
const submitting = ref(false)
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
let stream: MediaStream | null = null

const startRecording = async () => {
  try {
    // 获取视频和音频流
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    videoRef.value!.srcObject = stream
    
    // 录制视频
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    recordedChunks = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      videoUrl.value = URL.createObjectURL(blob)
      emit('stopRecording', blob)
    }
    
    mediaRecorder.start()
    isRecording.value = true
    emit('startRecording')
  } catch (error) {
    console.error('开始录制失败:', error)
    emit('error', '无法访问摄像头或麦克风，请检查权限设置')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    stream?.getTracks().forEach(track => track.stop())
    isRecording.value = false
  }
}

const submitInterview = async () => {
  if (!videoUrl.value) {
    emit('error', '请先录制视频')
    return
  }
  
  try {
    submitting.value = true
    const blob = await fetch(videoUrl.value).then(r => r.blob())
    emit('submitInterview', blob)
  } catch (error) {
    console.error('提交面试失败:', error)
    emit('error', '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const checkCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    hasCamera.value = true
  } catch (error) {
    console.error('检查摄像头失败:', error)
    hasCamera.value = false
  }
}

onMounted(() => {
  checkCamera()
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
  }
})
</script>

<style scoped>
.video-card {
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

.video-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;

  .preview-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .video-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;

    .placeholder-icon {
      font-size: 48px;
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #909399;
      margin: 0;
    }
  }

  .video-preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .video-container {
    padding-top: 60%; /* 调整为更适合小屏幕的比例 */
  }
}

.video-controls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.control-button {
  min-width: 160px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 24px;
}

.submit-button {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
}

.recording-status {
  display: flex;
  align-items: center;
}
</style>