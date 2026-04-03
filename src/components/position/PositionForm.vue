<template>
  <div class="position-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
      size="large"
    >
      <!-- 职位名称 -->
      <el-form-item label="职位名称" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入职位名称"
          :maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 职位类别 -->
      <el-form-item label="职位类别" prop="category">
        <el-cascader
          v-model="categoryValue"
          :options="categoryOptions"
          :props="{ expandTrigger: 'hover', emitPath: false }"
          placeholder="请选择职位类别"
          style="width: 100%"
          filterable
          clearable
        />
      </el-form-item>

      <!-- 工作城市 -->
      <el-form-item label="工作城市" prop="city">
        <el-input
          v-model="formData.city"
          placeholder="请输入工作城市"
          :maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <!-- 工作地址 -->
      <el-form-item label="工作地址" prop="address">
        <el-input
          v-model="formData.address"
          placeholder="请输入详细工作地址"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 薪资范围 -->
      <el-form-item label="薪资范围" required>
        <div class="salary-range">
          <el-form-item prop="salaryMin" class="inline-form-item">
            <el-input-number
              v-model="formData.salaryMin"
              :min="0"
              :max="999"
              :step="1"
              placeholder="最低"
              controls-position="right"
            />
          </el-form-item>
          <span class="salary-separator">-</span>
          <el-form-item prop="salaryMax" class="inline-form-item">
            <el-input-number
              v-model="formData.salaryMax"
              :min="0"
              :max="999"
              :step="1"
              placeholder="最高"
              controls-position="right"
            />
          </el-form-item>
          <span class="salary-unit">K/月</span>
        </div>
        <div class="form-tips">温馨提示：薪资为税后薪资范围</div>
      </el-form-item>

      <!-- 学历要求 -->
      <el-form-item label="学历要求" prop="educationMin">
        <el-select
          v-model="formData.educationMin"
          placeholder="请选择最低学历要求"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="level in educationOptions"
            :key="level.value"
            :label="level.label"
            :value="level.value"
          />
        </el-select>
      </el-form-item>

      <!-- 工作经验 -->
      <el-form-item label="工作经验" prop="workYearsMin">
        <el-input-number
          v-model="formData.workYearsMin"
          :min="0"
          :max="30"
          :step="1"
          placeholder="请输入最低工作经验要求（年）"
          style="width: 100%"
          controls-position="right"
        >
          <template #suffix>年</template>
        </el-input-number>
      </el-form-item>

      <!-- 岗位职责 -->
      <el-form-item label="岗位职责" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="6"
          placeholder="请输入岗位职责，每条职责建议用换行分隔"
          :maxlength="2000"
          show-word-limit
          resize="none"
        />
      </el-form-item>

      <!-- 任职要求 -->
      <el-form-item label="任职要求" prop="requirement">
        <el-input
          v-model="formData.requirement"
          type="textarea"
          :rows="6"
          placeholder="请输入任职要求，每条要求建议用换行分隔"
          :maxlength="2000"
          show-word-limit
          resize="none"
        />
      </el-form-item>

      <!-- 福利标签 -->
      <el-form-item label="福利标签" prop="tags">
        <div class="tags-container">
          <el-tag
            v-for="tag in currentTags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            type="primary"
            size="large"
          >
            {{ tag }}
          </el-tag>
          
          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="add-tag-btn"
            size="small"
            @click="showInput"
            type="primary"
            text
          >
            + 添加标签
          </el-button>
        </div>
        <div class="form-tips">标签建议：五险一金、年终奖、带薪年假、弹性工作等</div>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
        {{ mode === 'add' ? '发布职位' : '保存修改' }}
      </el-button>
      <el-button @click="handleCancel" size="large">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { addPosition, updatePosition, getCompanyInfo } from '@/utils/api'
import type { AddPositionRequest, UpdatePositionRequest, PositionInfo, CompanyInfo, EducationLevel, PositionStatus } from '@/types'

interface Props {
  mode?: 'add' | 'edit'
  position?: PositionInfo | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'add',
  position: null
})

const emit = defineEmits<{
  success: []
  cancel: []
}>()

// 表单引用和数据
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive<{
  title: string
  category: string
  city: string
  address: string
  salaryMin?: number
  salaryMax?: number
  educationMin?: EducationLevel
  workYearsMin?: number
  description: string
  requirement: string
  tags?: string
  status: PositionStatus // 添加职位状态字段
}>({
  title: '',
  category: '',
  city: '',
  address: '',
  salaryMin: undefined,
  salaryMax: undefined,
  educationMin: undefined,
  workYearsMin: undefined,
  description: '',
  requirement: '',
  tags: '',
  status: 0 // 默认为0（已关闭），创建后需要手动开启
})

// 公司信息（用于填充companyId）
const companyInfo = ref<CompanyInfo | null>(null)

// 职位类别选项
const categoryValue = ref('')
const categoryOptions = [
  {
    value: '技术',
    label: '技术',
    children: [
      { value: '后端开发', label: '后端开发' },
      { value: '前端开发', label: '前端开发' },
      { value: '移动开发', label: '移动开发' },
      { value: '测试工程师', label: '测试工程师' },
      { value: '运维工程师', label: '运维工程师' },
      { value: '数据开发', label: '数据开发' },
      { value: '人工智能', label: '人工智能' },
      { value: '产品经理', label: '产品经理' }
    ]
  },
  {
    value: '产品',
    label: '产品',
    children: [
      { value: '产品经理', label: '产品经理' },
      { value: '产品设计师', label: '产品设计师' },
      { value: '用户研究', label: '用户研究' }
    ]
  },
  {
    value: '设计',
    label: '设计',
    children: [
      { value: 'UI设计师', label: 'UI设计师' },
      { value: '交互设计师', label: '交互设计师' },
      { value: '平面设计师', label: '平面设计师' }
    ]
  },
  {
    value: '运营',
    label: '运营',
    children: [
      { value: '产品运营', label: '产品运营' },
      { value: '内容运营', label: '内容运营' },
      { value: '用户运营', label: '用户运营' },
      { value: '活动运营', label: '活动运营' },
      { value: '新媒体运营', label: '新媒体运营' }
    ]
  },
  {
    value: '市场',
    label: '市场',
    children: [
      { value: '市场推广', label: '市场推广' },
      { value: '市场营销', label: '市场营销' },
      { value: '品牌公关', label: '品牌公关' },
      { value: '销售', label: '销售' }
    ]
  },
  {
    value: '职能',
    label: '职能',
    children: [
      { value: '人力资源', label: '人力资源' },
      { value: '行政', label: '行政' },
      { value: '财务', label: '财务' },
      { value: '法务', label: '法务' }
    ]
  },
  {
    value: '金融',
    label: '金融',
    children: [
      { value: '投资', label: '投资' },
      { value: '风控', label: '风控' },
      { value: '审计', label: '审计' }
    ]
  }
]

// 学历选项
const educationOptions = [
  { value: 1, label: '高中及以下' },
  { value: 2, label: '大专' },
  { value: 3, label: '本科' },
  { value: 4, label: '硕士' },
  { value: 5, label: '博士' }
]

// 标签相关
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()
const currentTags = computed(() => {
  if (formData.tags) {
    try {
      return JSON.parse(formData.tags)
    } catch {
      return []
    }
  }
  return []
})

// 表单验证规则
const formRules = reactive<FormRules>({
  title: [
    { required: true, message: '请填写职位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '职位名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择职位类别', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请填写工作城市', trigger: 'blur' },
    { min: 2, max: 20, message: '城市名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  address: [
    { max: 100, message: '地址长度不能超过 100 个字符', trigger: 'blur' }
  ],
  salaryMin: [
    { validator: validateSalaryMin, trigger: 'blur' }
  ],
  salaryMax: [
    { validator: validateSalaryMax, trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请填写岗位职责', trigger: 'blur' },
    { min: 10, max: 2000, message: '岗位职责长度在 10 到 2000 个字符', trigger: 'blur' }
  ],
  requirement: [
    { required: true, message: '请填写任职要求', trigger: 'blur' },
    { min: 10, max: 2000, message: '任职要求长度在 10 到 2000 个字符', trigger: 'blur' }
  ]
})

// 薪资验证函数
function validateSalaryMin(_rule: any, value: number, callback: any) {
  if (value === undefined || value === null) {
    callback(new Error('请填写最低薪资'))
    return
  }
  if (value < 0) {
    callback(new Error('薪资不能为负数'))
    return
  }
  if (value > 999) {
    callback(new Error('薪资不能超过 999K'))
    return
  }
  callback()
}

function validateSalaryMax(_rule: any, value: number, callback: any) {
  if (value === undefined || value === null) {
    callback(new Error('请填写最高薪资'))
    return
  }
  if (value < 0) {
    callback(new Error('薪资不能为负数'))
    return
  }
  if (value > 999) {
    callback(new Error('薪资不能超过 999K'))
    return
  }
  if (value < formData.salaryMin!) {
    callback(new Error('最高薪资不能低于最低薪资'))
    return
  }
  callback()
}

// 标签操作方法
const removeTag = (tag: string) => {
  const newTags = currentTags.value.filter((t: string) => t !== tag)
  formData.tags = JSON.stringify(newTags)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    const tags = [...currentTags.value, inputValue.value]
    formData.tags = JSON.stringify(tags)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 获取公司信息
const fetchCompanyInfo = async () => {
  try {
    const info = await getCompanyInfo()
    companyInfo.value = info
  } catch (error) {
    console.error('获取公司信息失败:', error)
    ElMessage.error('获取公司信息失败，请检查登录状态')
  }
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    submitting.value = true

    if (!companyInfo.value) {
      ElMessage.error('未获取到公司信息，请先完善企业信息')
      return
    }

    const requestData = {
      ...formData,
      category: categoryValue.value,
      companyId: companyInfo.value.id,
      tags: currentTags.value.length > 0 ? JSON.stringify(currentTags.value) : undefined
    }

    if (props.mode === 'add') {
      await addPosition(requestData as AddPositionRequest)
      ElMessage.success('职位发布成功')
    } else {
      await updatePosition({
        ...requestData,
        id: props.position!.id
      } as UpdatePositionRequest)
      ElMessage.success('职位更新成功')
    }

    emit('success')
  } catch (error) {
    console.error('提交失败:', error)
    if (!(error as any).response) {
      ElMessage.error('操作失败，请检查网络连接')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

// 监听props变化，初始化表单数据
watch(
  () => props.position,
  (newPosition) => {
    if (newPosition) {
      Object.assign(formData, {
        title: newPosition.title,
        category: newPosition.category,
        city: newPosition.city,
        address: newPosition.address || '',
        salaryMin: newPosition.salaryMin,
        salaryMax: newPosition.salaryMax,
        educationMin: newPosition.educationMin,
        workYearsMin: newPosition.workYearsMin,
        description: newPosition.description,
        requirement: newPosition.requirement,
        tags: newPosition.tags,
        status: newPosition.status // 编辑时保持原有状态
      })
      categoryValue.value = newPosition.category
    } else {
      // 重置表单
      Object.assign(formData, {
        title: '',
        category: '',
        city: '',
        address: '',
        salaryMin: undefined,
        salaryMax: undefined,
        educationMin: undefined,
        workYearsMin: undefined,
        description: '',
        requirement: '',
        tags: '',
        status: 0 // 创建新职位默认为关闭状态
      })
      categoryValue.value = ''
    }
  },
  { immediate: true }
)

// 初始化公司信息
onMounted(() => {
  fetchCompanyInfo()
})
</script>

<style scoped lang="scss">
.position-form {
  padding: 20px 0;
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 12px;

  .inline-form-item {
    margin-bottom: 0;
    flex: 1;
  }

  .salary-separator {
    font-size: 18px;
    font-weight: 500;
    color: #666;
  }

  .salary-unit {
    font-size: 14px;
    color: #999;
  }
}

.form-tips {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
  line-height: 1.4;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  min-height: 48px;

  &:hover {
    border-color: #c0c4cc;
  }

  .el-tag {
    margin: 0;
  }

  .tag-input {
    width: 100px;
  }

  .add-tag-btn {
    border: 1px dashed #00beaa;
    color: #00beaa;
    height: 32px;
    
    &:hover {
      background: #f5fffd;
      border-color: #00a896;
      color: #00a896;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>