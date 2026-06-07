import type { AppStringsExtras } from "../types";

export const idExtras: AppStringsExtras = {
  toasts: {
    default: "Memori pengeluaran bisa sesederhana sebuah jumlah.",
    capture: {
      needAmount: "Masukkan jumlah untuk menyimpan memori ini.",
      needCategory: "Tambahkan minimal satu kategori pengeluaran di Pengaturan sebelum menyimpan.",
      needTransferAccounts: "Pilih dua akun berbeda untuk transfer ini.",
      transferMoved: "{amount} dipindahkan dari {from} ke {to}.",
      incomeSaved: "{amount} pemasukan tersimpan.",
      incomeSavedFrom: "{amount} pemasukan tersimpan dari {source}.",
      expenseSaved: "{amount} tersimpan.",
      expenseSavedFor: "{amount} tersimpan untuk {label}.",
      templateReady: "{label} siap disimpan."
    },
    memory: {
      removed: "Memori dihapus.",
      needAmount: "Masukkan jumlah sebelum menyimpan perubahan.",
      updated: "Memori diperbarui."
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
      removed: "Akun dihapus."
    },
    category: {
      needName: "Tambahkan nama kategori.",
      saved: "Kategori {label} tersimpan.",
      removed: "Kategori {label} dihapus."
    },
    limit: {
      needAmount: "Masukkan jumlah untuk menyimpan batas ini.",
      savedWeek: "Batas {category} tersimpan untuk minggu ini.",
      savedMonth: "Batas {category} tersimpan untuk bulan ini.",
      removed: "Batas {category} dihapus.",
      markedAs: "{category} ditandai sebagai {mode}."
    },
    plan: {
      saved: "Rencana bulanan tersimpan."
    },
    goal: {
      needFields: "Tambahkan nama target dan jumlah target.",
      saved: "Target tabungan tersimpan.",
      removed: "Target tabungan dihapus."
    },
    bill: {
      needFields: "Tambahkan nama dan jumlah tagihan.",
      invalidDay: "Pilih tanggal bulan antara 1 dan 31.",
      saved: "Tagihan rutin tersimpan.",
      removed: "Tagihan rutin dihapus.",
      unavailable: "Tagihan rutin itu tidak tersedia lagi.",
      loggedPartial: "{amount} tercatat, tetapi siklus tagihan tidak bisa diperbarui.",
      logged: "{amount} tercatat untuk {label}."
    },
    balance: {
      needFields: "Tambahkan nama akun dan jumlah saldo.",
      saved: "Snapshot saldo tersimpan."
    },
    backup: {
      ready: "Cadangan siap dibagikan atau disimpan.",
      exportFailed: "Tidak bisa mengekspor data lokal.",
      imported: "Cadangan diimpor.",
      invalidJson: "Teks itu bukan JSON cadangan Slev yang valid."
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
    allocation: {
      action: {
        setPlan: {
          title: "Atur amplop bulanan",
          detail:
            "Tambahkan pemasukan yang diharapkan, biaya tetap, pengeluaran fleksibel, dan target tabungan untuk bulan ini."
        },
        snapshotBalances: {
          title: "Snapshot saldo dulu",
          detail:
            "Tambahkan snapshot cepat untuk BRI, Jago, dompet, dan tunai agar pendanaan saku bisa dicek."
        },
        planExceedsIncome: {
          title: "Rencana di atas pemasukan",
          detail:
            "Rencana {amount} di atas pemasukan yang diharapkan. Kurangi satu alokasi atau naikkan pemasukan hanya jika realistis."
        },
        flexibleOverPlan: {
          title: "Anggaran fleksibel sudah terlampaui",
          detail:
            "Pengeluaran fleksibel {amount} di atas amplop bulanan. Anggap sisa bulan sebagai periode pengeluaran lebih pelan."
        },
        topUpPockets: {
          title: "Top-up saku terlihat",
          detail:
            "Memindahkan hingga {amount} dari hub pemasukan akan mendanai sisa anggaran fleksibel. Snapshot hub menunjukkan {hubBalance}."
        },
        hold: {
          title: "Alokasi stabil",
          detail:
            "Saldo saku saat ini menutupi sisa pengeluaran fleksibel. Terus catat seperti biasa dan perbarui snapshot saat saldo berubah."
        }
      },
      row: {
        incomeTitle: "Pemasukan diterima",
        incomeNoPlan: "Belum ada pemasukan yang diharapkan untuk bulan ini.",
        incomeRemaining: "{amount} pemasukan yang diharapkan belum tercatat.",
        incomeAbovePlan: "Pemasukan {amount} di atas rencana.",
        fixedTitle: "Biaya tetap",
        fixedNoPlan: "Belum ada amplop biaya tetap.",
        fixedRemaining: "Sisa ruang biaya tetap {amount}.",
        fixedAbovePlan: "Biaya tetap {amount} di atas rencana.",
        flexibleTitle: "Pengeluaran fleksibel",
        flexibleNoPlan: "Belum ada amplop pengeluaran fleksibel.",
        flexibleRemaining: "Sisa pengeluaran fleksibel {amount}.",
        flexibleAbovePlan: "Pengeluaran fleksibel {amount} di atas rencana.",
        savingsTitle: "Target tabungan",
        savingsNoPlan: "Belum ada target tabungan.",
        savingsStillNeeded: "Masih butuh {amount} untuk mencapai target tabungan.",
        savingsAboveTarget: "Sisa bersih {amount} di atas target."
      }
    },
    reconciliation: {
      summary: {
        noSnapshot: {
          title: "Belum ada pengecekan saldo",
          detail:
            "Tambahkan snapshot saldo dulu. Rekonsiliasi berguna setelah dua snapshot untuk akun yang sama."
        },
        needsReview: {
          title: "Beberapa saldo perlu ditinjau",
          detail: "{count} akun perlu dicek. Total selisih terlihat {totalGap}."
        },
        smallGap: {
          title: "Selisih saldo kecil terlihat",
          detail:
            "{count} akun punya selisih kecil. Bisa jadi biaya, pembulatan, atau satu entri yang hilang."
        },
        needsHistory: {
          title: "Satu snapshot lagi akan membuka pengecekan",
          detail:
            "Minimal satu akun hanya punya satu snapshot. Tambahkan snapshot berikutnya untuk membandingkan pergerakan tercatat."
        },
        matched: {
          title: "Pergerakan tercatat cocok dengan saldo",
          detail: "Snapshot terbaru cocok dengan pergerakan yang tercatat antar pengecekan saldo."
        }
      },
      status: {
        noSnapshot: "Tanpa snapshot",
        needsHistory: "Butuh 2 snapshot",
        matched: "Cocok"
      },
      detail: {
        noSnapshot: "Tambahkan snapshot saldo manual untuk akun ini.",
        needsHistory:
          "Tambahkan satu snapshot lagi nanti; Slev akan membandingkan pergerakan antara kedua pengecekan.",
        movement:
          "Pergerakan tercatat selama {days} hari: pemasukan {income}, pengeluaran {expense}, transfer masuk {transferIn}, transfer keluar {transferOut}.",
        higherThanExpected:
          "Saldo aktual {gap} lebih tinggi dari perkiraan. Periksa pemasukan hilang, transfer masuk, atau pengeluaran berlebih.",
        lowerThanExpected:
          "Saldo aktual {gap} lebih rendah dari perkiraan. Periksa pengeluaran hilang, transfer keluar, atau salah ketik saldo."
      }
    },
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
      slev_budget_limits: "Batas anggaran",
      slev_monthly_plans: "Rencana bulanan",
      slev_manual_templates: "Pintasan",
      slev_category_modes: "Mode kategori",
      slev_savings_goals: "Target tabungan",
      slev_recurring_bills: "Tagihan rutin",
      slev_balance_snapshots: "Snapshot saldo",
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
      estimatedCurrentBalance: "Estimasi saldo saat ini",
      estimatedCurrentBalanceCopy:
        "{total} dari snapshot ditambah pemasukan, pengeluaran, dan transfer tercatat.",
      trackedEphemeralCopy:
        "Tercatat {tracked} yang direkonsiliasi · Sementara {ephemeral} perkiraan.",
      worthQuickLook: "Layak dicek sebentar",
      driftCopy:
        "Saldo ini menyimpang dari yang Anda catat. Tidak buru-buru — rekonsiliasi saat ada waktu.",
      driftRow: "{label}: selisih {difference}",
      manualSnapshotBase: "Basis snapshot manual",
      manualSnapshotCopy: "{total} dari snapshot tersimpan terbaru.",
      balanceSnapshot: "Snapshot saldo",
      currentBalancePlaceholder: "Saldo saat ini",
      saveSnapshotA11y: "Simpan snapshot saldo",
      saveSnapshot: "Simpan snapshot",
      editAccount: "Edit akun",
      addAccount: "Tambah akun atau dompet",
      accountPlaceholder: "BRI, Jago, GoPay, Tunai...",
      accountKindBank: "Bank",
      accountKindWallet: "Dompet",
      accountKindCash: "Tunai",
      accountKindOther: "Lainnya",
      incomeHub: "Hub pemasukan",
      pocket: "Saku",
      tracked: "Tercatat",
      ephemeral: "Sementara",
      ephemeralHint:
        "Sementara = sumber pembayaran yang tidak direkonsiliasi ketat (e-wallet kecil).",
      saveAccount: "Simpan akun",
      yourAccounts: "Akun Anda",
      emptyAccounts:
        "Pemasukan, pengeluaran, transfer, atau snapshot akan membangun saldo akun di sini.",
      currentAccountBalances: "Saldo akun saat ini",
      estimatedFromSnapshot: "Diestimasi dari snapshot terbaru dan pergerakan tercatat.",
      incomeHubMeta: "Hub pemasukan",
      ephemeralPocketMeta: "Saku sementara",
      noActivity: "Belum ada aktivitas",
      editAccountA11y: "Edit akun {label}",
      deleteAccountTitle: "Hapus akun?",
      deleteAccountBody:
        "{label} akan dihapus dari pemilih akun. Memori yang ada tetap tersimpan."
    },
    goals: {
      editGoal: "Edit target tabungan",
      newGoal: "Target tabungan baru",
      goalNameA11y: "Nama target",
      goalNamePlaceholder: "Nama target",
      targetAmountA11y: "Jumlah target",
      targetAmountPlaceholder: "Jumlah target",
      savedSoFarA11y: "Sudah disimpan",
      savedSoFarPlaceholder: "Sudah disimpan",
      emptyGoals:
        "Target tabungan bisa sederhana: target, jumlah saat ini, dan catatan singkat.",
      editGoalA11y: "Edit target {label}",
      deleteGoalTitle: "Hapus target?",
      deleteGoalBody:
        "{label} akan dihapus dari target Anda. Ini tidak mengubah memori atau saldo tersimpan."
    },
    limits: {
      emptyNoCategories:
        "Belum ada kategori pengeluaran aktif, jadi batas anggaran tidak punya tempat melekat.",
      openSettings: "Buka Pengaturan",
      setLimit: "Atur",
      editLimitA11y: "{action} batas untuk {category}",
      spentOfLimit: "{spent} dari {limit} {period}",
      noLimitSpent: "Belum ada batas - {spent} bulan ini",
      fixed: "Tetap",
      flexible: "Fleksibel",
      limitAmountPlaceholder: "Jumlah batas",
      limitAmountA11y: "Jumlah batas untuk {category}",
      weekly: "Mingguan",
      monthly: "Bulanan",
      deleteLimit: "Hapus batas"
    },
    monthlyPlan: {
      title: "Rencana pengeluaran bulanan",
      expectedIncome: "Pemasukan yang diharapkan",
      useLoggedIncome: "Pakai pemasukan tercatat ({amount})",
      fixedCosts: "Biaya tetap",
      savingsTarget: "Target tabungan",
      notePlaceholder: "Satu penyesuaian untuk bulan ini, opsional",
      flexibleBudget: "Anggaran fleksibel",
      flexibleRemaining: "Sisa fleksibel",
      overIncomeBy: "Di atas pemasukan sebesar",
      savePlan: "Simpan rencana"
    },
    allocation: {
      setPlanEmpty: "Buat rencana bulanan untuk melihat alokasi Anda.",
      income: "Pemasukan",
      ofPlanned: "dari {planned}",
      dailyRoom: "Ruang harian",
      flexibleUntilMonthEnd: "fleksibel hingga akhir bulan",
      pocketCash: "Tunai saku",
      dayCoverage: "cakupan {count} hari",
      netLeft: "Sisa bersih",
      againstTarget: "terhadap target",
      monthlyAllocation: "Alokasi bulanan",
      estimatedFromLogs: "Diestimasi dari catatan Anda. Tambahkan snapshot untuk kalibrasi.",
      openBalance: "Buka Saldo"
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
      amountShare: "{amount} - {percent}%"
    },
    trends: {
      empty: "Tren muncul setelah pengeluaran terbentuk lintas bulan.",
      netWorthTrend: "Tren kekayaan bersih",
      snapshotForNetWorth: "Snapshot saldo untuk melihat tren kekayaan bersih.",
      spendingTrend: "Tren pengeluaran",
      currentPaceTitle: "Ritme bulan ini terlihat",
      topCategoriesTitle: "Kategori teratas bulan ini",
      topCategoriesEmpty: "Belum ada kategori yang menonjol bulan ini.",
      weeklyCashflow: "Arus kas mingguan"
    },
    cashflow: {
      empty: "Arus kas muncul setelah ada entri pemasukan atau pengeluaran.",
      net: "Bersih {amount}",
      income: "Pemasukan",
      expense: "Pengeluaran"
    },
    accounts: {
      hubAndPockets: "Hub dan saku",
      hubPocketsCopy: "Hub {hub} - saku harian {pockets}.",
      mostActivePocket: "Saku pengeluaran paling aktif",
      topSpendingCopy: "{label} punya pengeluaran tercatat {amount} bulan ini.",
      spendingByAccountEmpty:
        "Pengeluaran per akun muncul setelah entri menyertakan akun.",
      reconciliationEmpty:
        "Rekonsiliasi dimulai setelah snapshot manual pertama. Saldo saat ini masih bisa diestimasi dari pemasukan dan pengeluaran.",
      balanceReconciliation: "Rekonsiliasi saldo",
      accountMovement: "Pergerakan akun bulan ini",
      incomeNetCopy: "Pemasukan {income} - bersih {net}",
      recentTransfers: "Transfer terbaru",
      expectedActual: "Perkiraan {expected} - aktual {actual}",
      deleteTransferTitle: "Hapus transfer?",
      deleteTransferBody: "{amount} dari {from} ke {to} akan dihapus.",
      deleteTransferA11y: "Hapus transfer dari {from} ke {to}"
    },
    chart: {
      title: "Bulan ini sekilas",
      totalAcross: "{total} di {count} kategori",
      legendValue: "{amount} · {percent}%"
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
      quietStartDetail: "Slev akan mencari perubahan dan pengulangan seiring memori bertambah.",
      contextMoreVisibleTitle: "{context} lebih terlihat minggu ini",
      contextMoreVisibleDetailWithPrevious: "{count} momen tersimpan, naik dari {previousCount} minggu lalu.",
      contextMoreVisibleDetailNoPrevious: "{count} momen tersimpan muncul minggu ini.",
      contextMoreVisibleRecap: "Pertahankan ritme {context} ini?",
      newRepeatTitle: "Pengulangan baru mungkin terbentuk",
      newRepeatDetail: "{label} muncul {count} kali minggu ini.",
      newRepeatRecap: "Pertahankan {label} dalam ritme?",
      smallSpendsTitle: "Pengeluaran kecil lebih terasa",
      smallSpendsDetail: "{count} momen kecil berjumlah {total} minggu ini.",
      smallSpendsRecap: "Pertahankan ritme pengeluaran kecil ini?",
      weekendShapeTitle: "Akhir pekan membawa lebih banyak minggu ini",
      weekendShapeDetail: "Pengeluaran akhir pekan sekitar {ratio}x ritme hari kerja.",
      weekendShapeRecap: "Pertahankan ritme akhir pekan ini?",
      contextQuieterTitle: "{context} lebih tenang minggu ini",
      contextQuieterDetail:
        "Konteks itu sering muncul minggu lalu dan belum muncul di memori tersimpan minggu ini.",
      memoryBuildingTitle: "Memori sedang terbentuk",
      memoryBuildingDetail: "{count} momen tersimpan dalam dua minggu terakhir.",
      steadyRhythmTitle: "{context} bagian dari ritme terkini",
      steadyRhythmDetail: "{count} momen dalam dua minggu terakhir.",
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