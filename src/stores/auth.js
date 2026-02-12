import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => user.value !== null)

  const login = (username, password) => {
    const adminUser = import.meta.env.VITE_ADMIN_USER || ''
    const adminPass = import.meta.env.VITE_ADMIN_PASS || ''
    const regularUser = import.meta.env.VITE_REGULAR_USER || ''
    const regularPass = import.meta.env.VITE_REGULAR_PASS || ''

    if (username === adminUser && password === adminPass && adminUser && adminPass) {
      user.value = {
        username: adminUser,
        role: 'admin'
      }
      return { success: true, role: 'admin' }
    } else if (username === regularUser && password === regularPass && regularUser && regularPass) {
      user.value = {
        username: regularUser,
        role: 'regular'
      }
      return { success: true, role: 'regular' }
    } else {
      return { success: false, error: 'Invalid credentials' }
    }
  }

  const logout = () => {
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})

