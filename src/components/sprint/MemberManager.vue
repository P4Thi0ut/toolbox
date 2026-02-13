<template>
  <div class="member-manager">
    <div class="manager-header">
      <h3 class="section-title">Team Members</h3>
      <button @click="showAddForm = true" class="btn-icon" title="Add member">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <input
        v-model="newMemberName"
        @keyup.enter="addMember"
        @keyup.esc="cancelAdd"
        type="text"
        placeholder="Member name"
        class="input"
        ref="nameInput"
      />
      <div class="form-actions">
        <button @click="addMember" class="btn-small btn-primary">Add</button>
        <button @click="cancelAdd" class="btn-small btn-secondary">Cancel</button>
      </div>
    </div>

    <div class="member-list">
      <div
        v-for="member in members"
        :key="getMemberName(member)"
        class="member-item"
      >
        <div class="member-info">
          <span class="member-name">{{ getMemberName(member) }}</span>
          <div class="member-cost">
            <label class="cost-label">Cost/day:</label>
            <input
              type="number"
              :value="member.costPerDay || ''"
              @input="updateCost(getMemberName(member), $event.target.value)"
              @blur="handleCostBlur(getMemberName(member), $event.target.value)"
              placeholder="Optional"
              class="cost-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <button
          @click="removeMember(getMemberName(member))"
          class="delete-btn"
          title="Remove member"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div v-if="members.length === 0" class="empty-state">
        No members yet. Add your first team member.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSprintStore } from '@/stores/sprint'

const sprintStore = useSprintStore()
const { members } = storeToRefs(sprintStore)
const { getMemberName } = sprintStore

const showAddForm = ref(false)
const newMemberName = ref('')
const nameInput = ref(null)

const addMember = () => {
  const name = newMemberName.value.trim()
  if (name) {
    sprintStore.addMember(name)
    newMemberName.value = ''
    showAddForm.value = false
  }
}

const cancelAdd = () => {
  newMemberName.value = ''
  showAddForm.value = false
}

const removeMember = (name) => {
  if (confirm(`Remove "${name}" from team members?`)) {
    sprintStore.removeMember(name)
  }
}

const updateCost = (name, value) => {
  // Allow empty input for clearing
  sprintStore.updateMemberCost(name, value === '' ? null : value)
}

const handleCostBlur = (name, value) => {
  // Validate and clean up on blur
  const numValue = value === '' ? null : parseFloat(value)
  if (numValue !== null && (isNaN(numValue) || numValue < 0)) {
    sprintStore.updateMemberCost(name, null)
  }
}

// Focus input when form shows
nextTick(() => {
  if (showAddForm.value && nameInput.value) {
    nameInput.value.focus()
  }
})
</script>

<style scoped>
.member-manager {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-icon:hover {
  color: #3b82f6;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

.add-form {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 8px 12px;
  color: #f1f5f9;
  font-size: 14px;
  margin-bottom: 8px;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-small.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-small.btn-primary:hover {
  background: #2563eb;
}

.btn-small.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-small.btn-secondary:hover {
  background: #475569;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 12px;
  gap: 12px;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.member-name {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 500;
}

.member-cost {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cost-label {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}

.cost-input {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 4px 8px;
  color: #f1f5f9;
  font-size: 12px;
  width: 100px;
}

.cost-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.cost-input::placeholder {
  color: #64748b;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: #ef4444;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

.empty-state {
  color: #64748b;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}
</style>

