<template>
  <div class="services">
    <div class="add-section glass-effect">
      <div class="section-title">添加 Cloudflare 账户</div>
      <el-form :model="adding" class="add-form" inline>
        <el-form-item>
          <el-input v-model="adding.email" placeholder="Cloudflare 邮箱" style="width: 240px" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="adding.apiKey" placeholder="Global API Key" style="width: 320px" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAddAccount" :loading="isAdding">
            <el-icon><Plus /></el-icon>
            添加账户
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="accounts-section glass-effect">
      <div class="section-title">已接入账户</div>
      <div v-if="loading && accounts.length === 0" class="loading-state">
        <el-icon :size="40" class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      <div v-else-if="accounts.length === 0" class="empty-state">
        <el-icon :size="64"><User /></el-icon>
        <p>暂无接入账户</p>
      </div>
      <div v-else class="accounts-list">
        <div v-for="ad in accountDomains" :key="ad.accountId" class="account-group">
          <div class="account-item">
            <div class="account-info">
              <div class="account-avatar">
                <el-icon :size="24"><User /></el-icon>
              </div>
              <div class="account-details">
                <div class="account-email">{{ ad.email }}</div>
                <div class="account-status">已连接 · {{ ad.domains.length }} 个域名</div>
              </div>
            </div>
            <el-button type="danger" size="small" @click="handleRemoveAccount(ad.accountId)">
              <el-icon><Delete /></el-icon>
              解绑
            </el-button>
          </div>
          <div v-if="ad.domains.length > 0" class="domain-mini-list">
            <div 
              v-for="domain in ad.domains.slice(0, 5)" 
              :key="domain.id" 
              class="domain-mini-item"
            >
              <el-icon><Globe /></el-icon>
              <span>{{ domain.name }}</span>
            </div>
            <div v-if="ad.domains.length > 5" class="domain-more">
              还有 {{ ad.domains.length - 5 }} 个域名...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section glass-effect">
      <div class="section-title">获取 Global API Key</div>
      <div class="info-content">
        <ol>
          <li>登录 <a href="https://dash.cloudflare.com" target="_blank">Cloudflare Dashboard</a></li>
          <li>点击右上角头像 → 我的个人资料 (My Profile)</li>
          <li>滚动到 "API Tokens" 部分下方的 "API Keys"</li>
          <li>在 "Global API Key" 处点击 "View"</li>
          <li>输入密码验证后即可获取</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useCloudflareStore } from '@/stores/cloudflare'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'

const cloudflareStore = useCloudflareStore()
const { accounts, loadAccounts, addAccount, removeAccount, fetchAllDomains } = cloudflareStore
const { accountDomains, loading } = storeToRefs(cloudflareStore)
const adding = reactive({
  email: '',
  apiKey: ''
})
const isAdding = ref(false)

const loadAllData = async () => {
  loadAccounts()
  if (accounts.length > 0) {
    await fetchAllDomains(false)
  }
}

onMounted(() => {
  loadAllData()
})

watch(() => accounts.length, (newLength, oldLength) => {
  if (newLength > oldLength || newLength < oldLength) {
    fetchAllDomains(true)
  }
})

const handleAddAccount = async () => {
  if (!adding.email || !adding.apiKey) {
    ElMessage.warning('请填写完整信息')
    return
  }

  isAdding.value = true
  try {
    await addAccount(adding.email, adding.apiKey)
    ElMessage.success('账户添加成功')
    adding.email = ''
    adding.apiKey = ''
    await fetchAllDomains(true)
  } catch (e: any) {
    ElMessage.error(e.message || '添加失败')
  } finally {
    isAdding.value = false
  }
}

const handleRemoveAccount = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要解绑这个账户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    removeAccount(id)
    ElMessage.success('解绑成功')
  } catch {
  }
}
</script>

<style scoped>
.services {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.add-section {
  padding: 28px;
  border-radius: 20px;
}

.section-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -0.2px;
}

.add-form {
  margin: 0;
}

.accounts-section {
  padding: 28px;
  border-radius: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-muted);
  gap: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-muted);
  gap: 16px;
}

.loading-state p {
  margin: 0;
  font-size: 15px;
}

.domain-mini-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-left: 68px;
}

.domain-mini-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.domain-mini-item .el-icon {
  color: #007AFF;
  font-size: 14px;
}

.domain-more {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.account-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.account-avatar {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.25), rgba(0, 86, 204, 0.15));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007AFF;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-email {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.account-status {
  color: #34C759;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.account-status::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #34C759;
  border-radius: 50%;
}

.info-section {
  padding: 28px;
  border-radius: 20px;
}

.info-content {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 2;
}

.info-content ol {
  margin: 0;
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 10px;
}

.info-content a {
  color: #007AFF;
  text-decoration: none;
  font-weight: 500;
}

.info-content a:hover {
  text-decoration: underline;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}
</style>
