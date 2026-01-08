<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import AdminHeader from '../components/AdminHeader.vue'

const { api } = useAuth()
const votes = ref([])
const searchQuery = ref('')
const isLoading = ref(true)
const error = ref(null)

const fetchVotes = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/admin/vote')
    votes.value = response.data
  } catch (err) {
    console.error('Failed to fetch votes:', err)
    error.value = 'Failed to load votes'
  } finally {
    isLoading.value = false
  }
}

// Simple computed details for display
const filteredVotes = computed(() => {
  let list = [...votes.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(vote => {
      const date = new Date(vote.createdAt).toLocaleDateString('en-GB').toLowerCase()
      const voterFirst = (vote.user?.firstName || '').toLowerCase()
      const voterLast = (vote.user?.lastName || '').toLowerCase()
      const voterEmail = (vote.user?.email || '').toLowerCase()
      const bagId = (vote.bag?._id || '').toLowerCase()
      const bagName = (vote.bag?.name || vote.bag?.flavor || '').toLowerCase()
      
      return date.includes(query) ||
             voterFirst.includes(query) ||
             voterLast.includes(query) ||
             voterEmail.includes(query) ||
             bagId.includes(query) ||
             bagName.includes(query)
    })
  }
  
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalVotes = computed(() => votes.value.length)
const uniqueVoters = computed(() => {
  const voters = new Set(votes.value.map(v => v.user?._id))
  return voters.size
})

onMounted(fetchVotes)
</script>

<template>
  <div class="page-container">
    <div class="header"><AdminHeader /></div>
    
    <div class="page-header">
      <div class="search-container glass-panel">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by voter, bag ID, or flavor..." 
          class="search-input"
        />
      </div>
      <div class="stats-group">
        <!-- Stats moved here if needed or kept below -->
      </div>
    </div>

    <main class="content">

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading votes...</p>
      </div>

      <div v-else-if="error" class="error-state glass-panel">
        {{ error }}
        <button @click="fetchVotes" class="btn-primary" style="margin-top: 1rem">Retry</button>
      </div>

      <div v-else class="table-container glass-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Voter</th>
              <th>Preview</th>
              <th>Voted For (Bag ID)</th>
              <th>Bag Flavor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vote in filteredVotes" :key="vote._id">
              <td>{{ new Date(vote.createdAt).toLocaleDateString('en-GB') }} {{ new Date(vote.createdAt).toLocaleTimeString() }}</td>
              <td>
                <div class="voter-info">
                   <span class="voter-name">{{ vote.user?.firstName }} {{ vote.user?.lastName || '' }}</span>
                   <span class="voter-email">{{ vote.user?.email || 'No Email' }}</span>
                </div>
              </td>
              <td>
                <img 
                  v-if="vote.bag?.snapshot || vote.bag?.image" 
                  :src="vote.bag.snapshot || vote.bag.image" 
                  class="vote-thumbnail" 
                  alt="Snapshot"
                />
                <div v-else class="thumbnail-placeholder" :style="{ backgroundColor: vote.bag?.color || '#333' }"></div>
              </td>
              <td class="bag-id">{{ vote.bag?._id || 'Unknown' }}</td>
              <td>{{ vote.bag?.name || vote.bag?.flavor || 'N/A' }}</td>
            </tr>
            <tr v-if="votes.length === 0">
              <td colspan="4" class="empty-state">No votes recorded yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-container {
  height: 100vh;
  width: 100%;
  padding: 2rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto minmax(0, 1fr); /* Header, Search, Content */
  gap: 1rem;
  overflow: hidden;
  justify-items: center;
  align-items: start;
}

.header {
  grid-column: 1 / -1;
  width: 100%;
}

.content {
  width: 80dvw;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 85dvw;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
}

/* Search Styles matching ModeratorView */
.search-container {
  flex: 1;
  min-width: 300px;
  padding: 0.5rem;
  margin-right: 1rem;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--lays-white);
  font-size: 1rem;
  padding: 0.5rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.4);
}

.stats-group {
  display: flex;
  gap: 1rem;
}

.stats {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
}

.stats strong {
  color: var(--lays-yellow);
}

.table-container {
  overflow-y: auto; /* Vertical scroll for table */
  overflow-x: auto; /* Horizontal scroll if table is wide */
  padding: 0;
  /* height: 100%; */
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #1a1a1a; /* Opaque background to hide scrolling content */
  position: sticky; /* Make headers stationary */
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 rgba(255,255,255,0.1); /* Optional separator */
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.voter-info {
  display: flex;
  flex-direction: column;
}

.voter-name {
  font-weight: 500;
  color: var(--text-primary);
}

.voter-email {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.vote-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.05);
}

.thumbnail-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}

.bag-id {
  font-family: monospace;
  color: var(--lays-yellow);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
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
</style>
