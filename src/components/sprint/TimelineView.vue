<template>
  <div class="timeline-view" v-if="currentSprint">
    <div class="timeline-controls">
      <h3 class="timeline-title">{{ currentSprint.name }}</h3>
      <div class="controls-actions">
        <button @click="exportToPNG" class="btn-secondary" :disabled="isExporting">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ isExporting ? 'Exporting...' : 'Export PNG' }}
        </button>
        <button @click="showTaskForm = true" class="btn-primary">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>
    </div>

    <div class="timeline-container" ref="timelineContainer" id="timeline-export">
      <div class="timeline-scroll-wrapper" ref="timelineScrollWrapper">
        <TimelineHeader
          :duration="currentSprint.duration"
          :slot-width="slotWidth"
        />
        <div class="timeline-body">
          <TimelineRow
            v-for="member in memberNames"
            :key="member"
            :member="member"
            :tasks="currentSprintTasks"
            :duration="currentSprint.duration"
            :slot-width="slotWidth"
            @task-click="handleTaskClick"
          />
        </div>
      </div>
    </div>

    <TaskForm
      v-if="showTaskForm"
      :task="selectedTask"
      @close="closeTaskForm"
      @saved="handleTaskSaved"
    />
  </div>
  <div v-else class="empty-state">
    <p>No sprint selected. Please create or select a sprint.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSprintStore } from '@/stores/sprint'
import html2canvas from 'html2canvas'
import TimelineHeader from './TimelineHeader.vue'
import TimelineRow from './TimelineRow.vue'
import TaskForm from './TaskForm.vue'

const sprintStore = useSprintStore()

// Use storeToRefs to maintain reactivity
const { currentSprint, currentSprintTasks, memberNames } = storeToRefs(sprintStore)

const showTaskForm = ref(false)
const selectedTask = ref(null)
const slotWidth = ref(40)
const isExporting = ref(false)
const timelineContainer = ref(null)
const timelineScrollWrapper = ref(null)

const handleTaskClick = (task) => {
  selectedTask.value = task
  showTaskForm.value = true
}

const closeTaskForm = () => {
  showTaskForm.value = false
  selectedTask.value = null
}

const handleTaskSaved = () => {
  // Task is saved, form will close automatically
}

const exportToPNG = async () => {
  if (!timelineContainer.value || !timelineScrollWrapper.value || isExporting.value) return

  isExporting.value = true

  try {
    // Store original scroll positions and styles
    const originalScrollLeft = timelineScrollWrapper.value.scrollLeft
    const originalScrollTop = timelineScrollWrapper.value.scrollTop
    const originalOverflowX = timelineScrollWrapper.value.style.overflowX
    const originalOverflowY = timelineScrollWrapper.value.style.overflowY
    const originalContainerOverflow = timelineContainer.value.style.overflow

    // Wait a bit to ensure UI is fully rendered
    await new Promise(resolve => setTimeout(resolve, 200))

    // Get the full dimensions of the scrollable content
    const fullWidth = Math.max(timelineScrollWrapper.value.scrollWidth, timelineScrollWrapper.value.offsetWidth)
    const fullHeight = Math.max(timelineScrollWrapper.value.scrollHeight, timelineScrollWrapper.value.offsetHeight)

    // Temporarily modify styles to show full content
    timelineContainer.value.style.overflow = 'visible'
    timelineScrollWrapper.value.style.overflowX = 'visible'
    timelineScrollWrapper.value.style.overflowY = 'visible'
    timelineScrollWrapper.value.style.width = `${fullWidth}px`
    timelineScrollWrapper.value.style.height = `${fullHeight}px`
    
    // Reset scroll to capture from the beginning
    timelineScrollWrapper.value.scrollLeft = 0
    timelineScrollWrapper.value.scrollTop = 0

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 200))

    // Capture the entire timeline container
    const canvas = await html2canvas(timelineContainer.value, {
      backgroundColor: '#1e293b',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: false,
      width: fullWidth,
      height: fullHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    })

    // Restore original styles and scroll positions
    timelineContainer.value.style.overflow = originalContainerOverflow
    timelineScrollWrapper.value.style.overflowX = originalOverflowX
    timelineScrollWrapper.value.style.overflowY = originalOverflowY
    timelineScrollWrapper.value.style.width = ''
    timelineScrollWrapper.value.style.height = ''
    timelineScrollWrapper.value.scrollLeft = originalScrollLeft
    timelineScrollWrapper.value.scrollTop = originalScrollTop

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const sprintName = currentSprint.value?.name || 'export'
        const sanitizedName = sprintName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
        link.download = `sprint-timeline-${sanitizedName}-${new Date().toISOString().split('T')[0]}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }, 'image/png')

  } catch (error) {
    console.error('Error exporting to PNG:', error)
    alert('Failed to export timeline. Please try again.')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.timeline-view {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.timeline-title {
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 600;
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
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary .icon,
.btn-secondary .icon {
  width: 16px;
  height: 16px;
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

.btn-secondary:hover:not(:disabled) {
  background: #475569;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.timeline-container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.timeline-scroll-wrapper {
  overflow-x: auto;
  overflow-y: visible;
}

.timeline-body {
  min-width: fit-content;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state p {
  font-size: 16px;
}
</style>

