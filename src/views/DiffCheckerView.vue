<template>
  <div class="diff-checker">
    <!-- Input Mode -->
    <div v-if="!showDiff" class="input-mode">
      <div class="input-header">
        <h2>Config Diff Checker</h2>
        <p class="input-subtitle">Paste your demo and prod configs to compare and merge</p>
      </div>
      <div class="inputs-container">
        <div class="input-panel">
          <div class="panel-header">
            <label>Left (Demo)</label>
            <button class="btn-small" @click="leftText = ''" :disabled="!leftText">Clear</button>
          </div>
          <textarea
            v-model="leftText"
            class="code-input"
            placeholder="Paste demo config here..."
            spellcheck="false"
          ></textarea>
        </div>
        <div class="input-panel">
          <div class="panel-header">
            <label>Right (Prod)</label>
            <button class="btn-small" @click="rightText = ''" :disabled="!rightText">Clear</button>
          </div>
          <textarea
            v-model="rightText"
            class="code-input"
            placeholder="Paste prod config here..."
            spellcheck="false"
          ></textarea>
        </div>
      </div>
      <div class="actions-bar">
        <button class="btn-primary" @click="compare" :disabled="!leftText && !rightText">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Compare
        </button>
      </div>
    </div>

    <!-- Diff Mode -->
    <div v-else class="diff-mode">
      <div class="diff-toolbar">
        <button class="btn-secondary" @click="goBack">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to inputs
        </button>
        <div class="diff-stats">
          <span class="stat stat-added">+{{ stats.added }} added</span>
          <span class="stat stat-removed">-{{ stats.removed }} removed</span>
          <span class="stat stat-equal">{{ stats.equal }} unchanged</span>
        </div>
        <div class="toolbar-actions">
          <button class="btn-secondary" @click="acceptAllLeft" title="Use all left (demo) lines">
            Accept all left
          </button>
          <button class="btn-secondary" @click="acceptAllRight" title="Use all right (prod) lines">
            Accept all right
          </button>
          <button class="btn-primary" @click="showResult = !showResult">
            {{ showResult ? 'Hide' : 'Show' }} merged result
          </button>
        </div>
      </div>

      <!-- Side-by-side diff -->
      <div class="diff-container">
        <div class="diff-table-wrapper">
          <table class="diff-table">
            <thead>
              <tr>
                <th class="line-num-col"></th>
                <th class="content-col left-header">Demo (left)</th>
                <th class="action-col"></th>
                <th class="line-num-col"></th>
                <th class="content-col right-header">Prod (right)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in rows"
                :key="idx"
                :class="['diff-row', rowClass(row)]"
              >
                <!-- Left side -->
                <td class="line-num" :class="row.left.type">
                  {{ row.left.lineNum }}
                </td>
                <td class="line-content" :class="row.left.type">
                  <span v-if="row.left.type === 'removed'" class="diff-marker">-</span>
                  <span class="code-text">{{ row.left.content }}</span>
                </td>

                <!-- Action buttons -->
                <td class="action-cell">
                  <template v-if="hasConflict(row)">
                    <button
                      v-if="!resolutions[idx] || resolutions[idx] !== 'left'"
                      class="accept-btn accept-left"
                      @click="resolve(idx, 'left')"
                      title="Use left (demo)"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span v-if="resolutions[idx]" class="resolved-badge" :class="resolutions[idx]">
                      {{ resolutions[idx] === 'left' ? 'L' : 'R' }}
                    </span>
                    <button
                      v-if="!resolutions[idx] || resolutions[idx] !== 'right'"
                      class="accept-btn accept-right"
                      @click="resolve(idx, 'right')"
                      title="Use right (prod)"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </template>
                </td>

                <!-- Right side -->
                <td class="line-num" :class="row.right.type">
                  {{ row.right.lineNum }}
                </td>
                <td class="line-content" :class="row.right.type">
                  <span v-if="row.right.type === 'added'" class="diff-marker">+</span>
                  <span class="code-text">{{ row.right.content }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Merged result panel -->
      <div v-if="showResult" class="result-panel">
        <div class="result-header">
          <h3>Merged Result</h3>
          <div class="result-actions">
            <span v-if="unresolvedCount > 0" class="unresolved-badge">
              {{ unresolvedCount }} unresolved
            </span>
            <button class="btn-small" @click="copyResult">
              {{ copied ? 'Copied!' : 'Copy to clipboard' }}
            </button>
          </div>
        </div>
        <pre class="result-output">{{ mergedResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { computeDiff, buildSideBySideRows } from '@/utils/diff'

const leftText = ref('')
const rightText = ref('')
const showDiff = ref(false)
const showResult = ref(false)
const copied = ref(false)

const ops = ref([])
const rows = ref([])
const resolutions = reactive({})

const stats = computed(() => {
  let added = 0, removed = 0, equal = 0
  for (const op of ops.value) {
    if (op.type === 'added') added++
    else if (op.type === 'removed') removed++
    else equal++
  }
  return { added, removed, equal }
})

function compare() {
  ops.value = computeDiff(leftText.value, rightText.value)
  rows.value = buildSideBySideRows(ops.value)
  // Clear resolutions
  Object.keys(resolutions).forEach(k => delete resolutions[k])
  showDiff.value = true
  showResult.value = false
}

function goBack() {
  showDiff.value = false
  showResult.value = false
}

function hasConflict(row) {
  return (
    row.left.type === 'removed' ||
    row.right.type === 'added' ||
    row.left.type === 'empty' ||
    row.right.type === 'empty'
  )
}

function rowClass(row) {
  if (row.left.type === 'removed' && row.right.type === 'added') return 'row-modified'
  if (row.left.type === 'removed') return 'row-removed'
  if (row.right.type === 'added') return 'row-added'
  return ''
}

function resolve(idx, side) {
  resolutions[idx] = side
}

function acceptAllLeft() {
  rows.value.forEach((row, idx) => {
    if (hasConflict(row)) resolutions[idx] = 'left'
  })
}

function acceptAllRight() {
  rows.value.forEach((row, idx) => {
    if (hasConflict(row)) resolutions[idx] = 'right'
  })
}

const unresolvedCount = computed(() => {
  let count = 0
  rows.value.forEach((row, idx) => {
    if (hasConflict(row) && !resolutions[idx]) count++
  })
  return count
})

const mergedResult = computed(() => {
  const lines = []
  rows.value.forEach((row, idx) => {
    if (!hasConflict(row)) {
      // Equal line
      lines.push(row.left.content)
    } else {
      const choice = resolutions[idx]
      if (choice === 'left') {
        if (row.left.type !== 'empty') lines.push(row.left.content)
      } else if (choice === 'right') {
        if (row.right.type !== 'empty') lines.push(row.right.content)
      } else {
        // Unresolved - show both with markers
        if (row.left.type !== 'empty') lines.push(`<<<< LEFT: ${row.left.content}`)
        if (row.right.type !== 'empty') lines.push(`>>>> RIGHT: ${row.right.content}`)
      }
    }
  })
  return lines.join('\n')
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(mergedResult.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = mergedResult.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.diff-checker {
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ── Input Mode ── */
.input-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.input-header {
  margin-bottom: 20px;
}

.input-header h2 {
  color: #f1f5f9;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.input-subtitle {
  color: #94a3b8;
  font-size: 14px;
}

.inputs-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.input-panel {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.panel-header label {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.btn-small {
  background: #334155;
  color: #94a3b8;
  border: 1px solid #475569;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover:not(:disabled) {
  background: #475569;
  color: #e2e8f0;
}

.btn-small:disabled {
  opacity: 0.4;
  cursor: default;
}

.code-input {
  flex: 1;
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.code-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.code-input::placeholder {
  color: #475569;
}

.actions-bar {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #334155;
  color: #e2e8f0;
  border: 1px solid #475569;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* ── Diff Mode ── */
.diff-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.diff-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  flex-wrap: wrap;
}

.diff-stats {
  display: flex;
  gap: 12px;
  flex: 1;
}

.stat {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

.stat-added {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.stat-removed {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.stat-equal {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

/* ── Diff Table ── */
.diff-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
}

.diff-table-wrapper {
  min-width: 100%;
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  table-layout: fixed;
}

.diff-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
}

.diff-table th {
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #334155;
}

.line-num-col {
  width: 50px;
}

.content-col {
  width: calc((100% - 150px) / 2);
}

.action-col {
  width: 50px;
}

.left-header {
  border-right: 1px solid #334155;
}

/* ── Diff Rows ── */
.diff-row td {
  padding: 0 12px;
  vertical-align: top;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 24px;
}

.line-num {
  color: #475569;
  text-align: right;
  padding-right: 8px !important;
  user-select: none;
  width: 50px;
  min-width: 50px;
}

.line-content {
  position: relative;
}

.line-content .diff-marker {
  position: absolute;
  left: 2px;
  font-weight: 700;
}

.line-content .code-text {
  padding-left: 16px;
  display: inline-block;
}

/* Type colors */
.line-num.removed,
.line-content.removed {
  background: rgba(248, 113, 113, 0.1);
}

.line-content.removed .diff-marker {
  color: #f87171;
}

.line-content.removed .code-text {
  color: #fca5a5;
}

.line-num.added,
.line-content.added {
  background: rgba(74, 222, 128, 0.1);
}

.line-content.added .diff-marker {
  color: #4ade80;
}

.line-content.added .code-text {
  color: #86efac;
}

.line-num.equal,
.line-content.equal {
  background: transparent;
}

.line-content.equal .code-text {
  color: #94a3b8;
}

.line-num.empty,
.line-content.empty {
  background: rgba(51, 65, 85, 0.3);
}

/* Separator between left and right content columns */
.diff-row td.line-content.removed,
.diff-row td.line-content.equal:nth-child(2),
.diff-row td.line-content.empty:nth-child(2) {
  border-right: 1px solid #334155;
}

/* ── Action Buttons ── */
.action-cell {
  text-align: center;
  width: 50px;
  min-width: 50px;
  padding: 0 2px !important;
  display: table-cell;
  vertical-align: middle;
}

.accept-btn {
  background: transparent;
  border: 1px solid #475569;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  vertical-align: middle;
}

.accept-left {
  color: #f87171;
}

.accept-left:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: #f87171;
}

.accept-right {
  color: #4ade80;
}

.accept-right:hover {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
}

.resolved-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  vertical-align: middle;
  margin: 0 2px;
}

.resolved-badge.left {
  background: rgba(248, 113, 113, 0.25);
  color: #f87171;
}

.resolved-badge.right {
  background: rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

/* ── Result Panel ── */
.result-panel {
  margin-top: 16px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #334155;
}

.result-header h3 {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unresolved-badge {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.result-output {
  flex: 1;
  overflow: auto;
  padding: 16px;
  margin: 0;
  color: #e2e8f0;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
}
</style>
