<template>
  <div
    :class="['task-block', { 'over-allocated': isOverAllocated, 'dragging': isDragging }]"
    :style="blockStyle"
    draggable="true"
    @click.stop="$emit('click', task)"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @mouseenter="handleMouseEnter"
    @mouseleave="showTooltip = false"
  >
    <div class="task-content">
      <div class="task-label">{{ task.label }}</div>
      <div class="task-project">{{ task.project }}</div>
      <div class="task-meta">
        <span class="task-type">{{ task.type }}</span>
        <span class="task-workload">{{ assignment.workload.toFixed(2) }}d</span>
      </div>
    </div>
    <TaskTooltip
      v-if="showTooltip"
      :task="task"
      :assignment="assignment"
      :position="tooltipPosition"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getTaskTypeColor, getTaskTypeGradient } from '@/utils/timeline'
import TaskTooltip from './TaskTooltip.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  assignment: {
    type: Object,
    required: true
  },
  startSlot: {
    type: Number,
    required: true
  },
  widthSlots: {
    type: Number,
    required: true
  },
  slotWidth: {
    type: Number,
    default: 40
  },
  isOverAllocated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'drag-start', 'drag-end'])

const showTooltip = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })
const isDragging = ref(false)

const blockStyle = computed(() => {
  const gap = 4 // Gap between tasks
  const width = props.widthSlots * props.slotWidth - gap
  const left = props.startSlot * props.slotWidth + (gap / 2)
  const color = getTaskTypeColor(props.task.type)
  const gradient = getTaskTypeGradient(props.task.type)
  
  return {
    width: `${width}px`,
    left: `${left}px`,
    background: gradient,
    borderColor: color
  }
})

const handleMouseEnter = (event) => {
  if (!isDragging.value) {
    showTooltip.value = true
    const rect = event.currentTarget.getBoundingClientRect()
    tooltipPosition.value = {
      top: rect.top + window.scrollY,
      left: rect.left + rect.width / 2
    }
  }
}

const handleDragStart = (event) => {
  isDragging.value = true
  showTooltip.value = false
  
  // Store drag data
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify({
    taskId: props.task.id,
    memberId: props.assignment.memberId,
    startSlot: props.startSlot,
    widthSlots: props.widthSlots
  }))
  
  // Visual feedback
  event.currentTarget.style.opacity = '0.5'
  
  emit('drag-start', {
    taskId: props.task.id,
    memberId: props.assignment.memberId
  })
}

const handleDragEnd = (event) => {
  isDragging.value = false
  event.currentTarget.style.opacity = '1'
  emit('drag-end')
}
</script>

<style scoped>
.task-block {
  position: absolute;
  top: 6px;
  height: calc(100% - 12px);
  background: #3b82f6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  z-index: 1;
  margin-right: 4px;
}

.task-block:hover:not(.dragging) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.task-block.dragging {
  opacity: 0.5;
  cursor: grabbing;
  z-index: 100;
}

.task-block:active {
  cursor: grabbing;
}

.task-block.over-allocated {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

.task-content {
  padding: 6px 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  font-size: 12px;
}

.task-label {
  font-weight: 500;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-project {
  font-size: 10px;
  opacity: 0.85;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  font-size: 10px;
  opacity: 0.9;
}

.task-type {
  font-weight: 600;
  text-transform: uppercase;
}

.task-workload {
  opacity: 0.8;
}
</style>

