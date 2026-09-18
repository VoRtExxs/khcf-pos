"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "../../../store/AuthContext"
import { usePreferences } from "../../../store/PreferencesContext"
import { useRouter } from "next/navigation"

export default function VolunteerHistory() {
  const { user, isAuthLoading } = useAuth()
  const router = useRouter()
  const { theme, lang, toggleTheme, toggleLang, t } = usePreferences()
  const isRtl = lang === "ar"

  const [transactions, setTransactions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "CASH" | "VISA">("ALL")
  const [dateFilter, setDateFilter] = useState<"TODAY" | "ALL">("TODAY")
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null)
  const [currentTime, setCurrentTime] = useState("")

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString(isRtl ? "ar-JO" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [isRtl])

  // Load transactions
  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      router.push("/")
      return
    }
    const allTxs = JSON.parse(localStorage.getItem("khcf_transactions") || "[]")
    
    // Filter by this volunteer if available, else show device transactions
    const myTxs = allTxs.filter((tx: any) => {
      if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "SUPERVISOR") return true
      return tx.volunteerId === user.volunteer_id || !tx.volunteerId
    })

    setTransactions(myTxs)
  }, [user, isAuthLoading, router])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]

    return transactions.filter((tx) => {
      // Date filter
      if (dateFilter === "TODAY") {
        const txDate = (tx.date || "").split("T")[0]
        if (txDate !== todayStr) return false
      }

      // Payment filter
      if (paymentFilter !== "ALL" && tx.paymentMethod !== paymentFilter) {
        return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const idMatch = (tx.id || "").toLowerCase().includes(q)
        const siteMatch = (tx.siteName || "").toLowerCase().includes(q)
        const itemMatch = (tx.items || []).some((it: any) => (it.name || "").toLowerCase().includes(q))
        if (!idMatch && !siteMatch && !itemMatch) return false
      }

      return true
    })
  }, [transactions, dateFilter, paymentFilter, searchQuery])

  // Aggregate Stats based on filtered or today
  const todayStr = new Date().toISOString().split("T")[0]
  const todayTransactions = useMemo(() => {
    return transactions.filter((tx) => (tx.date || "").split("T")[0] === todayStr)
  }, [transactions, todayStr])

  const statsSource = dateFilter === "TODAY" ? todayTransactions : transactions

  const totalRevenue = useMemo(() => {
    return statsSource.reduce((acc, tx) => acc + (tx.total || 0), 0)
  }, [statsSource])

  const cashRevenue = useMemo(() => {
    return statsSource
      .filter((tx) => tx.paymentMethod === "CASH")
      .reduce((acc, tx) => acc + (tx.total || 0), 0)
  }, [statsSource])

  const visaRevenue = useMemo(() => {
    return statsSource
      .filter((tx) => tx.paymentMethod === "VISA")
      .reduce((acc, tx) => acc + (tx.total || 0), 0)
  }, [statsSource])

  const totalDonations = useMemo(() => {
    return statsSource.reduce((acc, tx) => acc + (tx.extraDonation || 0), 0)
  }, [statsSource])

  const invoiceCount = statsSource.length

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Header */}
      <header
        className={`sticky top-0 z-30 border-b px-6 py-4 flex flex-wrap justify-between items-center gap-4 transition-colors ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <Link href="/pos" className="flex items-center gap-3 group">
            <img
              src="/shop_logo.png"
              alt="دكان الخير"
              className="h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <h1 className="text-base font-black text-[#005295] dark:text-blue-400">
                {t("salesHistoryTitle")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("myDailySalesSubtitle")}
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-[#005295] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <span>👤</span>
            <span>{user?.name || "متطوع دكان الخير"}</span>
            {user?.role && (
              <span className="opacity-70 text-[10px]">({user.role})</span>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Live Clock */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <span>⏰</span>
            <span>{currentTime}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className={`p-2 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {lang === "ar" ? "English" : "العربية"}
          </button>

          {/* Back to POS Button */}
          <Link
            href="/pos"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#005295] hover:bg-[#003d70] text-white shadow-sm transition-all"
          >
            <span>←</span>
            <span>{t("backToPosBtn")}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Total Sales */}
          <div
            className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {dateFilter === "TODAY" ? t("todaySalesTotal") : t("kpiRevenueTitle")}
              </span>
              <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#005295] dark:text-blue-400 flex items-center justify-center text-lg font-black">
                💰
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-[#005295] dark:text-blue-400">
                {totalRevenue.toFixed(2)}{" "}
                <span className="text-sm font-bold text-slate-500">JD</span>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{invoiceCount} {t("invoiceCount")}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {statsSource.length > 0
                    ? `~${(totalRevenue / statsSource.length).toFixed(2)} JD / ${t("invoiceCount")}`
                    : "0 JD"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash Sales */}
          <div
            className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t("todayCashTotal")}
              </span>
              <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-black">
                💵
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {cashRevenue.toFixed(2)}{" "}
                <span className="text-sm font-bold text-slate-500">JD</span>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {totalRevenue > 0
                  ? `${Math.round((cashRevenue / totalRevenue) * 100)}% ${t("cashRatio")}`
                  : "0%"}
              </div>
            </div>
          </div>

          {/* Card 3: Visa Sales */}
          <div
            className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t("todayVisaTotal")}
              </span>
              <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#C8B18B] flex items-center justify-center text-lg font-black">
                💳
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-[#C8B18B]">
                {visaRevenue.toFixed(2)}{" "}
                <span className="text-sm font-bold text-slate-500">JD</span>
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {totalRevenue > 0
                  ? `${Math.round((visaRevenue / totalRevenue) * 100)}% ${t("visaRatio")}`
                  : "0%"}
              </div>
            </div>
          </div>

          {/* Card 4: Cancer Care Extra Donations */}
          <div
            className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
              theme === "dark"
                ? "bg-slate-900 border-amber-900/40 bg-gradient-to-br from-slate-900 to-amber-950/20"
                : "bg-amber-50/40 border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                🎗️ {isRtl ? "تبرعات مرضى السرطان" : "Cancer Care Donations"}
              </span>
              <span className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg font-black">
                🎗️
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {totalDonations.toFixed(2)}{" "}
                <span className="text-sm font-bold text-amber-700/70">JD</span>
              </div>
              <div className="mt-1 text-[11px] font-bold text-amber-700 dark:text-amber-300/80">
                {isRtl ? "قيدت كتبرع من باقي النقود" : "Contributed via change donation"}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div
          className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("ledgerSearchPlaceholder")}
              className={`w-full ps-9 pe-4 py-2 rounded-xl text-xs border outline-none transition-all ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#005295]"
              }`}
            />
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
            {/* Period tabs */}
            <div
              className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
                theme === "dark"
                  ? "bg-slate-800/80 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={() => setDateFilter("TODAY")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "TODAY"
                    ? "bg-[#005295] text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t("filterToday")}
              </button>
              <button
                onClick={() => setDateFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === "ALL"
                    ? "bg-[#005295] text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t("filterAll")}
              </button>
            </div>

            {/* Payment filter */}
            <div
              className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
                theme === "dark"
                  ? "bg-slate-800/80 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={() => setPaymentFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  paymentFilter === "ALL"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t("paymentAll")}
              </button>
              <button
                onClick={() => setPaymentFilter("CASH")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  paymentFilter === "CASH"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t("paymentCash")}
              </button>
              <button
                onClick={() => setPaymentFilter("VISA")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  paymentFilter === "VISA"
                    ? "bg-[#C8B18B] text-slate-900 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t("paymentVisa")}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-[#005295] dark:text-blue-400 flex items-center gap-2">
              <span>🧾</span>
              <span>{t("salesHistoryTitle")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold">
                {filteredTransactions.length}
              </span>
            </h2>
          </div>

          {filteredTransactions.length === 0 ? (
            <div
              className={`rounded-2xl p-16 text-center border ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-500"
                  : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              <div className="text-4xl mb-3">🍃</div>
              <p className="font-bold text-sm">{t("noSalesTodayMsg")}</p>
              <p className="text-xs text-slate-400 mt-1">
                {isRtl
                  ? "قم بإجراء مبيعات جديدة من نقطة البيع وستظهر هنا فوراً مع إمكانية طباعة الإيصالات."
                  : "Complete sales from the POS screen and they will appear here with instant reprint options."}
              </p>
              <Link
                href="/pos"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-xs font-black bg-[#005295] text-white hover:bg-[#004077] transition-all"
              >
                <span>🛒</span>
                <span>{t("backToPosBtn")}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions
                .slice()
                .reverse()
                .map((tx, idx) => {
                  const txDate = tx.date ? new Date(tx.date) : new Date()
                  const timeFormatted = txDate.toLocaleTimeString(
                    isRtl ? "ar-JO" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )
                  const dateFormatted = txDate.toLocaleDateString(
                    isRtl ? "ar-JO" : "en-US",
                    { month: "short", day: "numeric" }
                  )

                  return (
                    <div
                      key={tx.id || idx}
                      className={`rounded-2xl border shadow-sm overflow-hidden transition-all hover:border-[#005295]/40 dark:hover:border-blue-500/40 ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      {/* Top row of card */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b ${
                          theme === "dark"
                            ? "bg-slate-800/50 border-slate-800"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center flex-wrap gap-3">
                          <span className="font-mono font-black text-xs text-slate-400 dark:text-slate-500">
                            #{tx.id ? tx.id.slice(-8) : `TX-${idx + 1}`}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {dateFormatted} • {timeFormatted}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#005295]/10 dark:bg-blue-900/40 text-[#005295] dark:text-blue-300 border border-[#005295]/20 dark:border-blue-800">
                            📍 {tx.siteName || t("mainBuilding")}
                          </span>
                          {tx.extraDonation > 0 && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              🎗️ +{tx.extraDonation.toFixed(2)} JD {isRtl ? "تبرع" : "Donation"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {tx.paymentMethod === "VISA" ? (
                            <span className="text-xs font-bold bg-[#C8B18B]/20 text-[#8d7959] dark:text-[#e0cbb0] px-2.5 py-1 rounded-md border border-[#C8B18B]/30">
                              💳 فيزا (**** {tx.visaLast4 || "4242"})
                            </span>
                          ) : (
                            <span className="text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
                              💵 نقدي (CASH)
                            </span>
                          )}
                          <span className="text-base font-black text-[#005295] dark:text-blue-400">
                            {Number(tx.total).toFixed(2)} JD
                          </span>
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
                            title={t("reprintReceiptBtn")}
                          >
                            <span>🖨️</span>
                            <span className="hidden sm:inline">{t("reprintReceiptBtn")}</span>
                          </button>
                        </div>
                      </div>

                      {/* Item breakdown table */}
                      <div className="px-5 py-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                              <th className="pb-2 font-bold text-start">{isRtl ? "الصنف" : "Item"}</th>
                              <th className="pb-2 font-bold text-center">{isRtl ? "الكمية" : "Qty"}</th>
                              <th className="pb-2 font-bold text-center">{isRtl ? "سعر الوحدة" : "Unit Price"}</th>
                              <th className="pb-2 font-bold text-end">{isRtl ? "الإجمالي" : "Total"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {(tx.items || []).map((item: any, iIdx: number) => (
                              <tr key={iIdx} className="text-slate-700 dark:text-slate-300">
                                <td className="py-2 font-bold text-[#005295] dark:text-blue-300">
                                  {item.name}
                                </td>
                                <td className="py-2 text-center font-mono">
                                  {item.qty}
                                </td>
                                <td className="py-2 text-center text-slate-500">
                                  {Number(item.price).toFixed(2)} JD
                                </td>
                                <td className="py-2 text-end font-bold text-[#C8B18B]">
                                  {(item.price * item.qty).toFixed(2)} JD
                                </td>
                              </tr>
                            ))}
                            {tx.extraDonation > 0 && (
                              <tr className="text-amber-700 dark:text-amber-400 bg-amber-500/5">
                                <td className="py-2 font-bold flex items-center gap-1.5">
                                  <span>🎗️</span>
                                  <span>{t("extraDonationItemName")}</span>
                                </td>
                                <td className="py-2 text-center font-mono">1</td>
                                <td className="py-2 text-center font-bold">
                                  {Number(tx.extraDonation).toFixed(2)} JD
                                </td>
                                <td className="py-2 text-end font-black text-amber-600 dark:text-amber-400">
                                  {Number(tx.extraDonation).toFixed(2)} JD
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                        {/* Cash tendered & change summary if cash */}
                        {tx.paymentMethod === "CASH" && tx.cashTendered && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {t("cashTenderedLabel")}:{" "}
                              <strong className="text-slate-700 dark:text-slate-300">
                                {Number(tx.cashTendered).toFixed(2)} JD
                              </strong>
                            </span>
                            <span>
                              {t("changeDueLabel")}{" "}
                              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                                {Number(tx.changeGiven || 0).toFixed(2)} JD
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </main>

      {/* Reprint Thermal Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border transition-all ${
              theme === "dark"
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">🖨️</span>
                <span className="font-bold text-sm text-[#005295] dark:text-blue-400">
                  {t("receiptDetailsTitle")}
                </span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            {/* Receipt Body (Formatted like 80mm thermal receipt) */}
            <div
              id="printable-history-receipt"
              className="p-6 font-mono text-xs space-y-3 bg-white text-slate-900 border-y border-dashed border-slate-300"
            >
              <div className="text-center space-y-1">
                <img
                  src="/shop_logo.png"
                  alt="دكان الخير"
                  className="h-10 mx-auto object-contain mb-2"
                />
                <h3 className="font-black text-sm text-[#005295]">دكان الخير - KHCF</h3>
                <p className="text-[10px] text-slate-500">مؤسسة ومركز الحسين للسرطان</p>
                <div className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 mt-1">
                  نسخة معاد طباعتها / REPRINT
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>{t("receiptNumber")}:</span>
                  <span className="font-bold">
                    {selectedReceipt.id ? selectedReceipt.id.slice(-8) : "TX-COPY"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("thDateTime")}:</span>
                  <span>
                    {selectedReceipt.date
                      ? new Date(selectedReceipt.date).toLocaleString(
                          isRtl ? "ar-JO" : "en-US"
                        )
                      : new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("thVolunteer")}:</span>
                  <span>{user?.name || "متطوع دكان الخير"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("thLocation")}:</span>
                  <span>{selectedReceipt.siteName || t("mainBuilding")}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 pt-1">
                {(selectedReceipt.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <div className="truncate max-w-[170px]">
                      <span>{item.name}</span>
                      <span className="text-slate-400 text-[10px] mx-1">x{item.qty}</span>
                    </div>
                    <span className="font-bold">{(item.price * item.qty).toFixed(2)} JD</span>
                  </div>
                ))}

                {selectedReceipt.extraDonation > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-amber-700 font-bold bg-amber-50 p-1 rounded">
                    <span>🎗️ {t("extraDonationItemName")}</span>
                    <span>{Number(selectedReceipt.extraDonation).toFixed(2)} JD</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between items-center text-sm font-black text-[#005295]">
                  <span>{isRtl ? "المجموع الكلي:" : "Total Net:"}</span>
                  <span>{Number(selectedReceipt.total).toFixed(2)} JD</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>{t("thPayment")}:</span>
                  <span>
                    {selectedReceipt.paymentMethod === "VISA"
                      ? `فيزا (**** ${selectedReceipt.visaLast4 || "4242"})`
                      : "نقداً (CASH)"}
                  </span>
                </div>
                {selectedReceipt.paymentMethod === "CASH" && selectedReceipt.cashTendered && (
                  <>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>{t("cashTenderedLabel")}:</span>
                      <span>{Number(selectedReceipt.cashTendered).toFixed(2)} JD</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold text-[10px]">
                      <span>{t("changeDueLabel")}</span>
                      <span>{Number(selectedReceipt.changeGiven || 0).toFixed(2)} JD</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-500 leading-tight">
                <p className="font-bold text-[#005295] mb-1">{t("thankYouMessage")}</p>
                <p>www.khcf.jo • 06 554 4960</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-[#005295] hover:bg-[#004077] text-white shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>🖨️</span>
                <span>{t("printReceiptBtn")}</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all"
              >
                {t("closeReceiptBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
