<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ task ? 'Edit Task' : 'Create New Task' }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="label">Task Label</label>
          <input
            id="label"
            v-model="form.label"
            type="text"
            required
            placeholder="e.g., Implement feature X"
            class="input"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="project">Project</label>
            <div class="select-wrapper">
              <select
                id="project"
                v-model="form.project"
                required
                class="input"
              >
                <option value="">Select or create project</option>
                <option v-for="project in projects" :key="project" :value="project">
                  {{ project }}
                </option>
                <option v-if="isNewProject" :value="form.project">
                  {{ form.project }} (new)
                </option>
              </select>
            </div>
            <input
              v-if="showNewProjectInput"
              v-model="form.project"
              type="text"
              placeholder="New project name"
              class="input"
              style="margin-top: 8px;"
            />
            <button
              v-if="!showNewProjectInput"
              type="button"
              @click="showNewProjectInput = true"
              class="btn-link"
            >
              + Create new project
            </button>
          </div>

          <div class="form-group">
            <label for="type">Task Type</label>
            <select
              id="type"
              v-model="form.type"
              required
              class="input"
            >
              <option value="DEV">DEV</option>
              <option value="SPEC">SPEC</option>
              <option value="MEET">MEET</option>
              <option value="QA">QA</option>
              <option value="DEPLOY">DEPLOY</option>
              <option value="LEAVE">LEAVE</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="workload">Total Workload (days)</label>
          <input
            id="workload"
            v-model.number="form.workload"
            type="number"
            step="0.25"
            min="0.25"
            required
            class="input"
          />
          <small class="hint">Minimum: 0.25 days (increments of 0.25)</small>
        </div>

        <TaskAssignment
          :members="memberNames"
          :total-workload="form.workload"
          :assignments="form.assignments"
          @update:assignments="form.assignments = $event"
        />

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="!canSubmit"
          >
            {{ task ? 'Update Task' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSprintStore } from '@/stores/sprint'
import TaskAssignment from './TaskAssignment.vue'
import { useSprintData } from '@/composables/useSprintData'

const props = defineProps({
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const sprintStore = useSprintStore()
const { validateWorkloadDistribution } = useSprintData()

const { memberNames, projects } = storeToRefs(sprintStore)

const showNewProjectInput = ref(false)

// Computed to check if project exists
const isNewProject = computed(() => {
  return form.value.project && !projects.value.includes(form.value.project)
})

const form = ref({
  label: '',
  project: '',
  type: 'DEV',
  workload: 0.25,
  assignments: []
})

// Initialize form with task data if editing
if (props.task) {
  form.value = {
    label: props.task.label || '',
    project: props.task.project || '',
    type: props.task.type || 'DEV',
    workload: props.task.workload || 0.25,
    assignments: [...(props.task.assignments || [])]
  }
}

const canSubmit = computed(() => {
  if (!form.value.label || !form.value.project || form.value.assignments.length === 0) {
    return false
  }
  // For duplicate mode, we don't need to validate workload sum
  // (it's expected to be greater than task workload)
  // We only validate for equal and manual modes
  // The TaskAssignment component handles this validation
  return true
})

const handleSubmit = () => {
  if (!canSubmit.value) return

  const taskData = {
    label: form.value.label.trim(),
    project: form.value.project.trim(),
    type: form.value.type,
    workload: form.value.workload,
    assignments: form.value.assignments.map((a, index) => ({
      ...a,
      order: a.order !== undefined ? a.order : index
    }))
  }

  if (props.task) {
    sprintStore.updateTask(props.task.id, taskData)
  } else {
    sprintStore.addTask(taskData)
  }

  emit('saved')
  emit('close')
}

// Watch for project changes to hide new project input if selecting existing
watch(() => form.value.project, (newProject) => {
  if (projects.value.includes(newProject)) {
    showNewProjectInput.value = false
  }
})
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
  padding: 20px;
}

.modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
  position: sticky;
  top: 0;
  background: #1e293b;
  z-index: 10;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.input,
select.input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 12px;
  color: #f1f5f9;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input:focus,
select.input:focus {
  outline: none;
  border-color: #3b82f6;
}

select.input {
  cursor: pointer;
}

.hint {
  display: block;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
}

.btn-link {
  background: transparent;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 0;
  text-decoration: underline;
  margin-top: 4px;
}

.btn-link:hover {
  color: #2563eb;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #334155;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}
</style>

