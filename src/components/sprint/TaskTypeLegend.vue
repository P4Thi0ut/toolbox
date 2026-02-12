<template>
  <div class="task-type-legend">
    <h4 class="legend-title">Task Types</h4>
    <div class="legend-items">
      <div
        v-for="taskType in taskTypes"
        :key="taskType.type"
        class="legend-item"
      >
        <div
          class="legend-color"
          :style="{ background: taskType.gradient }"
        ></div>
        <span class="legend-label">{{ taskType.type }}</span>
        <span class="legend-description">{{ taskType.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getTaskTypes, getTaskTypeGradient } from '@/utils/timeline'

const taskTypes = getTaskTypes().map(type => ({
  ...type,
  gradient: getTaskTypeGradient(type.type)
}))
</script>

<style scoped>
.task-type-legend {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
}

.legend-title {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-label {
  color: #f1f5f9;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
}

.legend-description {
  color: #94a3b8;
  font-size: 11px;
}
</style>

