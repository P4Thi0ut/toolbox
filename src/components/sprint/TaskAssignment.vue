<template>
  <div class="task-assignment">
    <div class="assignment-header">
      <h4>Assign to Team Members</h4>
      <div class="distribution-mode">
        <label class="radio-label">
          <input
            type="radio"
            :value="'equal'"
            v-model="distributionMode"
            @change="applyDistribution"
          />
          <span>Equal Distribution</span>
        </label>
        <label class="radio-label">
          <input
            type="radio"
            :value="'duplicate'"
            v-model="distributionMode"
            @change="applyDistribution"
          />
          <span>Duplicate</span>
        </label>
        <label class="radio-label">
          <input
            type="radio"
            :value="'manual'"
            v-model="distributionMode"
          />
          <span>Manual Split</span>
        </label>
      </div>
    </div>

    <div class="members-list">
      <div
        v-for="member in availableMembers"
        :key="member"
        class="member-assignment"
      >
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="isAssigned(member)"
            @change="toggleMember(member, $event.target.checked)"
          />
          <span class="member-name">{{ member }}</span>
        </label>
        <input
          v-if="isAssigned(member) && distributionMode === 'manual'"
          v-model.number="getAssignment(member).workload"
          @input="updateWorkload(member, $event.target.value)"
          type="number"
          step="0.25"
          min="0.25"
          :max="totalWorkload"
          class="workload-input"
        />
        <span v-else-if="isAssigned(member)" class="workload-display">
          {{ getAssignment(member).workload.toFixed(2) }} days
        </span>
      </div>
    </div>

    <div v-if="validationMessage" :class="['validation-message', validationMessage.type]">
      {{ validationMessage.text }}
    </div>
    <div v-else-if="distributionMode === 'duplicate' && localAssignments.length > 0" class="validation-message info">
      In duplicate mode, each member gets the full task workload. This is normal and expected.
    </div>

    <div class="assignment-summary">
      <div class="summary-item">
        <span>Task Workload:</span>
        <strong>{{ totalWorkload }} days</strong>
      </div>
      <div class="summary-item">
        <span v-if="distributionMode === 'duplicate'">Total Assigned (duplicated):</span>
        <span v-else>Total Assigned:</span>
        <strong :class="{ 'error': !isValid && distributionMode !== 'duplicate' }">{{ totalAssigned.toFixed(2) }} days</strong>
      </div>
      <div v-if="distributionMode !== 'duplicate'" class="summary-item">
        <span>Difference:</span>
        <strong :class="{ 'error': !isValid }">{{ difference.toFixed(2) }} days</strong>
      </div>
      <div v-else class="summary-item">
        <span>Members:</span>
        <strong>{{ localAssignments.length }} member(s)</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSprintData } from '@/composables/useSprintData'

const props = defineProps({
  members: {
    type: Array,
    required: true
  },
  totalWorkload: {
    type: Number,
    required: true
  },
  assignments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:assignments'])

const { validateWorkloadDistribution, distributeWorkloadEqually } = useSprintData()

const distributionMode = ref('equal')
const localAssignments = ref([...props.assignments])

const availableMembers = computed(() => props.members)

const isAssigned = (member) => {
  return localAssignments.value.some(a => a.memberId === member)
}

const getAssignment = (member) => {
  let assignment = localAssignments.value.find(a => a.memberId === member)
  if (!assignment) {
    assignment = { memberId: member, workload: 0, order: 0 }
    localAssignments.value.push(assignment)
  }
  return assignment
}

const toggleMember = (member, checked) => {
  if (checked) {
    if (!isAssigned(member)) {
      const workload = distributionMode.value === 'duplicate' 
        ? props.totalWorkload 
        : props.totalWorkload / (localAssignments.value.length + 1)
      localAssignments.value.push({
        memberId: member,
        workload: workload,
        order: localAssignments.value.length
      })
      if (distributionMode.value !== 'manual') {
        applyDistribution()
      }
    }
  } else {
    const index = localAssignments.value.findIndex(a => a.memberId === member)
    if (index > -1) {
      localAssignments.value.splice(index, 1)
      if (distributionMode.value !== 'manual') {
        applyDistribution()
      }
    }
  }
  updateAssignments()
}

const updateWorkload = (member, value) => {
  const assignment = getAssignment(member)
  assignment.workload = parseFloat(value) || 0.25
  updateAssignments()
}

const applyDistribution = () => {
  const assignedMembers = localAssignments.value.map(a => a.memberId)
  
  if (distributionMode.value === 'equal') {
    const count = assignedMembers.length
    if (count > 0) {
      const workloadPerMember = props.totalWorkload / count
      localAssignments.value.forEach((assignment, index) => {
        assignment.workload = workloadPerMember
        assignment.order = index
      })
    }
  } else if (distributionMode.value === 'duplicate') {
    localAssignments.value.forEach((assignment, index) => {
      assignment.workload = props.totalWorkload
      assignment.order = index
    })
  }
  
  updateAssignments()
}

const updateAssignments = () => {
  emit('update:assignments', localAssignments.value.filter(a => 
    availableMembers.value.includes(a.memberId)
  ))
}

const validation = computed(() => {
  return validateWorkloadDistribution(props.totalWorkload, localAssignments.value)
})

const totalAssigned = computed(() => {
  return localAssignments.value.reduce((sum, a) => sum + (a.workload || 0), 0)
})

const difference = computed(() => {
  return props.totalWorkload - totalAssigned.value
})

const isValid = computed(() => {
  // In duplicate mode, it's normal for total assigned to be greater than task workload
  if (distributionMode.value === 'duplicate') {
    return localAssignments.value.length > 0
  }
  // For equal and manual modes, validate that sum equals task workload
  return Math.abs(difference.value) < 0.01
})

const validationMessage = computed(() => {
  if (localAssignments.value.length === 0) {
    return { type: 'warning', text: 'Select at least one team member' }
  }
  // In duplicate mode, no validation error needed - it's expected behavior
  if (distributionMode.value === 'duplicate') {
    return null
  }
  // For equal and manual modes, check if workload matches
  if (!isValid.value) {
    return { 
      type: 'error', 
      text: `Workload mismatch: ${difference.value > 0 ? 'under' : 'over'}-assigned by ${Math.abs(difference.value).toFixed(2)} days` 
    }
  }
  return null
})

// Initialize with equal distribution if assignments are empty
watch(() => props.assignments, (newAssignments) => {
  if (newAssignments.length === 0 && props.members.length > 0) {
    distributionMode.value = 'equal'
  } else {
    localAssignments.value = [...newAssignments]
  }
}, { immediate: true })

// Watch for mode changes
watch(distributionMode, () => {
  if (distributionMode.value !== 'manual') {
    applyDistribution()
  }
})
</script>

<style scoped>
.task-assignment {
  margin-top: 20px;
}

.assignment-header {
  margin-bottom: 16px;
}

.assignment-header h4 {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.distribution-mode {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  cursor: pointer;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.member-assignment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.member-name {
  color: #f1f5f9;
  font-size: 14px;
}

.workload-input {
  width: 100px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 6px 8px;
  color: #f1f5f9;
  font-size: 13px;
  text-align: right;
}

.workload-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.workload-display {
  color: #94a3b8;
  font-size: 13px;
  min-width: 100px;
  text-align: right;
}

.validation-message {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
}

.validation-message.warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.validation-message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.validation-message.info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.assignment-summary {
  display: flex;
  gap: 20px;
  padding: 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 13px;
}

.summary-item {
  display: flex;
  gap: 8px;
  color: #94a3b8;
}

.summary-item strong {
  color: #f1f5f9;
  font-weight: 600;
}

.summary-item strong.error {
  color: #ef4444;
}
</style>

