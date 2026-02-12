<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Create New Sprint</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="name">Sprint Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="e.g., Sprint 1 - Jan 2025"
            class="input"
          />
        </div>

        <div class="form-group">
          <label for="duration">Duration (working days)</label>
          <input
            id="duration"
            v-model.number="form.duration"
            type="number"
            min="1"
            max="20"
            required
            class="input"
          />
          <small class="hint">Default: 10 days (2 weeks)</small>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            Create Sprint
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSprintStore } from '@/stores/sprint'

const emit = defineEmits(['close', 'created'])

const sprintStore = useSprintStore()

const form = ref({
  name: '',
  duration: 10
})

const handleSubmit = () => {
  if (form.value.name.trim()) {
    sprintStore.createSprint(form.value.name.trim(), form.value.duration)
    emit('created')
    form.value = { name: '', duration: 10 }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
}

.modal-header h3 {
  margin: 0;
  color: #f1f5f9;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f1f5f9;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 12px;
  color: #f1f5f9;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.hint {
  display: block;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}
</style>

