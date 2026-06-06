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
      
      <div v-if="loading" class="loading-state">
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
            <span v-if="showPriority">优先级</span>
            <span>TTL</span>
            <span>代理状态</span>
            <span>操作</span>
          </div>
          <div v-for="record in dnsRecords" :key="record.id" class="table-row">
            <span class="record-type" :class="'type-' + record.type.toLowerCase()">{{ record.type }}</span>
            <span class="record-name" :title="record.name">{{ record.name }}</span>
            <span class="record-content" :title="record.content">{{ record.content }}</span>
            <span v-if="showPriority">{{ record.priority ?? '-' }}</span>
            <span>{{ record.ttl === 1 ? '自动' : record.ttl }}</span>
            <span>
              <el-tooltip :content="record.proxied ? '已启用 Cloudflare 代理（橙云）：隐藏真实IP，加速流量，提供DDoS防护' : '仅DNS（灰云）：不经过Cloudflare代理，直接查询DNS记录'" placement="top">
                <el-tag 
                  :type="record.proxied ? 'success' : 'info'" 
                  size="small"
                  :class="record.proxied ? 'proxied-on' : 'proxied-off'"
                >
                  {{ record.proxied ? '已代理' : 'DNS仅' }}
                </el-tag>
              </el-tooltip>
            </span>
            <div class="actions">
              <el-tooltip content="编辑记录" placement="top">
                <el-button link type="primary" size="small" @click="handleEdit(record)" :disabled="loading">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除记录" placement="top">
                <el-button link type="danger" size="small" @click="handleDelete(record.id)" :disabled="loading">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </template>
    </div>

    <el-dialog
      v-model="showAddDialog"
      :title="editingRecord ? '编辑 DNS 记录' : '添加 DNS 记录'"
      width="560px"
      class="custom-dialog"
      :close-on-click-modal="!loading"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="记录类型">
          <el-select v-model="form.type" style="width: 100%" placeholder="选择记录类型">
            <el-option-group label="常用记录">
              <el-option label="A    → IPv4 地址" value="A" />
              <el-option label="AAAA  → IPv6 地址" value="AAAA" />
              <el-option label="CNAME → 别名指向" value="CNAME" />
              <el-option label="TXT   → 文本验证" value="TXT" />
              <el-option label="MX    → 邮件服务器" value="MX" />
              <el-option label="NS    → 权威域名服务器" value="NS" />
            </el-option-group>
            <el-option-group label="其他记录">
              <el-option label="CAA   → CA 证书授权" value="CAA" />
              <el-option label="SRV   → 服务定位" value="SRV" />
              <el-option label="PTR   → 反向指针" value="PTR" />
              <el-option label="NAPTR→ 正则定位" value="NAPTR" />
              <el-option label="LOC   → 地理位置" value="LOC" />
              <el-option label="HTTPS → HTTPS 配置" value="HTTPS" />
              <el-option label="SVCB  → 服务绑定" value="SVCB" />
              <el-option label="SMIMEA→ S/MIME 证书" value="SMIMEA" />
              <el-option label="SSHFP → SSH 指纹" value="SSHFP" />
              <el-option label="TLSA  → TLS 证书关联" value="TLSA" />
              <el-option label="URI   → Uniform Resource" value="URI" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="名称 / Host">
          <el-input v-model="form.name" :placeholder="namePlaceholder" />
          <div class="form-hint">@ 表示根域名，或填写子域名前缀</div>
        </el-form-item>
        <el-form-item label="内容 / Value">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="3"
            :placeholder="contentPlaceholder" 
          />
          <div class="form-hint">{{ contentHint }}</div>
        </el-form-item>
        <el-form-item v-if="form.type === 'MX' || form.type === 'SRV'" label="优先级">
          <el-input-number v-model="form.priority" :min="0" :max="65535" controls-position="right" style="width: 100%" />
          <div class="form-hint">{{ form.type === 'MX' ? 'MX 记录邮件服务器优先级，数值越小越优先' : 'SRV 记录优先级，数值越小越优先' }}</div>
        </el-form-item>
        <el-form-item v-if="form.type === 'SRV'" label="权重">
          <el-input-number v-model="form.weight" :min="0" :max="65535" controls-position="right" style="width: 100%" />
          <div class="form-hint">SRV 记录权重，同一优先级下按比例分配流量</div>
        </el-form-item>
        <el-form-item v-if="form.type === 'SRV'" label="端口">
          <el-input-number v-model="form.port" :min="1" :max="65535" controls-position="right" style="width: 100%" />
          <div class="form-hint">SRV 服务监听的 TCP/UDP 端口号</div>
        </el-form-item>
        <el-form-item label="TTL">
          <el-select v-model="form.ttl" style="width: 100%">
            <el-option label="自动 (Auto)" :value="1" />
            <el-option label="30秒" :value="30" />
            <el-option label="1分钟" :value="60" />
            <el-option label="5分钟" :value="300" />
            <el-option label="10分钟" :value="600" />
            <el-option label="15分钟" :value="900" />
            <el-option label="30分钟" :value="1800" />
            <el-option label="1小时" :value="3600" />
            <el-option label="2小时" :value="7200" />
            <el-option label="6小时" :value="21600" />
            <el-option label="12小时" :value="43200" />
            <el-option label="24小时" :value="86400" />
          </el-select>
          <div class="form-hint">DNS 缓存生效时间，Cloudflare 最小值为 30 秒</div>
        </el-form-item>
        <el-form-item label="代理状态">
          <el-switch 
            v-model="form.proxied" 
            :disabled="!isProxiable(form.type)"
            active-text="橙云代理" 
            inactive-text="灰云仅DNS"
          />
          <div class="form-hint">
            <template v-if="isProxiable(form.type)">
              <span :class="form.proxied ? 'text-green' : 'text-gray'">
                {{ form.proxied ? '✅ 启用代理：隐藏真实IP + 加速 + DDoS防护' : '⚪ 仅DNS：不经过Cloudflare代理' }}
              </span>
            </template>
            <template v-else>
              <span class="text-yellow">⚠️ 该记录类型不支持 Cloudflare 代理</span>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          <el-icon><Check /></el-icon>
          {{ editingRecord ? '保存修改' : '添加记录' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCloudflareStore, type DNSRecord } from '@/stores/cloudflare'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

const PROXIABLE_TYPES = ['A', 'AAAA', 'CNAME']

const isProxiable = (type: string): boolean => {
  return PROXIABLE_TYPES.includes(type)
}

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
  proxied: true as boolean,
  priority: 10 as number,
  weight: 1 as number,
  port: 80 as number
})

const namePlaceholder = computed(() => {
  switch (form.type) {
    case 'A': case 'AAAA': return '@ 或 www、mail 等子域名'
    case 'CNAME': return '@ 或子域名'
    case 'MX': return '@（通常为根域名）'
    case 'NS': return '@ 或子域名'
    case 'TXT': return '@ 或子域名'
    case 'SRV': return '_service._protocol（如 _ldap._tcp）'
    case 'CAA': return '@ 或子域名'
    default: return '输入名称'
  }
})

const contentPlaceholder = computed(() => {
  switch (form.type) {
    case 'A': return 'IPv4 地址，如 192.168.1.1'
    case 'AAAA': return 'IPv6 地址，如 2001:0db8::1'
    case 'CNAME': return '目标域名，如 example.com'
    case 'MX': return '邮件服务器域名，如 mail.example.com'
    case 'NS': return 'NS 服务器域名，如 ns1.example.com'
    case 'TXT': return '文本内容，如 v=spf1 include:_spf.example.com'
    case 'SRV': return '目标主机名'
    case 'CAA': return '授权规则，如 0 issue "digicert.com"'
    case 'HTTPS': return 'HTTPS 参数'
    case 'SVCB': return 'SVCB 参数'
    default: return '输入内容'
  }
})

const contentHint = computed(() => {
  switch (form.type) {
    case 'A': return '将域名解析到服务器 IPv4 地址'
    case 'AAAA': return '将域名解析到服务器 IPv6 地址'
    case 'CNAME': return '将域名指向另一个域名（别名）'
    case 'MX': return '指定接收邮件的服务器'
    case 'NS': return '指定权威 DNS 服务器，通常由注册商或 Cloudflare 管理'
    case 'TXT': return '存储文本信息，常用于域名验证（SPF、DKIM等）'
    case 'SRV': return '定位特定服务（如 LDAP、XMPP、Minecraft 等）'
    case 'CAA': return '限制哪些 CA 可以为该域名颁发证书'
    case 'HTTPS': return 'HTTPS 记录，用于指定 HTTPS 连接参数'
    case 'SVCB': return '服务绑定记录，用于 HTTP/3 等'
    case 'PTR': return '反向 DNS 指针记录'
    case 'NAPTR': return 'NAPTR 记录（正则重写）'
    case 'LOC': return '地理位置记录'
    case 'SMIMEA': return 'S/MIME 证书关联'
    case 'SSHFP': return 'SSH 公钥指纹'
    case 'TLSA': return 'TLS 证书关联（DANE）'
    case 'URI': return 'URI 记录'
    default: return '按记录类型填写相应内容'
  }
})

const showPriority = computed(() => {
  return dnsRecords.value.some(r => r.type === 'MX' || r.type === 'SRV')
})

watch(() => form.type, (newType) => {
  if (!isProxiable(newType)) {
    form.proxied = false
  } else if (editingRecord.value) {
    form.proxied = editingRecord.value.proxied && isProxiable(editingRecord.value.type)
  }
})

const goBack = () => {
  router.back()
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
  form.proxied = record.proxied && isProxiable(record.type)
  form.priority = record.priority ?? 10
  showAddDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
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
    const recordData: Partial<DNSRecord> = {
      type: form.type,
      name: form.name,
      content: form.content,
      ttl: form.ttl,
      proxied: isProxiable(form.type) ? form.proxied : false,
    }
    
    if (form.type === 'MX' || form.type === 'SRV') {
      recordData.priority = form.priority
    }
    if (form.type === 'SRV') {
      recordData.content = `${form.weight} ${form.port} ${form.content}`
    }

    if (editingRecord.value) {
      await updateDNSRecord(editingRecord.value.id, recordData)
      ElMessage.success('✅ 更新成功')
    } else {
      await addDNSRecord(recordData)
      ElMessage.success('✅ 添加成功')
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
  form.priority = 10
  form.weight = 1
  form.port = 80
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
  transition: all 0.3s ease;
  font-size: 15px;
  padding: 8px 14px;
  border-radius: 10px;
}

.back-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
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
  grid-template-columns: 90px 120px 1fr 80px 100px 100px;
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
  grid-template-columns: 90px 120px 1fr 80px 100px 100px;
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

.table-row:has(> span:nth-child(5)) {
  grid-template-columns: 90px 120px 1fr 100px 100px 100px;
}

.table-header:has(> span:nth-child(5)) {
  grid-template-columns: 90px 120px 1fr 100px 100px 100px;
}

.record-type {
  font-weight: 700;
  color: #007AFF;
}

.type-a { color: #34C759; }
.type-aaaa { color: #007AFF; }
.type-cname { color: #AF52DE; }
.type-mx { color: #FF9500; }
.type-txt { color: #8E8E93; }
.type-ns { color: #FF3B30; }
.type-caa { color: #FF2D55; }
.type-srv { color: #64D2FF; }

.record-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.record-content {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.proxied-on {
  background: rgba(52, 199, 89, 0.15) !important;
}

.proxied-off {
  background: rgba(142, 142, 147, 0.15) !important;
}

.actions {
  display: flex;
  gap: 8px;
}

.form-hint {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.5;
}

.text-green {
  color: #34C759;
}

.text-gray {
  color: #8E8E93;
}

.text-yellow {
  color: #FF9500;
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

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: var(--text-primary);
}

:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.el-select-dropdown),
:deep(.el-popper) {
  background: rgba(40, 40, 42, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
}

:deep(.el-option-group__label) {
  color: #007AFF !important;
  font-weight: 600 !important;
}

:deep(.el-option) {
  color: var(--text-primary) !important;
}

:deep(.el-option:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-switch.is-disabled) {
  opacity: 0.6;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
}
</style>
