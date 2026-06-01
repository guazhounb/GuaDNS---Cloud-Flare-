<template>
  <div class="setup-container">
    <div class="setup-box glass-effect">
      <div class="logo">
        <el-icon :size="60" color="#007AFF">
          <Lock />
        </el-icon>
      </div>
      <h1 class="title">欢迎使用 GuaDNS</h1>
      
      <div class="step-content">
        <p class="subtitle">设置密码</p>
        
        <el-form :model="form" ref="formRef" :rules="rules" class="form">
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              prefix-icon="Lock"
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password
              prefix-icon="Lock"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" size="large" @click="handleSubmit" :loading="loading" style="width: 100%">
              完成设置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

onMounted(async () => {
  await authStore.loadState()
  
  if (authStore.hasPassword) {
    router.push('/')
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 800))
      
      authStore.setPassword(form.password)
      ElMessage.success('设置成功！')
      
      loading.value = false
      router.push('/main/dashboard')
    }
  })
}
</script>

<style scoped>
.setup-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.setup-box {
  width: 420px;
  padding: 50px 40px;
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo {
  margin-bottom: 20px;
}

.title {
  color: white;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 30px;
}

.step-content {
  margin-top: 20px;
}

.form {
  margin-top: 30px;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

:deep(.el-input__inner) {
  color: white;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  border: none;
  font-weight: 600;
}
</style>
