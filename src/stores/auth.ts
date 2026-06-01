import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const passwordHash = ref<string | null>(null)
  const hasPassword = ref(false)

  const loadState = async () => {
    const savedHash = localStorage.getItem('guadns_password_hash')
    passwordHash.value = savedHash
    hasPassword.value = !!savedHash
    isAuthenticated.value = false
  }

  const setPassword = (password: string) => {
    const hash = btoa(password)
    passwordHash.value = hash
    localStorage.setItem('guadns_password_hash', hash)
    hasPassword.value = true
    isAuthenticated.value = true
    return true
  }

  const verifyPassword = (password: string) => {
    if (!passwordHash.value) {
      return false
    }
    const hash = btoa(password)
    const isValid = hash === passwordHash.value
    if (isValid) {
      isAuthenticated.value = true
    }
    return isValid
  }

  const logout = () => {
    isAuthenticated.value = false
  }

  const resetAll = async () => {
    localStorage.removeItem('guadns_password_hash')
    localStorage.removeItem('guadns_accounts')
    localStorage.removeItem('guadns_domain_cache')
    passwordHash.value = null
    hasPassword.value = false
    isAuthenticated.value = false
  }

  return {
    isAuthenticated,
    hasPassword,
    passwordHash,
    loadState,
    setPassword,
    verifyPassword,
    logout,
    resetAll
  }
})
