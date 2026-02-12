<template>
  <div class="sprint-activity-view">
    <div class="view-header">
      <h1>Sprint Activity Preview</h1>
      <DataManager />
    </div>

    <div class="view-content">
      <ConfigDrawer>
        <SprintSelector />
        <TaskTypeLegend />
        <MemberManager />
        <ProjectManager />
      </ConfigDrawer>

      <div class="main-section">
        <TimelineView />
        <ProjectActivityGraph />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSprintStore } from '@/stores/sprint'
import ConfigDrawer from '@/components/sprint/ConfigDrawer.vue'
import SprintSelector from '@/components/sprint/SprintSelector.vue'
import TaskTypeLegend from '@/components/sprint/TaskTypeLegend.vue'
import MemberManager from '@/components/sprint/MemberManager.vue'
import ProjectManager from '@/components/sprint/ProjectManager.vue'
import TimelineView from '@/components/sprint/TimelineView.vue'
import ProjectActivityGraph from '@/components/sprint/ProjectActivityGraph.vue'
import DataManager from '@/components/sprint/DataManager.vue'

const sprintStore = useSprintStore()

onMounted(() => {
  sprintStore.initialize()
})
</script>

<style scoped>
.sprint-activity-view {
  width: 100%;
  max-width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.view-header h1 {
  color: #f1f5f9;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.view-content {
  position: relative;
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.main-section {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

.main-section.with-drawer {
  margin-left: 320px;
}

@media (max-width: 1200px) {
  .main-section.with-drawer {
    margin-left: 0;
  }
}
</style>

