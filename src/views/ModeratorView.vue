<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import AdminHeader from '../components/AdminHeader.vue'

const { api } = useAuth()
const bags = ref([])
const searchQuery = ref('')
const isLoading = ref(true)
const error = ref(null)
const deletingId = ref(null)

const fetchBags = async () => {
  isLoading.value = true
  try {
    // SWITCH: Using default endpoint to get populated user data & inspiration
    const response = await api.get('/default/bag')
    bags.value = response.data
  } catch (err) {
    console.error('Failed to fetch bags:', err)
    error.value = 'Failed to load submissions'
  } finally {
    isLoading.value = false
  }
}

// Search Logic
import { computed } from 'vue'
const filteredBags = computed(() => {
  if (!searchQuery.value) return bags.value
  
  const query = searchQuery.value.toLowerCase()
  return bags.value.filter(bag => {
    const name = (bag.name || '').toLowerCase()
    const flavor = (bag.flavor || '').toLowerCase()
    const inspo = (bag.inspiration || '').toLowerCase()
    const userFirst = (bag.user?.firstName || '').toLowerCase()
    const userLast = (bag.user?.lastName || '').toLowerCase()
    const userId = (bag.user?._id || '').toLowerCase()
    const bagId = (bag._id || '').toLowerCase()
    const date = new Date(bag.createdAt).toLocaleDateString('en-GB').toLowerCase()
    const keyFlavors = (bag.keyFlavours || []).join(' ').toLowerCase()
    
    return name.includes(query) ||
           flavor.includes(query) ||
           inspo.includes(query) ||
           userFirst.includes(query) ||
           userLast.includes(query) ||
           userId.includes(query) ||
           bagId.includes(query) ||
           date.includes(query) ||
           keyFlavors.includes(query)
  })
})

const deleteBag = async (id) => {
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


const formatUserName = (user) => {
  if (!user) return 'Anonymous'
  // Handle case where user is just an ID string
  if (typeof user === 'string') return 'User #' + user.slice(-4)
  
  // Handle object with potential names
  const first = user.firstName || ''
  const last = user.lastName || ''
  const full = `${first} ${last}`.trim()
  
  return full || 'Anonymous'
}

onMounted(fetchBags)
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
      </div>

    <main class="content">

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading submissions...</p>
      </div>

      <div v-else-if="error" class="error-state glass-panel">
        {{ error }}
        <button @click="fetchBags" class="btn-primary" style="margin-top: 1rem">Retry</button>
      </div>

      <div v-else class="grid-layout">
        <div v-for="bag in filteredBags" :key="bag._id" class="bag-card glass-panel">
          
          <!-- 1. Header: Name, User, Date -->
          <div class="card-header">
             <div class="header-top">
                <h3>{{ bag.name || bag.flavor || 'Untitled Flavor' }}</h3>
                <span class="date">{{ new Date(bag.createdAt).toLocaleDateString('en-GB') }}</span>
             </div>
             <div class="user-meta">
                <span class="author-name">{{ formatUserName(bag.user) }}</span>
                <div class="id-row" v-if="bag.user?._id">
                   <span class="id-label">ID:</span> 
                   <span class="user-id">{{ bag.user._id }}</span>
                </div>
             </div>
          </div>

          <!-- Bag Image/Preview -->
          <div class="bag-image-placeholder">
             <div class="bag-preview-container">
               <img 
                 v-if="bag.snapshot || bag.image" 
                 :src="bag.snapshot || bag.image" 
                 :alt="bag.name || bag.flavor" 
                 class="bag-image"
               />
               <div 
                 v-else 
                 class="bag-preview" 
                 :style="{ backgroundColor: bag.color || '#F2C400' }"
               >
                  <span class="preview-text">{{ bag.name || bag.flavor }}</span>
               </div>
             </div>
          </div>
          
          <div class="bag-info">
            <!-- 2. Flavors: Horizontal Scroll -->
            <div class="flavors-container">
               <strong>Key Flavours</strong>
               <div class="flavor-pills">
                 <span v-for="flavor in bag.keyFlavours" :key="flavor" class="flavor-pill">
                   {{ flavor }}
                 </span>
                 <span v-if="!bag.keyFlavours?.length" class="no-flavor">No flavours added</span>
               </div>
            </div>
            
            <!-- 3. Inspiration: Scrollable Box -->
            <div class="inspiration-box" v-if="bag.inspiration">
              <strong>Inspiration</strong>
              <div class="inspiration-content">
                <p>{{ bag.inspiration }}</p>
              </div>
            </div>

            <!-- 4. Action: Delete -->
            <button 
              @click="deleteBag(bag._id)" 
              class="btn-delete"
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
  height: 100vh; /* Strict viewport height */
  width: 100%;
  padding: 2rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto minmax(0, 1fr); /* 3 rows: Header, Search, Content */
  gap: 1rem;
  justify-items: center;
  align-items: start; /* Align to top */
}

.header {
  grid-column: 1 / -1;
  width: 100%;
}

.content {
  width: 80dvw;
  height: 100%; /* Fill the 1fr grid track */
  min-height: 0; /* Crucial for nested flex/grid scrolling */
  overflow: hidden; /* Parent doesn't scroll */
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .5rem;
  flex-wrap: wrap; /* responsive wrap */
  gap: 1rem;
}

.search-container {
  flex: 1;
  width: 85dvw;
  padding: 0.5rem;
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

.stats {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
}

.stats strong {
  color: var(--lays-yellow);
}

/* Grid Layout */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, 400px); /* Fixed 400px width */
  grid-auto-rows: max-content; /* Ensure rows fit content height */
  gap: 2rem;
  width: 100%;
  justify-content: center;
  align-content: start; /* Pack rows at the start */
  height: 100%;
  overflow-y: auto; 
  padding-bottom: 2rem;
}

.bag-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255,255,255,0.05);
}

/* Header Section */
.card-header {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.header-top h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--lays-white);
  margin: 0;
  line-height: 1.1;
  text-align: left; /* Align card title left */
}

.date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  margin-left: 1rem;
  padding-top: 0.3rem;
  opacity: 0.7;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align User info left */
  gap: 0.2rem;
}

.author-name {
  color: var(--lays-yellow);
  font-weight: 700;
  font-size: 1.1rem; /* Bigger user name */
}

.id-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem; /* Smaller ID info */
  color: var(--text-secondary); /* Better contrast handled by lighter text color on dark bg */
}

.id-label {
  opacity: 0.6;
}

.user-id {
  font-family: monospace;
  color: rgba(255, 255, 255, 0.8); /* Lighter for readability/contrast */
}

/* Image */
.bag-image-placeholder {
  height: 200px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.bag-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bag-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bag-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-text {
  color: #000;
  font-weight: 800;
  font-size: 1.2rem;
  text-transform: uppercase;
}

/* Info Body */
.bag-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Flavors */
.flavors-container strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-align: left; /* Align label left */
}

.flavor-pills {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start; /* Explicitly align left */
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--lays-yellow) transparent;
}

.flavor-pills::-webkit-scrollbar {
  height: 4px;
}

.flavor-pills::-webkit-scrollbar-thumb {
  background-color: var(--lays-yellow);
  border-radius: 2px;
}

.flavor-pill {
  flex: 0 0 auto;
  font-size: 0.8rem;
  background-color: var(--lays-yellow);
  color: #000;
  padding: 0.1rem 0.6rem;
  border-radius: 100px;
  font-weight: 600;
  white-space: nowrap;
}

.no-flavor {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Inspiration */
.inspiration-box {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.inspiration-box strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-align: left; /* Explicitly align left */
}

.inspiration-content {
  height: 150px; /* Fixed height for alignment */
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
  padding-right: 0.5rem;
  text-align: left; /* Explicitly align container content left */
}

.inspiration-content p {
  color: var(--text-primary);
  line-height: 1.5;
  font-size: 0.95rem;
  margin: 0;
  text-align: left; /* Explicitly align text left */
}

/* Action Button */
.btn-delete {
  margin-top: auto;
  width: 100%;
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: var(--danger);
  color: #fff;
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