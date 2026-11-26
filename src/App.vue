<script setup>
import { ref } from 'vue'
import { IonApp, IonIcon } from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useBoardStore } from './stores/board'
import BoardHeader from './components/BoardHeader.vue'
import BoardColumn from './components/BoardColumn.vue'
import TaskModal from './components/TaskModal.vue'

const store = useBoardStore()

const isModalOpen = ref(false)
const draft = ref(null)
const draftColumnId = ref('')
const isNew = ref(false)

const newListOpen = ref(false)
const newListName = ref('')

function createEmptyTask() {
  return {
    id: '',
    title: '',
    label: 'undefined',
    assignees: [],
    dueDate: '',
    cover: '',
    priority: 'Medium',
    board: 'Product Roadmap',
    description: '',
    attachments: [],
    checklist: [],
    activity: [],
    completed: false,
  }
}

function openCreate(columnId) {
  draftColumnId.value = columnId
  isNew.value = true
  draft.value = createEmptyTask()
  isModalOpen.value = true
}

function openEdit(task, columnId) {
  draftColumnId.value = columnId
  isNew.value = false
  draft.value = JSON.parse(JSON.stringify(task))
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function saveTask(targetColumnId) {
  if (!draft.value.title.trim()) {
    store.notify('Judul task wajib diisi', 'warning')
    return
  }

  if (isNew.value) {
    store.addTask(targetColumnId, draft.value)
    store.notify('Task berhasil dibuat', 'success')
  } else {
    const original = store.findTask(draft.value.id)
    if (original && original.columnId !== targetColumnId) {
      store.tasksByColumn[original.columnId].splice(original.index, 1)
      if (!store.tasksByColumn[targetColumnId]) store.tasksByColumn[targetColumnId] = []
      store.tasksByColumn[targetColumnId].unshift(JSON.parse(JSON.stringify(draft.value)))
    } else {
      store.updateTask(draft.value)
    }
    store.notify('Task berhasil disimpan', 'success')
  }
  closeModal()
}

function deleteTask() {
  if (!draft.value?.id || !window.confirm('Yakin ingin menghapus task ini?')) return
  store.deleteTask(draft.value.id)
  store.notify('Task berhasil dihapus', 'danger')
  closeModal()
}

function addList() {
  const column = store.addColumn(newListName.value)
  if (!column) return
  newListName.value = ''
  newListOpen.value = false
  store.notify(`List "${column.name}" ditambahkan`, 'success')
}

function removeList(columnId) {
  const column = store.columns.find((item) => item.id === columnId)
  if (!column || !window.confirm(`Hapus list "${column.name}"? Task di dalamnya akan dipindah.`)) return
  store.deleteColumn(columnId)
  store.notify('List dihapus', 'danger')
}
</script>

<template>
  <IonApp>
    <div class="board-app">
      <BoardHeader />

      <main class="board-scroll">
        <div class="board-columns">
          <BoardColumn
            v-for="column in store.columns"
            :key="column.id"
            :column="column"
            @open-task="openEdit"
            @add-task="openCreate"
            @delete-column="removeList"
          />

          <div class="add-list">
            <button v-if="!newListOpen" class="add-list-btn" @click="newListOpen = true">
              <IonIcon :icon="addOutline" /> Add new List
            </button>
            <div v-else class="add-list-form">
              <input
                v-model="newListName"
                placeholder="Nama list..."
                autofocus
                @keydown.enter.prevent="addList"
                @keydown.esc="newListOpen = false"
              />
              <div class="add-list-actions">
                <button class="save" @click="addList">Tambah</button>
                <button class="cancel" @click="newListOpen = false; newListName = ''">Batal</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <TaskModal
      :is-open="isModalOpen"
      :task="draft"
      :is-new="isNew"
      :column-id="draftColumnId"
      @save="saveTask"
      @delete="deleteTask"
      @discard="closeModal"
      @close="closeModal"
    />
  </IonApp>
</template>

<style scoped>
.board-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--c-bg);
}
.board-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 20px 20px;
}
.board-columns {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  height: 100%;
  min-width: min-content;
}
.add-list {
  width: 272px;
  flex: 0 0 272px;
}
.add-list-btn {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: rgba(9, 30, 66, 0.06);
  color: var(--c-text);
  font-size: 13px;
  font-weight: 600;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: background 0.16s ease;
}
.add-list-btn:hover {
  background: rgba(9, 30, 66, 0.12);
}
.add-list-form {
  background: var(--c-surface-alt);
  border-radius: 12px;
  padding: 10px;
}
.add-list-form input {
  width: 100%;
  height: 34px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 0 9px;
  outline: none;
  font-size: 13px;
  background: var(--c-surface);
}
.add-list-form input:focus { border-color: var(--c-accent); }
.add-list-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.add-list-actions button {
  border: 0;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
}
.add-list-actions .save { background: var(--c-accent); color: #fff; }
.add-list-actions .cancel { background: transparent; color: var(--c-text-muted); }

@media (max-width: 820px) {
  .board-scroll {
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 640px) {
  .board-scroll {
    scroll-snap-type: x proximity;
    padding: 10px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
  .board-columns {
    gap: 10px;
  }
  .column,
  .add-list {
    scroll-snap-align: start;
  }
  .add-list {
    width: min(272px, 84vw);
    flex-basis: min(272px, 84vw);
  }
}
</style>
