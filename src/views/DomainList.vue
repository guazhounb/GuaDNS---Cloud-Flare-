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
        <div class="page-header-right">
          <span class="total-stats">共 {{ totalDomains }} 个域名 · {{ totalRecords }} 条记录</span>
          <el-button type="primary" :icon="Refresh" @click="refreshDomains" :loading="loading">
            刷新列表
          </el-button>
        </div>
      </div>
      
      <div v-if="accountDomains.length === 0" class="loading-state glass-effect">
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
              {{ ad.domains.length }} 个域名 · {{ getAccountRecordCount(ad) }} 条记录
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
              <div class="domain-main">
                <div class="domain-status-dot" :class="domain.status" />
                <span class="domain-name">{{ domain.name }}</span>
                <el-icon class="domain-arrow"><ArrowRight /></el-icon>
              </div>
              <div class="domain-sub">
                {{ getDomainRecordCount(ad, domain.id) }} 条记录
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
import { onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCloudflareStore } from '@/stores/cloudflare'
import { ElMessage, ElButton } from 'element-plus'
import { Refresh, ArrowRight } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'

const router = useRouter()
const cloudflareStore = useCloudflareStore()
const { loadAccounts, fetchAllDomains } = cloudflareStore
const { accounts, accountDomains, loading } = storeToRefs(cloudflareStore)

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

const getAccountRecordCount = (ad: { domainRecordsCount?: Record<string, number> }) => {
  if (!ad.domainRecordsCount) return 0
  return Object.values(ad.domainRecordsCount).reduce((sum, count) => sum + count, 0)
}

const getDomainRecordCount = (ad: { domainRecordsCount?: Record<string, number> }, domainId: string) => {
  if (!ad.domainRecordsCount) return 0
  return ad.domainRecordsCount[domainId] ?? 0
}

const totalDomains = computed(() => {
  return accountDomains.value.reduce((sum, ad) => sum + ad.domains.length, 0)
})

const totalRecords = computed(() => {
  return accountDomains.value.reduce((sum, ad) => sum + getAccountRecordCount(ad), 0)
})

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

.page-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-stats {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
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
  padding: 22px 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
}

.domain-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  background: rgba(255, 255, 255, 0.08);
}

.domain-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.domain-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.domain-status-dot.active {
  background: #34C759;
  box-shadow: 0 0 8px #34C759;
  animation: blink 1.2s ease-in-out infinite;
}

.domain-status-dot.pending {
  background: #FF9500;
  box-shadow: 0 0 6px #FF9500;
  animation: blink 1.5s ease-in-out infinite;
}

.domain-status-dot.moved,
.domain-status-dot.deleted {
  background: #FF3B30;
  box-shadow: 0 0 6px #FF3B30;
}

@keyframes blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.domain-name {
  flex: 1;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.domain-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.domain-card:hover .domain-arrow {
  color: var(--text-primary);
  opacity: 1;
  transform: translateX(3px);
}

.domain-sub {
  margin-top: 10px;
  padding-left: 22px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
}
</style>
