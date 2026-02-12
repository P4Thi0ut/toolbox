<template>
  <div class="project-activity-graph" v-if="currentSprint">
    <div class="graph-header">
      <h3>Project Activity Overview</h3>
    </div>
    <div class="graph-content">
      <div class="graph-container">
        <div
          v-for="projectData in projectStats"
          :key="projectData.project"
          class="project-bar"
        >
          <div class="project-label">
            <span class="project-name">{{ projectData.project }}</span>
            <span class="project-total">{{ projectData.totalWorkload.toFixed(2) }}d</span>
          </div>
          <div class="bar-container" :style="{ width: `${projectData.scaledWidth}%` }">
            <div
              v-for="typeData in projectData.byType"
              :key="typeData.type"
              class="type-segment"
              :style="{
                width: `${typeData.percentage}%`,
                background: getTaskTypeGradient(typeData.type)
              }"
              :title="`${typeData.type}: ${typeData.workload.toFixed(2)}d`"
            >
              <span v-if="typeData.percentage > 5" class="segment-label">
                {{ typeData.type }} ({{ typeData.workload.toFixed(1) }}d)
              </span>
            </div>
          </div>
          <div class="project-meta">
            <span class="task-count">{{ projectData.taskCount }} task(s)</span>
            <div class="member-info">
              <span class="member-count">{{ projectData.memberCount }} member(s):</span>
              <span class="member-names">{{ projectData.memberNames.join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="projectStats.length === 0" class="empty-state">
        No project activity data available. Add tasks to see the graph.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSprintStore } from '@/stores/sprint'
import { getTaskTypeGradient } from '@/utils/timeline'

const sprintStore = useSprintStore()
const { currentSprint, currentSprintTasks, members } = storeToRefs(sprintStore)

const projectStats = computed(() => {
  if (!currentSprint.value || !currentSprintTasks.value.length) return []

  // Group tasks by project
  const projectMap = new Map()

  currentSprintTasks.value.forEach(task => {
    const project = task.project || 'Unassigned'
    
    if (!projectMap.has(project)) {
      projectMap.set(project, {
        project,
        tasks: [],
        totalWorkload: 0,
        byType: new Map(),
        members: new Set()
      })
    }

    const projectData = projectMap.get(project)
    projectData.tasks.push(task)
    projectData.totalWorkload += task.workload

    // Track by type
    if (!projectData.byType.has(task.type)) {
      projectData.byType.set(task.type, {
        type: task.type,
        workload: 0
      })
    }
    projectData.byType.get(task.type).workload += task.workload

    // Track members
    task.assignments.forEach(assignment => {
      projectData.members.add(assignment.memberId)
    })
  })

  // Get all projects and find max workload for scaling
  const allProjects = Array.from(projectMap.values())
  const maxWorkload = Math.max(...allProjects.map(p => p.totalWorkload), 1)

  // Convert to array and calculate percentages and scaled width
  return allProjects
    .map(projectData => {
      const totalWorkload = projectData.totalWorkload
      const byType = Array.from(projectData.byType.values())
        .map(typeData => ({
          ...typeData,
          percentage: totalWorkload > 0 ? (typeData.workload / totalWorkload) * 100 : 0
        }))
        .sort((a, b) => b.workload - a.workload)

      // Calculate scaled width (min 20%, max 100%, proportional to max workload)
      const scaleFactor = maxWorkload > 0 ? totalWorkload / maxWorkload : 0
      const scaledWidth = Math.max(20, Math.min(100, 20 + (scaleFactor * 80)))

      // Check if all members worked on this project
      const allMembers = members.value || []
      const projectMembers = Array.from(projectData.members)
      const hasAllMembers = allMembers.length > 0 && 
        allMembers.every(member => projectMembers.includes(member)) &&
        projectMembers.length === allMembers.length

      return {
        project: projectData.project,
        totalWorkload,
        taskCount: projectData.tasks.length,
        memberCount: projectData.members.size,
        memberNames: hasAllMembers ? ['Everybody'] : projectMembers.sort(),
        byType,
        scaledWidth
      }
    })
    .sort((a, b) => b.totalWorkload - a.totalWorkload)
})
</script>

<style scoped>
.project-activity-graph {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 24px;
  margin-top: 24px;
}

.graph-header {
  margin-bottom: 24px;
}

.graph-header h3 {
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.graph-content {
  width: 100%;
}

.graph-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
}

.project-total {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
}

.bar-container {
  display: flex;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #334155;
  transition: width 0.3s ease;
}

.type-segment {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2px;
  transition: all 0.2s;
}

.type-segment:hover {
  opacity: 0.9;
  transform: scaleY(1.05);
}

.segment-label {
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  padding: 0 4px;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.task-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.member-count {
  font-weight: 500;
}

.member-names {
  color: #cbd5e1;
  font-size: 11px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
}
</style>

