import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSprintStore = defineStore('sprint', () => {
  // Referential data (cross-sprints)
  const members = ref([])
  const projects = ref([])

  // Sprints data
  const sprints = ref([])
  const currentSprintId = ref(null)

  // Computed
  const currentSprint = computed(() => {
    return sprints.value.find(s => s.id === currentSprintId.value) || null
  })

  const currentSprintTasks = computed(() => {
    return currentSprint.value?.tasks || []
  })

  // Helper to normalize member (handle both string and object formats)
  const normalizeMember = (member) => {
    if (typeof member === 'string') {
      return { name: member, costPerDay: null }
    }
    return { name: member.name, costPerDay: member.costPerDay || null }
  }

  // Helper to get member name (handle both formats)
  const getMemberName = (member) => {
    return typeof member === 'string' ? member : member.name
  }

  // Helper to find member by name
  const findMemberByName = (name) => {
    return members.value.find(m => getMemberName(m) === name)
  }

  // Member operations
  const addMember = (name, costPerDay = null) => {
    const normalized = normalizeMember({ name, costPerDay })
    if (!findMemberByName(normalized.name)) {
      members.value.push(normalized)
    }
  }

  const removeMember = (name) => {
    const index = members.value.findIndex(m => getMemberName(m) === name)
    if (index > -1) {
      members.value.splice(index, 1)
    }
  }

  const updateMemberCost = (name, costPerDay) => {
    const member = findMemberByName(name)
    if (member) {
      const normalized = normalizeMember(member)
      normalized.costPerDay = costPerDay !== null && costPerDay !== '' ? parseFloat(costPerDay) : null
      const index = members.value.indexOf(member)
      members.value[index] = normalized
    }
  }

  // Computed: get member names array (for backward compatibility)
  const memberNames = computed(() => {
    return members.value.map(m => getMemberName(m))
  })

  // Project operations
  const addProject = (name) => {
    if (!projects.value.includes(name)) {
      projects.value.push(name)
    }
  }

  const removeProject = (name) => {
    const index = projects.value.indexOf(name)
    if (index > -1) {
      projects.value.splice(index, 1)
    }
  }

  // Sprint operations
  const createSprint = (name, duration = 10) => {
    const newSprint = {
      id: `sprint-${Date.now()}`,
      name,
      duration,
      tasks: []
    }
    sprints.value.push(newSprint)
    currentSprintId.value = newSprint.id
    return newSprint
  }

  const deleteSprint = (sprintId) => {
    const index = sprints.value.findIndex(s => s.id === sprintId)
    if (index > -1) {
      sprints.value.splice(index, 1)
      if (currentSprintId.value === sprintId) {
        currentSprintId.value = sprints.value.length > 0 ? sprints.value[0].id : null
      }
    }
  }

  const setCurrentSprint = (sprintId) => {
    if (sprints.value.find(s => s.id === sprintId)) {
      currentSprintId.value = sprintId
    }
  }

  // Task operations
  const addTask = (task) => {
    if (!currentSprint.value) return

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: task.label,
      project: task.project,
      type: task.type,
      workload: task.workload,
      assignments: task.assignments || []
    }

    // Auto-add project if new
    if (task.project && !projects.value.includes(task.project)) {
      addProject(task.project)
    }

    currentSprint.value.tasks.push(newTask)
    return newTask
  }

  const updateTask = (taskId, updates) => {
    if (!currentSprint.value) return

    const task = currentSprint.value.tasks.find(t => t.id === taskId)
    if (task) {
      Object.assign(task, updates)
      
      // Auto-add project if new
      if (updates.project && !projects.value.includes(updates.project)) {
        addProject(updates.project)
      }
    }
  }

  const deleteTask = (taskId) => {
    if (!currentSprint.value) return

    const index = currentSprint.value.tasks.findIndex(t => t.id === taskId)
    if (index > -1) {
      currentSprint.value.tasks.splice(index, 1)
    }
  }

  const reorderTask = (taskId, memberId, newOrder) => {
    if (!currentSprint.value) return

    const task = currentSprint.value.tasks.find(t => t.id === taskId)
    if (task) {
      const assignment = task.assignments.find(a => a.memberId === memberId)
      if (assignment) {
        assignment.order = newOrder
      }
    }
  }

  const reorderTasksForMember = (memberId, taskOrders) => {
    // taskOrders is an array of { taskId, order } objects
    if (!currentSprint.value) return

    taskOrders.forEach(({ taskId, order }) => {
      const task = currentSprint.value.tasks.find(t => t.id === taskId)
      if (task) {
        const assignment = task.assignments.find(a => a.memberId === memberId)
        if (assignment) {
          assignment.order = order
        }
      }
    })
  }

  // Data import/export
  const exportData = () => {
    return {
      referential: {
        members: members.value.map(m => normalizeMember(m)),
        projects: [...projects.value]
      },
      sprints: sprints.value.map(sprint => ({
        ...sprint,
        tasks: sprint.tasks.map(task => ({ ...task }))
      }))
    }
  }

  const importData = (data) => {
    if (data.referential) {
      // Handle backward compatibility: convert string members to objects
      const importedMembers = (data.referential.members || []).map(m => normalizeMember(m))
      members.value = importedMembers
      projects.value = [...(data.referential.projects || [])]
    }
    
    if (data.sprints && Array.isArray(data.sprints)) {
      sprints.value = data.sprints.map(sprint => ({
        id: sprint.id || `sprint-${Date.now()}-${Math.random()}`,
        name: sprint.name || 'Unnamed Sprint',
        duration: sprint.duration || 10,
        tasks: (sprint.tasks || []).map(task => ({
          id: task.id || `task-${Date.now()}-${Math.random()}`,
          label: task.label || '',
          project: task.project || '',
          type: task.type || 'DEV',
          workload: task.workload || 0.25,
          assignments: task.assignments || []
        }))
      }))
      
      if (sprints.value.length > 0 && !currentSprintId.value) {
        currentSprintId.value = sprints.value[0].id
      }
    }
  }

  // Initialize with default sprint if none exists
  const initialize = () => {
    if (sprints.value.length === 0) {
      createSprint('Sprint 1', 10)
    } else if (!currentSprintId.value) {
      currentSprintId.value = sprints.value[0].id
    }
  }

  return {
    // State
    members,
    projects,
    sprints,
    currentSprintId,
    // Computed
    currentSprint,
    currentSprintTasks,
    memberNames,
    // Methods
    addMember,
    removeMember,
    updateMemberCost,
    addProject,
    removeProject,
    createSprint,
    deleteSprint,
    setCurrentSprint,
    addTask,
    updateTask,
    deleteTask,
    reorderTask,
    reorderTasksForMember,
    exportData,
    importData,
    initialize,
    // Helpers
    getMemberName,
    findMemberByName
  }
})

