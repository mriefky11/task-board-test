<script setup>
import {computed} from 'vue';
import {IonIcon} from '@ionic/vue';
import {
  calendarOutline,
  checkboxOutline,
  documentAttachOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import {useBoardStore} from '../stores/board';

const props = defineProps({task: {type: Object, required: true}});
const emit = defineEmits(['open']);

const store = useBoardStore();

const label = computed(() => store.getLabel(props.task.label));
const assignees = computed(() =>
  (props.task.assignees || []).map((id) => store.getMember(id)).filter(Boolean),
);

const doneCount = computed(
  () => (props.task.checklist || []).filter((item) => item.done).length,
);
const total = computed(() => (props.task.checklist || []).length);
const progress = computed(() =>
  total.value ? Math.round((doneCount.value / total.value) * 100) : 0,
);

const dueText = computed(() => {
  if (!props.task.dueDate) return '';
  const date = new Date(`${props.task.dueDate}T00:00:00`);
  return date.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
});
const dueStatus = computed(() => {
  if (!props.task.dueDate) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${props.task.dueDate}T00:00:00`);
  const days = Math.round((target - today) / 86400000);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return '';
});
</script>

<template>
  <article
    class="task-card"
    tabindex="0"
    role="button"
    @click="emit('open')"
    @keydown.enter.prevent="emit('open')"
    @keydown.space.prevent="emit('open')"
  >
    <div v-if="task.cover" class="cover">
      <img :src="task.cover" alt="Cover task" />
    </div>

    <div class="card-body">
      <div v-if="label" class="labels">
        <span
          class="label-pill"
          :style="{background: label.bg, color: label.color}"
          >{{ label.name }}</span
        >
      </div>

      <div v-if="total" class="progress">
        <div class="progress-track">
          <div
            class="progress-fill"
            :class="{complete: progress === 100}"
            :style="{width: progress + '%'}"
          />
        </div>
      </div>

      <h3 class="title">{{ task.title }}</h3>

      <div class="meta">
        <span v-if="task.dueDate" class="chip due" :class="dueStatus">
          <IonIcon :icon="calendarOutline" />
          {{ dueText }}
        </span>
        <span v-if="total" class="chip">
          <IonIcon :icon="checkboxOutline" />
          {{ doneCount }}/{{ total }}
        </span>
        <span v-if="task.attachments?.length" class="chip">
          <IonIcon :icon="documentAttachOutline" />
          {{ task.attachments.length }}
        </span>
        <span v-if="task.completed" class="chip done-chip" title="Selesai">
          <IonIcon :icon="checkmarkCircleOutline" />
        </span>

        <span v-if="assignees.length" class="avatars">
          <span
            v-for="member in assignees.slice(0, 3)"
            :key="member.id"
            class="avatar"
            :style="{background: member.color}"
            :title="member.name"
            >{{ member.initials }}</span
          >
          <span v-if="assignees.length > 3" class="avatar more"
            >+{{ assignees.length - 3 }}</span
          >
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.task-card {
  flex: 0 0 auto;
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}
.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(9, 30, 66, 0.2);
}
.task-card:focus-visible {
  box-shadow: 0 0 0 2px var(--c-accent);
}
.cover {
  height: 132px;
  overflow: hidden;
  background: var(--c-surface-alt);
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card-body {
  padding: 10px 12px 11px;
}
.labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 7px;
}
.label-pill {
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  padding: 0 8px;
  border-radius: 4px;
}
.progress {
  margin: 2px 0 8px;
}
.progress-track {
  height: 6px;
  border-radius: 6px;
  background: var(--c-surface-alt);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 6px;
  background: #579dff;
  transition: width 0.3s ease;
}
.progress-fill.complete {
  background: var(--c-success);
}
.title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-muted);
  background: #f1f2f4;
  border-radius: 4px;
  padding: 2px 5px;
  white-space: nowrap;
}
.chip ion-icon {
  font-size: 13px;
}
.chip.due {
  color: #44546f;
  background: #e9ebef;
}
.chip.due.today {
  color: #7f5f01;
  background: #fff7d6;
}
.chip.due.soon {
  color: #0c66e4;
  background: #e9f2ff;
}
.chip.due.overdue {
  color: #ae2e24;
  background: #ffdedb;
}
.done-chip {
  color: var(--c-success);
  background: #dcfff1;
}
.avatars {
  display: flex;
  margin-left: auto;
  padding-left: 4px;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border: 2px solid var(--c-surface);
  margin-left: -6px;
}
.avatar.more {
  background: #dcdfe4;
  color: var(--c-text);
}
</style>
