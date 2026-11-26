<script setup>
import { computed, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  chevronDownOutline,
  personAddOutline,
  filterOutline,
  downloadOutline,
  searchOutline,
  closeOutline,
} from 'ionicons/icons'
import { useBoardStore } from '../stores/board'
import { workspace } from '../data/dummy'

const store = useBoardStore()
const filterOpen = ref(false)
const menuOpen = ref(false)
const fileInput = ref(null)

const dueOptions = [
  { value: 'all', label: 'Semua due date' },
  { value: 'overdue', label: 'Terlewat' },
  { value: 'today', label: 'Hari ini' },
  { value: 'upcoming', label: '7 hari ke depan' },
  { value: 'none', label: 'Tanpa due date' },
]

const visibleMembers = computed(() => store.members.slice(0, 4))
const extraMembers = computed(() => Math.max(0, store.members.length - visibleMembers.value.length))

function downloadJson() {
  const blob = new Blob([store.exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `task-board-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  menuOpen.value = false
  store.notify('Board berhasil diekspor', 'success')
}

async function onImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    store.importData(await file.text())
    store.notify('Board berhasil diimpor', 'success')
  } catch (error) {
    store.notify(`Gagal impor: ${error.message}`, 'danger')
  }
  event.target.value = ''
  menuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="left">
      <div class="workspace">
        <span class="workspace-mark">{{ workspace.name.slice(0, 1) }}</span>
        <span class="workspace-text">
          <strong>{{ workspace.name }}</strong>
          <small>{{ workspace.subtitle }}</small>
        </span>
        <IonIcon :icon="chevronDownOutline" class="chevron" />
      </div>

      <div class="members" :title="store.members.map((m) => m.name).join(', ')">
        <span
          v-for="member in visibleMembers"
          :key="member.id"
          class="member"
          :style="{ background: member.color }"
        >{{ member.initials }}</span>
        <span v-if="extraMembers" class="member extra">+{{ extraMembers }}</span>
      </div>

      <button class="btn invite" @click="store.notify('Tautan undangan disalin', 'success')">
        <IonIcon :icon="personAddOutline" /> <span class="btn-label">Invite</span>
      </button>
    </div>

    <div class="right">
      <div class="pop-wrap">
        <button class="btn" :class="{ active: filterOpen }" @click="filterOpen = !filterOpen; menuOpen = false">
          <IonIcon :icon="filterOutline" /> <span class="btn-label">Filter</span>
          <span v-if="store.activeFilterCount" class="badge-count">{{ store.activeFilterCount }}</span>
        </button>

        <div v-if="filterOpen" class="popover filter-panel">
          <div class="popover-head">
            <strong>Filter task</strong>
            <button class="close" @click="filterOpen = false"><IonIcon :icon="closeOutline" /></button>
          </div>
          <label>
            Assignee
            <select v-model="store.filters.assignee">
              <option value="all">Semua anggota</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </label>
          <label>
            Label
            <select v-model="store.filters.label">
              <option value="all">Semua label</option>
              <option v-for="l in store.labels" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </label>
          <label>
            Due date
            <select v-model="store.filters.due">
              <option v-for="option in dueOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <div class="popover-foot">
            <button class="link" @click="store.clearFilters()">Reset filter</button>
            <button class="primary" @click="filterOpen = false">Selesai</button>
          </div>
        </div>
      </div>

      <div class="pop-wrap">
        <button class="btn" :class="{ active: menuOpen }" @click="menuOpen = !menuOpen; filterOpen = false">
          <IonIcon :icon="downloadOutline" /> <span class="btn-label">Export / Import</span>
        </button>
        <div v-if="menuOpen" class="popover menu-panel">
          <button @click="downloadJson"><IonIcon :icon="downloadOutline" /> Export JSON</button>
          <button @click="fileInput.click()"><IonIcon :icon="downloadOutline" class="flip" /> Import JSON</button>
          <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onImport" />
        </div>
      </div>

      <label class="search">
        <IonIcon :icon="searchOutline" />
        <input v-model="store.search" type="search" placeholder="Search Tasks" />
        <button v-if="store.search" class="clear-search" title="Hapus" @click.prevent="store.search = ''">
          <IonIcon :icon="closeOutline" />
        </button>
      </label>
    </div>

    <div v-if="filterOpen || menuOpen" class="pop-backdrop" @click="filterOpen = false; menuOpen = false" />
  </header>
</template>

<style scoped>
.header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  box-shadow: 0 1px 3px rgba(9, 30, 66, 0.08);
  z-index: 10;
}
.left,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.right {
  position: relative;
}
.workspace {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-right: 6px;
}
.workspace-mark {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0c66e4, #5e4db2);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}
.workspace-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.workspace-text strong {
  font-size: 14px;
}
.workspace-text small {
  font-size: 11px;
  color: var(--c-text-muted);
}
.chevron {
  font-size: 16px;
  color: var(--c-text-muted);
}
.members {
  display: flex;
  padding-left: 8px;
}
.member {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--c-surface);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
}
.member.extra {
  background: #dcdfe4;
  color: var(--c-text);
}
.btn {
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-surface);
  color: var(--c-text);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.btn:hover,
.btn.active {
  background: var(--c-surface-alt);
}
.btn.invite {
  background: var(--c-accent-soft);
  border-color: transparent;
  color: var(--c-accent);
}
.btn.invite:hover {
  background: #d6e7ff;
}
.badge-count {
  background: var(--c-accent);
  color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 10px;
}
.search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  width: 220px;
  padding: 0 9px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-surface);
  color: var(--c-text-muted);
}
.search:focus-within {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 1px var(--c-accent);
}
.search input {
  border: 0;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 13px;
  color: var(--c-text);
}
.clear-search {
  border: 0;
  background: transparent;
  color: var(--c-text-muted);
  padding: 0;
  display: inline-flex;
}
.pop-wrap {
  position: relative;
}
.popover {
  position: absolute;
  top: 40px;
  right: 0;
  width: 250px;
  background: var(--c-surface);
  border-radius: 10px;
  box-shadow: var(--shadow-pop);
  padding: 12px;
  z-index: 20;
}
.popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}
.close {
  border: 0;
  background: transparent;
  color: var(--c-text-muted);
  font-size: 18px;
  display: inline-flex;
}
.filter-panel label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-muted);
  margin-bottom: 10px;
}
.filter-panel select {
  height: 34px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 0 8px;
  background: var(--c-surface);
  font-size: 13px;
  font-weight: 400;
  color: var(--c-text);
}
.popover-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.link {
  border: 0;
  background: transparent;
  color: var(--c-accent);
  font-size: 12px;
  padding: 6px;
}
.primary {
  border: 0;
  background: var(--c-accent);
  color: #fff;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
}
.menu-panel button {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 9px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.menu-panel button:hover {
  background: var(--c-surface-alt);
}
.flip {
  transform: rotate(180deg);
}
.pop-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9;
}

@media (max-width: 1024px) {
  .header {
    padding: 10px 14px;
  }
  .search {
    width: 190px;
  }
}

@media (max-width: 820px) {
  .header {
    flex-wrap: wrap;
    padding: 10px 12px;
    gap: 8px;
  }
  .left {
    flex: 1 1 auto;
    min-width: 0;
  }
  .right {
    width: 100%;
  }
  .search {
    flex: 1;
    width: auto;
  }
  .workspace-text small {
    display: none;
  }
  .member {
    width: 27px;
    height: 27px;
    font-size: 9px;
  }
  .popover {
    width: min(250px, calc(100vw - 24px));
  }
}

@media (max-width: 620px) {
  .header {
    padding: 8px 10px;
  }
  .left,
  .right {
    gap: 6px;
  }
  .btn {
    padding: 0 9px;
  }
  .pop-wrap .btn-label {
    display: none;
  }
  .search {
    height: 34px;
  }
  .members,
  .chevron {
    display: none;
  }
}

@media (max-width: 380px) {
  .workspace-text strong {
    font-size: 13px;
  }
  .btn.invite .btn-label {
    display: none;
  }
}
</style>
