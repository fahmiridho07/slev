import { idExtras } from "./complete/idExtras";
import type { AppStrings } from "./types";

export const id: AppStrings = {
  tabs: {
    home: "Beranda",
    money: "Uang",
    budget: "Anggaran"
  },
  brand: {
    tagline: "Memori pengeluaran",
    settings: "Pengaturan"
  },
  boot: {
    preparing: "Menyiapkan memori lokal...",
    loadingFinance: "Memuat data keuangan...",
    failed: "Tidak bisa memuat data lokal. Tarik untuk memuat ulang atau mulai ulang aplikasi."
  },
  common: {
    back: "Kembali",
    cancel: "Batal",
    delete: "Hapus",
    done: "Selesai",
    gotIt: "Mengerti",
    progressA11y: "{label}: {percent} persen",
    pullToRefresh: "Tarik untuk memuat ulang",
    undo: "Urungkan",
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
    closeSheet: "Tutup lembar",
    edit: "Ubah",
    selectAccount: "Pilih akun {label}",
    swipeOrLongPressDelete: "Geser kiri atau tekan lama untuk menghapus",
    swipeToDelete: "Geser kiri untuk menghapus"
  },
  capture: {
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
    billsReservedHint: "Tagihan rutin sudah dicadangkan — nggak perlu dicatat di sini.",
    reorderHint: "Tahan untuk atur ulang",
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
    contextLabels: {
      Meal: "Makan",
      Coffee: "Kopi",
      Transport: "Transport",
      Groceries: "Belanja",
      Bills: "Tagihan",
      Treat: "Jajan",
      Home: "Rumah",
      Other: "Lainnya"
    },
    notePlaceholder: "Catatan singkat, opsional",
    addNote: "Tambah catatan",
    saveExpense: "Simpan pengeluaran",
    saveIncome: "Simpan pemasukan",
    saveTransfer: "Simpan transfer",
    savedButton: "Tersimpan",
    savedBannerExpense: "{amount} tersimpan",
    savedBannerExpenseNamed: "{amount} tersimpan · {name}",
    savedBannerIncome: "{amount} pemasukan tersimpan",
    savedBannerIncomeNamed: "{amount} pemasukan tersimpan · {name}",
    savedBannerTransfer: "{amount} dipindahkan · {from} → {to}",
    saveAsShortcut: "Simpan sebagai pintasan",
    saveAsShortcutA11y: "Simpan sebagai pintasan",
    amountA11y: "Jumlah",
    amountPlaceholder: "0",
    currencyPrefix: "Rp",
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
    reduceMotionLabel: "Animasi",
    reduceMotionOff: "Penuh",
    reduceMotionOn: "Dikurangi",
    reduceMotionSystem: "Sistem",
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
      intro: "Tagihan bulanan yang diharapkan tiap siklus. Muncul di Ringkasan saat pembayaran mendekat.",
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
    appearanceTab: "Tampilan",
    accountsTab: "Akun",
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
      backupCopy: "Ekspor data sebagai JSON, pilih file cadangan, atau tempel JSON untuk memulihkan.",
      export: "Ekspor cadangan JSON",
      importChooseFile: "Pilih file cadangan",
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
      title: "Aksi daftar aktivitas",
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
      body: "Geser kiri untuk menyembunyikan kategori apa pun. Ketuk kategori kustom untuk mengganti nama."
    }
  },
  home: {
    safeToSpend: {
      billsReserve: "Disisihkan buat tagihan: {amount}",
      billsExceedBalance: "Tagihanmu lebih besar dari saldo saat ini (kurang {amount}).",
      heroLabel: "Aman dibelanjain hari ini",
      balanceAnchor: "Saldo saat ini {amount}",
      typicalDaily: "Rata-rata harianmu {amount}",
      typicalDailyUncertain: "estimasi kasar, butuh lebih banyak data",
      daysLeft: "{count} hari lagi",
      checkPurchase: "Bisa beli sesuatu?",
      checkPurchaseA11y: "Cek apakah pembelian ini masih aman",
      sheetTitle: "Bisa beli ini?",
      purchasePlaceholder: "Harga barang",
      affordable: "Bisa. Setelah ini, aman harianmu jadi {amount} sampai gajian.",
      notAffordable: "Belum aman — bakal makan jatah harianmu. Kurang {amount}."
    }
  },
  activity: {
    sectionTitle: "Aktivitas",
    edit: {
      amount: "Jumlah",
      label: "Label",
      source: "Sumber",
      receivedIn: "Diterima di",
      paidFrom: "Dibayar dari",
      note: "Catatan",
      save: "Simpan"
    },
    searchA11y: "Cari aktivitas",
    searchPlaceholder: "Cari label, konteks, atau jumlah",
    emptyText: "Belum ada pengeluaran tersimpan.",
    emptyAction: "Catat pengeluaran pertama",
    searchNoResults: "Tidak ada aktivitas yang cocok dengan pencarian.",
    editSheetTitle: "Edit entri",
    editSheetTitleNamed: "Edit {title}"
  },
  memory: {
    ...idExtras.memory
  },
  budget: {
    ...idExtras.budget
  },
  patterns: {
    tabs: {
      recap: "Ringkasan",
      spending: "Pengeluaran",
      accounts: "Akun"
    },
    tracker: {
      cashflow: "Arus kas",
      cashflowEmptyMonth: "Belum ada pemasukan atau pengeluaran tercatat bulan ini.",
      cashflowEarlyNew: "Catat pemasukan atau pengeluaran — arus kas bulan ini akan terbentuk.",
      cashflowEarlyBuilding: "Beberapa entri sudah masuk — arus kas terisi seiring bulan berjalan.",
      expenseEmptyMonth: "Belum ada pengeluaran bulan ini.",
      expenseEarlyNew: "Beberapa pengeluaran tercatat — rincian kategori berkembang seiring kamu mencatat.",
      expenseEarlyBuilding: "Pengeluaran masih ringan — lebih banyak entri akan memperjelas tampilan ini.",
      incomeEmptyMonth: "Belum ada pemasukan tercatat bulan ini.",
      incomeEarlyNew: "Beberapa pemasukan tercatat — sumber terisi seiring kamu mencatat.",
      incomeEarlyBuilding: "Pemasukan masih ringan — lebih banyak entri akan memperjelas tampilan ini."
    },
    hero: {
      breakdownHint: "{amount} pemasukan tercatat bulan ini",
      breakdownHintMonth: "{amount} pemasukan tercatat di {month}",
      breakdownKicker: "Pengeluaran bulan ini",
      breakdownKickerMonth: "Pengeluaran di {month}",
      accountsHintWithTrend: "Tren kekayaan bersih tersedia di bawah",
      accountsHintNoTrend: "Tambahkan snapshot saldo untuk melihat tren",
      accountsKicker: "Estimasi saldo",
      recapHintWithPatterns: "Ketuk pola untuk memberi umpan balik cepat",
      recapHintEmpty: "Pola muncul setelah beberapa momen tersimpan",
      recapKicker: "Ringkasan pengeluaran",
      recapValue: "{count} pola"
    },
    recap: {
      expensesProgress: "{count} dari 6 pengeluaran terbaru tercatat",
      feedbackKeep: "Pertahankan",
      feedbackLessOften: "Lebih jarang",
      feedbackLockedHint: "Catat minimal 6 pengeluaran dalam 14 hari terakhir untuk menjawab pertanyaan ringkasan.",
      feedbackNotSure: "Tidak yakin",
      feedbackSaved: "Terima kasih — kami akan mengingatnya."
    },
    recapEmptyAction: "Catat pengeluaran",
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
    activityDeleteTitle: "Hapus entri?",
    activityDeleteBody: "{title} akan dihapus dari Ringkasan. Total anggaran dan analisis diperbarui otomatis."
  },
  toasts: idExtras.toasts,
  analysis: idExtras.analysis,
  storage: idExtras.storage
};