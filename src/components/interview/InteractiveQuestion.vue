<template>
  <el-card class="interactive-question-card">
    <template #header>
      <div class="card-header">
        <span>
          <el-icon><Collection /></el-icon>
          面试题 ({{ currentIndex + 1 }}/{{ totalCount }})
        </span>
        <div class="progress-info">
          <el-progress 
            :percentage="progressPercentage" 
            :stroke-width="8"
            :show-text="false"
          />
        </div>
      </div>
    </template>
    
    <div class="question-content" :key="currentIndex">
      <transition name="fade-slide" mode="out-in">
        <div class="question-box" :key="currentIndex">
          <div class="question-number">AI面试官:</div>
          <div class="question-text-wrapper">
            <span class="question-text" ref="questionTextRef">{{ displayedText }}</span>
            <span v-if="isTyping" class="typing-cursor">|</span>
          </div>
        </div>
      </transition>
    </div>
    
    <div class="question-actions">
      <el-button 
        type="primary" 
        size="large"
        @click="nextQuestion"
        class="action-button"
        :disabled="isTyping"
      >
        <el-icon><Check /></el-icon>
        {{ getButtonText() }}
      </el-button>
      
      <div class="hint-text">
        {{ getHintText() }}
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Collection, Check } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  questions: string[],
  typingDelay?: number
}>(), {
  typingDelay: 100
})

const emit = defineEmits(['finish'])

const currentIndex = ref(0)
const displayedText = ref('')
const isTyping = ref(false)
const questionTextRef = ref<HTMLElement | null>(null)
let typingTimer: number | null = null
let isInitialized = false
let speechSynthesisUtterance: SpeechSynthesisUtterance | null = null
let isSpeaking = ref(false)

const totalCount = computed(() => props.questions.length)

const currentQuestion = computed(() => props.questions[currentIndex.value])

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round(((currentIndex.value + 1) / totalCount.value) * 100)
})

const typingDelay = computed(() => {
  const delay = props.typingDelay || 100
  return Math.max(50, Math.min(delay, 200))
})

const startTypingEffect = async (text: string) => {
  if (isTyping.value) {
    clearTimeout(typingTimer!)
    typingTimer = null
  }
  
  if (isInitialized && displayedText.value === text) {
    return
  }
  
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
  
  // 停止之前的语音
  stopSpeaking()
  
  displayedText.value = ''
  isTyping.value = true
  isInitialized = true
  
  await nextTick()
  
  let charIndex = 0
  
  const typeChar = () => {
    if (charIndex < text.length) {
      displayedText.value += text[charIndex]
      charIndex++
      typingTimer = window.setTimeout(typeChar, typingDelay.value)
    } else {
      // 打字完成后再朗读整个题目
      isTyping.value = false
      speakText(text)
    }
  }
  
  typeChar()
}

// 语音合成函数
const speakText = (text: string) => {
  if (!window.speechSynthesis) {
    console.warn('浏览器不支持语音合成')
    return
  }
  
  // 停止之前的语音
  window.speechSynthesis.cancel()
  
  speechSynthesisUtterance = new SpeechSynthesisUtterance(text)
  speechSynthesisUtterance.rate = 1.0 // 正常语速
  speechSynthesisUtterance.pitch = 1.0 // 正常音调
  speechSynthesisUtterance.volume = 1.0 // 音量
  
  // 设置语音（优先使用中文语音）
  const voices = window.speechSynthesis.getVoices()
  const chineseVoice = voices.find(voice => 
    voice.lang.includes('zh') || voice.lang.includes('CN')
  )
  if (chineseVoice) {
    speechSynthesisUtterance.voice = chineseVoice
  }
  
  isSpeaking.value = true
  
  speechSynthesisUtterance.onend = () => {
    isSpeaking.value = false
  }
  
  speechSynthesisUtterance.onerror = () => {
    isSpeaking.value = false
  }
  
  window.speechSynthesis.speak(speechSynthesisUtterance)
}

// 停止语音
const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  isSpeaking.value = false
  speechSynthesisUtterance = null
}

const nextQuestion = () => {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
  
  // 停止语音
  stopSpeaking()
  
  if (currentIndex.value < totalCount.value - 1) {
    currentIndex.value++
  } else {
    emit('finish')
  }
}

const getButtonText = () => {
  if (isTyping.value) {
    return '请稍候...'
  }
  return currentIndex.value < totalCount.value - 1 ? '已完成，准备下一题' : '回答完毕'
}

const getHintText = () => {
  if (isTyping.value) {
    return 'AI面试官正在出题，请稍候'
  }
  return currentIndex.value < totalCount.value - 1 ? '点击按钮进入下一题' : '点击按钮结束答题'
}

watch(() => props.questions, (newQuestions) => {
  if (newQuestions.length > 0 && !isInitialized) {
    startTypingEffect(newQuestions[0])
  }
})

watch(currentIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < props.questions.length) {
    startTypingEffect(props.questions[newIndex])
  }
})

onMounted(() => {
  if (props.questions.length > 0 && !isInitialized) {
    startTypingEffect(props.questions[0])
  }
})
</script>

<style scoped>
.interactive-question-card {
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #2E8B57 0%, #90EE90 100%);
  border: none;
  box-shadow: 0 10px 40px rgba(46, 139, 87, 0.3);
}

.interactive-question-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #409eff;
}

.interactive-question-card :deep(.el-card__body) {
  padding: 0;
  background: transparent;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.card-header .el-icon {
  margin-right: 8px;
}

.progress-info {
  width: 100%;
}

.progress-info :deep(.el-progress-bar__outer) {
  background: rgba(64, 158, 255, 0.2);
}

.question-content {
  padding: 16px 16px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-box {
  text-align: center;
  color: #409eff;
}

.question-number {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  opacity: 0.9;
  letter-spacing: 1px;
  color: #409eff;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  color: #409eff;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.question-text-wrapper {
  display: inline;
}

.typing-cursor {
  display: inline;
  color: #409eff;
  font-weight: bold;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.question-actions {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.action-button {
  min-width: 180px;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

.action-button .el-icon {
  margin-right: 8px;
}

.hint-text {
  font-size: 14px;
  color: rgba(64, 158, 255, 0.8);
  text-align: center;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
