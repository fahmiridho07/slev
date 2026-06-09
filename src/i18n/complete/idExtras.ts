import type { AppStringsExtras } from "../types";

export const idExtras: AppStringsExtras = {
  toasts: {
    default: "Memori pengeluaran bisa sesederhana sebuah jumlah.",
    capture: {
      needAmount: "Masukkan jumlah untuk menyimpan memori ini.",
      needAccount: "Pilih akun dulu.",
      needCategory: "Tambahkan minimal satu kategori pengeluaran di Pengaturan sebelum menyimpan.",
      needTransferAccounts: "Pilih dua akun berbeda untuk transfer ini.",
      transferMoved: "{amount} dipindahkan dari {from} ke {to}.",
      incomeSaved: "{amount} pemasukan tersimpan.",
      incomeSavedFrom: "{amount} pemasukan tersimpan dari {source}.",
      expenseSaved: "{amount} tersimpan.",
      expenseSavedFor: "{amount} tersimpan untuk {label}.",
      templateReady: "{label} siap disimpan."
    },
    boot: {
      failed: "Tidak bisa memuat data lokal. Tarik untuk memuat ulang atau mulai ulang aplikasi."
    },
    memory: {
      removed: "Memori dihapus.",
      restored: "Memori dipulihkan.",
      needAmount: "Masukkan jumlah sebelum menyimpan perubahan.",
      notFound: "Memori itu sudah tidak tersedia.",
      updated: "Memori diperbarui."
    },
    refresh: {
      failed: "Tidak bisa memuat ulang. Coba lagi."
    },
    shortcut: {
      transferUseChips: "Pintasan transfer bisa memakai chip akun langsung.",
      needLabel: "Tambahkan label atau sumber sebelum menyimpan pintasan.",
      saved: "Pintasan {label} tersimpan.",
      removed: "Pintasan dihapus."
    },
    transfer: {
      removed: "Transfer dihapus."
    },
    account: {
      needName: "Tambahkan nama akun atau dompet.",
      saved: "Akun {label} tersimpan.",
      keepOne: "Simpan minimal satu akun untuk saldo.",
      removed: "Akun dihapus.",
      duplicate: "Akun dengan nama itu sudah ada."
    },
    category: {
      needName: "Tambahkan nama kategori.",
      duplicate: "Kategori itu sudah ada.",
      saved: "Kategori {label} tersimpan.",
      removed: "Kategori {label} dihapus."
    },
    bill: {
      needFields: "Tambahkan nama dan jumlah tagihan.",
      saved: "Tagihan rutin tersimpan.",
      removed: "Tagihan rutin dihapus."
    },
    balance: {
      needFields: "Tambahkan nama akun dan jumlah saldo.",
      saved: "Saldo tersimpan."
    },
    backup: {
      ready: "Cadangan siap dibagikan atau disimpan.",
      exportFailed: "Tidak bisa mengekspor data lokal.",
      imported: "Cadangan diimpor.",
      invalidJson: "Teks itu bukan JSON cadangan Slev yang valid.",
      invalidBackup: "File cadangan itu bukan data Slev yang valid.",
      invalidCollection: "Data cadangan untuk {label} bukan koleksi JSON yang valid.",
      restoreFailed: "Tidak bisa memulihkan {label}. Coba kosongkan ruang penyimpanan.",
      emptyBackup: "Cadangan itu tidak memiliki data keuangan yang dikenali.",
      normalizeFailed: "Data yang diimpor tidak bisa dinormalisasi. Data sebelumnya tidak berubah.",
      shareTitle: "Cadangan keuangan Slev"
    },
    reset: {
      failed: "Tidak bisa mengatur ulang {label}.",
      success: "{label} diatur ulang. Anda bisa mulai segar di area itu."
    },
    clear: {
      cleared: "Memori keuangan lokal dihapus."
    },
    writeFailure: {
      corrupt:
        "{area} di perangkat ini terlihat rusak dan dibiarkan tidak berubah. Ekspor cadangan di Pengaturan, lalu impor ulang.",
      generic:
        "Tidak bisa menyimpan {area} ke perangkat ini. Periksa ruang penyimpanan atau ekspor cadangan di Pengaturan."
    }
  },
  analysis: {
    accounts: {
      unassigned: "Belum ditetapkan"
    },
    trends: {
      midpointPace: "{month} berjalan di atas ritme bulan lalu pada titik ini."
    }
  },
  storage: {
    collections: {
      slev_entries: "Memori pengeluaran",
      slev_pattern_feedback: "Umpan balik pola",
      slev_accounts: "Akun",
      slev_transfers: "Transfer",
      slev_manual_templates: "Pintasan",
      slev_recurring_bills: "Tagihan rutin",
      slev_balance_anchor: "Saldo aman dibelanjakan",
      slev_expense_categories: "Kategori pengeluaran"
    },
    exportSkippedOne: "Catatan: {label} terlihat rusak dan tidak disertakan.",
    exportSkippedMany: "Catatan: {list} dan {last} terlihat rusak dan tidak disertakan.",
    writeFailureCorrupt:
      "{area} di perangkat ini terlihat rusak dan dibiarkan tidak berubah. Ekspor cadangan di Pengaturan, lalu impor ulang.",
    writeFailureGeneric:
      "Tidak bisa menyimpan {area} ke perangkat ini. Periksa ruang penyimpanan atau ekspor cadangan di Pengaturan."
  },
  budget: {
    balance: {
      editAccount: "Edit akun",
      addAccount: "Tambah akun atau dompet",
      accountPlaceholder: "BRI, Jago, GoPay, Tunai...",
      accountKindBank: "Bank",
      accountKindWallet: "Dompet",
      accountKindCash: "Tunai",
      accountKindOther: "Lainnya",
      incomeHub: "Hub pemasukan",
      openingBalance: "Saldo awal",
      openingBalanceHint:
        "Saldo akun ini sekarang. Transaksi setelah ini akan menambah atau mengurangi dari sini.",
      pocket: "Saku",
      tracked: "Tercatat",
      trackedTotal: "Total saldo tercatat",
      ephemeral: "Sementara",
      ephemeralHint:
        "Sementara = sumber pembayaran yang tidak direkonsiliasi ketat (e-wallet kecil).",
      saveAccount: "Simpan akun",
      yourAccounts: "Akun Anda",
      incomeHubMeta: "Hub pemasukan",
      ephemeralPocketMeta: "Saku sementara",
      editAccountA11y: "Edit akun {label}",
      deleteAccountTitle: "Hapus akun?",
      deleteAccountBody:
        "{label} akan dihapus dari pemilih akun. Memori yang ada tetap tersimpan."
    }
  },
  patterns: {
    breakdown: {
      expenseEmpty: "Rincian pengeluaran muncul setelah ada pengeluaran tersimpan.",
      incomeEmpty: "Rincian pemasukan muncul setelah ada entri pemasukan.",
      spendingByCategory: "Pengeluaran per kategori",
      incomeBySource: "Pemasukan per sumber",
      expense: "Pengeluaran",
      income: "Pemasukan",
      amountShare: "{amount} - {percent}%",
      viewAll: "Lihat semua kategori",
      viewLess: "Tampilkan lebih sedikit",
      previousMonthA11y: "Bulan sebelumnya, saat ini {month}",
      nextMonthA11y: "Bulan berikutnya, saat ini {month}",
      vsLastMonthUp: "Naik {percent}% vs bulan lalu",
      vsLastMonthDown: "Turun {percent}% vs bulan lalu",
      vsLastMonthFlat: "Sama dengan bulan lalu",
      viewEntriesA11y: "Lihat {count} entri untuk {category}",
      drilldownTitle: "{category} · {month}",
      drilldownSummary: "{count} entri · {total}",
      drilldownEmpty: "Tidak ada entri di bulan ini",
      categoryNewThisMonth: "Baru bulan ini",
      categoryDeltaUp: "+{percent}%",
      categoryDeltaDown: "-{percent}%",
      topIncreasesTitle: "Kenaikan terbesar vs bulan lalu",
      topIncreaseAmount: "+{amount} (+{percent}%)"
    },
    trends: {
      empty: "Tren muncul setelah pengeluaran terbentuk lintas bulan.",
      advancedTrends: "Tren lanjutan",
      expandAdvancedTrends: "Tampilkan tren lanjutan",
      collapseAdvancedTrends: "Sembunyikan tren lanjutan",
      spendingTrend: "Tren pengeluaran",
      currentPaceTitle: "Ritme bulan ini terlihat",
      weeklyCashflow: "Arus kas mingguan",
      showFullCashflow: "Tampilkan 8 minggu terakhir",
      hideFullCashflow: "Tampilkan bulan ini saja"
    },
    cashflow: {
      empty: "Arus kas muncul setelah ada entri pemasukan atau pengeluaran.",
      net: "Bersih {amount}",
      netLabel: "Bersih",
      netThisMonth: "Bersih bulan ini",
      income: "Pemasukan",
      expense: "Pengeluaran"
    },
    chart: {
      title: "Bulan ini sekilas",
      titleMonth: "{month} sekilas",
      totalAcross: "{total} di {count} kategori",
      legendValue: "{amount} · {percent}%",
      a11ySummary: "Grafik pengeluaran: {total} di {count} kategori. {breakdown}"
    },
    recapEmpty: "Pola muncul setelah beberapa momen tersimpan.",
    groups: {
      repeatedLately: "Sering berulang belakangan",
      standsOut: "Menonjol minggu ini",
      smallSpends: "Pengeluaran kecil menumpuk",
      weekendShape: "Bentuk akhir pekan"
    },
    generated: {
      quietStartTitle: "Beberapa momen tersimpan",
      quietStartDetail: "Lebih banyak pola muncul seiring kamu mencatat.",
      contextMoreVisibleTitle: "{context} lebih terlihat minggu ini",
      contextMoreVisibleDetailWithPrevious: "{count} momen, naik dari {previousCount} minggu lalu.",
      contextMoreVisibleDetailNoPrevious: "{count} momen minggu ini.",
      contextMoreVisibleRecap: "Pertahankan ritme {context} ini?",
      newRepeatTitle: "Pengulangan baru mungkin terbentuk",
      newRepeatDetail: "{label} muncul {count} kali minggu ini.",
      newRepeatRecap: "Pertahankan {label} dalam ritme?",
      smallSpendsTitle: "Pengeluaran kecil menumpuk",
      smallSpendsDetail: "{count} momen kecil total {total} minggu ini.",
      smallSpendsRecap: "Pertahankan ritme pengeluaran kecil ini?",
      weekendShapeTitle: "Pengeluaran akhir pekan menonjol",
      weekendShapeDetail: "Sekitar {ratio}x ritme hari kerja.",
      weekendShapeRecap: "Pertahankan ritme akhir pekan ini?",
      contextQuieterTitle: "{context} lebih tenang",
      contextQuieterDetail: "Sering minggu lalu, belum ada minggu ini.",
      memoryBuildingTitle: "Memori sedang terbentuk",
      memoryBuildingDetail: "{count} momen dalam dua minggu terakhir.",
      steadyRhythmTitle: "{context} bagian dari ritmemu",
      steadyRhythmDetail: "{count} momen belakangan ini.",
      steadyRhythmRecap: "Pertahankan ritme {context} ini?"
    }
  },
  memory: {
    groups: {
      today: "Hari ini",
      yesterday: "Kemarin",
      thisWeek: "Minggu ini",
      earlier: "Sebelumnya"
    },
    repeatHint: "{count} minggu ini",
    momentTitle: {
      income: "Pemasukan"
    }
  }
};