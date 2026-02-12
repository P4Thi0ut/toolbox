<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1>Welcome to PA Toolbox</h1>
      <p class="subtitle">Your project management toolkit</p>
    </div>
    <div class="tools-grid">
      <router-link :to="{ name: 'sprint-activity' }" class="tool-card">
        <div class="tool-icon">📅</div>
        <h3>Sprint Activity</h3>
        <p>Track team sprint activities and workload</p>
      </router-link>
      <div class="tool-card">
        <div class="tool-icon">📊</div>
        <h3>Analytics</h3>
        <p>Track team activity and generate reports</p>
      </div>
      <div class="tool-card">
        <div class="tool-icon">⏱️</div>
        <h3>Time Tracking</h3>
        <p>Monitor time spent on projects</p>
      </div>
      <div class="tool-card">
        <div class="tool-icon">📝</div>
        <h3>Feedback</h3>
        <p>Consolidate and visualize feedback</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-section h1 {
  font-size: 32px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 16px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.tool-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
  display: block;
  color: inherit;
}

.tool-card:hover {
  border-color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tool-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.tool-card h3 {
  color: #f1f5f9;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.tool-card p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}
</style>

