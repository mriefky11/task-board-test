import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { toastController } from '@ionic/vue'
import {
  columns as seedColumns,
  tasksByColumn as seedTasks,
  members as seedMembers,
  labels as seedLabels,
} from '../data/dummy'

const STORAGE_KEY = 'task-board:v1'

const clone = (value) => JSON.parse(JSON.stringify(value))
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const useBoardStore = defineStore('board', () => {
  const columns = ref(clone(seedColumns))
  const tasksByColumn = ref(clone(seedTasks))
  const members = ref(clone(seedMembers))
  const labels = ref(clone(seedLabels))
  const search = ref('')
  const filters = ref({ assignee: 'all', label: 'all', due: 'all' })

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved?.columns?.length && saved?.tasksByColumn) {
      columns.value = saved.columns
      tasksByColumn.value = saved.tasksByColumn
      if (saved.members?.length) members.value = saved.members
      if (saved.labels?.length) labels.value = saved.labels
    }
  } catch (error) {
    console.warn('[board] gagal memuat localStorage:', error)
  }

  watch(
    [columns, tasksByColumn, members, labels],
    () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            columns: columns.value,
            tasksByColumn: tasksByColumn.value,
            members: members.value,
            labels: labels.value,
          }),
        )
      } catch (error) {
        console.warn('[board] gagal menyimpan localStorage:', error)
      }
    },
    { deep: true },
  )

  const isFiltering = computed(
    () =>
      search.value.trim() !== '' ||
      filters.value.assignee !== 'all' ||
      filters.value.label !== 'all' ||
      filters.value.due !== 'all',
  )

  const activeFilterCount = computed(
    () =>
      Number(filters.value.assignee !== 'all') +
      Number(filters.value.label !== 'all') +
      Number(filters.value.due !== 'all'),
  )

  function matches(task) {
    const query = search.value.trim().toLowerCase()
    if (query && !String(task.title).toLowerCase().includes(query)) return false

    const { assignee, label, due } = filters.value
    if (assignee !== 'all' && !(task.assignees || []).includes(assignee)) return false
    if (label !== 'all' && task.label !== label) return false

    if (due === 'none' && task.dueDate) return false
    if (due !== 'all' && due !== 'none') {
      if (!task.dueDate) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const target = new Date(task.dueDate)
      target.setHours(0, 0, 0, 0)
      const days = Math.round((target - today) / 86400000)
      if (due === 'overdue' && days >= 0) return false
      if (due === 'today' && days !== 0) return false
      if (due === 'upcoming' && (days <= 0 || days > 7)) return false
    }
    return true
  }

  function getTasks(columnId) {
    const list = tasksByColumn.value[columnId] || []
    return isFiltering.value ? list.filter(matches) : list
  }

  function setTasks(columnId, list) {
    if (isFiltering.value) return
    tasksByColumn.value[columnId] = list
  }

  function findTask(id) {
    for (const column of columns.value) {
      const index = (tasksByColumn.value[column.id] || []).findIndex((t) => t.id === id)
      if (index !== -1) return { columnId: column.id, index }
    }
    return null
  }

  function getLabel(id) {
    return labels.value.find((l) => l.id === id) || labels.value[labels.value.length - 1]
  }

  function getMember(id) {
    return members.value.find((m) => m.id === id)
  }

  function addTask(columnId, task) {
    if (!tasksByColumn.value[columnId]) tasksByColumn.value[columnId] = []
    tasksByColumn.value[columnId].unshift({ ...clone(task), id: uid() })
  }

  function updateTask(task) {
    const found = findTask(task.id)
    if (!found) return
    Object.assign(tasksByColumn.value[found.columnId][found.index], clone(task))
  }

  function deleteTask(id) {
    const found = findTask(id)
    if (found) tasksByColumn.value[found.columnId].splice(found.index, 1)
  }

  function addColumn(name) {
    const trimmed = String(name || '').trim()
    if (!trimmed) return null
    const column = { id: `col-${uid()}`, name: trimmed }
    columns.value.push(column)
    tasksByColumn.value[column.id] = []
    return column
  }

  function deleteColumn(columnId) {
    const index = columns.value.findIndex((c) => c.id === columnId)
    if (index === -1) return
    const fallback = columns.value.find((c) => c.id !== columnId)?.id
    const removed = tasksByColumn.value[columnId] || []
    if (fallback && removed.length) {
      tasksByColumn.value[fallback] = [...removed, ...(tasksByColumn.value[fallback] || [])]
    }
    delete tasksByColumn.value[columnId]
    columns.value.splice(index, 1)
  }

  function clearFilters() {
    search.value = ''
    filters.value = { assignee: 'all', label: 'all', due: 'all' }
  }

  function exportData() {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        columns: columns.value,
        tasksByColumn: tasksByColumn.value,
        members: members.value,
        labels: labels.value,
      },
      null,
      2,
    )
  }

  function importData(raw) {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!data?.columns?.length || !data?.tasksByColumn) {
      throw new Error('Format file tidak dikenali')
    }
    columns.value = data.columns
    tasksByColumn.value = data.tasksByColumn
    if (data.members?.length) members.value = data.members
    if (data.labels?.length) labels.value = data.labels
    clearFilters()
  }

  async function notify(message, color = 'success') {
    const toast = await toastController.create({
      message,
      duration: 2200,
      color,
      position: 'top',
    })
    await toast.present()
  }

  return {
    columns,
    tasksByColumn,
    members,
    labels,
    search,
    filters,
    isFiltering,
    activeFilterCount,
    getTasks,
    setTasks,
    findTask,
    getLabel,
    getMember,
    addTask,
    updateTask,
    deleteTask,
    addColumn,
    deleteColumn,
    clearFilters,
    exportData,
    importData,
    notify,
  }
})
