import { idExtras } from "./complete/idExtras";
import type { AppStrings } from "./types";

export const id: AppStrings = {
  tabs: {
    home: "Beranda",
    memory: "Memori",
    budget: "Anggaran",
    analysis: "Analisis"
  },
  brand: {
    tagline: "Memori pengeluaran",
    settings: "Pengaturan"
  },
  boot: {
    preparing: "Menyiapkan memori lokal..."
  },
  common: {
    back: "Kembali",
    cancel: "Batal",
    delete: "Hapus",
    gotIt: "Mengerti",
    openSettings: "Buka pengaturan",
    save: "Simpan",
    import: "Impor",
    reset: "Atur ulang",
    clear: "Hapus semua",
    active: "Aktif",
    paused: "Dijeda",
    amount: "Jumlah",
    account: "Akun",
    income: "Pemasukan",
    expense: "Pengeluaran",
    closeSheet: "Tutup lembar"
  },
  capture: {
    fabLabel: "Catat cepat",
    sheetTitle: "Catat cepat",
    kicker: "Catat cepat",
    quickAdd: "Tambah cepat",
    from: "Dari",
    to: "Ke",
    sourcePlaceholder: "Sumber, opsional",
    labelPlaceholder: "Label, opsional",
    receivedIn: "Diterima di",
    paidFrom: "Dibayar dari",
    noCategories: "Belum ada kategori pengeluaran aktif. Tambahkan dulu sebelum menyimpan.",
    openSettings: "Buka Pengaturan",
    context: "Konteks",
    contextHints: {
      Meal: "Makanan, camilan, makan siang",
      Coffee: "Kopi atau teh",
      Transport: "Ojek, bensin, parkir",
      Groceries: "Kebutuhan harian",
      Bills: "Pembayaran rutin",
      Treat: "Hal kecil yang menyenangkan",
      Home: "Kebutuhan rumah",
      Other: "Lainnya",
      custom: "Kategori pengeluaran kustom"
    },
    notePlaceholder: "Catatan singkat, opsional",
    addNote: "Tambah catatan",
    saveExpense: "Simpan pengeluaran",
    saveIncome: "Simpan pemasukan",
    saveTransfer: "Simpan transfer",
    saveAsShortcut: "Simpan sebagai pintasan",
    saveAsShortcutA11y: "Simpan sebagai pintasan",
    fewerOptions: "Lebih sedikit opsi",
    moreOptions: "Lebih banyak opsi",
    amountA11y: "Jumlah",
    applyShortcutA11y: "Terapkan pintasan {label}",
    removeShortcutA11y: "Hapus pintasan {label}",
    repeatA11y: "Ulangi {label}",
    income: "Pemasukan",
    type: {
      lead: "Apa yang ingin dicatat?",
      copy: "Pilih jenis momen uang yang ingin disimpan.",
      expenseLabel: "Pengeluaran",
      expenseHint: "Pengeluaran yang ingin dilacak",
      incomeLabel: "Pemasukan",
      incomeHint: "Gaji, refund, atau pemasukan",
      transferLabel: "Transfer",
      transferHint: "Pindahkan uang antar akun"
    }
  },
  appearance: {
    label: "Tampilan",
    light: "Terang",
    dark: "Gelap",
    system: "Sistem"
  },
  locale: {
    label: "Bahasa",
    english: "English",
    indonesian: "Bahasa Indonesia"
  },
  settings: {
    bills: {
      title: "Tagihan rutin",
      intro: "Tagihan bulanan yang diharapkan tiap siklus. Muncul di Beranda saat pembayaran mendekat.",
      add: "Tambah tagihan",
      edit: "Edit tagihan",
      nameA11y: "Nama tagihan",
      namePlaceholder: "Nama tagihan, mis. Internet",
      amountA11y: "Jumlah tagihan",
      amount: "Jumlah",
      dayPlaceholder: "Tanggal bulan (1-31)",
      active: "Aktif",
      paused: "Dijeda",
      save: "Simpan tagihan",
      empty: "Belum ada tagihan rutin. Tambahkan saat ada pembayaran tetap bulanan.",
      rowMeta: "{context} · tgl {day}{account} · {status}",
      editA11y: "Edit tagihan {label}",
      deleteTitle: "Hapus tagihan rutin?",
      deleteBody: "{label} akan dihapus dari tagihan rutin. Pembayaran tercatat tetap ada di riwayat."
    },
    billsTab: "Tagihan",
    categoriesTab: "Kategori",
    dataTab: "Data",
    heroKicker: "Pengaturan",
    heroHint: "{accounts} akun · {bills} tagihan rutin",
    heroValue: "{count} memori",
    categories: {
      edit: "Edit kategori",
      editA11y: "Edit kategori {label}",
      add: "Tambah kategori pengeluaran",
      nameA11y: "Nama kategori",
      placeholder: "mis. Kesehatan, Langganan, Hobi",
      save: "Simpan kategori",
      default: "Bawaan",
      custom: "Kustom",
      empty: "Belum ada kategori aktif. Tambahkan kategori di atas untuk mulai menetapkan pengeluaran."
    },
    data: {
      healthTitle: "Kesehatan data",
      healthCopy: "Beberapa data terlihat rusak. Ekspor cadangan sebelum mengatur ulang.",
      resetThis: "Atur ulang data ini",
      backupTitle: "Cadangan",
      backupCopy: "Ekspor data sebagai JSON, atau tempel cadangan untuk memulihkan.",
      export: "Ekspor cadangan JSON",
      importPlaceholder: "Tempel cadangan JSON Slev di sini",
      importA11y: "JSON cadangan",
      import: "Impor cadangan",
      clearAll: "Hapus memori keuangan lokal",
      resetTitle: "Atur ulang {label}?",
      resetTitleFallback: "Atur ulang data?",
      resetBody: "Ini hanya menghapus {label} di perangkat ini. Ekspor cadangan dulu jika ingin menyimpan salinan.",
      resetConfirm: "Atur ulang"
    },
    importTitle: "Impor cadangan?",
    importBody: "Impor akan mengganti data keuangan lokal saat ini dengan cadangan yang ditempel.",
    importConfirm: "Impor"
  },
  listHints: {
    memory: {
      title: "Aksi daftar memori",
      body: "Ketuk momen untuk mengedit di lembar bawah. Geser kiri untuk menghapus."
    },
    balance_accounts: {
      title: "Aksi daftar akun",
      body: "Ketuk akun untuk mengedit nama atau jenis. Geser kiri untuk menghapus akun kustom."
    },
    goals: {
      title: "Aksi target tabungan",
      body: "Ketuk kartu target untuk mengedit jumlah. Geser kiri untuk menghapus target."
    },
    recurring_bills: {
      title: "Aksi tagihan rutin",
      body: "Ketuk tagihan untuk mengedit jadwal dan jumlah. Geser kiri untuk menghapus tagihan."
    },
    settings_categories: {
      title: "Aksi daftar kategori",
      body: "Ketuk kategori kustom untuk mengganti nama. Geser kiri untuk menghapusnya."
    }
  },
  home: {
    pulse: {
      safeToSpendToday: "Aman dibelanjakan hari ini",
      setMonthlyPlan: "Buat rencana bulanan",
      setMonthlyPlanA11y: "Buat rencana bulanan",
      setMonthlyPlanHint: "Buat rencana bulanan untuk melihat ini",
      netLeft: "Sisa bersih bulan ini",
      spending: "Pengeluaran",
      estBalance: "Est. saldo",
      runwayMonths: "~{count} bulan runway",
      runwayHint: "Tambahkan beberapa pengeluaran untuk estimasi runway",
      savedTowardGoals: "Disimpan untuk target: {saved} dari {target}",
      monthlySavingsTarget: "Target tabungan bulanan: {amount}"
    },
    bills: {
      comingUp: "Akan datang",
      empty: "Tidak ada tagihan dalam dua minggu ke depan. Tagihan rutin bisa ditambahkan di Pengaturan.",
      horizonTotal: "{amount} dalam 14 hari",
      dueToday: "jatuh tempo hari ini",
      dueTomorrow: "jatuh tempo besok",
      dueInDays: "jatuh tempo {count} hari lagi",
      logPayment: "Catat pembayaran"
    }
  },
  memory: {
    edit: {
      amount: "Jumlah",
      label: "Label",
      source: "Sumber",
      receivedIn: "Diterima di",
      paidFrom: "Dibayar dari",
      note: "Catatan",
      save: "Simpan"
    },
    heroKicker: "Memori pengeluaran",
    heroHintWithCount: "{count} momen tersimpan bulan ini",
    heroHintEmpty: "Pengeluaran tersimpan muncul di sini setelah pencatatan",
    searchA11y: "Cari memori",
    searchPlaceholder: "Cari label, konteks, atau jumlah",
    emptyText: "Belum ada memori pengeluaran.",
    emptyAction: "Ke Beranda",
    searchNoResults: "Tidak ada memori yang cocok dengan pencarian.",
    editSheetTitle: "Edit memori",
    editSheetTitleNamed: "Edit {title}",
    deleteTitle: "Hapus memori?",
    ...idExtras.memory
  },
  budget: {
    tabs: {
      plan: "Rencana",
      balance: "Saldo",
      goals: "Target"
    },
    hero: {
      balanceHint: "Dari snapshot ditambah pergerakan tercatat",
      balanceKicker: "Estimasi saldo",
      goalsHint: "{count} target berjalan",
      goalsKicker: "Disimpan untuk target",
      goalsEmptyHint: "Tambahkan target saat siap",
      goalsEmptyKicker: "Target tabungan",
      flexibleSpent: "{amount} fleksibel terpakai bulan ini",
      flexibleRemaining: "Sisa fleksibel",
      noPlanAction: "Mulai dari rencana bulanan",
      noPlanHint: "Pemasukan, biaya tetap, dan target tabungan",
      noPlanKicker: "Rencana bulanan"
    },
    plan: {
      allocationDetails: "Detail alokasi",
      categoryLimitsOptional: "Batas kategori (opsional)"
    },
    ...idExtras.budget
  },
  patterns: {
    tabs: {
      recap: "Ringkasan",
      spending: "Pengeluaran",
      accounts: "Akun"
    },
    hero: {
      breakdownHint: "{amount} pemasukan tercatat bulan ini",
      breakdownKicker: "Pengeluaran bulan ini",
      accountsHintWithTrend: "Tren kekayaan bersih tersedia di bawah",
      accountsHintNoTrend: "Tambahkan snapshot saldo untuk melihat tren",
      accountsKicker: "Estimasi saldo",
      recapHintWithPatterns: "Ketuk pola untuk memberi umpan balik cepat",
      recapHintEmpty: "Pola muncul setelah beberapa momen tersimpan",
      recapKicker: "Ringkasan pengeluaran",
      recapValue: "{count} pola"
    },
    recap: {
      feedbackKeep: "Pertahankan",
      feedbackLessOften: "Lebih jarang",
      feedbackNotSure: "Tidak yakin"
    },
    ...idExtras.patterns
  },
  dialogs: {
    clearAllTitle: "Hapus memori keuangan lokal?",
    clearAllBody: "Ini menghapus entri, rencana, target, saldo, batas, akun, transfer, dan kategori dari perangkat ini.",
    clearAllConfirm: "Hapus semua",
    categoryDeleteDefaultTitle: "Hapus kategori bawaan?",
    categoryDeleteTitle: "Hapus kategori?",
    categoryDeleteDefault: "{label} akan hilang dari pencatatan dan batas anggaran. Memori yang ada tetap tersimpan.",
    categoryDeleteCustom: "{label} akan dihapus dari pencatatan dan batas anggaran. Memori yang ada tetap tersimpan.",
    memoryDeleteTitle: "Hapus memori?",
    memoryDeleteBody: "{title} akan dihapus dari Memori. Total anggaran dan analisis diperbarui otomatis."
  },
  toasts: idExtras.toasts,
  analysis: idExtras.analysis,
  storage: idExtras.storage
};