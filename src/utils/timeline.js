/**
 * Calculate working days (excluding weekends) for a given duration
 */
export function getWorkingDays(startDate, duration) {
  const days = []
  const current = new Date(startDate)
  let workingDaysCount = 0

  while (workingDaysCount < duration) {
    const dayOfWeek = current.getDay()
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(new Date(current))
      workingDaysCount++
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}

/**
 * Get slots for a sprint (4 slots per day)
 */
export function getSprintSlots(duration) {
  return duration * 4 // 4 slots per day (0.25 day increments)
}

/**
 * Calculate task position and width in slots
 */
export function calculateTaskPosition(task, memberId, allTasks) {
  // Get all tasks for this member, sorted by order
  const memberTasks = allTasks
    .filter(t => t.assignments.some(a => a.memberId === memberId))
    .map(t => ({
      task: t,
      assignment: t.assignments.find(a => a.memberId === memberId)
    }))
    .filter(t => t.assignment && t.assignment.workload > 0)
    .sort((a, b) => {
      const orderA = a.assignment.order !== undefined ? a.assignment.order : 999
      const orderB = b.assignment.order !== undefined ? b.assignment.order : 999
      if (orderA !== orderB) return orderA - orderB
      // If same order, sort by task id for consistency
      return a.task.id.localeCompare(b.task.id)
    })

  // Find current task position
  const currentTaskIndex = memberTasks.findIndex(t => t.task.id === task.id)
  
  if (currentTaskIndex === -1) {
    const currentAssignment = task.assignments.find(a => a.memberId === memberId)
    if (!currentAssignment || currentAssignment.workload <= 0) {
      return { startSlot: 0, widthSlots: 0 }
    }
    // Task not in sorted list, add at the end
    const totalSlots = memberTasks.reduce((sum, t) => {
      return sum + (t.assignment.workload / 0.25)
    }, 0)
    return {
      startSlot: Math.round(totalSlots),
      widthSlots: Math.round(currentAssignment.workload / 0.25)
    }
  }

  // Calculate start position (sum of previous tasks)
  let startSlot = 0
  for (let i = 0; i < currentTaskIndex; i++) {
    const workload = memberTasks[i].assignment.workload || 0
    startSlot += workload / 0.25 // Convert days to slots
  }

  // Calculate width
  const currentAssignment = task.assignments.find(a => a.memberId === memberId)
  const widthSlots = (currentAssignment?.workload || 0) / 0.25

  return {
    startSlot: Math.round(startSlot),
    widthSlots: Math.max(1, Math.round(widthSlots)) // Minimum 1 slot
  }
}

/**
 * Check if member is over-allocated
 */
export function checkMemberAllocation(memberId, sprintDuration, allTasks) {
  const memberTasks = allTasks.filter(t => 
    t.assignments.some(a => a.memberId === memberId)
  )

  const totalWorkload = memberTasks.reduce((sum, task) => {
    const assignment = task.assignments.find(a => a.memberId === memberId)
    return sum + (assignment?.workload || 0)
  }, 0)

  const maxWorkload = sprintDuration // 100% = 1 day per working day
  const percentage = (totalWorkload / maxWorkload) * 100

  return {
    totalWorkload,
    maxWorkload,
    percentage,
    isOverAllocated: totalWorkload > maxWorkload,
    isUnderAllocated: totalWorkload < maxWorkload * 0.8 // Less than 80% is under-allocated
  }
}

/**
 * Get task type color (for single color use)
 */
export function getTaskTypeColor(type) {
  const colors = {
    DEV: '#60a5fa',      // Pastel Blue
    SPEC: '#c084fc',     // Pastel Purple
    MEET: '#fb923c',     // Pastel Orange
    QA: '#4ade80',       // Pastel Green
    DEPLOY: '#f87171',   // Pastel Red
    LEAVE: '#94a3b8'     // Pastel Gray
  }
  return colors[type] || '#64748b'
}

/**
 * Get task type gradient
 */
export function getTaskTypeGradient(type) {
  const gradients = {
    DEV: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',      // Blue gradient
    SPEC: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',      // Purple gradient
    MEET: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',     // Orange gradient
    QA: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',       // Green gradient
    DEPLOY: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',    // Red gradient
    LEAVE: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'     // Gray gradient
  }
  return gradients[type] || 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
}

/**
 * Get all task types with their colors
 */
export function getTaskTypes() {
  return [
    { type: 'DEV', color: '#60a5fa', label: 'Development' },
    { type: 'SPEC', color: '#c084fc', label: 'Specification' },
    { type: 'MEET', color: '#fb923c', label: 'Meeting' },
    { type: 'QA', color: '#4ade80', label: 'Quality Assurance' },
    { type: 'DEPLOY', color: '#f87171', label: 'Deployment' },
    { type: 'LEAVE', color: '#94a3b8', label: 'Leave' }
  ]
}

