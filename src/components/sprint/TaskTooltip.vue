<template>
  <div
    class="task-tooltip"
    :style="tooltipStyle"
  >
    <div class="tooltip-header">
      <strong>{{ task.label }}</strong>
    </div>
    <div class="tooltip-body">
      <div class="tooltip-row">
        <span class="label">Project:</span>
        <span>{{ task.project }}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">Type:</span>
        <span class="task-type-badge" :style="{ background: typeGradient }">
          {{ task.type }}
        </span>
      </div>
      <div class="tooltip-row">
        <span class="label">Total Workload:</span>
        <span>{{ task.workload }} days</span>
      </div>
      <div class="tooltip-row">
        <span class="label">Assigned to:</span>
        <span>{{ assignment.memberId }}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">Member Workload:</span>
        <span>{{ assignment.workload.toFixed(2) }} days</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTaskTypeColor, getTaskTypeGradient } from '@/utils/timeline'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  assignment: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    default: () => ({ top: 0, left: 0 })
  }
})

const typeColor = computed(() => getTaskTypeColor(props.task.type))
const typeGradient = computed(() => getTaskTypeGradient(props.task.type))

const tooltipStyle = computed(() => {
  // Position tooltip above the task block, centered
  return {
    position: 'fixed',
    top: `${props.position.top - 10}px`,
    left: `${props.position.left}px`,
    transform: 'translate(-50%, -100%)',
    marginTop: '-8px'
  }
})
</script>

<style scoped>
.task-tooltip {
  position: absolute;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  pointer-events: none;
}

.tooltip-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #334155;
}

.tooltip-header strong {
  color: #f1f5f9;
  font-size: 14px;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #e2e8f0;
}

.tooltip-row .label {
  color: #94a3b8;
  font-weight: 500;
}

.task-type-badge {
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}
</style>

