<template>
  <div class="timeline-row">
    <div class="row-member">
      <div class="member-info">
        <div class="member-name">{{ member }}</div>
        <div class="member-stats">
          <span :class="['allocation-badge', allocationClass]">
            {{ allocationPercentage.toFixed(0) }}%
          </span>
          <span class="workload-text">{{ totalWorkload.toFixed(2) }}d</span>
        </div>
      </div>
    </div>
    <div class="row-timeline" ref="timelineContainer">
      <div class="timeline-slots" :style="{ width: `${totalSlots * slotWidth}px` }">
        <div
          v-for="slotIndex in totalSlots"
          :key="slotIndex"
          class="slot"
          :style="{ width: `${slotWidth}px`, minWidth: `${slotWidth}px` }"
          :class="{
            'slot-divider': slotIndex % 4 === 1,
            'slot-weekend': isWeekendSlot(slotIndex)
          }"
        ></div>
      </div>
      <div 
        class="timeline-tasks"
        @dragover.prevent="handleDragOver"
        @drop="handleDrop"
        @dragenter.prevent
      >
        <TaskBlock
          v-for="taskData in memberTasks"
          :key="`${taskData.task.id}-${member}`"
          :task="taskData.task"
          :assignment="taskData.assignment"
          :start-slot="taskData.startSlot"
          :width-slots="taskData.widthSlots"
          :slot-width="slotWidth"
          :is-over-allocated="isOverAllocated"
          @click="$emit('task-click', taskData.task)"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
        />
        <div 
          v-if="dragOverSlot !== null" 
          class="drop-indicator"
          :style="dropIndicatorStyle"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSprintStore } from '@/stores/sprint'
import { calculateTaskPosition, checkMemberAllocation } from '@/utils/timeline'
import TaskBlock from './TaskBlock.vue'

const props = defineProps({
  member: {
    type: String,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  },
  duration: {
    type: Number,
    default: 10
  },
  slotWidth: {
    type: Number,
    default: 40
  }
})

const emit = defineEmits(['task-click'])

const sprintStore = useSprintStore()
const dragOverSlot = ref(null)
const draggedTaskId = ref(null)

const totalSlots = computed(() => props.duration * 4)

const memberTasks = computed(() => {
  return props.tasks
    .filter(task => task.assignments.some(a => a.memberId === props.member))
    .map(task => {
      const assignment = task.assignments.find(a => a.memberId === props.member)
      const position = calculateTaskPosition(task, props.member, props.tasks)
      return {
        task,
        assignment,
        startSlot: position.startSlot,
        widthSlots: position.widthSlots
      }
    })
    .filter(taskData => taskData.widthSlots > 0)
})

const allocation = computed(() => {
  return checkMemberAllocation(props.member, props.duration, props.tasks)
})

const totalWorkload = computed(() => allocation.value.totalWorkload)
const allocationPercentage = computed(() => allocation.value.percentage)
const isOverAllocated = computed(() => allocation.value.isOverAllocated)

const allocationClass = computed(() => {
  if (isOverAllocated.value) return 'over-allocated'
  if (allocation.value.isUnderAllocated) return 'under-allocated'
  return 'normal'
})

const isWeekendSlot = (slotIndex) => {
  // This is a placeholder - weekends are already excluded from working days
  return false
}

const handleDragStart = ({ taskId, memberId }) => {
  // Only handle drags for this member
  if (memberId === props.member) {
    draggedTaskId.value = taskId
  }
}

const handleDragEnd = () => {
  draggedTaskId.value = null
  dragOverSlot.value = null
}

const handleDragOver = (event) => {
  if (!draggedTaskId.value) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const slot = Math.floor(x / props.slotWidth)
  
  // Clamp to valid range
  const clampedSlot = Math.max(0, Math.min(slot, totalSlots.value - 1))
  dragOverSlot.value = clampedSlot
}

const handleDrop = (event) => {
  if (!draggedTaskId.value) return
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('text/plain'))
    
    // Only allow dropping on the same member's timeline
    if (data.memberId !== props.member) {
      dragOverSlot.value = null
      return
    }
    
    const dropSlot = dragOverSlot.value
    if (dropSlot === null) {
      dragOverSlot.value = null
      return
    }
    
    // Calculate new order based on drop position
    const newOrder = calculateNewOrder(data.taskId, dropSlot)
    
    // Update all task orders for this member
    updateTaskOrders(data.taskId, newOrder)
    
    dragOverSlot.value = null
    draggedTaskId.value = null
  } catch (error) {
    console.error('Error handling drop:', error)
    dragOverSlot.value = null
    draggedTaskId.value = null
  }
}

const calculateNewOrder = (draggedTaskId, dropSlot) => {
  // Get all tasks for this member, sorted by current order
  const sortedTasks = [...memberTasks.value].sort((a, b) => {
    const orderA = a.assignment.order !== undefined ? a.assignment.order : 999
    const orderB = b.assignment.order !== undefined ? b.assignment.order : 999
    return orderA - orderB
  })
  
  // Find where to insert based on slot position
  let newOrder = 0
  let accumulatedSlots = 0
  
  for (const taskData of sortedTasks) {
    if (taskData.task.id === draggedTaskId) {
      // Skip the dragged task itself
      continue
    }
    
    const taskEndSlot = accumulatedSlots + taskData.widthSlots
    
    if (dropSlot < taskEndSlot) {
      // Insert before this task
      newOrder = taskData.assignment.order !== undefined ? taskData.assignment.order : newOrder
      break
    }
    
    accumulatedSlots = taskEndSlot
    newOrder = (taskData.assignment.order !== undefined ? taskData.assignment.order : newOrder) + 1
  }
  
  return newOrder
}

const updateTaskOrders = (draggedTaskId, newOrder) => {
  // Get all tasks for this member
  const sortedTasks = [...memberTasks.value].sort((a, b) => {
    const orderA = a.assignment.order !== undefined ? a.assignment.order : 999
    const orderB = b.assignment.order !== undefined ? b.assignment.order : 999
    return orderA - orderB
  })
  
  // Find the dragged task
  const draggedTaskIndex = sortedTasks.findIndex(t => t.task.id === draggedTaskId)
  if (draggedTaskIndex === -1) return
  
  // Remove dragged task from list
  const draggedTask = sortedTasks.splice(draggedTaskIndex, 1)[0]
  
  // Insert at new position
  const insertIndex = sortedTasks.findIndex(t => {
    const order = t.assignment.order !== undefined ? t.assignment.order : 999
    return order >= newOrder
  })
  
  if (insertIndex === -1) {
    sortedTasks.push(draggedTask)
  } else {
    sortedTasks.splice(insertIndex, 0, draggedTask)
  }
  
  // Reassign orders sequentially
  const taskOrders = sortedTasks.map((taskData, index) => ({
    taskId: taskData.task.id,
    order: index
  }))
  
  // Update store
  sprintStore.reorderTasksForMember(props.member, taskOrders)
}

const dropIndicatorStyle = computed(() => {
  if (dragOverSlot.value === null) return {}
  
  return {
    position: 'absolute',
    left: `${dragOverSlot.value * props.slotWidth}px`,
    top: '0',
    bottom: '0',
    width: '2px',
    backgroundColor: '#3b82f6',
    zIndex: 50,
    pointerEvents: 'none'
  }
})
</script>

<style scoped>
.timeline-row {
  display: flex;
  border-bottom: 1px solid #334155;
  min-height: 60px;
  min-width: fit-content;
}

.row-member {
  width: 200px;
  min-width: 200px;
  padding: 12px 16px;
  border-right: 1px solid #334155;
  background: #1e293b;
  display: flex;
  align-items: center;
  position: sticky;
  left: 0;
  z-index: 10;
  flex-shrink: 0;
}

.member-info {
  width: 100%;
}

.member-name {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.member-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.allocation-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 11px;
}

.allocation-badge.normal {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.allocation-badge.over-allocated {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.allocation-badge.under-allocated {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.workload-text {
  color: #94a3b8;
  font-size: 11px;
}

.row-timeline {
  flex: 1;
  position: relative;
  overflow: visible;
  min-width: fit-content;
  width: 100%;
}

.timeline-slots {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  min-width: fit-content;
}

.slot {
  flex-shrink: 0;
  border-right: 1px solid #334155;
  background: #0f172a;
  height: 100%;
}

.slot-divider {
  border-right: 2px solid #475569;
}

.timeline-tasks {
  position: relative;
  height: 100%;
  z-index: 1;
  min-height: 100%;
}

.drop-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  z-index: 50;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.6);
}
</style>

