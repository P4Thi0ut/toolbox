<template>
  <header class="header">
    <div class="header-left">
      <nav class="breadcrumbs">
        <span class="breadcrumb-item">Home</span>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-item">Dashboard</span>
      </nav>
    </div>
    <div class="header-right">
      <div class="header-actions">
        <button class="icon-button" title="Search">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button class="icon-button" title="Notifications">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  flex: 1;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
}

.breadcrumb-item {
  color: #e2e8f0;
}

.breadcrumb-separator {
  color: #64748b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: #334155;
  color: #f1f5f9;
}

.icon-button svg {
  width: 20px;
  height: 20px;
}
</style>

