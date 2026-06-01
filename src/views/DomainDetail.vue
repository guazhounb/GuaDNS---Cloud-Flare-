<template>
  <div class="domain-detail">
    <div class="detail-header glass-effect">
      <div class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="domain-title">
        <el-icon :size="28"><Globe /></el-icon>
        <span>{{ currentDomain?.name || '加载中...' }}</span>
      </div>
      <el-button type="primary" @click="showAddDialog = true" :disabled="loading">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>

    <div class="records-section glass-effect">
      <div class="section-title">DNS 记录</div>
      
      <div v-if="loading && dnsRecords.length === 0" class="loading-state">
        <el-icon :size="40" class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <template v-else>
        <div v-if="error" class="error-state">
          <el-icon :size="40"><WarningFilled /></el-icon>
          <p>{{ error }}</p>
          <el-button @click="loadRecords">重试</el-button>
        </div>
        <div v-else-if="dnsRecords.length === 0" class="empty-state">
          <el-icon :size="64"><Document /></el-icon>
          <h2>暂无 DNS 记录</h2>
          <p>点击上方按钮添加新记录</p>
        </div>
        <div v-else class="records-table">
          <div class="table-header">
            <span>类型</span>
            <span>名称</span>
            <span>内容</span>
            <span>TTL</span>
            <span>代理状态</span>
            <span>操作</span>
          </div>
          <div v-for="record in dnsRecords" :key="record.id" class="table-row">
            <span class="record-type">{{ record.type }}</span>
            <span>{{ record.name }}</span>
            <span class="record-content">{{ record.content }}</span>
            <span>{{ record.ttl === 1 ? '自动' : record.ttl }}</span>
            <span>
              <el-tag :type="record.proxied ? 'success' : 'info'" size="small">
                {{ record.proxied ? '已代理' : 'DNS仅' }}
              </el-tag>
            </span>
            <div class="actions">
              <el-button link type="primary" size="small" @click="handleEdit(record)" :disabled="loading">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(record.id)" :disabled="loading">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <el-dialog
      v-model="showAddDialog"
      :title="editingRecord ? '编辑记录' : '添加记录'"
      width="500px"
      class="custom-dialog"
      :close-on-click-modal="!loading"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="A" value="A" />
            <el-option label="AAAA" value="AAAA" />
            <el-option label="CNAME" value="CNAME" />
            <el-option label="MX" value="MX" />
            <el-option label="TXT" value="TXT" />
            <el-option label="NS" value="NS" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="@ 或子域名" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" placeholder="IP地址或域名" />
        </el-form-item>
        <el-form-item label="TTL">
          <el-select v-model="form.ttl" style="width: 100%">
            <el-option label="自动" :value="1" />
            <el-option label="1分钟" :value="60" />
            <el-option label="5分钟" :value="300" />
            <el-option label="10分钟" :value="600" />
            <el-option label="15分钟" :value="900" />
            <el-option label="30分钟" :value="1800" />
            <el-option label="1小时" :value="3600" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理">
          <el-switch v-model="form.proxied" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCloudflareStore, type DNSRecord } from '@/stores/cloudflare'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const cloudflareStore = useCloudflareStore()
const { fetchAllDomains, fetchDNSRecords, addDNSRecord, updateDNSRecord, deleteDNSRecord } = cloudflareStore
const { currentDomain, dnsRecords, loading, error } = storeToRefs(cloudflareStore)

const showAddDialog = ref(false)
const editingRecord = ref<DNSRecord | null>(null)

const form = reactive({
  type: 'A' as string,
  name: '',
  content: '',
  ttl: 300 as number,
  proxied: true as boolean
})

const goBack = () => {
  router.push('/main/dashboard')
}

const loadRecords = async () => {
  const domainId = route.params.id as string
  try {
    await fetchAllDomains(false)
    await fetchDNSRecords(domainId)
  } catch (e: any) {
    ElMessage.error(e.message || '获取 DNS 记录失败')
  }
}

const handleEdit = (record: DNSRecord) => {
  editingRecord.value = record
  form.type = record.type
  form.name = record.name
  form.content = record.content
  form.ttl = record.ttl
  form.proxied = record.proxied
  showAddDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteDNSRecord(id)
    ElMessage.success('删除成功')
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '删除失败')
    }
  }
}

const handleSave = async () => {
  try {
    if (editingRecord.value) {
      await updateDNSRecord(editingRecord.value.id, {
        type: form.type,
        name: form.name,
        content: form.content,
        ttl: form.ttl,
        proxied: form.proxied
      })
      ElMessage.success('更新成功')
    } else {
      await addDNSRecord({
        type: form.type,
        name: form.name,
        content: form.content,
        ttl: form.ttl,
        proxied: form.proxied
      })
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

const resetForm = () => {
  editingRecord.value = null
  form.type = 'A'
  form.name = ''
  form.content = ''
  form.ttl = 300
  form.proxied = true
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.domain-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  padding: 22px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 15px;
}

.back-btn:hover {
  color: var(--text-primary);
}

.domain-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.records-section {
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

.loading-state,
.error-state,
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
.error-state p,
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

.records-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 120px 1fr 80px 100px 100px;
  gap: 12px;
  padding: 14px 18px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: 0.2px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 120px 1fr 80px 100px 100px;
  gap: 12px;
  padding: 18px;
  color: var(--text-primary);
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: center;
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

.record-type {
  font-weight: 700;
  color: #007AFF;
}

.record-content {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 8px;
}

:deep(.el-dialog) {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
}

:deep(.el-dialog__title) {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.2px;
}

:deep(.el-form-item__label) {
  color: var(--text-secondary);
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

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
}
</style>
