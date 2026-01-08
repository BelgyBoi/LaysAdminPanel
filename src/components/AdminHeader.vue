<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { logout, user } = useAuth()

const isActive = (path) => router.currentRoute.value.path === path
</script>

<template>
  <header class="admin-header glass-panel">
    <div class="left">
      <div class="logo-section">
        <span class="logo-text">Lay's <span class="highlight">Admin</span></span>
      </div>
      
      <nav class="nav-links">
        <RouterLink to="/admin/dashboard" class="nav-item" :class="{ active: isActive('/admin/dashboard') }">
          Dashboard
        </RouterLink>
        <RouterLink to="/admin/vote" class="nav-item" :class="{ active: isActive('/admin/vote') }">
          Votes
        </RouterLink>
      </nav>
    </div>

    <div class="user-section">
      <span class="username" v-if="user">{{ user.firstName }}</span>
      <button @click="logout" class="btn-logout">Logout</button>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  position: sticky;
  top: 1rem;
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.logo-text {
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.highlight {
  color: var(--lays-yellow);
}

.nav-links {
  display: flex;
  gap: .5rem;
}

.nav-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
}

.nav-item:hover, .nav-item.active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.username {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--lays-yellow);
}
</style>
