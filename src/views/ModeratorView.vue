<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import AdminHeader from '../components/AdminHeader.vue'

const { api } = useAuth()
const bags = ref([])
const isLoading = ref(true)
const error = ref(null)
const deletingId = ref(null)

const fetchBags = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/admin/bag')
    bags.value = response.data
  } catch (err) {
    console.error('Failed to fetch bags:', err)
    error.value = 'Failed to load submissions'
  } finally {
    isLoading.value = false
  }
}

const deleteBag = async (id) => {
  if (!confirm('Are you sure you want to delete this bag? This cannot be undone.')) return

  deletingId.value = id
  try {
    await api.delete(`/admin/bag/${id}`)
    // Remove from local list
    bags.value = bags.value.filter(bag => bag._id !== id)
  } catch (err) {
    console.error('Failed to delete bag:', err)
    alert('Failed to delete bag. Please try again.')
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchBags)
</script>

<template>
  <div class="page-container">
    <AdminHeader />
    
    <main class="content">
      <div class="page-header">
        <h1>Submission Moderator</h1>
        <div class="stats glass-panel">
          <span>Total Bags: <strong>{{ bags.length }}</strong></span>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading submissions...</p>
      </div>

      <div v-else-if="error" class="error-state glass-panel">
        {{ error }}
        <button @click="fetchBags" class="btn-primary" style="margin-top: 1rem">Retry</button>
      </div>

      <div v-else class="grid-layout">
        <div v-for="bag in bags" :key="bag._id" class="bag-card glass-panel">
          <div class="bag-image-placeholder">
             <!-- If the API returns an image URL, we'd use it here. 
                  For now using a stylized placeholder or checking user structure -->
             <div class="bag-preview" :style="{ backgroundColor: bag.color || '#F2C400' }">
                <span class="preview-text">{{ bag.flavor }}</span>
             </div>
          </div>
          
          <div class="bag-info">
            <h3>{{ bag.flavor || 'Untitled Flavor' }}</h3>
            <div class="meta">
              <span>By: {{ bag.user?.firstName || 'Anonymous' }}</span>
              <span class="date">{{ new Date(bag.createdAt).toLocaleDateString() }}</span>
            </div>
            
            <button 
              @click="deleteBag(bag._id)" 
              class="btn-danger w-full"
              :disabled="deletingId === bag._id"
            >
              {{ deletingId === bag._id ? 'Deleting...' : 'Delete Submission' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
}

.stats {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
}

.stats strong {
  color: var(--lays-yellow);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.bag-card {
  overflow: hidden;
  transition: transform 0.2s;
}

.bag-card:hover {
  transform: translateY(-4px);
}

.bag-image-placeholder {
  height: 200px;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.bag-preview {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  overflow: hidden;
}

.preview-text {
  color: #000; /* Assuming light bags */
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.bag-info {
  padding: 1.25rem;
}

.bag-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  border-top-color: var(--lays-yellow);
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.w-full {
  width: 100%;
}
</style>
