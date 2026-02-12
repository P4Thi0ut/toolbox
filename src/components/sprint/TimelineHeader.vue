<template>
  <div class="timeline-header">
    <div class="header-member-name"></div>
      <div class="header-slots" ref="slotsContainer" :style="{ width: `${days.length * slotWidth * 4}px` }">
        <div
          v-for="(day, dayIndex) in days"
          :key="dayIndex"
          class="day-column"
          :style="{ width: `${slotWidth * 4}px`, minWidth: `${slotWidth * 4}px` }"
        >
        <div class="day-label">{{ formatDay(day) }}</div>
        <div class="day-slots">
          <div
            v-for="slotIndex in 4"
            :key="slotIndex"
            class="slot"
            :class="{ 'slot-divider': slotIndex === 1 }"
          >
            <span v-if="slotIndex === 1" class="slot-label">
              {{ getSlotTime(dayIndex, slotIndex - 1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 10
  },
  slotWidth: {
    type: Number,
    default: 40
  }
})

const days = computed(() => {
  // Generate working days (Monday to Friday)
  const daysArray = []
  const today = new Date()
  // Find next Monday
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const startDate = new Date(today)
  startDate.setDate(today.getDate() + daysUntilMonday)
  
  let currentDate = new Date(startDate)
  let workingDaysCount = 0
  
  while (workingDaysCount < props.duration) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysArray.push(new Date(currentDate))
      workingDaysCount++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return daysArray
})

const formatDay = (date) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
  const dayNum = date.getDate()
  const month = date.toLocaleString('default', { month: 'short' })
  return `${dayName} ${dayNum} ${month}`
}

const getSlotTime = (dayIndex, slotIndex) => {
  const times = ['09:00', '12:00', '15:00', '18:00']
  return times[slotIndex] || ''
}
</script>

<style scoped>
.timeline-header {
  display: flex;
  background: #1e293b;
  border-bottom: 2px solid #334155;
  position: sticky;
  top: 0;
  z-index: 20;
  min-width: fit-content;
}

.header-member-name {
  width: 200px;
  min-width: 200px;
  padding: 12px 16px;
  border-right: 1px solid #334155;
  background: #1e293b;
  position: sticky;
  left: 0;
  z-index: 21;
  flex-shrink: 0;
}

.header-slots {
  display: flex;
  flex: 1;
  min-width: fit-content;
}

.day-column {
  border-right: 1px solid #334155;
  flex-shrink: 0;
  min-width: fit-content;
}

.day-label {
  padding: 8px 12px;
  background: #0f172a;
  border-bottom: 1px solid #334155;
  color: #f1f5f9;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.day-slots {
  display: flex;
  height: 32px;
}

.slot {
  flex: 1;
  border-right: 1px solid #334155;
  position: relative;
  background: #1e293b;
}

.slot-divider {
  border-right: 2px solid #475569;
}

.slot-label {
  position: absolute;
  top: 50%;
  left: 4px;
  transform: translateY(-50%);
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}
</style>

