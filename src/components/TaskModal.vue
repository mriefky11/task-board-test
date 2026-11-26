<script setup>
import {computed, reactive, ref, watch} from 'vue';
import {IonModal, IonDatetime, IonIcon} from '@ionic/vue';
import {
  closeOutline,
  checkmarkCircleOutline,
  imageOutline,
  documentAttachOutline,
  addOutline,
  trashOutline,
  calendarOutline,
} from 'ionicons/icons';
import {useBoardStore} from '../stores/board';

const props = defineProps({
  isOpen: {type: Boolean, default: false},
  task: {type: Object, default: null},
  isNew: {type: Boolean, default: false},
  columnId: {type: String, default: ''},
});
const emit = defineEmits(['save', 'delete', 'discard', 'close']);

const store = useBoardStore();
const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const form = reactive({columnId: props.columnId});
const dateOpen = ref(false);
const newSubtask = ref('');
const comment = ref('');
const coverInput = ref(null);
const attachmentInput = ref(null);
const isDragging = ref(false);

function syncColumn() {
  form.columnId = props.columnId;
}
watch(
  () => [props.isOpen, props.columnId],
  () => {
    if (props.isOpen) syncColumn();
  },
  {immediate: true},
);

const doneCount = computed(
  () => (props.task?.checklist || []).filter((item) => item.done).length,
);
const total = computed(() => (props.task?.checklist || []).length);
const progress = computed(() =>
  total.value ? Math.round((doneCount.value / total.value) * 100) : 0,
);

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

async function onCover(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (props.task) props.task.cover = String(reader.result);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function addFiles(files) {
  if (!props.task) return;
  for (const file of files || []) {
    if (!props.task.attachments) props.task.attachments = [];
    props.task.attachments.push({id: uid(), name: file.name});
  }
}

function onAttachDrop(event) {
  isDragging.value = false;
  addFiles(event.dataTransfer?.files);
}

function onAttachChange(event) {
  addFiles(event.target.files);
  event.target.value = '';
}

function addSubtask() {
  const text = newSubtask.value.trim();
  if (!text || !props.task) return;
  if (!props.task.checklist) props.task.checklist = [];
  props.task.checklist.push({id: uid(), text, done: false});
  newSubtask.value = '';
}

function addComment() {
  const text = comment.value.trim();
  if (!text || !props.task) return;
  if (!props.task.activity) props.task.activity = [];
  props.task.activity.unshift({id: uid(), text, time: 'Baru saja'});
  comment.value = '';
}

function toggleAssignee(id) {
  if (!props.task) return;
  if (!props.task.assignees) props.task.assignees = [];
  props.task.assignees = props.task.assignees.includes(id)
    ? props.task.assignees.filter((value) => value !== id)
    : [...props.task.assignees, id];
}

function submit() {
  syncColumn();
  emit('save', form.columnId);
}
</script>

<template>
  <IonModal
    :is-open="isOpen"
    class="task-modal"
    @ionModalDidPresent="syncColumn"
    @ionModalDidDismiss="emit('close')"
  >
    <div v-if="task" class="modal-shell">
      <div class="modal-top">
        <div class="top-title">
          <span class="top-icon"
            ><IonIcon :icon="documentAttachOutline"
          /></span>
          <div>
            <strong>{{ isNew ? 'Task baru' : 'Detail task' }}</strong>
            <small>{{ task.board || 'Product Roadmap' }}</small>
          </div>
        </div>
        <button class="close-btn" title="Tutup" @click="emit('discard')">
          <IonIcon :icon="closeOutline" />
        </button>
      </div>

      <div class="modal-body">
        <div class="main-col">
          <section class="block">
            <label class="field-label" for="task-title">Judul</label>
            <textarea
              id="task-title"
              v-model="task.title"
              class="title-input"
              rows="2"
              placeholder="Tulis judul task..."
            />
          </section>

          <section class="block">
            <label class="field-label" for="task-desc">Description</label>
            <textarea
              id="task-desc"
              v-model="task.description"
              class="desc-input"
              rows="4"
              placeholder="Tambahkan penjelasan..."
            />
          </section>

          <section class="block">
            <div class="block-head">
              <h4>
                <IonIcon :icon="documentAttachOutline" /> Attachments
                <span v-if="task.attachments?.length" class="count">{{
                  task.attachments.length
                }}</span>
              </h4>
              <button class="text-btn" @click="attachmentInput.click()">
                + Add file
              </button>
            </div>
            <div
              class="dropzone"
              :class="{dragging: isDragging}"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onAttachDrop"
            >
              <IonIcon :icon="documentAttachOutline" />
              <span>Tarik file ke sini atau pilih dari perangkat</span>
              <small>Demo: hanya nama file yang disimpan</small>
            </div>
            <input
              ref="attachmentInput"
              type="file"
              multiple
              hidden
              @change="onAttachChange"
            />
            <ul v-if="task.attachments?.length" class="attachment-list">
              <li v-for="file in task.attachments" :key="file.id">
                <span class="file-icon"
                  ><IonIcon :icon="documentAttachOutline"
                /></span>
                <span class="file-name">{{ file.name }}</span>
                <button
                  title="Hapus"
                  @click="
                    task.attachments = task.attachments.filter(
                      (a) => a.id !== file.id,
                    )
                  "
                >
                  <IonIcon :icon="trashOutline" />
                </button>
              </li>
            </ul>
          </section>

          <section class="block">
            <div class="block-head">
              <h4>
                Check List
                <span v-if="total" class="count"
                  >{{ doneCount }}/{{ total }}</span
                >
              </h4>
            </div>
            <div v-if="total" class="progress-block">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :class="{complete: progress === 100}"
                  :style="{width: progress + '%'}"
                />
              </div>
              <span>{{ progress }}%</span>
            </div>
            <ul class="checklist">
              <li v-for="item in task.checklist || []" :key="item.id">
                <label class="check-item" :class="{checked: item.done}">
                  <input
                    type="checkbox"
                    :checked="item.done"
                    @change="item.done = $event.target.checked"
                  />
                  <span class="box"
                    ><IonIcon v-if="item.done" :icon="checkmarkCircleOutline"
                  /></span>
                  <span class="check-text">{{ item.text }}</span>
                </label>
                <button
                  class="row-del"
                  title="Hapus subtask"
                  @click="
                    task.checklist = task.checklist.filter(
                      (c) => c.id !== item.id,
                    )
                  "
                >
                  <IonIcon :icon="trashOutline" />
                </button>
              </li>
            </ul>
            <div class="add-row">
              <input
                v-model="newSubtask"
                placeholder="Tambah subtask..."
                @keydown.enter.prevent="addSubtask"
              />
              <button @click="addSubtask">
                <IonIcon :icon="addOutline" /> Add
              </button>
            </div>
          </section>

          <section class="block">
            <h4 class="block-title">Activity</h4>
            <div class="comment-box">
              <input
                v-model="comment"
                placeholder="Tulis komentar..."
                @keydown.enter.prevent="addComment"
              />
              <button @click="addComment">Kirim</button>
            </div>
            <ul class="activity-list">
              <li v-for="item in task.activity || []" :key="item.id">
                <span class="activity-avatar">A</span>
                <div>
                  <span>{{ item.text }}</span
                  ><small>{{ item.time }}</small>
                </div>
              </li>
              <li v-if="!task.activity?.length" class="muted">
                Belum ada aktivitas.
              </li>
            </ul>
          </section>
        </div>

        <aside class="side-col">
          <button
            class="complete-btn"
            :class="{done: task.completed}"
            @click="task.completed = !task.completed"
          >
            <IonIcon :icon="checkmarkCircleOutline" />
            {{ task.completed ? 'Completed' : 'Mark Complete' }}
          </button>

          <div v-if="task.cover" class="cover-preview">
            <img :src="task.cover" alt="Cover task" />
            <button @click="task.cover = ''">
              <IonIcon :icon="closeOutline" /> Hapus cover
            </button>
          </div>
          <button class="cover-btn" @click="coverInput.click()">
            <IonIcon :icon="imageOutline" /> Add Cover Image
          </button>
          <input
            ref="coverInput"
            type="file"
            accept="image/*"
            hidden
            @change="onCover"
          />

          <div class="side-field">
            <label>Assignee</label>
            <div class="assignee-grid">
              <button
                v-for="member in store.members"
                :key="member.id"
                class="assignee-chip"
                :class="{selected: (task.assignees || []).includes(member.id)}"
                @click="toggleAssignee(member.id)"
              >
                <span class="mini-avatar" :style="{background: member.color}">{{
                  member.initials
                }}</span>
                {{ member.name }}
              </button>
            </div>
          </div>

          <div class="side-field">
            <label>Due Date</label>
            <button class="value-btn" @click="dateOpen = !dateOpen">
              <IonIcon :icon="calendarOutline" />
              {{ formatDate(task.dueDate) || 'Pilih tanggal' }}
            </button>
            <div v-if="dateOpen" class="date-panel">
              <IonDatetime
                :value="task.dueDate"
                presentation="date"
                :show-default-buttons="true"
                done-text="OK"
                cancel-text="Batal"
                @ionChange="
                  task.dueDate = String($event.detail.value || '').slice(0, 10)
                "
              />
              <button
                class="clear-date"
                @click="
                  task.dueDate = '';
                  dateOpen = false;
                "
              >
                Hapus tanggal
              </button>
            </div>
          </div>

          <div class="side-field">
            <label for="task-board">Board</label>
            <select id="task-board" v-model="task.board">
              <option value="Product Roadmap">Product Roadmap</option>
              <option value="Marketing">Marketing</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          <div class="side-field">
            <label for="task-column">Column</label>
            <select id="task-column" v-model="form.columnId">
              <option
                v-for="column in store.columns"
                :key="column.id"
                :value="column.id"
              >
                {{ column.name }}
              </option>
            </select>
          </div>

          <div class="side-field">
            <label for="task-label">Label</label>
            <select id="task-label" v-model="task.label">
              <option
                v-for="label in store.labels"
                :key="label.id"
                :value="label.id"
              >
                {{ label.name }}
              </option>
            </select>
          </div>

          <div class="side-field">
            <label for="task-priority">Priority</label>
            <select id="task-priority" v-model="task.priority">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </aside>
      </div>

      <footer class="modal-foot">
        <button v-if="!isNew" class="delete-btn" @click="emit('delete')">
          <IonIcon :icon="trashOutline" /> Delete task
        </button>
        <span v-else />
        <div class="foot-actions">
          <button class="discard-btn" @click="emit('discard')">Discard</button>
          <button class="save-btn" @click="submit">Save</button>
        </div>
      </footer>
    </div>
  </IonModal>
</template>

<style>
.task-modal {
  --width: min(980px, 94vw);
  --height: min(760px, 92vh);
  --border-radius: 14px;
  --box-shadow: 0 24px 60px rgba(9, 30, 66, 0.35);
}

@media (max-width: 760px) {
  .task-modal {
    --width: 100vw;
    --height: 100dvh;
    --border-radius: 0;
  }
}
</style>

<style scoped>
.modal-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--c-surface);
  color: var(--c-text);
}
.modal-top {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--c-border);
}
.top-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.top-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--c-accent-soft);
  color: var(--c-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.top-title div {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.top-title strong {
  font-size: 15px;
}
.top-title small {
  font-size: 11px;
  color: var(--c-text-muted);
}
.close-btn {
  border: 0;
  background: transparent;
  color: var(--c-text-muted);
  font-size: 22px;
  padding: 4px;
  display: inline-flex;
  border-radius: 6px;
}
.close-btn:hover {
  background: var(--c-surface-alt);
}

.modal-body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 282px;
}
.main-col,
.side-col {
  overflow-y: auto;
  padding: 20px;
}
.side-col {
  border-left: 1px solid var(--c-border);
  background: #fafbfc;
}
.block {
  margin-bottom: 22px;
}
.block:last-child {
  margin-bottom: 0;
}
.field-label,
.side-field > label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-muted);
  margin-bottom: 7px;
}
.title-input,
.desc-input {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 9px 10px;
  resize: vertical;
  background: transparent;
  outline: none;
}
.title-input {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}
.title-input:hover,
.desc-input:hover {
  background: var(--c-surface-alt);
}
.title-input:focus,
.desc-input:focus {
  background: var(--c-surface);
  border-color: var(--c-accent);
  box-shadow: 0 0 0 1px var(--c-accent);
}
.desc-input {
  font-size: 14px;
}
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.block h4 {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.block-title {
  margin-bottom: 10px !important;
}
.count {
  font-size: 11px;
  color: var(--c-text-muted);
  background: var(--c-surface-alt);
  border-radius: 10px;
  padding: 1px 7px;
  font-weight: 600;
}
.text-btn {
  border: 0;
  background: transparent;
  color: var(--c-accent);
  font-size: 12px;
  font-weight: 600;
}
.dropzone {
  border: 1px dashed var(--c-border);
  border-radius: 8px;
  padding: 18px;
  text-align: center;
  color: var(--c-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.dropzone ion-icon {
  font-size: 24px;
}
.dropzone small {
  font-size: 11px;
}
.dropzone.dragging {
  border-color: var(--c-accent);
  background: var(--c-accent-soft);
}
.attachment-list,
.checklist,
.activity-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
}
.attachment-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 6px;
  background: var(--c-surface-alt);
  margin-bottom: 5px;
  font-size: 13px;
}
.file-icon {
  color: var(--c-accent);
  font-size: 16px;
  display: inline-flex;
}
.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.attachment-list button,
.row-del {
  border: 0;
  background: transparent;
  color: var(--c-text-muted);
  font-size: 16px;
  padding: 2px;
  display: inline-flex;
}
.attachment-list button:hover,
.row-del:hover {
  color: var(--c-danger);
}

.progress-block {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 11px;
  color: var(--c-text-muted);
}
.progress-track {
  flex: 1;
  height: 8px;
  border-radius: 8px;
  background: var(--c-surface-alt);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #579dff;
  border-radius: 8px;
  transition: width 0.3s ease;
}
.progress-fill.complete {
  background: var(--c-success);
}
.checklist li {
  display: flex;
  align-items: center;
  gap: 6px;
}
.check-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 4px;
  cursor: pointer;
  font-size: 13px;
}
.check-item input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.check-item .box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--c-border);
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-accent);
  font-size: 16px;
  flex: 0 0 auto;
}
.check-item.checked .box {
  border-color: var(--c-accent);
}
.check-item.checked .check-text {
  text-decoration: line-through;
  color: var(--c-text-muted);
}
.add-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.add-row input,
.comment-box input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
  background: var(--c-surface);
}
.add-row input:focus,
.comment-box input:focus {
  border-color: var(--c-accent);
}
.add-row button,
.comment-box button {
  border: 0;
  background: var(--c-accent);
  color: #fff;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.comment-box {
  display: flex;
  gap: 6px;
}
.activity-list li {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  padding: 8px 0;
  font-size: 13px;
}
.activity-list li div {
  display: flex;
  flex-direction: column;
}
.activity-list small {
  color: var(--c-text-muted);
  font-size: 11px;
}
.activity-list .muted {
  color: var(--c-text-muted);
}
.activity-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.complete-btn {
  width: 100%;
  height: 38px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-bottom: 16px;
}
.complete-btn:hover {
  background: var(--c-surface-alt);
}
.complete-btn.done {
  color: var(--c-success);
  background: #dcfff1;
  border-color: transparent;
}
.cover-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}
.cover-preview img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}
.cover-preview button {
  position: absolute;
  bottom: 6px;
  right: 6px;
  border: 0;
  border-radius: 5px;
  background: rgba(9, 30, 66, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 4px 7px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.cover-btn {
  width: 100%;
  height: 36px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-bottom: 20px;
}
.cover-btn:hover {
  background: var(--c-surface-alt);
}
.side-field {
  margin-bottom: 16px;
}
.assignee-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.assignee-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  border-radius: 16px;
  padding: 3px 8px 3px 3px;
  font-size: 11px;
}
.assignee-chip.selected {
  border-color: var(--c-accent);
  background: var(--c-accent-soft);
  color: var(--c-accent);
}
.mini-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.value-btn {
  width: 100%;
  min-height: 36px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-surface);
  color: var(--c-text);
  font-size: 13px;
  text-align: left;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.value-btn:hover {
  background: var(--c-surface-alt);
}
.date-panel {
  margin-top: 6px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  overflow: hidden;
}
.date-panel ion-datetime {
  --background: var(--c-surface);
  --color: var(--c-text);
  max-height: 300px;
}
.clear-date {
  width: 100%;
  border: 0;
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-danger);
  font-size: 12px;
  padding: 8px;
}
.side-field select {
  width: 100%;
  height: 36px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-surface);
  color: var(--c-text);
  font-size: 13px;
  padding: 0 8px;
  outline: none;
}
.side-field select:focus {
  border-color: var(--c-accent);
}

.modal-foot {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
}
.delete-btn {
  border: 0;
  background: transparent;
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 6px;
}
.delete-btn:hover {
  background: #ffdedb;
}
.foot-actions {
  display: flex;
  gap: 8px;
}
.discard-btn,
.save-btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}
.discard-btn {
  border: 1px solid var(--c-border);
  background: var(--c-surface);
}
.discard-btn:hover {
  background: var(--c-surface-alt);
}
.save-btn {
  border: 0;
  background: var(--c-accent);
  color: #fff;
}
.save-btn:hover {
  background: var(--c-accent-hover);
}

@media (max-width: 760px) {
  .modal-body {
    grid-template-columns: 1fr;
  }
  .side-col {
    border-left: 0;
    border-top: 1px solid var(--c-border);
  }
  .modal-top {
    padding: calc(12px + env(safe-area-inset-top)) 14px 12px;
  }
  .modal-foot {
    padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
  }
  .main-col,
  .side-col {
    padding: 14px;
  }
  .title-input {
    font-size: 18px;
  }
}

@media (max-width: 420px) {
  .modal-foot {
    flex-wrap: wrap;
  }
  .delete-btn {
    padding-left: 0;
  }
  .foot-actions {
    width: 100%;
  }
  .foot-actions button {
    flex: 1;
  }
  .assignee-chip {
    font-size: 10px;
  }
}
</style>
