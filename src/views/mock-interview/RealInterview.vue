<template>
  <AppLayout>
    <div class="real-interview-container">
      <InterviewHeader 
        title="AI面试" 
        :subtitle="subtitle" 
        backRoute="/interviews"
      />

      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 面试确认页面 -->
      <el-card v-else-if="!interviewConfirmed" class="confirm-card">
        <div class="confirm-content">
          <div class="confirm-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <h2>即将开始AI面试</h2>
          <div class="confirm-info">
            <p class="position-info" v-if="positionTitle">
              <span class="label">面试职位：</span>
              <span class="value">{{ positionTitle }}</span>
            </p>
            <p class="company-info" v-if="companyName">
              <span class="label">招聘公司：</span>
              <span class="value">{{ companyName }}</span>
            </p>
          </div>
          <div class="confirm-warning">
            <el-icon><Warning /></el-icon>
            <span>请务必认真对待此次面试机会</span>
          </div>
          <ul class="confirm-rules">
            <li>面试机会只有 <strong>一次</strong>，请认真对待</li>
            <li>开始后 <strong>必须完成</strong> 全部面试流程</li>
            <li>面试过程中<strong>无法暂停</strong>，请提前做好准备</li>
            <li>确保网络环境稳定，摄像头和麦克风正常工作</li>
          </ul>
          <div class="confirm-buttons">
            <el-button type="danger" size="large" @click="goBack">
              <el-icon><Close /></el-icon>
              暂不面试
            </el-button>
            <el-button type="success" size="large" @click="confirmAndStart">
              <el-icon><Check /></el-icon>
              确认开始面试
            </el-button>
          </div>
        </div>
      </el-card>

      <div v-else class="interview-content">
        <!-- 生成面试题 -->
        <el-card v-if="!questions.length" class="generate-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><MagicStick /></el-icon> 生成面试题</span>
            </div>
          </template>
          <div class="generate-content">
            <p class="generate-desc">
              AI已根据您的简历自动生成了面试题，请做好准备后开始视频面试
            </p>
            <el-button 
              type="primary" 
              size="large" 
              @click="generateQuestions()"
              :loading="generating"
            >
              <el-icon><MagicStick /></el-icon> 生成面试题
            </el-button>
          </div>
        </el-card>

        <!-- 面试题展示区域 -->
        <div class="question-section" v-else>
          <InteractiveQuestion 
            :questions="questions"
            :typing-delay="120"
            @finish="handleInterviewFinish"
          />
        </div>

        <!-- 视频录制区域 -->
        <div class="video-section">
          <VideoRecorder 
            :is-real-interview="true"
            @start-recording="handleStartRecording"
            @stop-recording="handleStopRecording"
            @submit-interview="handleSubmitInterview"
            @error="handleError"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Loading, VideoPlay, Warning, Close, Check, MagicStick } from '@element-plus/icons-vue'
import { finishInterview, generateMockInterviewQuestions } from '@/utils/api'

const AppLayout = defineAsyncComponent(() => import('../../components/AppLayout.vue'))
const InterviewHeader = defineAsyncComponent(() => import('../../components/interview/InterviewHeader.vue'))
const InteractiveQuestion = defineAsyncComponent(() => import('../../components/interview/InteractiveQuestion.vue'))
const VideoRecorder = defineAsyncComponent(() => import('../../components/interview/VideoRecorder.vue'))

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const generating = ref(false)
const interviewConfirmed = ref(false)
const currentQuestion = ref(0)
const questions = ref<string[]>([])

// 从路由参数获取面试信息
const interviewId = computed(() => route.query.interviewId ? parseInt(route.query.interviewId as string) : null)
const positionTitle = computed(() => route.query.positionTitle as string || '')
const companyName = computed(() => route.query.companyName as string || '')

const subtitle = computed(() => {
  if (interviewConfirmed.value && questions.value.length > 0) {
    return '面试进行中，请认真作答'
  } else if (positionTitle.value) {
    return `职位：${positionTitle.value} | 公司：${companyName.value}`
  }
  return ''
})

// 确认并开始面试
const confirmAndStart = async () => {
  interviewConfirmed.value = true
  await generateQuestions()
}

// 生成面试题
const generateQuestions = async () => {
  if (generating.value) return
  
  try {
    generating.value = true
    
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: '正在生成面试题，请耐心等待...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const response = await generateMockInterviewQuestions(interviewId.value || undefined)
    questions.value = response.questions
    
    loading.close()
    ElMessage.success('面试题生成成功')
  } catch (error) {
    console.error('生成面试题失败:', error)
    ElMessage.error('生成面试题失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

// 处理开始录制
const handleStartRecording = () => {
  ElMessage.success('录制开始')
}

// 处理停止录制
const handleStopRecording = () => {
  ElMessage.success('录制结束')
}

// 处理提交面试
const handleSubmitInterview = async (videoBlob: Blob) => {
  try {
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: '正在上传面试视频和音频，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 准备视频数据
    const formData = new FormData()
    formData.append('video', videoBlob, 'interview.webm')
    
    // 添加面试ID
    if (interviewId.value) {
      formData.append('interviewId', interviewId.value.toString())
    }
    
    // 调用结束面试接口，触发后端异步评估
    // 不等待评估完成，只等待文件上传成功
    await finishInterview(formData)
    
    // 立即关闭加载提示，告知用户面试已结束
    loading.close()
    ElMessage.success('面试已结束，感谢您的参与！')
    
    // 延迟一小段时间再跳转，让用户看到成功提示
    setTimeout(() => {
      // 跳转到"我的面试"页面
      router.push('/interviews')
    }, 1500)
  } catch (error) {
    console.error('提交面试失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

// 处理错误
const handleError = (message: string) => {
  ElMessage.error(message)
}

// 处理面试题完成（所有题目已展示完毕，用户点击了"回答完毕"）
const handleInterviewFinish = () => {
  ElMessage.success('所有题目已回答完毕，请结束面试')
}

// 返回
const goBack = () => {
  router.push('/interviews')
}
</script>

<style scoped>
.real-interview-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #409eff;

  .el-icon {
    font-size: 32px;
    margin-bottom: 16px;
  }
}

.confirm-card {
  max-width: 700px;
  margin: 40px auto;

  .confirm-content {
    text-align: center;
    padding: 40px 20px;

    .confirm-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #67c23a 0%, #4caf50 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;

      .el-icon {
        font-size: 48px;
        color: #fff;
      }
    }

    h2 {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 24px 0;
    }

    .confirm-info {
      background: #f5f7fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;

      p {
        margin: 8px 0;
        font-size: 16px;
        display: flex;
        justify-content: center;
        gap: 8px;

        .label {
          color: #606266;
        }

        .value {
          color: #303133;
          font-weight: 600;
        }
      }
    }

    .confirm-warning {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #e6a23c;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 20px;

      .el-icon {
        font-size: 20px;
      }
    }

    .confirm-rules {
      text-align: left;
      background: #fff8f8;
      border: 1px solid #fef0f0;
      border-radius: 12px;
      padding: 20px 30px;
      margin: 0 auto 32px;
      max-width: 500px;

      li {
        margin: 12px 0;
        font-size: 15px;
        color: #606266;
        line-height: 1.6;

        strong {
          color: #f56c6c;
        }
      }
    }

    .confirm-buttons {
      display: flex;
      justify-content: center;
      gap: 24px;

      .el-button {
        min-width: 160px;
        height: 48px;
        font-size: 16px;
      }
    }
  }
}

.interview-content {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}

.question-section {
  flex: 1;
  min-width: 300px;
}

.video-section {
  flex: 1.2;
  min-width: 400px;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .interview-content {
    flex-direction: column;
  }
  
  .question-section,
  .video-section {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .interview-content {
    gap: 16px;
  }
}

.generate-card {
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

  .generate-content {
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    .generate-desc {
      font-size: 16px;
      color: #606266;
      text-align: center;
      line-height: 1.5;
      max-width: 600px;
    }

    .el-button {
      min-width: 200px;
    }
  }
}
</style>