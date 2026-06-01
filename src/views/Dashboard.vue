<template>
  <div class="dashboard">
    <div v-if="accounts.length === 0" class="no-account glass-effect">
      <el-icon :size="64"><User /></el-icon>
      <h2>请先接入 Cloudflare 账户</h2>
      <p>前往服务接入页面添加您的账户</p>
      <el-button type="primary" @click="router.push('/main/services')">
        去添加账户
      </el-button>
    </div>
    <div v-else>
      <div class="page-header glass-effect">
        <h1>数据总览</h1>
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
          刷新数据
        </el-button>
      </div>

      <div class="stats-grid">
        <div class="stat-card glass-effect">
          <div class="stat-icon" style="background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%)">
            <el-icon :size="28"><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ allDomains.length }}</div>
            <div class="stat-label">总域名</div>
          </div>
        </div>
        <div class="stat-card glass-effect">
          <div class="stat-icon" style="background: linear-gradient(135deg, #34C759 0%, #28A745 100%)">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ estimatedRecords }}</div>
            <div class="stat-label">DNS 记录</div>
          </div>
        </div>
        <div class="stat-card glass-effect">
          <div class="stat-icon" style="background: linear-gradient(135deg, #FF9500 0%, #E07800 100%)">
            <el-icon :size="28"><Odometer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeDomains }}</div>
            <div class="stat-label">活跃域名</div>
          </div>
        </div>
        <div class="stat-card glass-effect">
          <div class="stat-icon" style="background: linear-gradient(135deg, #AF52DE 0%, #8944AB 100%)">
            <el-icon :size="28"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ accounts.length }}</div>
            <div class="stat-label">接入账户</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-card glass-effect">
          <div class="info-header">
            <h3>域名列表</h3>
          </div>
          <div v-if="loading && !hasLoadedOnce" class="loading-state">
            <el-icon :size="40" class="is-loading"><Loading /></el-icon>
            <p>加载中...</p>
          </div>
          <div v-else-if="allDomains.length === 0" class="empty-state">
            <el-icon :size="64"><Globe /></el-icon>
            <p>暂无域名</p>
          </div>
          <div v-else class="domain-list">
            <div 
              v-for="domain in allDomains" 
              :key="domain.id" 
              class="domain-item" 
              @click="navigateToDomain(domain.id)"
            >
              <div class="domain-info">
                <div class="domain-name">{{ domain.name }}</div>
                <div class="domain-status" :class="domain.status">{{ getStatusText(domain.status) }}</div>
              </div>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCloudflareStore } from '@/stores/cloudflare'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const cloudflareStore = useCloudflareStore()
const { loadAccounts, fetchAllDomains } = cloudflareStore
const { accounts, accountDomains, loading } = storeToRefs(cloudflareStore)

const hasLoadedOnce = ref(false)
let autoRefreshInterval: number | null = null

const allDomains = computed(() => {
  return accountDomains.value.flatMap(ad => ad.domains)
})

const estimatedRecords = computed(() => {
  return accountDomains.value.reduce((total, ad) => {
    const counts = ad.domainRecordsCount || {}
    return total + Object.values(counts).reduce((sum, count) => sum + count, 0)
  }, 0)
})

const activeDomains = computed(() => {
  return allDomains.value.filter(d => d.status === 'active').length
})

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    pending: '待激活',
    moved: '已转移',
    deleted: '已删除'
  }
  return statusMap[status] || status
}

const refreshData = async () => {
  try {
    await fetchAllDomains(true)
    ElMessage.success('数据已刷新')
  } catch (e: any) {
    ElMessage.error(e.message || '刷新失败')
  }
}

const navigateToDomain = (domainId: string) => {
  router.push(`/main/domain/${domainId}`)
}

const loadAllData = async () => {
  loadAccounts()
  if (accounts.value.length > 0) {
    try {
      await fetchAllDomains(false)
    } catch (e) {
      console.error('加载域名失败:', e)
    }
  }
  hasLoadedOnce.value = true
}

onMounted(() => {
  loadAllData()
  
  // 每30秒自动刷新一次域名
  autoRefreshInterval = window.setInterval(() => {
    if (accounts.value.length > 0) {
      fetchAllDomains(false)
    }
  }, 30000)
})

onUnmounted(() => {
  if (autoRefreshInterval !== null) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
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
  margin: 0;
}

.no-account p {
  color: var(--text-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  box-sizing: border-box;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  color: var(--text-primary);
  font-size: 26px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.info-card {
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-header h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.loading-state,
.empty-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  color: var(--text-secondary);
}

.domain-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.domain-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.domain-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.domain-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.domain-name {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.domain-status {
  display: inline-block;
  width: fit-content;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.domain-status.active {
  background: rgba(52, 199, 89, 0.2);
  color: #34C759;
}

.domain-status.pending {
  background: rgba(255, 149, 0, 0.2);
  color: #FF9500;
}

.domain-status.moved {
  background: rgba(175, 82, 222, 0.2);
  color: #AF52DE;
}

.arrow-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 12px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 13px;
  }

  .page-header {
    padding: 16px 20px;
  }

  .page-header h1 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
