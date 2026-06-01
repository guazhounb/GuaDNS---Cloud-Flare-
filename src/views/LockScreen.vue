<template>
  <div class="lock-container">
    <div class="lock-box glass-effect">
      <div class="logo">
        <el-icon :size="60" color="#007AFF">
          <Lock />
        </el-icon>
      </div>
      <h1 class="title">GuaDNS</h1>
      <p class="subtitle">请输入密码解锁</p>
      
      <el-form :model="form" ref="formRef" :rules="rules" class="form" @submit.prevent="handleUnlock">
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            prefix-icon="Lock"
            @keyup.enter="handleUnlock"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="handleUnlock" :loading="loading" style="width: 100%">
            解锁
          </el-button>
        </el-form-item>
      </el-form>
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
  password: ''
})

const rules = reactive<FormRules>({
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

onMounted(async () => {
  await authStore.loadState()
  
  if (!authStore.hasPassword) {
    router.push('/setup')
  }
})

const handleUnlock = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (authStore.verifyPassword(form.password)) {
          ElMessage.success('解锁成功！')
          router.push('/main/dashboard')
        } else {
          ElMessage.error('密码错误')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.lock-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lock-box {
  width: 420px;
  padding: 60px 40px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.logo {
  margin-bottom: 20px;
}

.title {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 30px;
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
