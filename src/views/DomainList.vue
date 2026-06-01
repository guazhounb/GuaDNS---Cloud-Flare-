<template>
  <div class="domain-list">
    <div v-if="accounts.length === 0" class="no-account glass-effect">
      <el-icon :size="64"><User /></el-icon>
      <h2>请先接入 Cloudflare 账户</h2>
      <p>前往服务接入页面添加您的账户</p>
      <el-button type="primary" @click="router.push('/main/services')">
        去添加账户
      </el-button>
    </div>
    <div v-else class="content">
      <div class="page-header glass-effect">
        <h1>域名管理</h1>
        <el-button type="primary" :icon="Refresh" @click="refreshDomains" :loading="loading">
          刷新列表
        </el-button>
      </div>
      
      <div v-if="loading && accountDomains.length === 0" class="loading-state glass-effect">
        <el-icon :size="40" class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      
      <template v-else>
        <div v-for="ad in accountDomains" :key="ad.accountId" class="account-group">
          <div class="group-header glass-effect">
            <el-icon><User /></el-icon>
            <span class="account-email">{{ ad.email }}</span>
            <span v-if="ad.error" class="error-badge">
              <el-icon><WarningFilled /></el-icon>
              {{ ad.error }}
            </span>
            <span v-else class="count-badge">
              {{ ad.domains.length }} 个域名
            </span>
          </div>
          <div class="domain-grid">
            <div v-if="ad.domains.length === 0 && !ad.error" class="empty-group glass-effect">
              <p>暂无域名</p>
            </div>
            <div
              v-for="domain in ad.domains"
              :key="domain.id"
              class="domain-card glass-effect"
              @click="router.push(`/main/domain/${domain.id}`)"
            >
              <div class="domain-header">
                <div class="domain-icon">
                  <el-icon :size="32"><Globe /></el-icon>
                </div>
                <div class="domain-status" :class="domain.status">
                  {{ getStatusText(domain.status) }}
                </div>
              </div>
              <div class="domain-name">{{ domain.name }}</div>
              <div class="domain-info">
                <span><el-icon><Document /></el-icon> {{ getNSRecordsCount(domain.id) }} 个 NS 记录</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="accountDomains.length === 0" class="empty-state glass-effect">
          <el-icon :size="64"><Globe /></el-icon>
          <h2>暂无域名</h2>
          <p>您的 Cloudflare 账户下没有域名</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCloudflareStore } from '@/stores/cloudflare'
import { ElMessage, ElButton } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'

const router = useRouter()
const cloudflareStore = useCloudflareStore()
const { loadAccounts, fetchAllDomains } = cloudflareStore
const { accounts, accountDomains, loading } = storeToRefs(cloudflareStore)

const getNSRecordsCount = (domainId: string) => {
  for (const ad of accountDomains.value) {
    if (ad.domainNSRecordsCount && ad.domainNSRecordsCount[domainId] !== undefined) {
      return ad.domainNSRecordsCount[domainId]
    }
  }
  return 0
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    pending: '待激活',
    moved: '已转移',
    deleted: '已删除'
  }
  return statusMap[status] || status
}

const loadAllDomains = async (force = false) => {
  try {
    await fetchAllDomains(force)
  } catch (e: any) {
    ElMessage.error(e.message || '获取域名失败')
  }
}

const refreshDomains = async () => {
  await loadAllDomains(true)
  ElMessage.success('域名列表已刷新')
}

watch(() => accounts.value, (newAccounts) => {
  if (newAccounts.length > 0) {
    loadAllDomains(false)
  }
}, { immediate: true, deep: true })

onMounted(async () => {
  loadAccounts()
  await loadAllDomains(false)
})
</script>

<style scoped>
.domain-list {
  padding: 0;
}

.no-account {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: center;
}

.no-account h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.3px;
}

.no-account p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 15px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-radius: 16px;
}

.account-email {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.count-badge {
  margin-left: auto;
  padding: 6px 14px;
  background: rgba(0, 122, 255, 0.18);
  color: #007AFF;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
}

.error-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 59, 48, 0.18);
  color: #FF3B30;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
}

.domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.empty-group {
  grid-column: 1 / -1;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 15px;
}

.loading-state,
.empty-state {
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: center;
}

.loading-state p,
.empty-state p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 15px;
}

.empty-state h2 {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.3px;
}

.domain-card {
  padding: 28px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
}

.domain-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
}

.domain-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.domain-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.25), rgba(0, 86, 204, 0.15));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007AFF;
}

.domain-status {
  padding: 7px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.domain-status.active {
  background: rgba(52, 199, 89, 0.2);
  color: #34C759;
}

.domain-status.pending {
  background: rgba(255, 149, 0, 0.2);
  color: #FF9500;
}

.domain-status.moved,
.domain-status.deleted {
  background: rgba(255, 59, 48, 0.2);
  color: #FF3B30;
}

.domain-name {
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: -0.3px;
}

.domain-info {
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
