<template>
  <div class="sprint-selector">
    <div class="selector-header">
      <h2 class="section-title">Sprints</h2>
      <button @click="showCreateForm = true" class="btn-primary">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Sprint
      </button>
    </div>

    <div class="sprint-list">
      <button
        v-for="sprint in sprints"
        :key="sprint.id"
        @click="selectSprint(sprint.id)"
        :class="['sprint-item', { active: sprint.id === currentSprintId }]"
      >
        <div class="sprint-name">{{ sprint.name }}</div>
        <div class="sprint-meta">
          <span>{{ sprint.duration }} days</span>
          <span>{{ sprint.tasks.length }} tasks</span>
        </div>
        <button
          v-if="sprints.length > 1"
          @click.stop="deleteSprintConfirm(sprint.id)"
          class="delete-btn"
          title="Delete sprint"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </button>
    </div>

    <SprintForm
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @created="handleSprintCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSprintStore } from '@/stores/sprint'
import SprintForm from './SprintForm.vue'

const sprintStore = useSprintStore()
const showCreateForm = ref(false)

// Use storeToRefs to maintain reactivity
const { sprints, currentSprintId } = storeToRefs(sprintStore)

const selectSprint = (sprintId) => {
  sprintStore.setCurrentSprint(sprintId)
}

const deleteSprintConfirm = (sprintId) => {
  if (confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) {
    sprintStore.deleteSprint(sprintId)
  }
}

const handleSprintCreated = () => {
  showCreateForm.value = false
}
</script>

<style scoped>
.sprint-selector {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary .icon {
  width: 16px;
  height: 16px;
}

.sprint-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sprint-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.sprint-item:hover {
  border-color: #475569;
  background: #1e293b;
}

.sprint-item.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.sprint-name {
  color: #f1f5f9;
  font-weight: 500;
  font-size: 14px;
}

.sprint-meta {
  display: flex;
  gap: 12px;
  color: #94a3b8;
  font-size: 12px;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  color: #ef4444;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}
</style>

