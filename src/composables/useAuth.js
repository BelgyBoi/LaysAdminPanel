import { ref, computed } from 'vue'
import axios from 'axios'
import router from '../router'

const token = ref(localStorage.getItem('admin_token') || null)
const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

// Base API configuration
const api = axios.create({
  baseURL: 'https://laysapi-uyjc.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor to add token to requests
api.interceptors.request.use(config => {
  if (token.value) {
    config.headers.Authorization = `Bearer ${token.value}`
  }
  return config
})

// Interceptor to handle 401s
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      logout()
    }
    return Promise.reject(error)
  }
)

const logout = () => {
  token.value = null
  user.value = null
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/admin/login')
}

export function useAuth() {
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.post('/default/user/auth', {
        email,
        password
      })

      const userData = response.data.user
      const authToken = response.data.token

      if (userData.role !== 'admin') {
        throw new Error('Access denied: Admins only.')
      }

      // Update state
      token.value = authToken
      user.value = userData

      // Persist
      localStorage.setItem('admin_token', authToken)
      localStorage.setItem('admin_user', JSON.stringify(userData))

      router.push('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.response?.data?.message || err.message || 'Login failed'
    } finally {
      isLoading.value = false
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    logout,
    api // Export configured axios instance for use in other views
  }
}
