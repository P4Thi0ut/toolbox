/**
 * Line-based diff algorithm using Longest Common Subsequence (LCS).
 * Produces a list of diff operations for each line.
 */

/**
 * Compute LCS table for two arrays of lines
 */
function lcsTable(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp
}

/**
 * Backtrack through LCS table to produce diff operations.
 * Returns array of { type: 'equal'|'removed'|'added', line, leftLine, rightLine }
 */
function backtrack(dp, a, b) {
  const ops = []
  let i = a.length
  let j = b.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'equal', line: a[i - 1], leftIdx: i - 1, rightIdx: j - 1 })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'added', line: b[j - 1], rightIdx: j - 1 })
      j--
    } else {
      ops.push({ type: 'removed', line: a[i - 1], leftIdx: i - 1 })
      i--
    }
  }

  return ops.reverse()
}

/**
 * Compute a line-level diff between two strings.
 * Returns an array of operations: { type, line, leftIdx?, rightIdx? }
 */
export function computeDiff(leftText, rightText) {
  const leftLines = leftText.split('\n')
  const rightLines = rightText.split('\n')
  const dp = lcsTable(leftLines, rightLines)
  return backtrack(dp, leftLines, rightLines)
}

/**
 * Group consecutive diff operations into hunks.
 * Each hunk is { lines: [...ops], hasChanges: boolean, id: number }
 * Context lines (equal) between changes are grouped with the nearest hunk.
 */
export function groupIntoHunks(ops, contextLines = 3) {
  if (ops.length === 0) return []

  // Find ranges of changed lines
  const changeIndices = []
  ops.forEach((op, idx) => {
    if (op.type !== 'equal') changeIndices.push(idx)
  })

  if (changeIndices.length === 0) {
    return [{ id: 0, lines: ops, hasChanges: false }]
  }

  // Build hunk ranges with context
  const ranges = []
  let currentStart = Math.max(0, changeIndices[0] - contextLines)
  let currentEnd = Math.min(ops.length - 1, changeIndices[0] + contextLines)

  for (let k = 1; k < changeIndices.length; k++) {
    const newStart = Math.max(0, changeIndices[k] - contextLines)
    const newEnd = Math.min(ops.length - 1, changeIndices[k] + contextLines)

    if (newStart <= currentEnd + 1) {
      currentEnd = newEnd
    } else {
      ranges.push([currentStart, currentEnd])
      currentStart = newStart
      currentEnd = newEnd
    }
  }
  ranges.push([currentStart, currentEnd])

  return ranges.map(([start, end], id) => ({
    id,
    lines: ops.slice(start, end + 1),
    hasChanges: true
  }))
}

/**
 * Build side-by-side rows from diff operations.
 * Each row has { left: { lineNum, content, type }, right: { lineNum, content, type } }
 */
export function buildSideBySideRows(ops) {
  const rows = []
  let leftNum = 0
  let rightNum = 0

  let i = 0
  while (i < ops.length) {
    const op = ops[i]

    if (op.type === 'equal') {
      leftNum++
      rightNum++
      rows.push({
        left: { lineNum: leftNum, content: op.line, type: 'equal' },
        right: { lineNum: rightNum, content: op.line, type: 'equal' }
      })
      i++
    } else if (op.type === 'removed') {
      // Check if next op is 'added' to pair them
      if (i + 1 < ops.length && ops[i + 1].type === 'added') {
        leftNum++
        rightNum++
        rows.push({
          left: { lineNum: leftNum, content: op.line, type: 'removed' },
          right: { lineNum: rightNum, content: ops[i + 1].line, type: 'added' }
        })
        i += 2
      } else {
        leftNum++
        rows.push({
          left: { lineNum: leftNum, content: op.line, type: 'removed' },
          right: { lineNum: null, content: '', type: 'empty' }
        })
        i++
      }
    } else {
      rightNum++
      rows.push({
        left: { lineNum: null, content: '', type: 'empty' },
        right: { lineNum: rightNum, content: op.line, type: 'added' }
      })
      i++
    }
  }

  return rows
}
