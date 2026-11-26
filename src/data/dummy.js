export const workspace = {
  name: 'Product Space',
  subtitle: 'Team Workspace',
}

export const members = [
  { id: 'u1', name: 'Alya', initials: 'AL', color: '#7c3aed' },
  { id: 'u2', name: 'Bima', initials: 'BI', color: '#0891b2' },
  { id: 'u3', name: 'Citra', initials: 'CI', color: '#db2777' },
  { id: 'u4', name: 'Dimas', initials: 'DI', color: '#ea580c' },
  { id: 'u5', name: 'Eka', initials: 'EK', color: '#16a34a' },
  { id: 'u6', name: 'Fajar', initials: 'FA', color: '#4f46e5' },
  { id: 'u7', name: 'Gita', initials: 'GI', color: '#ca8a04' },
]

export const labels = [
  { id: 'feature', name: 'Feature', color: '#216e4e', bg: '#dcfff1' },
  { id: 'bug', name: 'Bug', color: '#ae2e24', bg: '#ffdedb' },
  { id: 'issue', name: 'Issue', color: '#7f5f01', bg: '#fff7d6' },
  { id: 'undefined', name: 'Undefined', color: '#44546f', bg: '#dcdfe4' },
]

export const columns = [
  { id: 'todo', name: 'To do' },
  { id: 'doing', name: 'Doing' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' },
  { id: 'rework', name: 'Rework' },
]

const sampleCover =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='170'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%236366f1'/%3E%3Cstop offset='1' stop-color='%23c084fc'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ccircle cx='390' cy='40' r='70' fill='%23ffffff' opacity='0.12'/%3E%3Ccircle cx='70' cy='150' r='55' fill='%23ffffff' opacity='0.12'/%3E%3C/svg%3E"

function task(id, title, extra = {}) {
  return {
    id,
    title,
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
    ...extra,
  }
}

const checklist = (items) =>
  items.map(([text, done], i) => ({ id: `c${Date.now()}${i}`, text, done }))

export const tasksByColumn = {
  todo: [
    task('t1', 'Redesign landing page hero section', {
      label: 'feature',
      assignees: ['u1', 'u3'],
      cover: sampleCover,
      dueDate: '2026-12-02',
      priority: 'High',
      description: 'Perbarui hero dengan ilustrasi baru dan CTA yang lebih kontras.',
      checklist: checklist([
        ['Riset referensi', true],
        ['Buat wireframe', true],
        ['Desain final', false],
        ['Review tim', false],
      ]),
      attachments: [{ id: 'a1', name: 'hero-reference.fig' }],
      activity: [{ id: 'ac1', text: 'Alya menambahkan task ini', time: '2 hari lalu' }],
    }),
    task('t2', 'Fix login redirect loop on Safari', {
      label: 'bug',
      assignees: ['u2'],
      dueDate: '2026-11-24',
      priority: 'High',
      description: 'Safari mengulang redirect setelah login berhasil.',
      checklist: checklist([['Reproduce bug', true], ['Patch session', false]]),
    }),
    task('t3', 'Draft documentation for API v2', {
      label: 'issue',
      assignees: ['u4', 'u5'],
      priority: 'Low',
      description: 'Dokumentasi endpoint baru untuk release berikutnya.',
    }),
  ],
  doing: [
    task('t4', 'Build notification preference settings', {
      label: 'feature',
      assignees: ['u1', 'u2', 'u6'],
      dueDate: '2026-11-28',
      priority: 'Medium',
      checklist: checklist([
        ['Schema pengaturan', true],
        ['UI toggle', true],
        ['Simpan ke store', false],
        ['Testing', false],
        ['QA', false],
      ]),
      attachments: [{ id: 'a2', name: 'notification-spec.pdf' }, { id: 'a3', name: 'tokens.json' }],
    }),
    task('t5', 'Optimize dashboard chart rendering', {
      label: 'issue',
      assignees: ['u3'],
      dueDate: '2026-11-27',
      description: 'Chart lambat saat data lebih dari 10k baris.',
      checklist: checklist([['Profile', true], ['Virtualisasi', false]]),
    }),
  ],
  review: [
    task('t6', 'Add keyboard shortcut for quick search', {
      label: 'feature',
      assignees: ['u6'],
      dueDate: '2026-11-26',
      priority: 'Medium',
      checklist: checklist([['Implementasi', true], ['Dokumentasi', true]]),
    }),
    task('t7', 'Correct invoice tax calculation', {
      label: 'bug',
      assignees: ['u4', 'u7'],
      dueDate: '2026-11-25',
      priority: 'High',
      description: 'Pajak dihitung dua kali untuk transaksi internasional.',
    }),
  ],
  done: [
    task('t8', 'Setup CI pipeline', {
      label: 'feature',
      assignees: ['u5'],
      dueDate: '2026-11-20',
      priority: 'Medium',
      completed: true,
      checklist: checklist([['Workflow', true], ['Cache', true]]),
    }),
    task('t9', 'Update brand color tokens', {
      label: 'undefined',
      assignees: ['u1', 'u7'],
      priority: 'Low',
      completed: true,
    }),
  ],
  rework: [
    task('t10', 'Mobile nav overlaps safe area', {
      label: 'bug',
      assignees: ['u2'],
      dueDate: '2026-11-29',
      priority: 'High',
      description: 'Perlu penyesuaian setelah review QA.',
      checklist: checklist([['Perbaiki padding', false], ['Uji iPhone', false]]),
    }),
  ],
}
