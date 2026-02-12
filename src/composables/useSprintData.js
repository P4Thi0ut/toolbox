import { useSprintStore } from '@/stores/sprint'

export function useSprintData() {
  const sprintStore = useSprintStore()

  const exportToJSON = () => {
    const data = sprintStore.exportData()
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sprint-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importFromJSON = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          // Validate data structure
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid JSON structure')
          }

          // Validate referential data
          if (data.referential) {
            if (!Array.isArray(data.referential.members) || !Array.isArray(data.referential.projects)) {
              throw new Error('Invalid referential data structure')
            }
          }

          // Validate sprints
          if (data.sprints) {
            if (!Array.isArray(data.sprints)) {
              throw new Error('Sprints must be an array')
            }
            
            for (const sprint of data.sprints) {
              if (!sprint.name || typeof sprint.duration !== 'number') {
                throw new Error('Invalid sprint structure')
              }
              if (!Array.isArray(sprint.tasks)) {
                throw new Error('Sprint tasks must be an array')
              }
            }
          }

          sprintStore.importData(data)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  const validateWorkloadDistribution = (totalWorkload, assignments) => {
    const totalAssigned = assignments.reduce((sum, a) => sum + (a.workload || 0), 0)
    return {
      isValid: Math.abs(totalAssigned - totalWorkload) < 0.01, // Allow small floating point differences
      totalAssigned,
      difference: totalWorkload - totalAssigned
    }
  }

  const distributeWorkloadEqually = (totalWorkload, memberCount) => {
    if (memberCount === 0) return []
    const workloadPerMember = totalWorkload / memberCount
    return Array(memberCount).fill(workloadPerMember)
  }

  return {
    exportToJSON,
    importFromJSON,
    validateWorkloadDistribution,
    distributeWorkloadEqually
  }
}

