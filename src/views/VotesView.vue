<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import AdminHeader from '../components/AdminHeader.vue'

const { api } = useAuth()
const votes = ref([])
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
const sortedVotes = computed(() => {
  return [...votes.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    <AdminHeader />
    
    <main class="content">
      <div class="page-header">
        <h1>Voting Dashboard</h1>
        <div class="stats-group">
          <div class="stats glass-panel">
             <span>Total Votes: <strong>{{ totalVotes }}</strong></span>
          </div>
          <div class="stats glass-panel">
             <span>Unique Voters: <strong>{{ uniqueVoters }}</strong></span>
          </div>
        </div>
      </div>

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
              <th>Voted For (Bag ID)</th>
              <th>Bag Flavor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vote in sortedVotes" :key="vote._id">
              <td>{{ new Date(vote.createdAt).toLocaleDateString() }} {{ new Date(vote.createdAt).toLocaleTimeString() }}</td>
              <td>
                <div class="voter-info">
                   <span class="voter-name">{{ vote.user?.firstName }} {{ vote.user?.lastName }}</span>
                   <span class="voter-email">{{ vote.user?.email }}</span>
                </div>
              </td>
              <td class="bag-id">{{ vote.bag?._id || 'Unknown' }}</td>
              <td>{{ vote.bag?.flavor || 'N/A' }}</td>
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
  overflow-x: auto;
  padding: 0;
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
  background: rgba(255, 255, 255, 0.02);
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
