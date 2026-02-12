<template>
  <div>
    <button @click="toggleDrawer" class="drawer-toggle" :title="isOpen ? 'Close configuration' : 'Open configuration'">
      <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <div class="config-drawer" :class="{ 'drawer-open': isOpen }">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>Configuration</h3>
        </div>
        <div class="drawer-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  defaultOpen: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(props.defaultOpen)

const toggleDrawer = () => {
  isOpen.value = !isOpen.value
  nextTick(() => {
    updateMainSectionMargin()
  })
}

const updateMainSectionMargin = () => {
  const mainSection = document.querySelector('.main-section')
  if (mainSection) {
    if (isOpen.value) {
      mainSection.classList.add('with-drawer')
    } else {
      mainSection.classList.remove('with-drawer')
    }
  }
}

watch(isOpen, () => {
  nextTick(() => {
    updateMainSectionMargin()
  })
})

onMounted(() => {
  updateMainSectionMargin()
})

defineExpose({
  isOpen,
  toggleDrawer
})
</script>

<style scoped>
.config-drawer {
  position: fixed;
  left: 280px;
  top: 0;
  bottom: 0;
  width: 320px;
  background: #1e293b;
  border-right: 1px solid #334155;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  pointer-events: none;
}

.config-drawer.drawer-open {
  transform: translateX(0);
  z-index: 150;
  pointer-events: auto;
}

.drawer-toggle {
  position: fixed;
  left: 280px;
  top: 70px;
  width: 40px;
  height: 40px;
  background: #1e293b;
  border: 1px solid #334155;
  border-left: none;
  border-radius: 0 8px 8px 0;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 200;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
}

.drawer-toggle.drawer-open {
  left: 600px;
}

.drawer-toggle:hover {
  background: #334155;
  color: #f1f5f9;
}

.toggle-icon {
  width: 20px;
  height: 20px;
}

.drawer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}

.drawer-header h3 {
  color: #f1f5f9;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>

