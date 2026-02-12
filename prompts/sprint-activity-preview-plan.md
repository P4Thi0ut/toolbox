# Sprint Activity Preview Module - Implementation Plan

## Overview
A Gantt-like timeline visualization tool for tracking team member sprint activities, workload distribution, and detecting over-allocation issues.

## Architecture & Data Structure

### Data Models

#### Sprint Data Structure (JSON)
```json
{
  "referential": {
    "members": ["Member A", "Member B", ...],
    "projects": ["Project 1", "Project 2", ...]
  },
  "sprints": [
    {
      "id": "sprint-1",
      "name": "Sprint 1 - Jan 2025",
      "duration": 10, // working days (default: 10 for 2 weeks)
      "tasks": [
        {
          "id": "task-1",
          "label": "Feature X",
          "project": "Project 1",
          "type": "DEV",
          "workload": 2.0, // total days
          "assignments": [
            {
              "memberId": "member-a",
              "workload": 1.0, // days assigned to this member
              "order": 0 // position in timeline
            },
            {
              "memberId": "member-b",
              "workload": 1.0,
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

## Implementation Phases

### Phase 1: Core Data Management & Store
**Files to create:**
- `src/stores/sprint.js` - Pinia store for sprint data management
- `src/composables/useSprintData.js` - Composable for data operations (import/export, validation)

**Features:**
- Store structure for referential data (members, projects)
- Store structure for sprints array
- Current sprint selection
- JSON import/export functions
- Data validation
- Default sprint creation

### Phase 2: Sprint Management UI
**Files to create:**
- `src/views/SprintActivityView.vue` - Main view container
- `src/components/sprint/SprintSelector.vue` - Sprint navigation/selector
- `src/components/sprint/SprintForm.vue` - Create/edit sprint form

**Features:**
- List of sprints with names
- Create new sprint (with name input)
- Switch between sprints
- Delete sprint
- Sprint duration configuration (default: 10 working days)

### Phase 3: Referential Data Management
**Files to create:**
- `src/components/sprint/MemberManager.vue` - Manage team members
- `src/components/sprint/ProjectManager.vue` - Manage projects

**Features:**
- Add/remove team members
- Add/remove projects
- Auto-create projects from task labels (with confirmation)
- Persist in referential data

### Phase 4: Task Management
**Files to create:**
- `src/components/sprint/TaskForm.vue` - Create/edit task modal/form
- `src/components/sprint/TaskAssignment.vue` - Task assignment component (member selection + workload distribution)

**Features:**
- Create task with:
  - Label
  - Project (select from existing or create new)
  - Type (DEV, SPEC, MEET, QA, DEPLOY)
  - Total workload (0.25 day increments)
- Assign to multiple members:
  - Option 1: Duplicate workload for each member
  - Option 2: Split workload manually
  - Option 3: Dispatch equally (default)
- Edit task
- Delete task

### Phase 5: Timeline Visualization
**Files to create:**
- `src/components/sprint/TimelineView.vue` - Main timeline component
- `src/components/sprint/TimelineHeader.vue` - Day slots header
- `src/components/sprint/TimelineRow.vue` - Member row with tasks
- `src/components/sprint/TaskBlock.vue` - Individual task block in timeline

**Features:**
- Calculate working days (exclude weekends)
- Display day slots (4 slots per day = 0.25 day increments)
- One row per team member
- Render tasks as blocks spanning appropriate slots
- Task positioning based on order
- Visual indicators:
  - Color coding by task type
  - Over-allocation warning (if member > 100% staffed)
  - Under-allocation indicator
- Hover tooltip with task details
- Drag & drop to reorder tasks (optional, can start with manual order input)

### Phase 6: Task Interaction & Editing
**Files to create:**
- `src/components/sprint/TaskTooltip.vue` - Task details on hover
- `src/composables/useTaskDrag.js` - Drag & drop functionality (optional)

**Features:**
- Click task to edit
- Hover to see details (label, project, type, workload, assignments)
- Reorder tasks (drag or manual order input)
- Delete task from timeline
- Visual feedback on interactions

### Phase 7: Import/Export & Persistence
**Files to create:**
- `src/components/sprint/DataManager.vue` - Import/export UI
- `src/utils/jsonExport.js` - Export utilities
- `src/utils/jsonImport.js` - Import utilities

**Features:**
- Export current data to JSON file (download)
- Import JSON file (file input)
- Validate imported data structure
- Merge imported referential data with existing
- Load previous sprint data when creating new sprint

## Component Hierarchy

```
SprintActivityView
├── SprintSelector (top bar)
├── DataManager (import/export buttons)
├── MemberManager (sidebar or modal)
├── ProjectManager (sidebar or modal)
├── TaskForm (modal, triggered by "Add Task" button)
└── TimelineView
    ├── TimelineHeader (day slots)
    └── TimelineRow[] (one per member)
        └── TaskBlock[] (tasks for this member)
            └── TaskTooltip (on hover)
```

## Technical Considerations

### Timeline Calculation
- Working days: Monday to Friday (exclude weekends)
- Slots per day: 4 (representing 0.25, 0.5, 0.75, 1.0 day)
- Total slots for 2 weeks: 10 days × 4 = 40 slots
- Task block width: `(task.workload / 0.25) * slotWidth` pixels
- Task position: Based on order and previous tasks

### Workload Distribution Logic
```javascript
// Equal distribution (default)
function distributeEqually(totalWorkload, memberCount) {
  return totalWorkload / memberCount
}

// Manual distribution
// User inputs workload per member, validated against total
```

### Over-allocation Detection
- Calculate total workload per member per day
- If > 1.0 day (4 slots), show warning indicator
- Visual highlight (red border or background)

### Color Coding by Task Type
- DEV: Blue
- SPEC: Purple
- MEET: Orange
- QA: Green
- DEPLOY: Red

## UI/UX Design Notes

- Follow dark theme from dashboard
- Timeline should be horizontally scrollable if needed
- Sticky header (member names) when scrolling
- Sticky day slots header when scrolling vertically
- Smooth transitions for task blocks
- Clear visual hierarchy
- Responsive design considerations (may need horizontal scroll on smaller screens)

## File Structure

```
src/
├── views/
│   └── SprintActivityView.vue
├── components/
│   └── sprint/
│       ├── SprintSelector.vue
│       ├── SprintForm.vue
│       ├── MemberManager.vue
│       ├── ProjectManager.vue
│       ├── TaskForm.vue
│       ├── TaskAssignment.vue
│       ├── TimelineView.vue
│       ├── TimelineHeader.vue
│       ├── TimelineRow.vue
│       ├── TaskBlock.vue
│       ├── TaskTooltip.vue
│       └── DataManager.vue
├── stores/
│   └── sprint.js
├── composables/
│   ├── useSprintData.js
│   └── useTaskDrag.js (optional)
└── utils/
    ├── jsonExport.js
    └── jsonImport.js
```

## Router Integration

Add route to `src/router/index.js`:
```javascript
{
  path: '/sprint-activity',
  name: 'sprint-activity',
  component: () => import('@/views/SprintActivityView.vue'),
  meta: { requiresAuth: true }
}
```

Add navigation link in Sidebar component.

## Implementation Order Recommendation

1. **Phase 1** - Data store & structure (foundation)
2. **Phase 2** - Sprint management (basic navigation)
3. **Phase 3** - Referential data (members & projects)
4. **Phase 4** - Task management (CRUD operations)
5. **Phase 5** - Timeline visualization (core feature)
6. **Phase 6** - Task interactions (polish)
7. **Phase 7** - Import/export (persistence)

## Questions/Clarifications Needed

1. Should task order be manual input or drag-and-drop? (Plan assumes both options)
2. When a task is assigned to multiple members, should they appear on the same timeline position or can they be independent?
3. Should there be a "copy sprint" feature to duplicate a sprint as a starting point?
4. Any specific validation rules for workload distribution (e.g., must sum to total)?

