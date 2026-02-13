<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">PA</div>
        <div class="logo-text">
          <div class="logo-title">PA Toolbox</div>
          <div class="logo-subtitle">ID: CMP-1006</div>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link :to="{ name: 'home' }" class="nav-item" active-class="active">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
      </router-link>
      <router-link :to="{ name: 'sprint-activity' }" class="nav-item" active-class="active">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Sprint Activity</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-info">
          <div class="user-name">{{ authStore.user?.username }} {{ userRole }}</div>
          <div class="user-email">{{ authStore.user?.username }}@example.com</div>
        </div>
        <button @click="handleLogout" class="logout-button" title="Logout">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userInitials = computed(() => {
  const username = authStore.user?.username || ''
  return username.substring(0, 2).toUpperCase()
})

const userRole = computed(() => {
  return authStore.user?.role === 'admin' ? '+ ADMIN' : ''
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #334155;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.logo-text {
  flex: 1;
}

.logo-title {
  color: #f1f5f9;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.logo-subtitle {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.2;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #94a3b8;
  text-decoration: none;
  margin-bottom: 2px;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.1);
  color: #e2e8f0;
  border-left: 2px solid #3b82f6;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #334155;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #0f172a;
  border-radius: 8px;
  border: 1px solid #334155;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-button {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.logout-button:hover {
  color: #f1f5f9;
}

.logout-button svg {
  width: 20px;
  height: 20px;
}
</style>

