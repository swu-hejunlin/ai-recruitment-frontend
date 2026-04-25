<template>
  <AppLayout>
    <div class="mock-interview-container">
      <InterviewHeader 
        title="AI模拟面试" 
        subtitle="通过视频面试，获取AI智能评估"
      />

      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else class="interview-content">
        <!-- 生成面试题阶段 -->
        <el-card v-if="!questions.length" class="generate-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><MagicStick /></el-icon> 个性化面试题</span>
            </div>
          </template>
          <div class="generate-content">
            <p class="generate-desc">
              输入您想要面试的岗位信息，AI面试官将为您准备定制化的面试题
            </p>
            
            <el-form :model="positionForm" class="position-form" label-width="100px">
              <el-form-item label="职位名称">
                <el-input 
                  v-model="positionForm.positionName" 
                  placeholder="例如：Java开发工程师"
                  clearable
                />
              </el-form-item>
              <el-form-item label="职位类别">
                <el-input 
                  v-model="positionForm.positionCategory" 
                  placeholder="例如：技术类"
                  clearable
                />
              </el-form-item>
              <el-form-item label="工作城市">
                <el-input 
                  v-model="positionForm.city" 
                  placeholder="例如：北京"
                  clearable
                />
              </el-form-item>
              <el-form-item label="岗位职责">
                <el-input 
                  v-model="positionForm.description" 
                  type="textarea"
                  :rows="3"
                  placeholder="请输入该职位的主要职责和工作内容"
                  clearable
                />
              </el-form-item>
              <el-form-item label="任职要求">
                <el-input 
                  v-model="positionForm.requirement" 
                  type="textarea"
                  :rows="3"
                  placeholder="请输入该职位的技能要求、工作经验要求等"
                  clearable
                />
              </el-form-item>
            </el-form>
            
            <el-button 
              type="primary" 
              size="large" 
              @click="generateQuestions()"
              :loading="generating"
              :disabled="!canGenerate"
            >
              <el-icon><MagicStick /></el-icon> 生成面试题
            </el-button>
          </div>
        </el-card>

        <!-- 面试阶段：上下布局（题目在上，视频在下） -->
        <div v-else-if="!evaluationResult" class="interview-stage">
          <!-- 上方：逐题展示区域 -->
          <div class="question-section">
            <InteractiveQuestion 
              :questions="questions"
              @finish="handleFinishInterview"
            />
          </div>
          
          <!-- 下方：视频录制区域 -->
          <div class="video-section">
            <VideoRecorder 
              :is-real-interview="false"
              @start-recording="handleStartRecording"
              @stop-recording="handleStopRecording"
              @submit-interview="handleSubmitInterview"
              @error="handleError"
            />
          </div>
        </div>

        <!-- AI评估结果 -->
        <EvaluationResult 
          v-if="evaluationResult" 
          :evaluation-result="evaluationResult"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Loading, MagicStick } from '@element-plus/icons-vue'
import { submitMockInterview, generateMockInterviewQuestions } from '@/utils/api'

const AppLayout = defineAsyncComponent(() => import('../../components/AppLayout.vue'))
const InterviewHeader = defineAsyncComponent(() => import('../../components/interview/InterviewHeader.vue'))
const QuestionList = defineAsyncComponent(() => import('../../components/interview/QuestionList.vue'))
const InteractiveQuestion = defineAsyncComponent(() => import('../../components/interview/InteractiveQuestion.vue'))
const VideoRecorder = defineAsyncComponent(() => import('../../components/interview/VideoRecorder.vue'))
const EvaluationResult = defineAsyncComponent(() => import('../../components/interview/EvaluationResult.vue'))

const router = useRouter()

const loading = ref(false)
const generating = ref(false)
const currentQuestion = ref(0)
const evaluationResult = ref<any>(null)
const sessionKey = ref<string>('')

const questions = ref<string[]>([])

const positionForm = ref({
  positionName: '',
  positionCategory: '',
  city: '',
  description: '',
  requirement: ''
})

const canGenerate = computed(() => {
  return positionForm.value.positionName.trim() !== '' && 
         (positionForm.value.description.trim() !== '' || positionForm.value.requirement.trim() !== '')
})

// 生成面试题
const generateQuestions = async () => {
  if (generating.value) return
  
  try {
    generating.value = true
    
    // 显示加载提示
    const loading = ElLoading.service({
      lock: true,
      text: 'AI面试官正在准备面试题，请耐心等待...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const response = await generateMockInterviewQuestions(
      undefined, 
      positionForm.value.positionName,
      positionForm.value.positionCategory,
      positionForm.value.city,
      positionForm.value.description,
      positionForm.value.requirement
    )
    questions.value = response.questions
    sessionKey.value = response.sessionKey || ''
    
    loading.close()
    ElMessage.success('面试题生成成功')
  } catch (error) {
    console.error('生成面试题失败:', error)
    ElMessage.error('生成面试题失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

// 重新生成面试题
const regenerateQuestions = async () => {
  await generateQuestions()
}

// 处理结束面试（所有题目展示完毕）
const handleFinishInterview = () => {
  ElMessage.info('面试结束，请提交您的面试视频')
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
      text: '正在上传视频和音频并等待AI评估，请耐心等待...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 准备视频数据
    const formData = new FormData()
    formData.append('video', videoBlob, 'interview.webm')
    
    const response = await submitMockInterview(formData, undefined, sessionKey.value || undefined)
    evaluationResult.value = response
    
    loading.close()
    ElMessage.success('评估完成')
  } catch (error) {
    console.error('提交面试失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

// 处理错误
const handleError = (message: string) => {
  ElMessage.error(message)
}
</script>

<style scoped>
.mock-interview-container {
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

.interview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

    .position-form {
      width: 100%;
      max-width: 600px;
      margin: 20px 0;
      
      :deep(.el-form-item__label) {
        font-weight: 500;
      }
    }

    .el-button {
      min-width: 200px;
    }
  }
}

/* 面试阶段：左右分栏布局 */
.interview-stage {
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
  .interview-stage {
    flex-direction: column;
  }
  
  .question-section,
  .video-section {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .interview-stage {
    gap: 16px;
  }
}
</style>