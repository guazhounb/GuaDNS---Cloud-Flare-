<template>
  <div class="main-container">
    <div class="sidebar glass-effect">
      <div class="logo-section">
        <el-icon :size="40" color="#007AFF">
          <Platform />
        </el-icon>
        <span class="app-name">GuaDNS</span>
      </div>
      
      <div class="nav-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: $route.path.includes(item.path) }"
          @click="router.push(item.path)"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.name }}</span>
        </div>
      </div>
      
      <div class="bottom-section">
        <div class="nav-item" @click="handleLock">
          <el-icon :size="20">
            <Lock />
          </el-icon>
          <span>锁定</span>
        </div>
      </div>
    </div>
    
    <div class="content-area">
      <div class="header glass-effect">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-actions">
          <el-button circle size="default">
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  { name: '数据大屏', path: '/main/dashboard', icon: 'Odometer' },
  { name: '域名管理', path: '/main/domains', icon: 'Monitor' },
  { name: '服务接入', path: '/main/services', icon: 'Connection' }
]

const currentTitle = computed(() => {
  const item = menuItems.find(m => route.path.includes(m.path))
  return item?.name || 'GuaDNS'
})

const handleLock = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.main-container {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  gap: 20px;
}

.sidebar {
  width: 240px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 0 8px;
}

.app-name {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.3) 0%, rgba(0, 86, 204, 0.3) 100%);
  color: white;
  border: 1px solid rgba(0, 122, 255, 0.3);
}

.bottom-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.main-content {
  flex: 1;
  overflow: auto;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
