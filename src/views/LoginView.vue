<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const { login, isLoading, error } = useAuth()

const handleSubmit = async () => {
  if (!email.value || !password.value) return
  await login(email.value, password.value)
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card glass-panel">
      <div class="header">
        <h1>Lay's Admin</h1>
        <p>Please sign in to continue</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="admin@example.com"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2.5rem;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--lays-yellow) 0%, #FFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: white;
  font-family: inherit;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--lays-yellow);
  background: rgba(255, 255, 255, 0.1);
}

input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.w-full {
  width: 100%;
  margin-top: 0.5rem;
}

.error-message {
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
  background: rgba(231, 76, 60, 0.1);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
}
</style>
