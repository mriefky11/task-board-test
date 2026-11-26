<script setup>
import { IonModal, IonIcon } from '@ionic/vue'
import { trashOutline } from 'ionicons/icons'

defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Hapus' },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <IonModal
    :is-open="isOpen"
    class="confirm-modal"
    @ionModalDidDismiss="emit('cancel')"
  >
    <div class="confirm-shell">
      <div class="confirm-icon"><IonIcon :icon="trashOutline" /></div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button class="cancel" @click="emit('cancel')">Batal</button>
        <button class="confirm" @click="emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </IonModal>
</template>

<style>
.confirm-modal {
  --width: min(420px, 92vw);
  --height: auto;
  --border-radius: 12px;
  --box-shadow: 0 20px 50px rgba(9, 30, 66, 0.35);
}
</style>

<style scoped>
.confirm-shell {
  padding: 24px;
  text-align: center;
  background: var(--c-surface);
  color: var(--c-text);
}
.confirm-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #ffdedb;
  color: var(--c-danger);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-shell h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
}
.confirm-shell p {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--c-text-muted);
  line-height: 1.5;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.confirm-actions button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}
.confirm-actions .cancel {
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text);
}
.confirm-actions .cancel:hover {
  background: var(--c-surface-alt);
}
.confirm-actions .confirm {
  border: 0;
  background: var(--c-danger);
  color: #fff;
}
.confirm-actions .confirm:hover {
  background: #a52d23;
}
@media (max-width: 420px) {
  .confirm-actions button {
    flex: 1;
  }
}
</style>
