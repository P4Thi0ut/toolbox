<template>
  <div class="data-manager">
    <div class="manager-actions">
      <button @click="handleExport" class="btn-secondary">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Data
      </button>
      <label class="btn-secondary file-input-label">
        <input
          type="file"
          accept=".json"
          @change="handleImport"
          class="file-input"
        />
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import Data
      </label>
    </div>
    <div v-if="message" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSprintData } from '@/composables/useSprintData'
import { useSprintStore } from '@/stores/sprint'

const { exportToJSON, importFromJSON } = useSprintData()
const sprintStore = useSprintStore()

const message = ref(null)

const showMessage = (text, type = 'success') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = null
  }, 3000)
}

const handleExport = () => {
  try {
    exportToJSON()
    showMessage('Data exported successfully!', 'success')
  } catch (error) {
    showMessage('Failed to export data: ' + error.message, 'error')
  }
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    await importFromJSON(file)
    sprintStore.initialize()
    showMessage('Data imported successfully!', 'success')
  } catch (error) {
    showMessage('Failed to import data: ' + error.message, 'error')
  } finally {
    // Reset file input
    event.target.value = ''
  }
}
</script>

<style scoped>
.data-manager {
  margin-bottom: 24px;
}

.manager-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #334155;
  color: #e2e8f0;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-secondary .icon {
  width: 16px;
  height: 16px;
}

.file-input-label {
  cursor: pointer;
}

.file-input {
  display: none;
}

.message {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}
</style>

