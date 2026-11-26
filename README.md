# Task Management Board

Aplikasi kanban ala Trello berbasis Vue 3. Seluruh data disimpan di browser melalui
Pinia + `localStorage`, tanpa backend. Tampilan mengikuti referensi board dan modal
detail task (desktop dua kolom, mobile satu kolom).

## Instalasi

```bash
npm install
```

## Menjalankan

```bash
# mode development
npm run dev

# build produksi
npm run build

# pratinjau hasil build
npm run preview
```

Buka URL yang ditampilkan Vite (biasanya `http://localhost:5173`).

## Tech stack

- **Vue 3** (`<script setup>`, Composition API) + **Vite**
- **Pinia** untuk state management
- **@ionic/vue** untuk `IonModal`, `IonDatetime`, `IonApp`, dan `toastController`
- **ionicons** untuk ikon
- **vuedraggable@next** untuk drag & drop antar kolom
- JavaScript murni (tanpa TypeScript), CSS scoped + CSS variables
- Tidak memakai `vue-router`

## Fitur

- Board 5 kolom default: **To do, Doing, Review, Done, Rework** + tombol **Add new List**.
- Header workspace: avatar anggota (+N), **Invite**, **Filter**, **Export/Import**, dan kolom **Search Tasks**.
- Task card: label pill (Feature / Bug / Issue / Undefined), progress bar checklist,
  judul, badge due date, jumlah checklist, jumlah attachment, tumpukan avatar, dan cover image opsional.
- Pencarian berdasarkan judul; filter berdasarkan assignee, label, dan due date
  (terlewat / hari ini / 7 hari ke depan / tanpa tanggal).
- CRUD task: buat lewat tombol `+` pada kolom, baca di card, ubah di modal, hapus dengan konfirmasi.
- Modal detail task:
  - **Mark Complete**
  - **Add Cover Image** (upload gambar, disimpan sebagai base64 di localStorage)
  - Judul, Assignee (multi pilih), Due Date (`IonDatetime`), Board, Column, Label, Priority
  - Description, Attachments (drag & drop / browse; demo hanya menyimpan nama file)
  - Check List dengan progress bar, tambah/centang/hapus subtask
  - Activity (komentar sederhana)
  - tombol **Discard** dan **Save**
- Drag & drop task antar kolom; urutan tersimpan otomatis ke localStorage.
- Export/Import seluruh board sebagai file JSON.
- Toast Ionic saat create, update, delete, export, dan import.
- Animasi hover card, transisi modal, dan efek saat drag.
- Responsif untuk desktop dan mobile.

## Struktur

```
src/
├── App.vue                 # layout board + wiring modal
├── main.js                 # mount app + plugin IonicVue
├── style.css               # CSS variables & reset global
├── data/dummy.js           # data awal (workspace, member, label, kolom, task)
├── stores/board.js         # Pinia store + localStorage + filter + export/import
└── components/
    ├── BoardHeader.vue     # header, pencarian, filter, export/import
    ├── BoardColumn.vue     # kolom + draggable
    ├── TaskCard.vue        # kartu task
    └── TaskModal.vue       # modal detail task
```

## Catatan

- Kunci localStorage: `task-board:v1`. Hapus kunci ini dari DevTools untuk
  mengembalikan data ke dummy awal.
- Saat filter/search aktif, drag & drop dinonaktifkan agar task yang tersembunyi
  tidak ikut tertimpa saat urutan disimpan.
- File lampiran pada demo hanya disimpan namanya, bukan isinya, supaya localStorage
  tidak cepat penuh.
