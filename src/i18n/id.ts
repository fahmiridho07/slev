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
    preparing: "Menyiapkan data...",
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
    context: "Kategori",
    billSuggestions: "Saran dari tagihan rutin",
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
    changeDate: "Ubah tanggal",
    dateLabel: "Tanggal",
    pickAnotherDate: "Pilih tanggal lain",
    dateQuick: {
      today: "Hari ini",
      yesterday: "Kemarin",
      daysAgo: "{count} hari lalu"
    },
    saveExpense: "Simpan pengeluaran",
    saveIncome: "Simpan pemasukan",
    saveTransfer: "Simpan transfer",
    savedButton: "Tersimpan",
    savedBannerExpense: "{amount} tersimpan",
    savedBannerExpenseNamed: "{amount} tersimpan · {name}",
    savedBannerIncome: "{amount} pemasukan tersimpan",
    savedBannerIncomeNamed: "{amount} pemasukan tersimpan · {name}",
    savedBannerTransfer: "{amount} dipindahkan · {from} → {to}",
    savedBannerWithDate: "{message} · {date}",
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
      copy: "Pilih jenis catatan yang ingin disimpan.",
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
      intro: "Tagihan bulanan yang diharapkan tiap siklus. Yang lewat jatuh tempo juga muncul sebagai petunjuk setup di Beranda.",
      add: "Tambah tagihan",
      edit: "Edit tagihan",
      nameA11y: "Nama tagihan",
      namePlaceholder: "Nama tagihan, mis. Internet",
      amountA11y: "Jumlah tagihan",
      amount: "Jumlah",
      dayPlaceholder: "Tanggal bulan (1-31)",
      dueDayMeta: "Jatuh tempo tgl {day}",
      active: "Aktif",
      paused: "Dijeda",
      save: "Simpan tagihan",
      empty: "Belum ada tagihan rutin. Tambahkan saat ada pembayaran tetap bulanan.",

      editA11y: "Edit tagihan {label}",
      deleteTitle: "Hapus tagihan rutin?",
      deleteBody: "{label} akan dihapus dari tagihan rutin. Pembayaran tercatat tetap ada di riwayat catatan."
    },
    appearanceTab: "Tampilan",
    accountsTab: "Akun",
    billsTab: "Tagihan",
    categoriesTab: "Kategori",
    dataTab: "Data",
    heroKicker: "Pengaturan",
    heroHint: "{accounts} akun · {bills} tagihan rutin",
    heroValue: "{count} catatan tersimpan",
    categories: {
      edit: "Edit kategori",
      editA11y: "Edit kategori {label}",
      add: "Tambah kategori pengeluaran",
      nameA11y: "Nama kategori",
      placeholder: "mis. Kesehatan, Langganan, Hobi",
      save: "Simpan kategori",
      default: "Bawaan",
      custom: "Kustom",
      orderLabel: "Urutan di layar catat",
      moveEarlier: "Ke atas",
      moveLater: "Ke bawah",
      orderHint: "Mengubah urutan chip saat mencatat pengeluaran.",
      renameHint: "Ganti nama juga memperbarui catatan lama di kategori ini.",
      defaultRenameHint: "Ganti nama kategori bawaan menyembunyikan yang lama dan memperbarui catatan lama.",
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
      clearAll: "Hapus semua data lokal",
      resetTitle: "Atur ulang {label}?",
      resetTitleFallback: "Atur ulang data?",
      resetBody: "Ini hanya menghapus {label} di perangkat ini. Ekspor cadangan dulu jika ingin menyimpan salinan.",
      resetConfirm: "Atur ulang"
    },
    importTitle: "Impor cadangan?",
    importBody: "Impor akan mengganti data keuangan lokal saat ini dengan cadangan yang ditempel.",
    importConfirm: "Impor",
    payday: {
      label: "Tanggal gajian",
      helper:
        "Atur tanggal gajianmu (1–31) biar jatah aman harian dihitung sampai gajian, bukan akhir bulan. Kosongkan untuk pakai akhir bulan.",
      placeholder: "Tanggal (1–31), mis. 25",
      a11y: "Tanggal gajian"
    },
    buffer: {
      label: "Sisihkan tiap bulan",
      helper:
        "Jumlah yang mau kamu amankan tiap bulan — dipotong duluan sebelum jatah harian dihitung.",
      placeholder: "0",
      a11y: "Jumlah yang disisihkan tiap bulan"
    }
  },
  listHints: {
    memory: {
      title: "Aksi daftar aktivitas",
      body: "Ketuk catatan untuk mengedit. Geser kiri untuk menghapus."
    },
    balance_accounts: {
      title: "Aksi daftar akun",
      body: "Ketuk akun untuk mengedit nama atau jenis. Geser kiri untuk menghapus akun kustom."
    },
    recurring_bills: {
      title: "Aksi tagihan rutin",
      body: "Ketuk tagihan untuk mengedit jadwal dan jumlah. Geser kiri untuk menghapus tagihan."
    },
    settings_categories: {
      title: "Aksi daftar kategori",
      body: "Ketuk kategori untuk ganti nama atau urutan. Geser kiri untuk sembunyikan."
    }
  },
  home: {
    hints: {
      sheetTitle: "Cara kerjanya",
      triggerA11y: "Buka bantuan saldo dan petunjuk persiapan",
      balanceSection: "Saldo",
      detailsSection: "Detail",
      paceSection: "Ritme harian",
      paceIntro:
        "Chip di kartu saldo membandingkan rata-rata pengeluaranmu (±30 hari terakhir) dengan jatah aman harian.",
      paceNowLabel: "Sekarang",
      paceUnderExplain:
        "Di bawah ritme — rata-rata pengeluaranmu lebih rendah dari jatah aman harian.",
      paceOverExplain:
        "Di atas ritme — rata-rata pengeluaranmu lebih tinggi dari jatah aman harian. Bisa mepet sebelum akhir bulan atau gajian.",
      paceEvenExplain: "Pas ritme — rata-rata pengeluaranmu selaras dengan jatah aman harian.",
      paceUnknownExplain: "Estimasi — belum cukup riwayat pengeluaran untuk membandingkan ritme.",
      setupSection: "Persiapan"
    },
    setup: {
      openingBalanceHint: "Atur saldo awal supaya aman harian lebih akurat.",
      openingBalanceAction: "Atur saldo",
      openingBalanceA11y: "Buka pengaturan untuk atur saldo awal",
      billsHint: "Tambah tagihan rutin untuk sisihkan uang tagihan.",
      billsAction: "Tambah tagihan",
      billsA11y: "Buka pengaturan untuk tambah tagihan rutin",
      overdueBillsHint: "{count} tagihan mungkin jatuh tempo tanpa pembayaran tercatat.",
      overdueBillsAction: "Cek tagihan",
      overdueBillsA11y: "Buka pengaturan untuk cek tagihan rutin",
      progress: "Persiapan · {current} dari {total}"
    },
    safeToSpend: {
      billsReserve: "Disisihkan buat tagihan terdekat: {amount}",
      spendBuffer: "Kamu sisihkan: {amount}",
      billsExceedBalance: "Tagihanmu lebih besar dari saldo saat ini (kurang {amount}).",
      heroLabel: "Saldo total",
      safeDailyTile: "Aman harian",
      spendableTile: "Bisa dibelanjakan",
      spendableHelper:
        "Saldo total = uangmu sekarang. Bisa dibelanjakan = sisa setelah tagihan & sisihan bulanan. Aman harian = dibagi sisa hari.",
      paceUnder: "Di bawah ritme harian",
      paceOver: "Di atas ritme harian",
      paceEven: "Pas ritme harian",
      paceUnknown: "Estimasi",
      daysLeftChip: "Sisa {count} hari",
      compactTypicalDaily: "Rata-rata {amount}/hari",
      compactBillsReserve: "Cadangan tagihan {amount}",
      paydayHint: "Dihitung sampai akhir bulan.",
      paydayHintAction: "Atur hari gajian",
      paydayHintA11y: "Buka pengaturan untuk atur hari gajian",
      typicalDaily: "Rata-rata harianmu {amount}",
      typicalDailyUncertain: "estimasi kasar — butuh lebih banyak data",
      checkPurchase: "Bisa beli sesuatu?",
      checkPurchaseA11y: "Cek apakah pembelian ini masih aman",
      sheetTitle: "Bisa beli ini?",
      purchasePlaceholder: "Harga barang",
      purchaseHint: "Masukkan harga buat lihat dampaknya ke jatah harianmu.",
      sheetContext: "Aman harian {amount} · sisa {days} hari",
      affordableUntilPayday: "Bisa. Setelah ini, aman harianmu jadi {amount} sampai gajian.",
      affordableUntilMonthEnd: "Bisa. Setelah ini, aman harianmu jadi {amount} sampai akhir bulan.",
      overPace: "Masih bisa, tapi bakal mepet — jatah harianmu turun ke {amount}, di bawah rata-ratamu.",
      dipsReserve: "Masih bisa, tapi bakal makan {amount} dari jatah tagihan & tabunganmu.",
      cannotAfford: "Saldomu belum cukup buat ini — kurang {amount}.",
      purchaseVerdict: {
        comfortableHeadline: "Bisa — masih longgar.",
        comfortableDetail: "Jatah harian tetap {amount}, di atas {paceLabel} ({reference}/hari).",
        affordableHeadline: "Bisa — masih aman.",
        affordableDetail: "Jatah harian jadi {amount} sampai {horizon}.",
        tightMultiHeadline: "Masih bisa, tapi mepet.",
        tightMultiDetail:
          "Di {paceLabel} ({reference}/hari), uangmu cuma cukup ~{days} dari {total} hari tersisa.",
        tightOneHeadline: "Sangat mepet — besok bakal berat.",
        tightOneDetail:
          "Sisa cukup ~1 hari di {paceLabel} ({reference}/hari). Jatah harian turun ke {amount}.",
        belowDailyHeadline: "Kurang masuk akal — kebutuhan harian nggak muat.",
        belowDailyDetail: "Sisanya nggak cukup buat 1 hari di {paceLabel} ({reference}/hari).",
        dipsReserveHeadline: "Riskan — sentuh cadangan.",
        dipsReserveDetail: "Bakal makan {amount} dari jatah tagihan atau sisihan bulanan.",
        unaffordableHeadline: "Nggak bisa — uang belanja nggak cukup.",
        unaffordableDetail: "Kurang {amount} dari yang bisa dibelanjakan.",
        horizonPayday: "gajian",
        horizonMonthEnd: "akhir bulan",
        paceLabelTypical: "ritme biasamu",
        paceLabelSafe: "jatah aman harianmu",
        historyFallback: "Pakai jatah aman harian — catat lebih banyak pengeluaran buat ritme personal.",
        historyUncertain: "Estimasi ritme masih kasar — catat lebih banyak biar lebih akurat.",
        categoryContext: "Ini ~{multiple}× {category} biasamu ({amount}).",
        categoryContextSingle: "Sekitar satu {category} biasa ({amount}).",
        logExpense: "Catat pengeluaran",
        logExpenseA11y: "Catat pembelian ini sebagai pengeluaran",
        loggingExpense: "Menyimpan..."
      }
    }
  },
  activity: {
    tabOverview: "Ikhtisar",
    tabActivity: "Aktivitas",
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
    searchPlaceholder: "Cari label, kategori, atau jumlah",
    emptyText: "Belum ada catatan tersimpan.",
    monthEmpty: "Belum ada catatan bulan ini.",
    monthTitle: "Aktivitas · {month}",
    emptyAction: "Catat transaksi pertama",
    searchNoResults: "Tidak ada aktivitas yang cocok dengan pencarian.",
    transferDeleteTitle: "Hapus transfer?",
    transferDeleteBody: "{title} akan dihapus. Saldo akun diperbarui otomatis.",
    transferEditSheetTitle: "Edit transfer",
    transferEditSheetTitleNamed: "Edit {title}",
    editSheetTitle: "Edit catatan",
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
      accountsHintWithTrend: "Tren saldo tersedia di bawah",
      accountsHintNoTrend: "Tambahkan snapshot saldo untuk melihat tren",
      accountsKicker: "Estimasi saldo",
      recapHintWithPatterns: "Ketuk pola untuk memberi umpan balik cepat",
      recapHintEmpty: "Pola muncul setelah beberapa catatan tersimpan",
      recapKicker: "Ringkasan pengeluaran",
      recapValue: "{count} pola"
    },
    recap: {
      expensesProgress: "{count} dari 6 pengeluaran terbaru tercatat",
      feedbackKeep: "Pertahankan",
      feedbackLessOften: "Lebih jarang",
      feedbackLockedHint: "Catat minimal 6 pengeluaran dalam 14 hari terakhir untuk menjawab pertanyaan ringkasan.",
      feedbackNotSure: "Tidak yakin",
      feedbackSaved: "Terima kasih — tercatat."
    },
    recapEmptyAction: "Catat pengeluaran",
    ...idExtras.patterns
  },
  dialogs: {
    clearAllTitle: "Hapus semua data lokal?",
    clearAllBody: "Ini menghapus catatan, saldo, akun, transfer, pintasan, tagihan, dan kategori dari perangkat ini.",
    clearAllConfirm: "Hapus semua",
    categoryDeleteDefaultTitle: "Hapus kategori bawaan?",
    categoryDeleteTitle: "Hapus kategori?",
    categoryDeleteDefault: "{label} akan hilang dari layar catat. Catatan lama tetap tersimpan.",
    categoryDeleteCustom: "{label} akan dihapus dari layar catat. Catatan lama tetap tersimpan.",
    activityDeleteTitle: "Hapus catatan?",
    activityDeleteBody: "{title} akan dihapus. Saldo dan ringkasan bulan ini diperbarui otomatis."
  },
  toasts: idExtras.toasts,
  analysis: idExtras.analysis,
  storage: idExtras.storage
};