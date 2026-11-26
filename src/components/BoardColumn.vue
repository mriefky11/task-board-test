<script setup>
import {computed, ref} from 'vue';
import draggable from 'vuedraggable';
import {IonIcon} from '@ionic/vue';
import {addOutline, ellipsisHorizontal, trashOutline} from 'ionicons/icons';
import {useBoardStore} from '../stores/board';
import TaskCard from './TaskCard.vue';

const props = defineProps({column: {type: Object, required: true}});
const emit = defineEmits(['open-task', 'add-task', 'delete-column']);

const store = useBoardStore();
const menuOpen = ref(false);

const tasks = computed({
  get: () => store.getTasks(props.column.id),
  set: (list) => store.setTasks(props.column.id, list),
});
</script>

<template>
  <section class="column">
    <header class="column-header">
      <div class="column-title">
        <span>{{ column.name }}</span>
        <span class="count">{{ store.getTasks(column.id).length }}</span>
      </div>
      <div class="column-actions">
        <button
          class="icon-btn"
          title="Tambah task"
          @click="emit('add-task', column.id)"
        >
          <IonIcon :icon="addOutline" />
        </button>
        <button
          class="icon-btn"
          title="Menu list"
          @click="menuOpen = !menuOpen"
        >
          <IonIcon :icon="ellipsisHorizontal" />
        </button>

        <div v-if="menuOpen" class="menu">
          <button
            @click="
              emit('add-task', column.id);
              menuOpen = false;
            "
          >
            <IonIcon :icon="addOutline" /> Tambah task
          </button>
          <button
            class="danger"
            @click="
              emit('delete-column', column.id);
              menuOpen = false;
            "
          >
            <IonIcon :icon="trashOutline" /> Hapus list
          </button>
        </div>
      </div>
    </header>

    <div v-if="menuOpen" class="menu-backdrop" @click="menuOpen = false" />

    <draggable
      v-model="tasks"
      group="tasks"
      item-key="id"
      :animation="180"
      :disabled="store.isFiltering"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      drag-class="drag-active"
      class="card-list"
    >
      <template #item="{element}">
        <TaskCard
          :task="element"
          @open="emit('open-task', element, column.id)"
        />
      </template>
    </draggable>

    <p v-if="!tasks.length" class="empty">
      {{ store.isFiltering ? 'Tidak ada hasil' : 'Belum ada task di list ini' }}
    </p>

    <button class="add-card" @click="emit('add-task', column.id)">
      <IonIcon :icon="addOutline" /> Tambah task
    </button>
  </section>
</template>

<style scoped>
.column {
  width: 288px;
  flex: 0 0 288px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  background: var(--c-surface-alt);
  border-radius: 12px;
  padding: 8px;
  position: relative;
}
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 6px 10px;
  position: relative;
}
.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--c-text);
  min-width: 0;
}
.count {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-muted);
  background: rgba(9, 30, 66, 0.08);
  border-radius: 10px;
  padding: 1px 7px;
}
.column-actions {
  display: flex;
  gap: 2px;
}
.icon-btn {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--c-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.icon-btn:hover {
  background: rgba(9, 30, 66, 0.09);
  color: var(--c-text);
}
.menu {
  position: absolute;
  top: 32px;
  right: 0;
  width: 170px;
  background: var(--c-surface);
  border-radius: 8px;
  box-shadow: var(--shadow-pop);
  padding: 6px;
  z-index: 5;
}
.menu button {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 8px;
  border-radius: 5px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.menu button:hover {
  background: var(--c-surface-alt);
}
.menu button.danger {
  color: var(--c-danger);
}
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: 2px 4px 4px;
  flex: 1 1 0;
  overscroll-behavior: contain;
}
.empty {
  margin: 8px 4px;
  font-size: 12px;
  color: var(--c-text-muted);
  text-align: center;
  padding: 12px 0;
  border: 1px dashed var(--c-border);
  border-radius: 8px;
}
.add-card {
  margin-top: 4px;
  border: 0;
  background: transparent;
  color: var(--c-text-muted);
  border-radius: 8px;
  padding: 9px 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.add-card:hover {
  background: rgba(9, 30, 66, 0.09);
  color: var(--c-text);
}
.drag-ghost {
  opacity: 0.35;
  background: #cce0ff;
  border-radius: var(--radius);
}
.drag-chosen {
  cursor: grabbing;
}
.drag-active {
  transform: rotate(2deg);
  box-shadow: 0 12px 24px rgba(9, 30, 66, 0.28);
}

@media (max-width: 640px) {
  .column {
    width: min(288px, 84vw);
    flex-basis: min(288px, 84vw);
  }
  .column-header {
    padding: 6px 4px 10px;
  }
}
</style>
