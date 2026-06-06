import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export interface CloudflareAccount {
  id: string
  email: string
  apiKey: string
}

export interface Domain {
  id: string
  name: string
  status: string
  name_servers: string[]
  account: {
    id: string
    name: string
  }
  original_name_servers?: string[]
}

export interface DNSRecord {
  id: string
  type: string
  name: string
  content: string
  ttl: number
  proxied: boolean
  zone_id?: string
  zone_name?: string
  created_on?: string
  modified_on?: string
  proxiable?: boolean
  priority?: number
  comment?: string
  tags?: string[]
}

export interface AnalyticsData {
  timeseries: Array<{
    until: string
    since: string
    requests: {
      all: number
    }
  }>
}

class CloudflareAPI {
  private email: string
  private apiKey: string

  constructor(email: string, apiKey: string) {
    this.email = email
    this.apiKey = apiKey
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<{ result: T; success: boolean; errors: any[]; messages: any[] }> {
    try {
      const response = await invoke<string>('cloudflare_request', {
        method,
        endpoint,
        email: this.email,
        apiKey: this.apiKey,
        body: data || null
      })

      const responseData = JSON.parse(response) as { result: T; success: boolean; errors: any[]; messages: any[] }

      if (!responseData.success) {
        const errorMsg = responseData.errors?.[0]?.message || 'API Error'
        throw new Error(errorMsg)
      }

      return responseData
    } catch (error: any) {
      if (typeof error === 'string') {
        throw new Error(error)
      }
      throw error
    }
  }

  async getZones(): Promise<Domain[]> {
    const result = await this.request<Domain[]>('GET', '/zones')
    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to fetch zones')
    }
    return result.result
  }

  async getDNSRecords(zoneId: string): Promise<DNSRecord[]> {
    let allRecords: DNSRecord[] = []
    let page = 1
    const perPage = 100
    
    while (true) {
      const result = await this.request<DNSRecord[]>('GET', `/zones/${zoneId}/dns_records?per_page=${perPage}&page=${page}`)
      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || 'Failed to fetch DNS records')
      }
      
      if (result.result.length === 0) {
        break
      }
      
      allRecords = [...allRecords, ...result.result]
      
      if (result.result.length < perPage) {
        break
      }
      
      page++
    }
    
    return allRecords
  }

  async createDNSRecord(zoneId: string, record: Partial<DNSRecord>): Promise<DNSRecord> {
    const result = await this.request<DNSRecord>('POST', `/zones/${zoneId}/dns_records`, record)
    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to create DNS record')
    }
    return result.result
  }

  async updateDNSRecord(zoneId: string, recordId: string, record: Partial<DNSRecord>): Promise<DNSRecord> {
    const result = await this.request<DNSRecord>('PATCH', `/zones/${zoneId}/dns_records/${recordId}`, record)
    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to update DNS record')
    }
    return result.result
  }

  async deleteDNSRecord(zoneId: string, recordId: string): Promise<void> {
    const result = await this.request('DELETE', `/zones/${zoneId}/dns_records/${recordId}`)
    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to delete DNS record')
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const result = await this.request('GET', '/user')
      return result.success
    } catch (error: any) {
      console.error('Cloudflare API 验证失败:', error)
      return false
    }
  }

  async testConnection(): Promise<string> {
    try {
      const result = await this.request('GET', '/user')
      if (result.success) {
        return 'success'
      } else {
        return result.errors?.[0]?.message || 'Unknown error'
      }
    } catch (error: any) {
      return error.message || 'Network error'
    }
  }

  async getZoneAnalytics(zoneId: string, since: string, until: string): Promise<AnalyticsData> {
    const result = await this.request<AnalyticsData>('GET', `/zones/${zoneId}/analytics/dashboard?since=${since}&until=${until}`)
    if (!result.success) {
      throw new Error(result.errors?.[0]?.message || 'Failed to fetch analytics')
    }
    return result.result
  }
}

export interface AccountDomains {
  accountId: string
  email: string
  domains: Domain[]
  domainRecordsCount?: Record<string, number>
  domainNSRecordsCount?: Record<string, number>
  error?: string
}

interface DomainCache {
  data: AccountDomains[]
  timestamp: number
}

const CACHE_KEY = 'guadns_domain_cache'
const CACHE_DURATION = 5 * 60 * 1000

const loadCache = (): DomainCache | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error('加载缓存失败:', e)
  }
  return null
}

const saveCache = (data: AccountDomains[]) => {
  try {
    const cache: DomainCache = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.error('保存缓存失败:', e)
  }
}

const isCacheValid = (cache: DomainCache): boolean => {
  return Date.now() - cache.timestamp < CACHE_DURATION
}

export const useCloudflareStore = defineStore('cloudflare', () => {
  const accounts = ref<CloudflareAccount[]>([])
  const currentAccountId = ref<string | null>(null)
  const accountDomains = ref<AccountDomains[]>([])
  const currentDomain = ref<Domain | null>(null)
  const dnsRecords = ref<DNSRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedAccountId = ref<string | null>(null)

  const getAPI = (accountId: string): CloudflareAPI | null => {
    const account = accounts.value.find(a => a.id === accountId)
    if (!account) return null
    return new CloudflareAPI(account.email, account.apiKey)
  }

  const loadAccounts = () => {
    const saved = localStorage.getItem('guadns_accounts')
    if (saved) {
      accounts.value = JSON.parse(saved)
      if (accounts.value.length > 0) {
        currentAccountId.value = accounts.value[0].id
      }
    }
  }

  const saveAccounts = () => {
    localStorage.setItem('guadns_accounts', JSON.stringify(accounts.value))
  }

  const addAccount = async (email: string, apiKey: string) => {
    const testAPI = new CloudflareAPI(email, apiKey)
    const result = await testAPI.testConnection()
    if (result !== 'success') {
      throw new Error(`API Key 验证失败: ${result}`)
    }

    const account: CloudflareAccount = {
      id: Date.now().toString(),
      email,
      apiKey
    }
    accounts.value.push(account)
    currentAccountId.value = account.id
    saveAccounts()
    
    const previousDomains = [...accountDomains.value]
    try {
      await fetchAllDomains(true)
    } catch {
      accountDomains.value = previousDomains
      throw new Error('账户添加成功但获取域名列表失败')
    }
    return account
  }

  const removeAccount = (id: string) => {
    accounts.value = accounts.value.filter(a => a.id !== id)
    if (currentAccountId.value === id) {
      currentAccountId.value = accounts.value.length > 0 ? accounts.value[0].id : null
    }
    saveAccounts()
    
    accountDomains.value = accountDomains.value.filter(ad => ad.accountId !== id)
    fetchAllDomains(true).catch(() => {})
  }

  const setCurrentAccount = (id: string) => {
    currentAccountId.value = id
  }

  const fetchAllDomains = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh) {
      const cache = loadCache()
      if (cache && isCacheValid(cache)) {
        accountDomains.value = cache.data
        loading.value = false
        return
      }
    }

    const previousDomains = [...accountDomains.value]
    loading.value = true
    error.value = null
    try {
      const promises = accounts.value.map(async (account) => {
        const api = new CloudflareAPI(account.email, account.apiKey)
        try {
          const domainList = await api.getZones()
          
          const domainRecordsCount: Record<string, number> = {}
          const domainNSRecordsCount: Record<string, number> = {}
          
          const recordsPromises = domainList.map(async (domain) => {
            try {
              const records = await api.getDNSRecords(domain.id)
              domainRecordsCount[domain.id] = records.length
              domainNSRecordsCount[domain.id] = records.filter(r => r.type === 'NS').length
            } catch {
              domainRecordsCount[domain.id] = 0
              domainNSRecordsCount[domain.id] = 0
            }
          })
          
          await Promise.all(recordsPromises)
          
          return {
            accountId: account.id,
            email: account.email,
            domains: domainList,
            domainRecordsCount,
            domainNSRecordsCount
          }
        } catch (e) {
          return {
            accountId: account.id,
            email: account.email,
            domains: [],
            error: e instanceof Error ? e.message : '获取域名失败'
          }
        }
      })

      const accountResults = await Promise.all(promises)
      accountDomains.value = accountResults
      saveCache(accountResults)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      if (previousDomains.length > 0) {
        accountDomains.value = previousDomains
      }
    } finally {
      loading.value = false
    }
  }

  const findDomain = (zoneId: string): { domain: Domain | null, accountId: string | null } => {
    for (const ad of accountDomains.value) {
      const domain = ad.domains.find(d => d.id === zoneId)
      if (domain) {
        return { domain, accountId: ad.accountId }
      }
    }
    return { domain: null, accountId: null }
  }

  const fetchDNSRecords = async (zoneId: string): Promise<DNSRecord[]> => {
    loading.value = true
    error.value = null
    try {
      const { domain, accountId } = findDomain(zoneId)
      if (!domain || !accountId) throw new Error('未找到该域名')

      const api = getAPI(accountId)
      if (!api) throw new Error('请先添加 Cloudflare 账户')

      currentDomain.value = domain
      dnsRecords.value = await api.getDNSRecords(zoneId)
      selectedAccountId.value = accountId
      return dnsRecords.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addDNSRecord = async (record: Partial<DNSRecord>): Promise<DNSRecord> => {
    loading.value = true
    error.value = null
    try {
      if (!selectedAccountId.value) throw new Error('请先选择一个域名')
      if (!currentDomain.value) throw new Error('请先选择域名')

      const api = getAPI(selectedAccountId.value)
      if (!api) throw new Error('请先添加 Cloudflare 账户')

      const newRecord = await api.createDNSRecord(currentDomain.value.id, record)
      dnsRecords.value.push(newRecord)
      return newRecord
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDNSRecord = async (id: string, record: Partial<DNSRecord>): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (!selectedAccountId.value) throw new Error('请先选择一个域名')
      if (!currentDomain.value) throw new Error('请先选择域名')

      const api = getAPI(selectedAccountId.value)
      if (!api) throw new Error('请先添加 Cloudflare 账户')

      const updatedRecord = await api.updateDNSRecord(currentDomain.value.id, id, record)
      const index = dnsRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        dnsRecords.value[index] = updatedRecord
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDNSRecord = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      if (!selectedAccountId.value) throw new Error('请先选择一个域名')
      if (!currentDomain.value) throw new Error('请先选择域名')

      const api = getAPI(selectedAccountId.value)
      if (!api) throw new Error('请先添加 Cloudflare 账户')

      await api.deleteDNSRecord(currentDomain.value.id, id)
      dnsRecords.value = dnsRecords.value.filter(r => r.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAnalytics = async (zoneId: string) => {
    const { accountId } = findDomain(zoneId)
    if (!accountId) throw new Error('未找到该域名')

    const api = getAPI(accountId)
    if (!api) throw new Error('请先添加 Cloudflare 账户')

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    try {
      const data = await api.getZoneAnalytics(zoneId, yesterday.toISOString(), now.toISOString())
      return data
    } catch {
      return null
    }
  }

  const refreshDomains = async () => {
    await fetchAllDomains(true)
  }

  return {
    accounts,
    currentAccountId,
    accountDomains,
    currentDomain,
    dnsRecords,
    loading,
    error,
    selectedAccountId,
    loadAccounts,
    addAccount,
    removeAccount,
    setCurrentAccount,
    fetchAllDomains,
    fetchDNSRecords,
    addDNSRecord,
    updateDNSRecord,
    deleteDNSRecord,
    fetchAnalytics,
    refreshDomains
  }
})
