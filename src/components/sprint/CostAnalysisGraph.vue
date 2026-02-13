<template>
  <div class="cost-analysis-graph">
    <div class="graph-header" @click="toggleExpanded">
      <div class="header-content">
        <h3>Global Cost Analysis</h3>
        <p class="graph-subtitle">Cost per project across all sprints</p>
      </div>
      <button class="toggle-btn" :class="{ expanded: isExpanded }">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    <transition name="collapse">
      <div v-show="isExpanded" class="graph-content">
      <div class="graph-container">
        <div
          v-for="projectData in projectCostStats"
          :key="projectData.project"
          class="project-bar"
        >
          <div class="project-label">
            <span class="project-name">{{ projectData.project }}</span>
            <span class="project-total">{{ formatCurrency(projectData.totalCost) }}</span>
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
              :title="`${typeData.type}: ${formatCurrency(typeData.cost)}`"
            >
              <span v-if="typeData.percentage > 5" class="segment-label">
                {{ typeData.type }} ({{ formatCurrency(typeData.cost) }})
              </span>
            </div>
          </div>
          <div class="project-meta">
            <span class="task-count">{{ projectData.taskCount }} task(s) across {{ projectData.sprintCount }} sprint(s)</span>
            <div class="member-info">
              <span class="member-count">{{ projectData.memberCount }} member(s):</span>
              <span class="member-names">{{ projectData.memberNames.join(', ') }}</span>
            </div>
            <div class="cost-breakdown">
              <span class="cost-label">Total days: {{ projectData.totalDays.toFixed(2) }}d</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="projectCostStats.length === 0" class="empty-state">
        <p>No cost data available.</p>
        <p class="empty-hint">Add cost per day to team members and create tasks to see cost analysis.</p>
      </div>
      <div v-if="hasNoCostData && projectCostStats.length === 0" class="empty-state">
        <p>No members have cost per day configured.</p>
        <p class="empty-hint">Set cost per day for team members in the configuration panel to see cost analysis.</p>
      </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSprintStore } from '@/stores/sprint'
import { getTaskTypeGradient } from '@/utils/timeline'

const sprintStore = useSprintStore()
const { sprints, members, memberNames } = storeToRefs(sprintStore)
const { getMemberName, findMemberByName } = sprintStore

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Check if any member has cost data
const hasNoCostData = computed(() => {
  return members.value.length > 0 && 
    !members.value.some(m => {
      const normalized = typeof m === 'string' ? { name: m, costPerDay: null } : m
      return normalized.costPerDay !== null && normalized.costPerDay !== undefined
    })
})

// Get member cost per day
const getMemberCost = (memberName) => {
  const member = findMemberByName(memberName)
  return member && member.costPerDay !== null && member.costPerDay !== undefined 
    ? member.costPerDay 
    : 0
}

// Format currency (simple formatter, can be enhanced)
const formatCurrency = (amount) => {
  if (amount === 0 || isNaN(amount)) return '€0'
  return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const projectCostStats = computed(() => {
  if (!sprints.value || sprints.value.length === 0) return []

  // Group tasks by project across all sprints
  const projectMap = new Map()

  sprints.value.forEach(sprint => {
    if (!sprint.tasks || !Array.isArray(sprint.tasks)) return

    sprint.tasks.forEach(task => {
      const project = task.project || 'Unassigned'
      
      if (!projectMap.has(project)) {
        projectMap.set(project, {
          project,
          tasks: [],
          sprints: new Set(),
          totalCost: 0,
          totalDays: 0,
          byType: new Map(),
          members: new Set()
        })
      }

      const projectData = projectMap.get(project)
      projectData.tasks.push(task)
      projectData.sprints.add(sprint.id)

      // Calculate cost for this task
      let taskCost = 0
      let taskDays = 0

      task.assignments.forEach(assignment => {
        const memberCost = getMemberCost(assignment.memberId)
        const memberWorkload = assignment.workload || 0
        taskCost += memberCost * memberWorkload
        taskDays += memberWorkload
        projectData.members.add(assignment.memberId)
      })

      projectData.totalCost += taskCost
      projectData.totalDays += taskDays

      // Track by type
      if (!projectData.byType.has(task.type)) {
        projectData.byType.set(task.type, {
          type: task.type,
          cost: 0
        })
      }
      projectData.byType.get(task.type).cost += taskCost
    })
  })

  // Filter out projects with no cost data
  const projectsWithCost = Array.from(projectMap.values())
    .filter(p => p.totalCost > 0)

  if (projectsWithCost.length === 0) return []

  // Get max cost for scaling
  const maxCost = Math.max(...projectsWithCost.map(p => p.totalCost), 1)

  // Convert to array and calculate percentages and scaled width
  return projectsWithCost
    .map(projectData => {
      const totalCost = projectData.totalCost
      const byType = Array.from(projectData.byType.values())
        .map(typeData => ({
          ...typeData,
          percentage: totalCost > 0 ? (typeData.cost / totalCost) * 100 : 0
        }))
        .sort((a, b) => b.cost - a.cost)

      // Calculate scaled width (min 20%, max 100%, proportional to max cost)
      const scaleFactor = maxCost > 0 ? totalCost / maxCost : 0
      const scaledWidth = Math.max(20, Math.min(100, 20 + (scaleFactor * 80)))

      // Check if all members worked on this project
      const allMembers = memberNames.value || []
      const projectMembers = Array.from(projectData.members)
      const hasAllMembers = allMembers.length > 0 && 
        allMembers.every(member => projectMembers.includes(member)) &&
        projectMembers.length === allMembers.length

      return {
        project: projectData.project,
        totalCost,
        totalDays: projectData.totalDays,
        taskCount: projectData.tasks.length,
        sprintCount: projectData.sprints.size,
        memberCount: projectData.members.size,
        memberNames: hasAllMembers ? ['Everybody'] : projectMembers.sort(),
        byType,
        scaledWidth
      }
    })
    .sort((a, b) => b.totalCost - a.totalCost)
})
</script>

<style scoped>
.cost-analysis-graph {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 24px;
  margin-top: 24px;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  cursor: pointer;
  padding: 16px 0;
  user-select: none;
  transition: opacity 0.2s;
}

.graph-header:hover {
  opacity: 0.8;
}

.header-content {
  flex: 1;
}

.graph-header h3 {
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.graph-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: transform 0.3s ease, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  color: #f1f5f9;
}

.toggle-btn.expanded {
  transform: rotate(180deg);
}

.toggle-btn svg {
  width: 20px;
  height: 20px;
}

.graph-content {
  padding-top: 16px;
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
  color: #10b981;
  font-size: 14px;
  font-weight: 600;
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

.cost-breakdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cost-label {
  color: #94a3b8;
  font-size: 11px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
}

.empty-state p {
  margin: 8px 0;
}

.empty-hint {
  font-size: 12px;
  color: #64748b;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 2000px;
  opacity: 1;
  padding-top: 16px;
}
</style>

