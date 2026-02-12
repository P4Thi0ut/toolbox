<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main-content">
      <Header />
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  min-width: 0;
  max-width: calc(100vw - 280px);
  overflow-x: hidden;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  max-width: 100%;
}
</style>

