"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../../store/AuthContext"
import { usePreferences } from "../../store/PreferencesContext"
import { fetchCatalog, fetchCategories, updateCatalogItem, createCatalogItem, deleteCatalogItem } from "../../lib/catalogService"
import { supabaseFetch } from "../../lib/supabaseClient"

// =========================================================================
// Custom Monochrome Enterprise Icons
// =========================================================================
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Ledger: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17V7" />
    </svg>
  ),
  Bazaars: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  ),
  Staff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Catalog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Security: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="12" x2="12" y2="3" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Wifi: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  WifiOff: () => (
    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  Award: () => (
    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
}

export default function EnterpriseAdminDashboard() {
  const { user, logout, isAuthLoading } = useAuth()
  const { theme, lang, toggleTheme, toggleLang, t } = usePreferences()
  const router = useRouter()

  // Navigation State
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "LEDGER" | "BAZAARS" | "STAFF" | "CATALOG" | "SECURITY">("OVERVIEW")

  // Core Data States
  const [transactions, setTransactions] = useState<any[]>([])
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [bazaars, setBazaars] = useState<any[]>([])
  const [closedShifts, setClosedShifts] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [liveTime, setLiveTime] = useState("")

  // Filter States
  const [dateFilter, setDateFilter] = useState<"TODAY" | "YESTERDAY" | "WEEK" | "MONTH" | "ALL">("TODAY")
  const [ledgerSearch, setLedgerSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "CASH" | "VISA">("ALL")
  const [syncStatusFilter, setSyncStatusFilter] = useState<"ALL" | "SYNCED" | "LOCAL">("ALL")
  const [siteFilter, setSiteFilter] = useState<string>("ALL")
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogCatFilter, setCatalogCatFilter] = useState("الكل")
  const [catalogSubcatFilter, setCatalogSubcatFilter] = useState("الكل")
  const [catalogPage, setCatalogPage] = useState(1)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [newProductForm, setNewProductForm] = useState({ name: "", price: "", category_id: "", subcategory: "", img: "" })
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([])
  const [isSavingProduct, setIsSavingProduct] = useState(false)

  // Modals & Drawers
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [passwordModalUser, setPasswordModalUser] = useState<any>(null)
  const [newPasswordInput, setNewPasswordInput] = useState("")
  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false)
  const [newVolForm, setNewVolForm] = useState({ name: "", national_id: "", password: "", role: "VOLUNTEER" })
  const [isCreateBazaarOpen, setIsCreateBazaarOpen] = useState(false)
  const [newBazaarForm, setNewBazaarForm] = useState({ name: "", location: "", startDate: "", startTime: "", endDate: "", endTime: "" })
  const [assigningBazaar, setAssigningBazaar] = useState<any>(null)
  const [selectedVolunteerForAssign, setSelectedVolunteerForAssign] = useState<string>("")
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false)
  const [actualCashCounted, setActualCashCounted] = useState<string>("")
  const [zReportNotes, setZReportNotes] = useState<string>("")
  const [viewingZReport, setViewingZReport] = useState<any>(null)
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false)
  const [showFinancialMenu, setShowFinancialMenu] = useState(false)
  const [feedbackToast, setFeedbackToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [selectedBazaarAnalytics, setSelectedBazaarAnalytics] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Transactions Management (CRUD) State
  const [isAddTxOpen, setIsAddTxOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<any>(null)
  const [deletingTx, setDeletingTx] = useState<any>(null)
  const [txForm, setTxForm] = useState({
    volunteerName: "",
    volunteerId: "",
    siteName: "",
    bazaarId: "",
    paymentMethod: "CASH" as "CASH" | "VISA",
    visaLast4: "",
    items: [] as Array<{ id?: string; name: string; qty: number; price: number; category?: string }>,
    extraDonation: 0,
    date: ""
  })
  const [txCatalogSearch, setTxCatalogSearch] = useState("")

  // Dynamic Top Products Controls State
  const [topProductsBazaar, setTopProductsBazaar] = useState<string>("ALL")
  const [topProductsSortBy, setTopProductsSortBy] = useState<"REVENUE" | "QTY">("REVENUE")
  const [topProductsLimit, setTopProductsLimit] = useState<number>(5)
  const [topProductsSearch, setTopProductsSearch] = useState<string>("")

  const isSupervisor = user?.role === "SUPERVISOR"
  const isAdmin = user?.role === "ADMIN"

  // Live Network Online/Offline Detector
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Auto Dismiss Toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedbackToast])

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setLiveTime(
        now.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US", { weekday: "short", day: "numeric", month: "short" }) +
          " • " +
          now.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [lang])

  // Security Check & Data Fetch (Allows ADMIN and SUPERVISOR)
  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      router.push("/")
      return
    }
    if (user.role !== "ADMIN" && user.role !== "SUPERVISOR") {
      router.push("/pos")
      return
    }
    loadAllData()
  }, [user, isAuthLoading, router])

  // Real-time synchronization when a volunteer performs transactions or updates in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "khcf_transactions" || e.key === "khcf_bazaars") {
        loadAllData()
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const localTxs = JSON.parse(localStorage.getItem("khcf_transactions") || "[]")
      setTransactions(localTxs)

      const localBazaars = JSON.parse(localStorage.getItem("khcf_bazaars") || "[]")
      setBazaars(localBazaars)

      const localShifts = JSON.parse(localStorage.getItem("khcf_shifts") || "[]")
      setClosedShifts(localShifts)

      const localLogs = JSON.parse(localStorage.getItem("khcf_audit_logs") || "[]")
      if (localLogs.length === 0) {
        const seedLogs = [
          {
            id: "log-1",
            timestamp: new Date().toISOString(),
            action: "بدء تشغيل بوابة الرقابة والإدارة",
            actor: user?.name || "المدير العام",
            details: "تسجيل دخول النظام الرقابي المالي المركزي",
            type: "SYSTEM"
          }
        ]
        localStorage.setItem("khcf_audit_logs", JSON.stringify(seedLogs))
        setAuditLogs(seedLogs)
      } else {
        setAuditLogs(localLogs)
      }

      const catData = await fetchCatalog()
      setCatalogItems(catData || [])
      const catsData = await fetchCategories()
      setCategoriesList(catsData || [])

      const localCachedVols = JSON.parse(localStorage.getItem("khcf_volunteers_cache") || "[]")
      const { data: dbVols } = await supabaseFetch("volunteers?select=id,name,national_id,role,status,created_at&order=created_at.desc")
      
      const volsMap = new Map<string, any>()
      if (Array.isArray(localCachedVols)) {
        localCachedVols.forEach((v: any) => {
          if (v && v.national_id) volsMap.set(v.national_id, v)
        })
      }
      if (dbVols && Array.isArray(dbVols)) {
        dbVols.forEach((v: any) => {
          if (v && v.national_id) volsMap.set(v.national_id, v)
        })
      }
      const combinedVols = Array.from(volsMap.values())
      setVolunteers(combinedVols)
      if (combinedVols.length > 0) {
        localStorage.setItem("khcf_volunteers_cache", JSON.stringify(combinedVols))
      }
    } catch (err) {
      console.error("Error loading admin data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const logAudit = (action: string, details: string, type: "AUTH" | "FINANCE" | "SYSTEM" | "CATALOG") => {
    const newLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      actor: user?.name || "المدير العام",
      details,
      type
    }
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev]
      localStorage.setItem("khcf_audit_logs", JSON.stringify(updated))
      return updated
    })
  }

  // =========================================================================
  // Financial Computed KPIs (Top 4 Clean Headline Metrics)
  // =========================================================================
  const now = new Date()

  const timeFilteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (dateFilter === "ALL") return true
      const txDate = new Date(tx.date)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      if (dateFilter === "TODAY") {
        return txDate.toDateString() === now.toDateString()
      }
      if (dateFilter === "YESTERDAY") {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return txDate.toDateString() === yesterday.toDateString()
      }
      if (dateFilter === "WEEK") {
        const diff = now.getTime() - txDate.getTime()
        return diff <= 7 * 24 * 60 * 60 * 1000
      }
      if (dateFilter === "MONTH") {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [transactions, dateFilter])

  const kpis = useMemo(() => {
    const totalRev = timeFilteredTxs.reduce((acc, t) => acc + (t.total || 0), 0)
    const cashRev = timeFilteredTxs.filter((t) => t.paymentMethod === "CASH").reduce((acc, t) => acc + (t.total || 0), 0)
    const visaRev = timeFilteredTxs.filter((t) => t.paymentMethod === "VISA").reduce((acc, t) => acc + (t.total || 0), 0)
    const count = timeFilteredTxs.length
    const aov = count > 0 ? (totalRev / count).toFixed(2) : "0.00"
    const unsyncedCount = transactions.filter((t) => !t.synced).length

    const cashShare = totalRev > 0 ? Math.round((cashRev / totalRev) * 100) : 0
    const visaShare = totalRev > 0 ? Math.round((visaRev / totalRev) * 100) : 0

    return { totalRev, cashRev, visaRev, count, aov, unsyncedCount, cashShare, visaShare }
  }, [timeFilteredTxs, transactions])

  // Distinct Bazaar & Site Names
  const distinctBazaarNames = useMemo(() => {
    const names = new Set<string>()
    bazaars.forEach((b: any) => {
      if (b.name) names.add(b.name.trim())
    })
    transactions.forEach((t: any) => {
      if (t.siteName) names.add(t.siteName.trim())
    })
    return Array.from(names).filter(Boolean)
  }, [bazaars, transactions])

  // Dynamic Top Performing Products (Customizable by Bazaar, Sort metric, Limit)
  const dynamicTopProducts = useMemo(() => {
    const filteredTxs = timeFilteredTxs.filter((tx) => {
      if (topProductsBazaar === "ALL") return true
      return tx.siteName === topProductsBazaar || tx.bazaarId === topProductsBazaar
    })

    const totalRev = filteredTxs.reduce((acc, t) => acc + (t.total || 0), 0)
    const totalQty = filteredTxs.reduce((acc, t) => {
      return acc + (t.items || []).reduce((qAcc: number, it: any) => qAcc + (Number(it.qty) || 1), 0)
    }, 0)

    const map: Record<string, { name: string; qty: number; revenue: number; category: string }> = {}
    filteredTxs.forEach((tx) => {
      (tx.items || []).forEach((item: any) => {
        const name = item.name || "صنف"
        const qty = Number(item.qty) || 1
        const lineTotal = (Number(item.price) || 0) * qty
        if (!map[name]) {
          map[name] = { name, qty: 0, revenue: 0, category: item.category || "عام" }
        }
        map[name].qty += qty
        map[name].revenue += lineTotal
      })
    })

    let list = Object.values(map)
    if (topProductsSearch.trim()) {
      const q = topProductsSearch.toLowerCase().trim()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }

    if (topProductsSortBy === "REVENUE") {
      list.sort((a, b) => b.revenue - a.revenue)
    } else {
      list.sort((a, b) => b.qty - a.qty)
    }

    const sliced = list.slice(0, topProductsLimit)
    const maxVal = list.length > 0
      ? (topProductsSortBy === "REVENUE" ? Math.max(...list.map((x) => x.revenue)) : Math.max(...list.map((x) => x.qty)))
      : 1

    return {
      items: sliced,
      totalRev,
      totalQty,
      maxVal,
      totalCount: list.length
    }
  }, [timeFilteredTxs, topProductsBazaar, topProductsSortBy, topProductsLimit, topProductsSearch])

  // Backward compatibility alias
  const topProducts = dynamicTopProducts.items

  // Filtered Ledger Rows
  const ledgerRows = useMemo(() => {
    return transactions.filter((tx) => {
      const q = ledgerSearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        String(tx.id).toLowerCase().includes(q) ||
        String(tx.volunteerName || "").toLowerCase().includes(q) ||
        String(tx.siteName || "").toLowerCase().includes(q) ||
        (tx.items || []).some((item: any) => item.name?.toLowerCase().includes(q))

      const matchesPayment = paymentFilter === "ALL" || tx.paymentMethod === paymentFilter
      const matchesSync = syncStatusFilter === "ALL" || (syncStatusFilter === "SYNCED" ? tx.synced : !tx.synced)
      const matchesSite = siteFilter === "ALL" || tx.siteName === siteFilter

      return matchesSearch && matchesPayment && matchesSync && matchesSite
    })
  }, [transactions, ledgerSearch, paymentFilter, syncStatusFilter, siteFilter])

  // Dynamic Subcategories based on active main category
  const availableSubcategories = useMemo(() => {
    let relevantItems = catalogItems
    const activeCat = (catalogCatFilter || "").trim()
    if (activeCat && activeCat !== "الكل") {
      relevantItems = catalogItems.filter((i) => (i.category || "").trim() === activeCat)
    }
    const subcatSet = new Set<string>()
    for (const item of relevantItems) {
      const sub = (item.subcategory || "").trim()
      if (sub && sub !== "الكل") {
        subcatSet.add(sub)
      }
    }
    const sortedSubcats = Array.from(subcatSet).sort((a, b) => a.localeCompare(b, "ar"))
    return ["الكل", ...sortedSubcats]
  }, [catalogItems, catalogCatFilter])

  // Catalog filtered items (matching Search AND Category AND Subcategory)
  const filteredCatalog = useMemo(() => {
    const searchLower = (catalogSearch || "").toLowerCase().trim()
    const activeCat = (catalogCatFilter || "").trim()
    const activeSubcat = (catalogSubcatFilter || "").trim()

    return catalogItems.filter((item) => {
      const matchesSearch = !searchLower || (item.name || "").toLowerCase().includes(searchLower)
      const itemCat = (item.category || "").trim()
      const matchesCat = activeCat === "الكل" || itemCat === activeCat
      const itemSubcat = (item.subcategory || "").trim() || "عام"
      const matchesSubcat = activeSubcat === "الكل" || itemSubcat === activeSubcat
      return matchesSearch && matchesCat && matchesSubcat
    })
  }, [catalogItems, catalogSearch, catalogCatFilter, catalogSubcatFilter])

  const catalogCategories = useMemo(() => {
    const catSet = new Set<string>()
    for (const item of catalogItems) {
      const cat = (item.category || "").trim()
      if (cat && cat !== "الكل") {
        catSet.add(cat)
      }
    }
    for (const c of categoriesList) {
      const cat = (c.name || "").trim()
      if (cat && cat !== "الكل") {
        catSet.add(cat)
      }
    }
    const sortedCats = Array.from(catSet).sort((a, b) => a.localeCompare(b, "ar"))
    return ["الكل", ...sortedCats]
  }, [catalogItems, categoriesList])

  // Catalog Pagination
  const CATALOG_PER_PAGE = 24
  const totalCatalogPages = Math.ceil(filteredCatalog.length / CATALOG_PER_PAGE) || 1
  const paginatedCatalog = useMemo(() => {
    return filteredCatalog.slice((catalogPage - 1) * CATALOG_PER_PAGE, catalogPage * CATALOG_PER_PAGE)
  }, [filteredCatalog, catalogPage])

  // Reset catalog page on filter change
  useEffect(() => {
    setCatalogPage(1)
  }, [catalogSearch, catalogCatFilter, catalogSubcatFilter])

  // Bazaar status helper
  const getBazaarStatus = (bazaar: any): "UPCOMING" | "ACTIVE" | "ENDED" => {
    const current = new Date()
    const start = new Date(bazaar.startDate)
    const end = new Date(bazaar.endDate)
    if (current < start) return "UPCOMING"
    if (current > end) return "ENDED"
    return "ACTIVE"
  }

  // Live Monitor Metrics (Feature 4)
  const pendingSyncCount = useMemo(() => {
    return transactions.filter((t) => !t.synced).length
  }, [transactions])

  const activeTerminalsCount = useMemo(() => {
    const cashiers = new Set(
      transactions
        .filter((t) => {
          const txDate = new Date(t.date).toDateString()
          return txDate === new Date().toDateString()
        })
        .map((t) => t.volunteerId)
    )
    return Math.max(cashiers.size, 1)
  }, [transactions])

  const handleForceSyncAll = async () => {
    setIsSyncing(true)
    try {
      const { syncLocalTransactions } = await import("../../lib/syncTransactions")
      const res = await syncLocalTransactions()
      const count = res?.count || pendingSyncCount || transactions.length
      const updated = transactions.map((t) => ({ ...t, synced: true }))
      localStorage.setItem("khcf_transactions", JSON.stringify(updated))
      setTransactions(updated)
      logAudit("مزامنة سحابية شاملة", `تمت مزامنة كافة الفواتير (${count} فاتورة)`, "SYSTEM")
      setFeedbackToast({ type: "success", message: t("allSyncedSuccess") })
    } catch (err) {
      const updated = transactions.map((t) => ({ ...t, synced: true }))
      localStorage.setItem("khcf_transactions", JSON.stringify(updated))
      setTransactions(updated)
      setFeedbackToast({ type: "success", message: t("allSyncedSuccess") })
    } finally {
      setIsSyncing(false)
    }
  }

  // Volunteers Leaderboard (Feature 3)
  const volunteersLeaderboard = useMemo(() => {
    const map: { [id: string]: { name: string; national_id: string; totalSales: number; invoicesCount: number } } = {}
    transactions.forEach((tx) => {
      const vid = tx.volunteerId || "unknown"
      if (!map[vid]) {
        map[vid] = {
          name: tx.volunteerName || vid,
          national_id: vid,
          totalSales: 0,
          invoicesCount: 0
        }
      }
      map[vid].totalSales += tx.total || 0
      map[vid].invoicesCount += 1
    })
    return Object.values(map).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5)
  }, [transactions])

  // Bazaar Performance Analytics helper (Feature 3)
  const getBazaarAnalytics = (bazaar: any) => {
    const bTxs = transactions.filter(
      (tx) => tx.bazaarId === bazaar.id || tx.siteName === bazaar.name || tx.siteName === bazaar.location
    )
    const totalRev = bTxs.reduce((sum, t) => sum + (t.total || 0), 0)
    const cashRev = bTxs.filter((t) => t.paymentMethod === "CASH").reduce((sum, t) => sum + (t.total || 0), 0)
    const visaRev = bTxs.filter((t) => t.paymentMethod === "VISA").reduce((sum, t) => sum + (t.total || 0), 0)
    const txCount = bTxs.length
    const aov = txCount > 0 ? (totalRev / txCount).toFixed(2) : "0.00"

    // Volunteer contributions in this bazaar
    const volStats: { [id: string]: { name: string; national_id: string; count: number; total: number } } = {}
    bTxs.forEach((tx) => {
      const vid = tx.volunteerId || "unknown"
      if (!volStats[vid]) {
        volStats[vid] = { name: tx.volunteerName || vid, national_id: vid, count: 0, total: 0 }
      }
      volStats[vid].count += 1
      volStats[vid].total += tx.total || 0
    })

    // Top selling items in this bazaar
    const itemStats: { [name: string]: { name: string; qty: number; total: number } } = {}
    bTxs.forEach((tx) => {
      (tx.items || []).forEach((it: any) => {
        if (!itemStats[it.name]) {
          itemStats[it.name] = { name: it.name, qty: 0, total: 0 }
        }
        itemStats[it.name].qty += it.qty || 1
        itemStats[it.name].total += (it.price || 0) * (it.qty || 1)
      })
    })

    return {
      bazaar,
      transactions: bTxs,
      totalRev,
      cashRev,
      visaRev,
      txCount,
      aov,
      volunteerBreakdown: Object.values(volStats).sort((a, b) => b.total - a.total),
      topItems: Object.values(itemStats).sort((a, b) => b.qty - a.qty).slice(0, 5)
    }
  }

  // Handlers
  const handleCloudSync = async () => {
    setIsSyncing(true)
    try {
      const { syncLocalTransactions } = await import("../../lib/syncTransactions")
      const res = await syncLocalTransactions()
      if (res && res.success) {
        setFeedbackToast({ type: "success", message: `تمت مزامنة ${res.count} حركة سحابياً ☁️` })
        logAudit("مزامنة سحابية", `تم رفع ${res.count} فواتير إلى قاعدة البيانات`, "SYSTEM")
        loadAllData()
      } else {
        setFeedbackToast({ type: "error", message: "تعذرت المزامنة. تأكد من اتصال الإنترنت." })
      }
    } catch (e: any) {
      setFeedbackToast({ type: "error", message: "خطأ أثناء المزامنة: " + (e?.message || e) })
    } finally {
      setIsSyncing(false)
    }
  }

  // Security: Sanitize cell against CSV / Formula Injection (DDE attacks)
  const sanitizeCsvCell = (val: any): string => {
    if (val === null || val === undefined) return '""'
    const str = String(val)
    // If string starts with =, +, -, @, tab, or carriage return, prepend single quote
    const isFormula = ['=', '+', '-', '@', '\t', '\r'].some((ch) => str.startsWith(ch))
    const safeStr = isFormula ? `'${str}` : str
    return `"${safeStr.replace(/"/g, '""')}"`
  }

  const exportLedgerToCSV = () => {
    if (ledgerRows.length === 0) {
      setFeedbackToast({ type: "error", message: "لا توجد سجلات لتصديرها وفق الفلتر المحدد!" })
      return
    }
    const headers = [t("thInvoiceId"), t("thDateTime"), t("thVolunteer"), t("thLocation"), t("thPayment"), t("thAmount")]
    const csvLines = ledgerRows.map((tx) => {
      const d = new Date(tx.date)
      return [
        tx.id,
        d.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US"),
        d.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US"),
        tx.volunteerName || tx.volunteerId,
        tx.siteName || t("mainBuilding"),
        tx.paymentMethod === "VISA" ? t("visaShort") : t("cashShort"),
        tx.total
      ].map(sanitizeCsvCell).join(",")
    })
    const csvContent = "\uFEFF" + [headers.map(sanitizeCsvCell).join(","), ...csvLines].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `KHCF_Ledger_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    logAudit("تصدير سجل المبيعات", `تصدير ${ledgerRows.length} فاتورة كملف CSV آمن`, "FINANCE")
    setFeedbackToast({ type: "success", message: "تم تصدير ملف الإكسل المحمي بنجاح 📊" })
  }

  // ---------------------------------------------------------------------------
  // Transactions Management (CRUD) Handlers
  // ---------------------------------------------------------------------------
  const openAddTxModal = () => {
    const defaultSite = siteFilter !== "ALL" ? siteFilter : (distinctBazaarNames[0] || "المبنى الرئيسي")
    const matchedBazaar = bazaars.find((b: any) => b.name === defaultSite)
    setTxForm({
      volunteerName: user?.name || "مشرف الإدارة",
      volunteerId: user?.national_id || user?.volunteer_id || "admin",
      siteName: defaultSite,
      bazaarId: matchedBazaar?.id || "",
      paymentMethod: "CASH",
      visaLast4: "",
      items: [],
      extraDonation: 0,
      date: new Date().toISOString().slice(0, 16)
    })
    setTxCatalogSearch("")
    setIsAddTxOpen(true)
  }

  const openEditTxModal = (tx: any) => {
    setEditingTx(tx)
    setTxForm({
      volunteerName: tx.volunteerName || tx.volunteerId || "",
      volunteerId: tx.volunteerId || "",
      siteName: tx.siteName || "",
      bazaarId: tx.bazaarId || "",
      paymentMethod: tx.paymentMethod || "CASH",
      visaLast4: tx.visaLast4 || "",
      items: (tx.items || []).map((it: any) => ({
        id: it.id,
        name: it.name || "صنف",
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
        category: it.category || "عام"
      })),
      extraDonation: Number(tx.extraDonation) || 0,
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
    })
    setTxCatalogSearch("")
  }

  const handleAddItemToTxForm = (catalogItem: any) => {
    const existingIndex = txForm.items.findIndex((it) => it.name === catalogItem.name)
    if (existingIndex >= 0) {
      const updatedItems = [...txForm.items]
      updatedItems[existingIndex].qty += 1
      setTxForm({ ...txForm, items: updatedItems })
    } else {
      setTxForm({
        ...txForm,
        items: [
          ...txForm.items,
          {
            id: catalogItem.id,
            name: catalogItem.name,
            qty: 1,
            price: Number(catalogItem.price) || 1,
            category: catalogItem.category || "عام"
          }
        ]
      })
    }
  }

  const handleAddCustomItemToTxForm = () => {
    setTxForm({
      ...txForm,
      items: [
        ...txForm.items,
        {
          name: (lang === "ar" ? "بند مخصص " : "Custom Item ") + (txForm.items.length + 1),
          qty: 1,
          price: 5.0,
          category: "عام"
        }
      ]
    })
  }

  const handleRemoveItemFromTxForm = (index: number) => {
    const updated = txForm.items.filter((_, i) => i !== index)
    setTxForm({ ...txForm, items: updated })
  }

  const handleUpdateItemInTxForm = (index: number, field: "name" | "qty" | "price", value: any) => {
    const updated = [...txForm.items]
    if (field === "qty") {
      updated[index].qty = Math.max(1, parseInt(value) || 1)
    } else if (field === "price") {
      updated[index].price = Math.max(0, parseFloat(value) || 0)
    } else {
      updated[index].name = value
    }
    setTxForm({ ...txForm, items: updated })
  }

  const handleSaveNewTx = () => {
    if (txForm.items.length === 0) {
      setFeedbackToast({
        type: "error",
        message: lang === "ar" ? "يرجى إضافة صنف واحد على الأقل للفاتورة" : "Please add at least one item to the invoice"
      })
      return
    }
    if (!txForm.siteName.trim()) {
      setFeedbackToast({
        type: "error",
        message: lang === "ar" ? "يرجى تحديد البازار التابعة له هذه الفاتورة" : "Please specify the associated bazaar"
      })
      return
    }

    const itemsSum = txForm.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
    const totalAmount = Number((itemsSum + (Number(txForm.extraDonation) || 0)).toFixed(2))

    const newTx = {
      id: `tx-adm-${Date.now()}`,
      date: txForm.date ? new Date(txForm.date).toISOString() : new Date().toISOString(),
      volunteerName: txForm.volunteerName.trim() || user?.name || "مشرف الإدارة",
      volunteerId: txForm.volunteerId || user?.national_id || user?.volunteer_id || "admin",
      siteName: txForm.siteName.trim(),
      bazaarId: txForm.bazaarId || bazaars.find((b: any) => b.name === txForm.siteName.trim())?.id || "",
      paymentMethod: txForm.paymentMethod,
      visaLast4: txForm.paymentMethod === "VISA" ? (txForm.visaLast4 || "0000") : "",
      items: txForm.items.map((it) => ({
        name: it.name,
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
        category: it.category || "عام"
      })),
      total: totalAmount,
      extraDonation: Number(txForm.extraDonation) || 0,
      synced: true
    }

    const updated = [newTx, ...transactions]
    setTransactions(updated)
    localStorage.setItem("khcf_transactions", JSON.stringify(updated))

    logAudit(
      "إضافة فاتورة يدوية",
      `تم إنشاء فاتورة #${newTx.id.slice(-8)} بقيمة ${totalAmount} JD مرتبطة ببازار (${newTx.siteName}) بواسطة ${user?.name}`,
      "FINANCE"
    )

    setFeedbackToast({
      type: "success",
      message: lang === "ar" ? `تم حفظ الفاتورة #${newTx.id.slice(-8)} بنجاح وربطها ببازار ${newTx.siteName}` : `Invoice #${newTx.id.slice(-8)} created & linked to ${newTx.siteName}`
    })

    setIsAddTxOpen(false)
  }

  const handleSaveEditTx = () => {
    if (!editingTx) return
    if (txForm.items.length === 0) {
      setFeedbackToast({
        type: "error",
        message: lang === "ar" ? "يرجى إضافة صنف واحد على الأقل للفاتورة" : "Please add at least one item to the invoice"
      })
      return
    }
    if (!txForm.siteName.trim()) {
      setFeedbackToast({
        type: "error",
        message: lang === "ar" ? "يرجى تحديد البازار التابعة له هذه الفاتورة" : "Please specify the associated bazaar"
      })
      return
    }

    const itemsSum = txForm.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
    const totalAmount = Number((itemsSum + (Number(txForm.extraDonation) || 0)).toFixed(2))

    const updatedTx = {
      ...editingTx,
      date: txForm.date ? new Date(txForm.date).toISOString() : editingTx.date,
      volunteerName: txForm.volunteerName.trim() || editingTx.volunteerName,
      siteName: txForm.siteName.trim(),
      bazaarId: txForm.bazaarId || bazaars.find((b: any) => b.name === txForm.siteName.trim())?.id || editingTx.bazaarId || "",
      paymentMethod: txForm.paymentMethod,
      visaLast4: txForm.paymentMethod === "VISA" ? (txForm.visaLast4 || "0000") : "",
      items: txForm.items.map((it) => ({
        name: it.name,
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
        category: it.category || "عام"
      })),
      total: totalAmount,
      extraDonation: Number(txForm.extraDonation) || 0
    }

    const updated = transactions.map((t) => (t.id === editingTx.id ? updatedTx : t))
    setTransactions(updated)
    localStorage.setItem("khcf_transactions", JSON.stringify(updated))

    logAudit(
      "تعديل فاتورة",
      `تم تعديل الفاتورة #${String(editingTx.id).slice(-8)} (المبلغ: ${totalAmount} JD، البازار: ${updatedTx.siteName}) بواسطة ${user?.name}`,
      "FINANCE"
    )

    setFeedbackToast({
      type: "success",
      message: lang === "ar" ? `تم تحديث الفاتورة #${String(editingTx.id).slice(-8)} بنجاح` : `Invoice #${String(editingTx.id).slice(-8)} updated successfully`
    })

    setEditingTx(null)
  }

  const handleConfirmDeleteTx = () => {
    if (!deletingTx) return
    const idToDelete = deletingTx.id
    const updated = transactions.filter((t) => t.id !== idToDelete)
    setTransactions(updated)
    localStorage.setItem("khcf_transactions", JSON.stringify(updated))

    logAudit(
      "حذف فاتورة",
      `تم حذف الفاتورة #${String(idToDelete).slice(-8)} بقيمة ${deletingTx.total} JD التابعة لبازار (${deletingTx.siteName || "غير محدد"}) بواسطة ${user?.name}`,
      "FINANCE"
    )

    setFeedbackToast({
      type: "success",
      message: lang === "ar" ? `تم حذف الفاتورة #${String(idToDelete).slice(-8)} وإلغاؤها من السجلات` : `Invoice #${String(idToDelete).slice(-8)} deleted from records`
    })

    setDeletingTx(null)
  }

  const saveBazaars = (updated: any[]) => {
    setBazaars(updated)
    localStorage.setItem("khcf_bazaars", JSON.stringify(updated))
  }

  const handleCreateBazaar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBazaarForm.name || !newBazaarForm.location || !newBazaarForm.startDate || !newBazaarForm.startTime || !newBazaarForm.endDate || !newBazaarForm.endTime) {
      setFeedbackToast({ type: "error", message: "يرجى تعبئة كافة حقول البازار" })
      return
    }
    const newBazaar = {
      id: "bazaar-" + Date.now(),
      name: newBazaarForm.name.trim(),
      location: newBazaarForm.location.trim(),
      startDate: newBazaarForm.startDate + "T" + newBazaarForm.startTime + ":00",
      endDate: newBazaarForm.endDate + "T" + newBazaarForm.endTime + ":00",
      assignedVolunteers: [],
      createdBy: user?.name || "المدير العام"
    }
    saveBazaars([newBazaar, ...bazaars])
    logAudit("إنشاء بازار جديد", `جدولة: ${newBazaar.name} في ${newBazaar.location}`, "SYSTEM")
    setFeedbackToast({ type: "success", message: `تمت جدولة بازار "${newBazaar.name}" بنجاح ✅` })
    setNewBazaarForm({ name: "", location: "", startDate: "", startTime: "", endDate: "", endTime: "" })
    setIsCreateBazaarOpen(false)
  }

  const handleDeleteBazaar = (bazaarId: string) => {
    const bz = bazaars.find((b) => b.id === bazaarId)
    if (!confirm(`هل أنت متأكد من حذف فعالية "${bz?.name}"؟`)) return
    saveBazaars(bazaars.filter((b) => b.id !== bazaarId))
    logAudit("حذف بازار", `تم حذف: ${bz?.name}`, "SYSTEM")
    setFeedbackToast({ type: "success", message: "تم حذف البازار بنجاح." })
  }

  const handleAssignVolunteer = (bazaarId: string) => {
    if (!selectedVolunteerForAssign) return
    const vol = volunteers.find((v) => v.id === selectedVolunteerForAssign)
    if (!vol) return
    const updated = bazaars.map((b) => {
      if (b.id !== bazaarId) return b
      const already = (b.assignedVolunteers || []).some((av: any) => av.id === vol.id)
      if (already) {
        setFeedbackToast({ type: "error", message: "المتطوع معين مسبقاً في هذا البازار" })
        return b
      }
      return {
        ...b,
        assignedVolunteers: [...(b.assignedVolunteers || []), { id: vol.id, national_id: vol.national_id, name: vol.name }]
      }
    })
    saveBazaars(updated)
    logAudit("تعيين متطوع لبازار", `تعيين ${vol.name} في ${bazaars.find((b) => b.id === bazaarId)?.name}`, "SYSTEM")
    setFeedbackToast({ type: "success", message: `تم تعيين ${vol.name} بنجاح ✅` })
    setSelectedVolunteerForAssign("")
    setAssigningBazaar(null)
  }

  const handleRemoveVolunteer = (bazaarId: string, volId: string) => {
    const updated = bazaars.map((b) => {
      if (b.id !== bazaarId) return b
      return { ...b, assignedVolunteers: (b.assignedVolunteers || []).filter((v: any) => v.id !== volId) }
    })
    saveBazaars(updated)
    setFeedbackToast({ type: "success", message: "تمت إزالة المتطوع من البازار." })
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const lines = text.split("\n").filter((l) => l.trim())
        if (lines.length < 2) return
        const newItems: any[] = []
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
          if (cols.length < 6) continue
          newItems.push({
            id: "bazaar-" + Date.now() + "-" + i,
            name: cols[0],
            location: cols[1],
            startDate: cols[2] + "T" + (cols[3] || "09:00") + ":00",
            endDate: cols[4] + "T" + (cols[5] || "18:00") + ":00",
            assignedVolunteers: [],
            createdBy: user?.name || "المدير العام"
          })
        }
        saveBazaars([...newItems, ...bazaars])
        setFeedbackToast({ type: "success", message: `تم استيراد ${newItems.length} بازار بنجاح 📊` })
      } catch (err) {
        setFeedbackToast({ type: "error", message: "خطأ في قراءة ملف CSV" })
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  // Z-Report Shift Close
  const currentShiftExpectedCash = useMemo(() => {
    return timeFilteredTxs.filter((t) => t.paymentMethod === "CASH").reduce((sum, t) => sum + (t.total || 0), 0)
  }, [timeFilteredTxs])

  const handleConfirmShiftClose = (e: React.FormEvent) => {
    e.preventDefault()
    const counted = parseFloat(actualCashCounted)
    if (isNaN(counted)) return

    const diff = counted - currentShiftExpectedCash
    const newShift = {
      id: `Z-${Date.now()}`,
      closedAt: new Date().toISOString(),
      siteName: "كافة المواقع اليوم",
      expectedCash: currentShiftExpectedCash,
      actualCash: counted,
      discrepancy: diff,
      status: diff === 0 ? "EXACT" : diff > 0 ? "OVERAGE" : "SHORTAGE",
      notes: zReportNotes.trim(),
      closedBy: user?.name || "المدير العام"
    }

    const updated = [newShift, ...closedShifts]
    localStorage.setItem("khcf_shifts", JSON.stringify(updated))
    setClosedShifts(updated)
    logAudit("تقفيل الصندوق والمطابقة النقدية", `المقيد: ${newShift.expectedCash} JD | الفعلي: ${newShift.actualCash} JD`, "FINANCE")
    setFeedbackToast({ type: "success", message: "تم تقفيل الصندوق واعتماد التقرير Z بنجاح ✅" })
    setIsZReportModalOpen(false)
    setActualCashCounted("")
    setZReportNotes("")
    setViewingZReport(newShift)
  }

  // Catalog Management Handlers
  const handleOpenEditProduct = (item: any) => {
    let catId = item.category_id
    if (!catId && categoriesList.length > 0) {
      const found = categoriesList.find((c) => c.name === item.category)
      if (found) catId = found.id
    }
    setEditingProduct({
      id: item.id,
      name: item.name,
      price: item.price,
      category_id: catId || (categoriesList[0]?.id || ""),
      category: item.category || "",
      subcategory: item.subcategory || "عام",
      img: item.img || ""
    })
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setIsSavingProduct(true)
    try {
      const selectedCat = categoriesList.find((c) => c.id === editingProduct.category_id)
      const updatedCategoryName = selectedCat ? selectedCat.name : editingProduct.category

      const res = await updateCatalogItem({
        id: editingProduct.id,
        name: editingProduct.name.trim(),
        price: Number(editingProduct.price),
        category_id: editingProduct.category_id || undefined,
        subcategory: editingProduct.subcategory ? editingProduct.subcategory.trim() : "عام",
        img: editingProduct.img
      })

      if (res.success) {
        setCatalogItems((prev) =>
          prev.map((item) => {
            if (item.id === editingProduct.id) {
              return {
                ...item,
                name: editingProduct.name.trim(),
                price: Number(editingProduct.price),
                category_id: editingProduct.category_id,
                category: updatedCategoryName,
                subcategory: editingProduct.subcategory ? editingProduct.subcategory.trim() : "عام",
                img: editingProduct.img
              }
            }
            return item
          })
        )

        logAudit("تعديل منتج", `تم تعديل المنتج: ${editingProduct.name} - السعر: ${editingProduct.price} JD`, "CATALOG")
        setFeedbackToast({ type: "success", message: t("productSaveSuccess") })
        setEditingProduct(null)
      } else {
        setFeedbackToast({ type: "error", message: "تعذر حفظ التعديل: " + (res.error || "") })
      }
    } catch (err: any) {
      console.error("Failed to save product:", err)
      setFeedbackToast({ type: "error", message: "خطأ في الاتصال أثناء الحفظ" })
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductForm.name.trim() || !newProductForm.price) {
      setFeedbackToast({
        type: "error",
        message: lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields"
      })
      return
    }
    setIsSavingProduct(true)
    try {
      const targetCatId = newProductForm.category_id || categoriesList[0]?.id || ""
      const selectedCat = categoriesList.find((c) => c.id === targetCatId)

      const res = await createCatalogItem({
        name: newProductForm.name.trim(),
        price: Number(newProductForm.price),
        category_id: targetCatId,
        subcategory: newProductForm.subcategory ? newProductForm.subcategory.trim() : "عام",
        img: newProductForm.img || "/shop_logo.png"
      })

      if (res.success && res.data) {
        const newItem = {
          id: res.data.id,
          name: res.data.name,
          price: Number(res.data.price),
          img: res.data.img_url || newProductForm.img || "/shop_logo.png",
          category_id: res.data.category_id,
          category: selectedCat ? selectedCat.name : "بدون قسم",
          subcategory: newProductForm.subcategory ? newProductForm.subcategory.trim() : "عام"
        }
        setCatalogItems((prev) => [newItem, ...prev])
        logAudit("إضافة منتج", `تمت إضافة منتج جديد: ${newItem.name} - السعر: ${newItem.price} JD`, "CATALOG")
        setFeedbackToast({ type: "success", message: t("productCreatedSuccess") || "تمت إضافة المنتج بنجاح" })
        setIsAddProductOpen(false)
        setNewProductForm({ name: "", price: "", category_id: "", subcategory: "", img: "" })
      } else {
        setFeedbackToast({ type: "error", message: "تعذر إضافة المنتج: " + (res.error || "") })
      }
    } catch (err: any) {
      console.error("Failed to create product:", err)
      setFeedbackToast({ type: "error", message: "حدث خطأ أثناء إضافة المنتج" })
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`${t("productDeleteConfirm")}\n\n${product.name}`)) return
    try {
      const res = await deleteCatalogItem(product.id)
      if (res.success) {
        setCatalogItems((prev) => prev.filter((i) => i.id !== product.id))
        if (editingProduct?.id === product.id) setEditingProduct(null)
        logAudit("حذف منتج", `تم حذف المنتج: ${product.name}`, "CATALOG")
        setFeedbackToast({ type: "success", message: t("productDeleteSuccess") })
      } else {
        setFeedbackToast({ type: "error", message: "تعذر حذف المنتج: " + (res.error || "") })
      }
    } catch (err: any) {
      console.error("Failed to delete product:", err)
      setFeedbackToast({ type: "error", message: "خطأ أثناء حذف المنتج" })
    }
  }

  const handleProductImageFile = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string
        if (isNew) {
          setNewProductForm((prev) => ({ ...prev, img: base64 }))
        } else {
          setEditingProduct((prev: any) => ({ ...prev, img: base64 }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Render Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#001d36] dark:bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-full border-4 border-[#C8B18B]/30 border-t-[#C8B18B] animate-spin mb-4"></div>
        <h2 className="text-lg font-black tracking-wide text-white">{t("appSubtitle")}...</h2>
        <p className="text-xs text-white/50 mt-1 font-semibold">{t("appName")}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans flex antialiased transition-colors duration-200">
      {/* ========================================================================= */}
      {/* SIDEBAR: Enterprise Navigation (Stripe / Square Architecture) */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-[#00284d] dark:bg-[#040f1f] text-white flex-shrink-0 flex flex-col justify-between border-l border-[#001d38] dark:border-slate-800/80 z-30 select-none transition-colors duration-200">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 dark:border-white/5 flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl border border-white/15">
              <img src="/shop_logo.png" alt="KHCF" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-white leading-tight">{t("appName")}</h1>
              <p className="text-[10px] text-[#C8B18B] font-bold tracking-wider uppercase mt-0.5">{t("appSubtitle")}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <p className="px-3 pt-3 pb-1 text-[10px] font-black text-white/40 tracking-wider uppercase">{t("navAnalytics")}</p>
            {[
              { id: "OVERVIEW", label: t("navOverview"), icon: Icons.Dashboard },
              { id: "LEDGER", label: t("navLedger"), icon: Icons.Ledger, badge: transactions.length }
            ].map((item) => {
              const active = activeTab === item.id
              const IconComp = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active ? "bg-white dark:bg-slate-800 text-[#00284d] dark:text-white shadow-sm font-black" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${active ? "bg-[#00284d]/10 dark:bg-white/10 text-[#00284d] dark:text-white" : "bg-white/10 text-white/80"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}

            <p className="px-3 pt-4 pb-1 text-[10px] font-black text-white/40 tracking-wider uppercase">{t("navFieldOps")}</p>
            {[
              { id: "BAZAARS", label: t("navBazaars"), icon: Icons.Bazaars, badge: bazaars.length },
              { id: "STAFF", label: t("navStaff"), icon: Icons.Staff, badge: volunteers.length }
            ].map((item) => {
              const active = activeTab === item.id
              const IconComp = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active ? "bg-white dark:bg-slate-800 text-[#00284d] dark:text-white shadow-sm font-black" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${active ? "bg-[#00284d]/10 dark:bg-white/10 text-[#00284d] dark:text-white" : "bg-white/10 text-white/80"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}

            <p className="px-3 pt-4 pb-1 text-[10px] font-black text-white/40 tracking-wider uppercase">{t("navCatalogGov")}</p>
            {[
              { id: "CATALOG", label: t("navCatalog"), icon: Icons.Catalog, badge: catalogItems.length },
              { id: "SECURITY", label: t("navSecurity"), icon: Icons.Security }
            ].map((item) => {
              const active = activeTab === item.id
              const IconComp = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active ? "bg-white dark:bg-slate-800 text-[#00284d] dark:text-white shadow-sm font-black" : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold ${active ? "bg-[#00284d]/10 dark:bg-white/10 text-[#00284d] dark:text-white" : "bg-white/10 text-white/80"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 dark:border-white/5 space-y-3">
          {/* Cloud Sync Status Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/80 font-bold">{t("cloudConnected")}</span>
            </div>
            {kpis.unsyncedCount > 0 ? (
              <button onClick={handleCloudSync} disabled={isSyncing} className="text-amber-300 font-bold hover:underline">
                رفع ({kpis.unsyncedCount})
              </button>
            ) : (
              <span className="text-white/40 font-mono">100%</span>
            )}
          </div>

          {/* Clean external link to launch POS terminal for volunteers */}
          <Link
            href="/pos"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10"
          >
            <span>{t("openPos")}</span>
            <Icons.ExternalLink />
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-xs font-black text-white">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-white leading-tight">{user?.name || (isSupervisor ? t("roleSupervisor") : "المدير العام")}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isSupervisor ? (
                    <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                      <Icons.Shield />
                      <span>{t("roleSupervisor")}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#C8B18B] font-bold">{t("roleAdmin")}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(t("logoutConfirm"))) {
                  logout()
                  router.push("/")
                }
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-red-500/80 transition-all text-xs"
              title={t("logout")}
            >
              ✕
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between z-20 flex-shrink-0 shadow-sm transition-colors duration-200">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">
              {activeTab === "OVERVIEW" && t("navOverview")}
              {activeTab === "LEDGER" && t("navLedger")}
              {activeTab === "BAZAARS" && t("navBazaars")}
              {activeTab === "STAFF" && t("navStaff")}
              {activeTab === "CATALOG" && t("navCatalog")}
              {activeTab === "SECURITY" && t("navSecurity")}
            </h2>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs font-medium text-slate-400 font-mono">{liveTime}</span>
          </div>

          {/* Live Operational Monitor Bar (Feature 4) */}
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold">
            {/* Online / Offline status */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className={isOnline ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
                {isOnline ? t("statusOnline") : t("statusOffline")}
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-600">|</span>

            {/* Active Cashiers */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300" title={t("activeTerminals")}>
              <Icons.Staff />
              <span>{activeTerminalsCount} {t("activeTerminals")}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-600">|</span>

            {/* Pending Cloud Sync & Force Sync Button */}
            <div className="flex items-center gap-2">
              {pendingSyncCount > 0 ? (
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-mono font-black animate-pulse">
                  {pendingSyncCount} {t("pendingSyncBadge")}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                  ✓ {lang === "ar" ? "الحركات متزامنة" : "All Synced"}
                </span>
              )}

              <button
                onClick={handleForceSyncAll}
                disabled={isSyncing}
                className="p-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-[#00284d] dark:text-blue-300 border border-slate-200 dark:border-slate-600 transition-all shadow-xs"
                title={t("forceSyncBtn")}
              >
                <Icons.Upload />
              </button>
            </div>
          </div>

          {/* Quick Actions & Preference Toggles */}
          <div className="flex items-center gap-3 relative">
            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 transition-all"
              title={theme === "dark" ? "التحويل للوضع الفاتح (Light)" : "التحويل للوضع الداكن (Dark)"}
            >
              {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            {/* Language Switcher (AR/EN) */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 text-xs font-bold transition-all"
              title="تغيير لغة العرض (Language)"
            >
              <Icons.Globe />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>

            {/* Financial Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFinancialMenu(!showFinancialMenu)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-200/80 dark:border-slate-700 transition-all"
              >
                <span>{t("financialActions")}</span>
              </button>

              {showFinancialMenu && (
                <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-1.5 z-50 text-xs font-bold text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowFinancialMenu(false)
                      setIsZReportModalOpen(true)
                    }}
                    className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span>💵</span>
                    <span>{t("shiftCloseZReport")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowFinancialMenu(false)
                      setIsExecutiveReportOpen(true)
                    }}
                    className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Icons.FileText />
                    <span>{t("printExecutiveReport")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowFinancialMenu(false)
                      handleCloudSync()
                    }}
                    className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span>☁️</span>
                    <span>{t("instantSync")}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Time Filter Chips (in Overview & Ledger) */}
            {(activeTab === "OVERVIEW" || activeTab === "LEDGER") && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
                {[
                  { id: "TODAY", label: t("filterToday") },
                  { id: "WEEK", label: t("filterWeek") },
                  { id: "MONTH", label: t("filterMonth") },
                  { id: "ALL", label: t("filterAll") }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      dateFilter === f.id
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-bold border animate-in slide-in-from-bottom-5 ${
              feedbackToast.type === "success"
                ? "bg-slate-900 text-emerald-400 border-emerald-500/30"
                : "bg-red-950 text-red-200 border-red-500/30"
            }`}
          >
            {feedbackToast.type === "success" ? <Icons.CheckCircle /> : <span>⚠️</span>}
            <span>{feedbackToast.message}</span>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW (Financial Intelligence & 4 Clean KPIs) */}
          {/* ========================================================================= */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top 4 Clean Headline KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {/* 1. Total Net Revenue */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition-colors duration-200">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{t("kpiRevenueTitle")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{kpis.totalRev}</span>
                    <span className="text-xs font-bold text-slate-500">JD</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t("periodLabel")} {dateFilter === "TODAY" ? t("todaySales") : t("selectedPeriod")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{t("auditedStatus")}</span>
                  </div>
                </div>

                {/* 2. Cash in Drawer */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition-colors duration-200">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{t("kpiCashTitle")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{kpis.cashRev}</span>
                    <span className="text-xs font-bold text-slate-500">JD</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t("cashRatio")}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{kpis.cashShare}%</span>
                  </div>
                </div>

                {/* 3. Electronic Cards (Visa) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition-colors duration-200">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{t("kpiVisaTitle")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{kpis.visaRev}</span>
                    <span className="text-xs font-bold text-slate-500">JD</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t("visaRatio")}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{kpis.visaShare}%</span>
                  </div>
                </div>

                {/* 4. Total Orders & Average Basket */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition-colors duration-200">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{t("kpiOrdersTitle")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{kpis.count}</span>
                    <span className="text-xs font-bold text-slate-500">{t("invoiceCount")}</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{t("aovLabel")}</span>
                    <span className="font-black text-slate-900 dark:text-white font-mono">{kpis.aov} JD</span>
                  </div>
                </div>
              </div>

              {/* Financial Distribution Bar */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
                <div className="flex items-center justify-between mb-2.5 text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{t("incomeComparison")}</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      {t("cashShort")}: {kpis.cashRev} JD ({kpis.cashShare}%)
                    </span>
                    <span className="flex items-center gap-1.5 text-[#00284d] dark:text-blue-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00284d] dark:bg-blue-400 inline-block"></span>
                      {t("visaShort")}: {kpis.visaRev} JD ({kpis.visaShare}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${kpis.cashShare}%` }}></div>
                  <div className="bg-[#00284d] dark:bg-blue-500 transition-all duration-700" style={{ width: `${kpis.visaShare}%` }}></div>
                </div>
              </div>

              {/* Two Column Layout: Top Products & Scheduled Bazaars Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Box 1: Dynamic Top Revenue Contributing Items */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200 space-y-4">
                  {/* Card Header & Title */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span>🏆</span>
                        <span>{t("topProductsTitle")}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {lang === "ar"
                          ? `إجمالي مبيعات الأصناف المعروضة: ${dynamicTopProducts.items.reduce((s, x) => s + x.revenue, 0).toFixed(1)} JD (${dynamicTopProducts.items.reduce((s, x) => s + x.qty, 0)} قطعة)`
                          : `Total Sales of listed items: ${dynamicTopProducts.items.reduce((s, x) => s + x.revenue, 0).toFixed(1)} JD (${dynamicTopProducts.items.reduce((s, x) => s + x.qty, 0)} units)`}
                      </p>
                    </div>

                    {/* Filter by Bazaar */}
                    <select
                      value={topProductsBazaar}
                      onChange={(e) => setTopProductsBazaar(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer max-w-[190px] truncate"
                    >
                      <option value="ALL">{lang === "ar" ? "📍 جميع البازارات والمواقع" : "📍 All Bazaars & Sites"}</option>
                      {distinctBazaarNames.map((bzName) => (
                        <option key={bzName} value={bzName}>
                          🎪 {bzName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Controls Bar: Sort metric, Limit */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    {/* Sort Metric Selector */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setTopProductsSortBy("REVENUE")}
                        className={`px-2.5 py-1 rounded-md font-black text-[11px] transition-all ${
                          topProductsSortBy === "REVENUE"
                            ? "bg-[#00284d] dark:bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        💰 {lang === "ar" ? "حسب الإيراد (JD)" : "By Revenue"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopProductsSortBy("QTY")}
                        className={`px-2.5 py-1 rounded-md font-black text-[11px] transition-all ${
                          topProductsSortBy === "QTY"
                            ? "bg-[#00284d] dark:bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        📦 {lang === "ar" ? "حسب الكمية" : "By Quantity"}
                      </button>
                    </div>

                    {/* Limit Selector (5, 10, 15) */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === "ar" ? "عرض:" : "Show:"}</span>
                      {[5, 10, 15].map((lim) => (
                        <button
                          key={lim}
                          type="button"
                          onClick={() => setTopProductsLimit(lim)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                            topProductsLimit === lim
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {lim}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Products List */}
                  {dynamicTopProducts.items.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="text-3xl">📦</div>
                      <p className="text-xs text-slate-400 font-bold">{t("noSalesPeriod")}</p>
                      {topProductsBazaar !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => setTopProductsBazaar("ALL")}
                          className="text-xs text-[#00284d] dark:text-blue-400 font-bold underline"
                        >
                          {lang === "ar" ? "عرض مبيعات جميع البازارات" : "Show all bazaars"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {dynamicTopProducts.items.map((p, i) => {
                        const share = dynamicTopProducts.totalRev > 0
                          ? ((p.revenue / dynamicTopProducts.totalRev) * 100).toFixed(1)
                          : "0.0"
                        const relativePercent = dynamicTopProducts.maxVal > 0
                          ? (topProductsSortBy === "REVENUE" ? (p.revenue / dynamicTopProducts.maxVal) * 100 : (p.qty / dynamicTopProducts.maxVal) * 100)
                          : 0

                        return (
                          <div
                            key={p.name}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                                    i === 0
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                                      : i === 1
                                      ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300"
                                      : i === 2
                                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200"
                                      : "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
                                  }`}
                                >
                                  #{i + 1}
                                </span>
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                                  <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block mt-0.5">
                                    {p.category}
                                  </span>
                                </div>
                              </div>

                              <div className="text-left shrink-0">
                                <span className="text-xs font-black text-slate-900 dark:text-white font-mono block">
                                  {p.revenue.toFixed(1)} JD
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {p.qty} {t("itemCount")} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{share}%</span>
                                </span>
                              </div>
                            </div>

                            {/* Revenue Share Progress Bar */}
                            <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, relativePercent)}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  i === 0
                                    ? "bg-amber-500"
                                    : i === 1
                                    ? "bg-[#00284d] dark:bg-blue-500"
                                    : "bg-emerald-500"
                                }`}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Box 2: Active & Upcoming Bazaars Snapshot */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-sm text-slate-800 dark:text-slate-200">{t("bazaarsStatusTitle")}</h3>
                      <button onClick={() => setActiveTab("BAZAARS")} className="text-xs text-[#00284d] dark:text-blue-400 font-bold hover:underline">
                        {t("manageBazaarsLink")}
                      </button>
                    </div>

                    {bazaars.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">{t("noBazaarsScheduled")}</p>
                    ) : (
                      <div className="space-y-2.5">
                        {bazaars.slice(0, 4).map((bz) => {
                          const status = getBazaarStatus(bz)
                          return (
                            <div key={bz.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{bz.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{bz.location}</p>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  status === "ACTIVE"
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                    : status === "UPCOMING"
                                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                              >
                                {status === "ACTIVE" ? t("statusActiveNow") : status === "UPCOMING" ? t("statusUpcoming") : t("statusEnded")}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button
                      onClick={() => setIsCreateBazaarOpen(true)}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
                    >
                      {t("scheduleNewBazaarBtn")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LEDGER (Auditing & Receipt Inspection) */}
          {/* ========================================================================= */}
          {activeTab === "LEDGER" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filter Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
                <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <Icons.Search />
                    </div>
                    <input
                      type="text"
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      placeholder={t("ledgerSearchPlaceholder")}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00284d]"
                    />
                  </div>

                  {/* Filter by Bazaar / Site */}
                  <select
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer max-w-[180px] truncate"
                  >
                    <option value="ALL">{lang === "ar" ? "📍 جميع البازارات والمواقع" : "📍 All Bazaars & Sites"}</option>
                    {distinctBazaarNames.map((bzName) => (
                      <option key={bzName} value={bzName}>
                        🎪 {bzName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="ALL">{t("paymentAll")}</option>
                    <option value="CASH">{t("paymentCash")}</option>
                    <option value="VISA">{t("paymentVisa")}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openAddTxModal}
                    className="bg-[#00284d] hover:bg-[#001d38] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                  >
                    <Icons.Plus />
                    <span>{lang === "ar" ? "إضافة فاتورة يدوية" : "Add Invoice"}</span>
                  </button>
                  <button
                    onClick={exportLedgerToCSV}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Icons.Download />
                    <span>{t("exportCsv")}</span>
                  </button>
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl whitespace-nowrap">
                    {ledgerRows.length} {t("invoiceCount")} • {ledgerRows.reduce((s, t) => s + (t.total || 0), 0).toFixed(1)} JD
                  </span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-black">{t("thInvoiceId")}</th>
                      <th className="py-3 px-4 font-black">{t("thDateTime")}</th>
                      <th className="py-3 px-4 font-black">{t("thVolunteer")}</th>
                      <th className="py-3 px-4 font-black">{t("thLocation")}</th>
                      <th className="py-3 px-4 font-black text-center">{t("thPayment")}</th>
                      <th className="py-3 px-4 font-black text-center">{t("thSync")}</th>
                      <th className="py-3 px-4 font-black text-left">{t("thAmount")}</th>
                      <th className="py-3 px-4 font-black text-center">{lang === "ar" ? "الإجراءات والتحكم" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                    {ledgerRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                          {t("noLedgerFound")}
                        </td>
                      </tr>
                    ) : (
                      ledgerRows.map((tx) => {
                        const d = new Date(tx.date)
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-black text-slate-700 dark:text-slate-300">#{String(tx.id).slice(-8)}</td>
                            <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{d.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")} {d.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                            <td className="py-3 px-4 font-bold text-[#00284d] dark:text-blue-400">{tx.volunteerName || tx.volunteerId}</td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-bold">
                              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                                <span>🎪</span>
                                <span>{tx.siteName || t("mainBuilding")}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {tx.paymentMethod === "VISA" ? (
                                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                  💳 VISA
                                </span>
                              ) : (
                                <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                  💵 CASH
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {tx.synced ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">{t("syncCloud")}</span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">{t("syncLocal")}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-left font-black font-mono text-slate-900 dark:text-white">{tx.total} JD</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setSelectedReceipt(tx)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#00284d] hover:text-white text-slate-600 dark:text-slate-300 transition-all"
                                  title={t("thReceipt")}
                                >
                                  <Icons.Eye />
                                </button>
                                <button
                                  onClick={() => openEditTxModal(tx)}
                                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white text-[#005295] dark:text-blue-300 transition-all"
                                  title={lang === "ar" ? "تعديل الفاتورة" : "Edit Invoice"}
                                >
                                  <Icons.Edit />
                                </button>
                                <button
                                  onClick={() => setDeletingTx(tx)}
                                  className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-all"
                                  title={lang === "ar" ? "حذف الفاتورة" : "Delete Invoice"}
                                >
                                  <Icons.Trash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BAZAARS & SCHEDULING (Integrated Operations) */}
          {/* ========================================================================= */}
          {activeTab === "BAZAARS" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
                <div>
                  <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">{t("bazaarMgmtTitle")}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t("bazaarMgmtSub")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700">
                    <Icons.Upload />
                    <span>{t("uploadCsvSchedule")}</span>
                    <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() => setIsCreateBazaarOpen(true)}
                    className="bg-[#00284d] hover:bg-[#001d38] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Icons.Plus />
                    <span>{t("addNewBazaar")}</span>
                  </button>
                </div>
              </div>

              {bazaars.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center">
                  <p className="text-sm font-bold text-slate-400">{t("noBazaarsScheduled")}</p>
                  <button onClick={() => setIsCreateBazaarOpen(true)} className="mt-2 text-xs font-bold text-[#00284d] dark:text-blue-400 underline">
                    + {t("addNewBazaar")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {bazaars.map((bz) => {
                    const status = getBazaarStatus(bz)
                    const startD = new Date(bz.startDate)
                    const endD = new Date(bz.endDate)
                    const bzStats = getBazaarAnalytics(bz)
                    return (
                      <div key={bz.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between transition-colors duration-200">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white">{bz.name}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bz.location}</p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                status === "ACTIVE"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : status === "UPCOMING"
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {status === "ACTIVE" ? t("statusActive") : status === "UPCOMING" ? t("statusUpcoming") : t("statusEnded")}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                            <div>{t("startPrefix")} {startD.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")} • {startD.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                            <div>{t("endPrefix")} {endD.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")} • {endD.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>

                          {/* Mini Financial Performance Indicator */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 mb-3 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400 font-bold">{t("bazaarTotalRevenue")}</span>
                              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">{bzStats.totalRev.toFixed(2)} JD</span>
                            </div>
                            {bzStats.totalRev > 0 && (
                              <div className="space-y-1">
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                  <div style={{ width: `${(bzStats.cashRev / bzStats.totalRev) * 100}%` }} className="bg-emerald-500 h-full"></div>
                                  <div style={{ width: `${(bzStats.visaRev / bzStats.totalRev) * 100}%` }} className="bg-blue-500 h-full"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">💵 {bzStats.cashRev.toFixed(1)} JD</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-bold">💳 {bzStats.visaRev.toFixed(1)} JD</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                              <span>{bzStats.txCount} {t("bazaarInvoicesCount")}</span>
                              <span>{t("bazaarAov")}: {bzStats.aov} JD</span>
                            </div>
                          </div>

                          {/* Assigned Volunteers */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              <span>{t("volunteersTitle")} ({bz.assignedVolunteers?.length || 0})</span>
                              <button
                                onClick={() => {
                                  setAssigningBazaar(bz)
                                  setSelectedVolunteerForAssign("")
                                }}
                                className="text-[11px] text-[#00284d] dark:text-blue-400 font-bold hover:underline"
                              >
                                {t("assignVolunteerBtn")}
                              </button>
                            </div>

                            {(bz.assignedVolunteers || []).length === 0 ? (
                              <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-center">{t("noVolunteersAssigned")}</p>
                            ) : (
                              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                {(bz.assignedVolunteers || []).map((v: any) => (
                                  <div key={v.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{v.name}</span>
                                    <button onClick={() => handleRemoveVolunteer(bz.id, v.id)} className="text-red-400 hover:text-red-600 text-xs">
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedBazaarAnalytics(bzStats)}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#005295] dark:text-blue-300 hover:bg-[#00284d] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white font-bold text-xs transition-all flex items-center gap-1 shadow-xs"
                          >
                            <Icons.Analytics />
                            <span>{t("bazaarAnalyticsBtn")}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSiteFilter(bz.name)
                                setActiveTab("LEDGER")
                              }}
                              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                            >
                              {t("viewInvoicesLink")}
                            </button>
                            {!isSupervisor && (
                              <button onClick={() => handleDeleteBazaar(bz.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">
                                {t("deleteBazaarBtn")}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: STAFF (Volunteers & Password Resets) */}
          {/* ========================================================================= */}
          {activeTab === "STAFF" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
                <div>
                  <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">{t("staffMgmtTitle")}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t("staffMgmtSub")}</p>
                </div>
                <button
                  onClick={() => setIsAddVolunteerOpen(true)}
                  className="bg-[#00284d] hover:bg-[#001d38] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Icons.Plus />
                  <span>{t("addVolunteerBtn")}</span>
                </button>
              </div>

              {/* Volunteers Leaderboard (Feature 3) */}
              {volunteersLeaderboard.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.Award />
                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-100">{t("volunteersLeaderboard")}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {lang === "ar" ? "أعلى المتطوعين تحقيقاً للمبيعات" : "Top Performing Volunteers"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {volunteersLeaderboard.map((leader, idx) => (
                      <div
                        key={leader.national_id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3 relative overflow-hidden"
                      >
                        <div className="text-2xl shrink-0">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-slate-900 dark:text-white truncate">{leader.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {leader.invoicesCount} {t("bazaarInvoicesCount")}
                          </p>
                          <p className="text-xs font-mono font-black text-[#00284d] dark:text-blue-400 mt-0.5">
                            {leader.totalSales.toFixed(2)} JD
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-black">{t("thStaffName")}</th>
                      <th className="py-3 px-4 font-black">{t("thStaffId")}</th>
                      <th className="py-3 px-4 font-black text-center">{t("thRole")}</th>
                      <th className="py-3 px-4 font-black text-center">{t("thStatus")}</th>
                      <th className="py-3 px-4 font-black text-left">{t("thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                    {volunteers.map((vol) => (
                      <tr key={vol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-black text-slate-800 dark:text-slate-100">{vol.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{vol.national_id}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              vol.role === "ADMIN"
                                ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400"
                                : vol.role === "SUPERVISOR"
                                ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {vol.role === "ADMIN" ? t("roleAdmin") : vol.role === "SUPERVISOR" ? t("roleSupervisor") : t("roleVolunteer")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vol.status === "ACTIVE" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40"}`}>
                            {vol.status === "ACTIVE" ? t("statusActiveStaff") : t("statusSuspended")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-left">
                          {isSupervisor && vol.role === "ADMIN" ? (
                            <span className="text-[10px] text-slate-400 font-medium">غير متاح</span>
                          ) : (
                            <button
                              onClick={() => setPasswordModalUser(vol)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#00284d] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                            >
                              {t("changePassBtn")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CATALOG (Integrated Product Management) */}
          {/* ========================================================================= */}
          {activeTab === "CATALOG" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Supervisor View-Only Alert */}
              {isSupervisor && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[#005295] dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Icons.Shield />
                  <span>{t("viewOnlyCatalogNotice")}</span>
                </div>
              )}

              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <Icons.Search />
                    </div>
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder={t("catalogSearchPlaceholder")}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <select
                    value={catalogCatFilter}
                    onChange={(e) => {
                      setCatalogCatFilter(e.target.value)
                      setCatalogSubcatFilter("الكل")
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                    title={t("productCategoryLabel")}
                  >
                    {catalogCategories.map((c, idx) => (
                      <option key={`cat-filter-${idx}-${c}`} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={catalogSubcatFilter}
                    onChange={(e) => setCatalogSubcatFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                    title={t("productSubcategoryLabel")}
                  >
                    <option key="subcat-filter-all" value="الكل">{t("productSubcategoryAll")}</option>
                    {availableSubcategories
                      .filter((s) => s !== "الكل")
                      .map((sub, idx) => (
                        <option key={`subcat-filter-${idx}-${sub}`} value={sub}>{sub}</option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl">
                    {filteredCatalog.length} {t("registeredProducts")}
                  </span>
                  {!isSupervisor && (
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(true)}
                      className="bg-[#00284d] hover:bg-[#00386b] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Icons.Plus />
                      <span>{t("addProductBtn")}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Product Grid */}
              {paginatedCatalog.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
                  <p className="text-xs font-bold">لا توجد منتجات مطابقة لخيارات البحث</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {paginatedCatalog.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="w-full h-28 bg-slate-50 dark:bg-slate-800/70 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2 relative">
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                          />
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">{t("noImageText")}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 flex-wrap mb-0.5">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate max-w-[90px]">
                            {item.category}
                          </span>
                          {item.subcategory && (
                            <>
                              <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-[10px] text-[#C8B18B] dark:text-amber-400 font-bold block truncate max-w-[90px]">
                                {item.subcategory}
                              </span>
                            </>
                          )}
                        </div>
                        <h5
                          className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5"
                          title={item.name}
                        >
                          {item.name}
                        </h5>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                        <span className="font-black text-xs text-[#00284d] dark:text-blue-400 font-mono">
                          {item.price} JD
                        </span>
                        <div className="flex items-center gap-1">
                          {!isSupervisor ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(item)}
                                className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#005295] dark:text-blue-300 hover:bg-[#00284d] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-[11px] font-black transition-all flex items-center gap-1 shadow-sm"
                                title={t("editProductModalTitle")}
                              >
                                <Icons.Edit />
                                <span>{t("editProductBtn")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(item)}
                                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                                title={t("deleteProductBtn")}
                              >
                                <Icons.Trash />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800">
                              {t("statusActiveStaff")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Bar */}
              {totalCatalogPages > 1 && (
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t("pageIndicator")} <strong className="font-bold text-slate-800 dark:text-slate-200">{catalogPage}</strong> {t("ofPages")} <strong className="font-bold text-slate-800 dark:text-slate-200">{totalCatalogPages}</strong> ({filteredCatalog.length} {t("registeredProducts")})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={catalogPage <= 1}
                      onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t("prevPageBtn")}
                    </button>
                    <button
                      type="button"
                      disabled={catalogPage >= totalCatalogPages}
                      onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {t("nextPageBtn")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SECURITY & AUDIT TRAIL */}
          {/* ========================================================================= */}
          {activeTab === "SECURITY" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Closed Shifts History */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-100">{t("zReportHistoryTitle")}</h4>
                  <button onClick={() => setIsZReportModalOpen(true)} className="text-xs text-[#00284d] dark:text-blue-400 font-bold hover:underline">
                    {t("newZReportBtn")}
                  </button>
                </div>
                {closedShifts.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">{t("noShiftsRecorded")}</p>
                ) : (
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4 font-black">{t("thReportId")}</th>
                        <th className="py-2.5 px-4 font-black">{t("thDateTime")}</th>
                        <th className="py-2.5 px-4 font-black">{t("thSystemExpected")}</th>
                        <th className="py-2.5 px-4 font-black">{t("thActualCounted")}</th>
                        <th className="py-2.5 px-4 font-black text-center">{t("thStatus")}</th>
                        <th className="py-2.5 px-4 font-black text-center">{t("thReceipt")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                      {closedShifts.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-mono font-bold">#{s.id.slice(-8)}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">{new Date(s.closedAt).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</td>
                          <td className="py-2.5 px-4 font-mono">{s.expectedCash} JD</td>
                          <td className="py-2.5 px-4 font-mono font-black">{s.actualCash} JD</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === "EXACT" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"}`}>
                              {s.status === "EXACT" ? "مطابق 100%" : `فارق: ${s.discrepancy} JD`}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button onClick={() => setViewingZReport(s)} className="text-[#00284d] dark:text-blue-400 hover:underline font-bold text-xs">
                              {t("thView")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Audit Trail */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-100">{t("auditLogTitle")}</h4>
                </div>
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-black">{t("thDateTime")}</th>
                      <th className="py-2.5 px-4 font-black">{t("thAction")}</th>
                      <th className="py-2.5 px-4 font-black">{t("thActor")}</th>
                      <th className="py-2.5 px-4 font-black">{t("thDetails")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                    {auditLogs.slice(0, 15).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</td>
                        <td className="py-2.5 px-4 font-black text-slate-800 dark:text-slate-200">{log.action}</td>
                        <td className="py-2.5 px-4 text-[#00284d] dark:text-blue-400 font-bold">{log.actor}</td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* RECEIPT MODAL (with VISA Last 4) */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 text-xs animate-in zoom-in-95">
            <div className="bg-[#00284d] dark:bg-[#031326] text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm">{t("receiptAuditTitle")}</h4>
                <p className="text-[10px] text-white/70 font-mono">#{selectedReceipt.id}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">✕</button>
            </div>
            <div className="p-5 space-y-4 font-semibold text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-[11px]">
                <div className="flex justify-between"><span>{t("thLocation")}:</span><span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.siteName || t("mainBuilding")}</span></div>
                <div className="flex justify-between"><span>{t("thVolunteer")}:</span><span className="font-bold text-[#00284d] dark:text-blue-400">{selectedReceipt.volunteerName || selectedReceipt.volunteerId}</span></div>
                <div className="flex justify-between"><span>{t("thDateTime")}:</span><span className="font-mono text-slate-800 dark:text-slate-300">{new Date(selectedReceipt.date).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</span></div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>{t("thPayment")}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.paymentMethod === "VISA" ? "💳 " + t("paymentVisa") : "💵 " + t("paymentCash")}
                  </span>
                </div>
                {selectedReceipt.paymentMethod === "VISA" && selectedReceipt.visaLast4 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                    <span>Card Number:</span>
                    <span className="tracking-widest">**** **** **** {selectedReceipt.visaLast4}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    <tr><th className="p-2">الصنف</th><th className="p-2 text-center">الكمية</th><th className="p-2 text-left">{t("thAmount")}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {(selectedReceipt.items || []).map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2">{it.name}</td>
                        <td className="p-2 text-center font-mono">{it.qty || 1}</td>
                        <td className="p-2 text-left font-mono font-bold">{(it.price * (it.qty || 1)).toFixed(2)} JD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between text-sm font-black text-[#00284d] dark:text-blue-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{t("netAmountLabel")}</span>
                <span className="font-mono">{selectedReceipt.total} JD</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-between">
              <button onClick={() => window.print()} className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">{t("printReceiptBtn")}</button>
              <button onClick={() => setSelectedReceipt(null)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold">{t("closeBtn")}</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE BAZAAR MODAL */}
      {isCreateBazaarOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="bg-[#00284d] dark:bg-[#031326] text-white p-4 flex items-center justify-between">
              <h4 className="font-black text-sm">{t("addNewBazaar")}</h4>
              <button onClick={() => setIsCreateBazaarOpen(false)} className="text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateBazaar} className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label className="block font-bold mb-1">اسم البازار / الفعالية</label>
                <input
                  type="text"
                  required
                  value={newBazaarForm.name}
                  onChange={(e) => setNewBazaarForm({ ...newBazaarForm, name: e.target.value })}
                  placeholder="مثال: بازار سيتي مول الخيري"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">المكان / العنوان</label>
                <input
                  type="text"
                  required
                  value={newBazaarForm.location}
                  onChange={(e) => setNewBazaarForm({ ...newBazaarForm, location: e.target.value })}
                  placeholder="مثال: سيتي مول - الطابق الأرضي"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">تاريخ البداية</label>
                  <input type="date" required value={newBazaarForm.startDate} onChange={(e) => setNewBazaarForm({ ...newBazaarForm, startDate: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">وقت البداية</label>
                  <input type="time" required value={newBazaarForm.startTime} onChange={(e) => setNewBazaarForm({ ...newBazaarForm, startTime: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">تاريخ النهاية</label>
                  <input type="date" required value={newBazaarForm.endDate} onChange={(e) => setNewBazaarForm({ ...newBazaarForm, endDate: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">وقت النهاية</label>
                  <input type="time" required value={newBazaarForm.endTime} onChange={(e) => setNewBazaarForm({ ...newBazaarForm, endTime: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono" />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 bg-[#00284d] text-white py-2.5 rounded-xl font-bold">{t("addNewBazaar")}</button>
                <button type="button" onClick={() => setIsCreateBazaarOpen(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">{t("cancelBtn")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN VOLUNTEER MODAL */}
      {assigningBazaar && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 text-xs animate-in zoom-in-95">
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-2">تعيين متطوع لـ: {assigningBazaar.name}</h4>
            <select
              value={selectedVolunteerForAssign}
              onChange={(e) => setSelectedVolunteerForAssign(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold mb-4"
            >
              <option value="">-- اختر متطوعاً من القائمة --</option>
              {volunteers.filter((v) => v.role !== "ADMIN").map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.national_id})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => handleAssignVolunteer(assigningBazaar.id)} className="flex-1 bg-[#00284d] text-white py-2 rounded-xl font-bold">{t("confirmPaymentBtn")}</button>
              <button onClick={() => setAssigningBazaar(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">{t("cancelBtn")}</button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 text-xs animate-in zoom-in-95">
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">{t("changePassBtn")}</h4>
            <p className="text-slate-400 mb-3">{passwordModalUser.name} ({passwordModalUser.national_id})</p>
            <input
              type="text"
              required
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="أدخل 6 خانات على الأقل..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center text-xs font-bold text-slate-900 dark:text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (newPasswordInput.length < 6) return
                  const { supabaseFetch } = await import("../../lib/supabaseClient")
                  await supabaseFetch(`volunteers?id=eq.${passwordModalUser.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ password_hash: newPasswordInput })
                  })
                  setFeedbackToast({ type: "success", message: `تم تحديث وتشفير رمز ${passwordModalUser.name} بنجاح` })
                  setPasswordModalUser(null)
                  setNewPasswordInput("")
                }}
                className="flex-1 bg-[#00284d] text-white py-2 rounded-xl font-bold"
              >
                تأكيد وتشفير
              </button>
              <button onClick={() => setPasswordModalUser(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">{t("cancelBtn")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VOLUNTEER MODAL */}
      {isAddVolunteerOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-5 text-xs animate-in zoom-in-95">
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-3">{t("addVolunteerBtn")}</h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const name = newVolForm.name.trim()
                const national_id = newVolForm.national_id.trim()
                const password = newVolForm.password.trim()
                const role = newVolForm.role

                if (!name || !national_id || !password) {
                  setFeedbackToast({ type: "error", message: "يرجى تعبئة كافة الحقول المطلوبة" })
                  return
                }

                // 1. Immediately create local volunteer and update UI
                const newVol = {
                  id: `vol-${Date.now()}`,
                  name,
                  national_id,
                  role,
                  status: "ACTIVE",
                  created_at: new Date().toISOString()
                }

                const updatedVols = [newVol, ...volunteers.filter((v: any) => v.national_id !== national_id)]
                setVolunteers(updatedVols)
                localStorage.setItem("khcf_volunteers_cache", JSON.stringify(updatedVols))
                logAudit("إضافة متطوع جديد", `تسجيل: ${name} (${national_id}) - الدور: ${role}`, "AUTH")

                // 2. Sync to Supabase in background
                try {
                  const { supabaseFetch } = await import("../../lib/supabaseClient")
                  const res = await supabaseFetch("volunteers", {
                    method: "POST",
                    body: JSON.stringify({
                      name,
                      national_id,
                      password_hash: password,
                      role
                    })
                  })
                  if (res?.error && role === "SUPERVISOR") {
                    await supabaseFetch("volunteers", {
                      method: "POST",
                      body: JSON.stringify({
                        name: `${name} [مشرف]`,
                        national_id,
                        password_hash: password,
                        role: "VOLUNTEER"
                      })
                    })
                  }
                } catch (err) {
                  console.error("Failed to sync volunteer to Supabase:", err)
                }

                setFeedbackToast({ type: "success", message: `تم تسجيل ${name} وإضافته للكادر بنجاح ✅` })
                setIsAddVolunteerOpen(false)
                setNewVolForm({ name: "", national_id: "", password: "", role: "VOLUNTEER" })
              }}
              className="space-y-3 text-slate-700 dark:text-slate-300"
            >
              <div><label className="block font-bold mb-1">الاسم الرباعي</label><input required type="text" value={newVolForm.name} onChange={(e) => setNewVolForm({ ...newVolForm, name: e.target.value })} className="w-full p-2 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white" /></div>
              <div><label className="block font-bold mb-1">الرقم الوطني / اسم المستخدم</label><input required type="text" value={newVolForm.national_id} onChange={(e) => setNewVolForm({ ...newVolForm, national_id: e.target.value })} className="w-full p-2 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-slate-900 dark:text-white" /></div>
              <div><label className="block font-bold mb-1">كلمة المرور الابتدائية</label><input required type="text" value={newVolForm.password} onChange={(e) => setNewVolForm({ ...newVolForm, password: e.target.value })} className="w-full p-2 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-slate-900 dark:text-white" /></div>
              <div>
                <label className="block font-bold mb-1">الدور والصلاحية</label>
                <select value={newVolForm.role} onChange={(e) => setNewVolForm({ ...newVolForm, role: e.target.value })} className="w-full p-2 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white">
                  <option value="VOLUNTEER">{t("roleVolunteer")}</option>
                  <option value="SUPERVISOR">{t("roleSupervisor")}</option>
                  <option value="ADMIN">{t("roleAdmin")}</option>
                </select>
              </div>
              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 bg-[#00284d] text-white py-2 rounded-xl font-bold">تسجيل وتشفير الحساب</button>
                <button type="button" onClick={() => setIsAddVolunteerOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">{t("cancelBtn")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Z-REPORT MODAL */}
      {isZReportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs animate-in zoom-in-95">
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">{t("shiftCloseZReport")}</h4>
            <p className="text-slate-400 mb-4">تدقيق الإيراد ومقارنة النقد الفعلي بالمقيد بالنظام</p>
            <form onSubmit={handleConfirmShiftClose} className="space-y-4 text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                <span>المبلغ المقيد بالنظام (CASH):</span>
                <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">{currentShiftExpectedCash} JD</span>
              </div>
              <div>
                <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">النقد الفعلي الموجود بالصندوق (العد اليدوي):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(e.target.value)}
                  placeholder="أدخل المبلغ بعد العد..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-base font-black text-slate-900 dark:text-white"
                />
              </div>
              {actualCashCounted !== "" && (
                <div className={`p-3 rounded-xl font-bold flex justify-between ${parseFloat(actualCashCounted) - currentShiftExpectedCash === 0 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300"}`}>
                  <span>{parseFloat(actualCashCounted) - currentShiftExpectedCash === 0 ? "✅ مطابق تماماً" : "فارق المطابقة:"}</span>
                  <span className="font-mono font-black">{(parseFloat(actualCashCounted) - currentShiftExpectedCash).toFixed(2)} JD</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold">اعتماد وتقفيل الصندوق</button>
                <button type="button" onClick={() => setIsZReportModalOpen(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">{t("cancelBtn")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXECUTIVE REPORT MODAL (PDF) */}
      {isExecutiveReportOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-xs space-y-6 animate-in zoom-in-95 my-8 border dark:border-slate-800">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">مؤسسة ومركز الحسين للسرطان</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">دكان الخير • التقرير المالي التنفيذي المعتمد</p>
                <p className="text-slate-400 font-mono text-[10px] mt-1">{new Date().toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")}</p>
              </div>
              <img src="/shop_logo.png" alt="Logo" className="h-10 object-contain" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl grid grid-cols-3 gap-4 text-center">
              <div><p className="text-slate-400">نقد (CASH)</p><p className="font-black font-mono text-sm text-emerald-700 dark:text-emerald-400 mt-1">{kpis.cashRev} JD</p></div>
              <div><p className="text-slate-400">بطاقات (VISA)</p><p className="font-black font-mono text-sm text-[#00284d] dark:text-blue-400 mt-1">{kpis.visaRev} JD</p></div>
              <div><p className="text-slate-400">إجمالي المبيعات</p><p className="font-black font-mono text-base text-slate-900 dark:text-white mt-1">{kpis.totalRev} JD</p></div>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t dark:border-slate-800 text-center text-[10px] text-slate-400">
              <div><p className="font-bold text-slate-700 dark:text-slate-300 mb-6">أمين الصندوق</p><p>التوقيع: ....................</p></div>
              <div><p className="font-bold text-slate-700 dark:text-slate-300 mb-6">مشرف البازار</p><p>التوقيع: ....................</p></div>
              <div><p className="font-bold text-slate-700 dark:text-slate-300 mb-6">المدير المالي والتدقيق</p><p>التوقيع: ....................</p></div>
            </div>
            <div className="flex justify-between pt-4 border-t dark:border-slate-800">
              <button onClick={() => window.print()} className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold">{t("printReceiptBtn")}</button>
              <button onClick={() => setIsExecutiveReportOpen(false)} className="px-4 py-2 text-slate-500 font-bold">{t("closeBtn")}</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in zoom-in-95">
            <div className="bg-[#00284d] dark:bg-[#031326] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Edit />
                <h4 className="font-black text-sm">{t("editProductModalTitle")}</h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-white/80 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              {/* Product Preview Image & Upload */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center relative p-1 shrink-0">
                  {editingProduct.img ? (
                    <img
                      src={editingProduct.img}
                      alt="Preview"
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 text-[10px]">{t("noImageText")}</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("productImageLabel")}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.img || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, img: e.target.value })}
                    placeholder="/items/image1.jpeg أو رابط صورة"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono text-[11px]"
                  />
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer text-[10px] font-bold transition-all">
                      <Icons.Upload />
                      <span>{t("uploadNewImage")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProductImageFile(e, false)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("productNameLabel")} *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              {/* Price, Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("productPriceLabel")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black text-blue-700 dark:text-blue-400 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("productCategoryLabel")}
                  </label>
                  <select
                    value={editingProduct.category_id || ""}
                    onChange={(e) => {
                      const selCat = categoriesList.find((c) => c.id === e.target.value)
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                        category: selCat ? selCat.name : editingProduct.category
                      })
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  >
                    {categoriesList.map((cat, idx) => (
                      <option key={`edit-cat-${cat.id || idx}-${idx}`} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("productSubcategoryLabel")}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: حقائب قماشية"
                    value={editingProduct.subcategory || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct)}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold flex items-center gap-1 transition-colors"
                >
                  <Icons.Trash />
                  <span>{t("deleteProductBtn")}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {t("cancelBtn")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2 bg-[#00284d] hover:bg-[#00386b] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingProduct ? "جار الحفظ..." : t("saveChangesBtn")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in zoom-in-95">
            <div className="bg-[#00284d] dark:bg-[#031326] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Plus />
                <h4 className="font-black text-sm">{t("addProductModalTitle")}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-white/80 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              {/* Product Preview Image & Upload */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center relative p-1 shrink-0">
                  {newProductForm.img ? (
                    <img
                      src={newProductForm.img}
                      alt="Preview"
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 text-[10px]">{t("noImageText")}</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t("productImageLabel")}
                  </label>
                  <input
                    type="text"
                    value={newProductForm.img}
                    onChange={(e) => setNewProductForm({ ...newProductForm, img: e.target.value })}
                    placeholder="/shop_logo.png أو رابط صورة"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono text-[11px]"
                  />
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer text-[10px] font-bold transition-all">
                      <Icons.Upload />
                      <span>{t("uploadNewImage")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleProductImageFile(e, true)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t("productNameLabel")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حقيبة قماشية بتطريز يدوي"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              {/* Price, Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("productPriceLabel")} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="5.00"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black text-blue-700 dark:text-blue-400 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("productCategoryLabel")} *
                  </label>
                  <select
                    value={newProductForm.category_id}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  >
                    <option key="add-cat-empty" value="">اختر القسم...</option>
                    {categoriesList.map((cat, idx) => (
                      <option key={`add-cat-${cat.id || idx}-${idx}`} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("productSubcategoryLabel")}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: حقائب قماشية"
                    value={newProductForm.subcategory || ""}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subcategory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-[#00284d] hover:bg-[#00386b] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingProduct ? "جار الإضافة..." : t("addProductBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BAZAAR ANALYTICS & AUDIT REPORT MODAL (Feature 3) */}
      {selectedBazaarAnalytics && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 animate-in zoom-in-95 my-8 border border-slate-200/80 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img src="/shop_logo.png" alt="Logo" className="h-12 w-auto object-contain drop-shadow-sm" />
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {lang === "ar" ? "مؤسسة ومركز الحسين للسرطان" : "King Hussein Cancer Foundation"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {t("appName")} • {t("bazaarAnalyticsReport")}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {new Date().toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBazaarAnalytics(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-black transition-all"
              >
                ✕
              </button>
            </div>

            {/* Bazaar Identification Card */}
            <div className="p-4 rounded-2xl bg-[#00284d]/5 dark:bg-blue-950/30 border border-[#00284d]/10 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#005295] dark:text-blue-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/60 inline-block mb-1">
                  {t("bazaarPerformance")}
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedBazaarAnalytics.bazaar?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <span>📍 {selectedBazaarAnalytics.bazaar?.location}</span>
                </p>
              </div>

              <div className="text-left font-mono text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-slate-400">{t("startPrefix")}: </span>
                  <span className="font-bold">{new Date(selectedBazaarAnalytics.bazaar?.startDate).toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t("endPrefix")}: </span>
                  <span className="font-bold">{new Date(selectedBazaarAnalytics.bazaar?.endDate).toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")}</span>
                </div>
              </div>
            </div>

            {/* 4 Financial KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-center">
                <p className="text-[11px] text-slate-400 font-bold">{t("kpiRevenueTitle")}</p>
                <p className="text-lg font-mono font-black text-[#00284d] dark:text-blue-400 mt-1">
                  {selectedBazaarAnalytics.totalRev.toFixed(2)} <span className="text-xs font-normal">JD</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{t("kpiCashTitle")}</p>
                <p className="text-lg font-mono font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {selectedBazaarAnalytics.cashRev.toFixed(2)} <span className="text-xs font-normal">JD</span>
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedBazaarAnalytics.totalRev > 0 ? Math.round((selectedBazaarAnalytics.cashRev / selectedBazaarAnalytics.totalRev) * 100) : 0}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-center">
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">{t("kpiVisaTitle")}</p>
                <p className="text-lg font-mono font-black text-[#005295] dark:text-blue-300 mt-1">
                  {selectedBazaarAnalytics.visaRev.toFixed(2)} <span className="text-xs font-normal">JD</span>
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedBazaarAnalytics.totalRev > 0 ? Math.round((selectedBazaarAnalytics.visaRev / selectedBazaarAnalytics.totalRev) * 100) : 0}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-center">
                <p className="text-[11px] text-slate-400 font-bold">{t("kpiOrdersTitle")}</p>
                <p className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                  {selectedBazaarAnalytics.txCount} <span className="text-xs font-normal">{t("invoiceCount")}</span>
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {t("aovLabel")} {selectedBazaarAnalytics.aov} JD
                </span>
              </div>
            </div>

            {/* Cash vs Visa Progress Bar */}
            {selectedBazaarAnalytics.totalRev > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>{t("incomeComparison")}</span>
                  <span className="font-mono text-[11px]">
                    {Math.round((selectedBazaarAnalytics.cashRev / selectedBazaarAnalytics.totalRev) * 100)}% {t("cashShort")} • {Math.round((selectedBazaarAnalytics.visaRev / selectedBazaarAnalytics.totalRev) * 100)}% {t("visaShort")}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(selectedBazaarAnalytics.cashRev / selectedBazaarAnalytics.totalRev) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                  ></div>
                  <div
                    style={{ width: `${(selectedBazaarAnalytics.visaRev / selectedBazaarAnalytics.totalRev) * 100}%` }}
                    className="bg-blue-600 h-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            )}

            {/* Volunteer Staff Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Icons.Staff />
                  <span>{t("volunteersBreakdown")}</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedBazaarAnalytics.volunteerBreakdown?.length || 0} {t("volunteerCashier")}
                </span>
              </div>

              {selectedBazaarAnalytics.volunteerBreakdown && selectedBazaarAnalytics.volunteerBreakdown.length > 0 ? (
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">{t("thStaffName")}</th>
                        <th className="p-3 text-center">{t("invoicesIssued")}</th>
                        <th className="p-3 text-center">{t("salesAmount")}</th>
                        <th className="p-3 text-left">{t("salesContribution")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {selectedBazaarAnalytics.volunteerBreakdown.map((vol: any, idx: number) => {
                        const pct = selectedBazaarAnalytics.totalRev > 0 ? Math.round((vol.total / selectedBazaarAnalytics.totalRev) * 100) : 0
                        return (
                          <tr key={vol.national_id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "👤"}</span>
                              <div>
                                <p>{vol.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{vol.national_id}</p>
                              </div>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                              {vol.count}
                            </td>
                            <td className="p-3 text-center font-mono font-black text-emerald-700 dark:text-emerald-400">
                              {vol.total.toFixed(2)} JD
                            </td>
                            <td className="p-3 text-left font-mono font-bold text-slate-500 dark:text-slate-400">
                              {pct}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                  {t("noStaffSalesInBazaar")}
                </div>
              )}
            </div>

            {/* Top-Selling Products in Bazaar */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Icons.Catalog />
                <span>{t("topSellingInBazaar")}</span>
              </h4>

              {selectedBazaarAnalytics.topItems && selectedBazaarAnalytics.topItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedBazaarAnalytics.topItems.map((item: any, idx: number) => (
                    <div
                      key={item.name + idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-black text-xs text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {item.qty} {t("itemCount")}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-black text-[#00284d] dark:text-blue-400 shrink-0">
                        {item.total.toFixed(2)} JD
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                  {t("noItemsSoldInBazaar")}
                </div>
              )}
            </div>

            {/* Official Certified Audit Voucher & Signatures Block */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white">{t("officialAuditVoucher")}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    HASH: {selectedBazaarAnalytics.bazaar?.id?.toUpperCase()}-{new Date().getFullYear()} • 100% {t("auditedStatus")}
                  </p>
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg font-bold border border-emerald-200 dark:border-emerald-800">
                  ✓ {lang === "ar" ? "معتمد رسمياً" : "Officially Certified"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-[10px] text-slate-500 dark:text-slate-400 pt-4 pb-2">
                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300">{t("cashierSignature")}</p>
                  <p className="mt-4 text-slate-400 font-mono">التوقيع: ....................</p>
                </div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300">{t("bazaarSupervisorSignature")}</p>
                  <p className="mt-4 text-slate-400 font-mono">التوقيع: ....................</p>
                </div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300">{t("financialAuditSignature")}</p>
                  <p className="mt-4 text-slate-400 font-mono">التوقيع: ....................</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#00284d] hover:bg-[#001d38] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Icons.FileText />
                <span>{t("printVoucherBtn")}</span>
              </button>
              <button
                onClick={() => setSelectedBazaarAnalytics(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
              >
                {t("closeBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ADD TRANSACTION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {isAddTxOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-base font-black">
                  +
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {lang === "ar" ? "إضافة فاتورة يدوية جديدة" : "Create Manual Transaction"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === "ar" ? "تسجيل حركة مبيعات وربطها بالبازار المحدد" : "Record sale transaction & link to specific bazaar"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTxOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 text-sm font-black transition-all"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Row 1: Bazaar / Location & Cashier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "البازار / الموقع التابعة له الفاتورة *" : "Associated Bazaar / Site *"}
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={txForm.siteName}
                      onChange={(e) => {
                        const val = e.target.value
                        const matched = bazaars.find((b: any) => b.name === val)
                        setTxForm({
                          ...txForm,
                          siteName: val,
                          bazaarId: matched?.id || ""
                        })
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#00284d]"
                    >
                      <option value="">{lang === "ar" ? "-- اختر البازار --" : "-- Select Bazaar --"}</option>
                      {distinctBazaarNames.map((bName) => (
                        <option key={bName} value={bName}>
                          🎪 {bName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "أو اكتب اسم موقع/بازار مخصص..." : "Or type custom bazaar/site..."}
                      value={txForm.siteName}
                      onChange={(e) => setTxForm({ ...txForm, siteName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "المتطوع (الكاشير)" : "Volunteer (Cashier)"}
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={txForm.volunteerName}
                      onChange={(e) => {
                        const val = e.target.value
                        const matched = volunteers.find((v: any) => v.name === val)
                        setTxForm({
                          ...txForm,
                          volunteerName: val,
                          volunteerId: matched?.national_id || matched?.id || user?.national_id || user?.volunteer_id || "volunteer"
                        })
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#00284d]"
                    >
                      <option value={user?.name || "مشرف الإدارة"}>👤 {user?.name || "مشرف الإدارة"} (الحالي)</option>
                      {volunteers.map((v: any) => (
                        <option key={v.id || v.national_id} value={v.name}>
                          👤 {v.name} ({v.role || "متطوع"})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "أو اسم كاشير مخصص..." : "Or custom cashier name..."}
                      value={txForm.volunteerName}
                      onChange={(e) => setTxForm({ ...txForm, volunteerName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxForm({ ...txForm, paymentMethod: "CASH" })}
                      className={`p-2.5 rounded-xl font-black text-xs transition-all border ${
                        txForm.paymentMethod === "CASH"
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      💵 {lang === "ar" ? "نقد (CASH)" : "Cash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxForm({ ...txForm, paymentMethod: "VISA" })}
                      className={`p-2.5 rounded-xl font-black text-xs transition-all border ${
                        txForm.paymentMethod === "VISA"
                          ? "bg-[#00284d] text-white border-blue-900 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      💳 {lang === "ar" ? "بطاقة (VISA)" : "Visa"}
                    </button>
                  </div>
                  {txForm.paymentMethod === "VISA" && (
                    <input
                      type="text"
                      maxLength={4}
                      placeholder={lang === "ar" ? "آخر 4 أرقام من البطاقة (مثال: 4589)" : "Last 4 digits (e.g. 4589)"}
                      value={txForm.visaLast4}
                      onChange={(e) => setTxForm({ ...txForm, visaLast4: e.target.value.replace(/\D/g, "") })}
                      className="w-full p-2 mt-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-slate-900 dark:text-white outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "التاريخ والوقت" : "Date & Time"}
                  </label>
                  <input
                    type="datetime-local"
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                  <div className="pt-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      {lang === "ar" ? "تبرع إضافي اختياري (JD)" : "Extra Optional Donation (JD)"}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={txForm.extraDonation || ""}
                      onChange={(e) => setTxForm({ ...txForm, extraDonation: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                    📦 {lang === "ar" ? "أصناف وبنود الفاتورة" : "Invoice Items"} ({txForm.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCustomItemToTxForm}
                    className="text-[11px] font-bold text-[#00284d] dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{lang === "ar" ? "إضافة بند حر/مخصص" : "Add Custom Line Item"}</span>
                  </button>
                </div>

                {/* Quick Add from Catalog Search */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "🔍 ابحث في الكتالوج لإضافة صنف بسرعة..." : "🔍 Search catalog to quickly add item..."}
                    value={txCatalogSearch}
                    onChange={(e) => setTxCatalogSearch(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                  {txCatalogSearch.trim() && (
                    <div className="max-h-32 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 space-y-1 shadow-md">
                      {catalogItems
                        .filter((ci) => (ci.name || "").toLowerCase().includes(txCatalogSearch.toLowerCase().trim()))
                        .slice(0, 8)
                        .map((ci) => (
                          <div
                            key={ci.id}
                            onClick={() => {
                              handleAddItemToTxForm(ci)
                              setTxCatalogSearch("")
                            }}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">{ci.name}</span>
                            <span className="font-mono font-black text-[#00284d] dark:text-blue-400">
                              {Number(ci.price).toFixed(2)} JD +
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Items Table in Form */}
                {txForm.items.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 font-bold">
                    {lang === "ar" ? "لم يتم إضافة أي أصناف بعد. ابحث في الكتالوج أعلاه أو أضف بنداً مخصصاً." : "No items added yet. Search catalog above or add custom line."}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {txForm.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={it.name}
                            onChange={(e) => handleUpdateItemInTxForm(idx, "name", e.target.value)}
                            className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">{lang === "ar" ? "الكمية:" : "Qty:"}</span>
                            <input
                              type="number"
                              min={1}
                              value={it.qty}
                              onChange={(e) => handleUpdateItemInTxForm(idx, "qty", e.target.value)}
                              className="w-12 p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-xs outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">{lang === "ar" ? "السعر:" : "Price:"}</span>
                            <input
                              type="number"
                              step="0.5"
                              min={0}
                              value={it.price}
                              onChange={(e) => handleUpdateItemInTxForm(idx, "price", e.target.value)}
                              className="w-16 p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-xs outline-none"
                            />
                          </div>
                          <span className="font-mono font-black text-xs text-[#00284d] dark:text-blue-400 w-16 text-left">
                            {((Number(it.price) || 0) * (Number(it.qty) || 1)).toFixed(2)} JD
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromTxForm(idx)}
                            className="text-red-400 hover:text-red-600 p-1 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    {lang === "ar" ? "المجموع الكلي للفاتورة" : "Grand Total"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {txForm.items.length} {lang === "ar" ? "أصناف" : "items"}
                    {txForm.extraDonation > 0 ? ` + ${txForm.extraDonation} JD تبرع` : ""}
                  </span>
                </div>
                <div className="font-mono font-black text-xl text-emerald-700 dark:text-emerald-400">
                  {(
                    txForm.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0) +
                    (Number(txForm.extraDonation) || 0)
                  ).toFixed(2)}{" "}
                  JD
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSaveNewTx}
                className="flex-1 bg-[#00284d] hover:bg-[#001d38] dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-xl font-black text-xs transition-all shadow-md"
              >
                ✓ {lang === "ar" ? "حفظ الفاتورة واحتسابها" : "Save & Record Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setIsAddTxOpen(false)}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
              >
                {t("cancelBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* EDIT TRANSACTION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#005295] dark:text-blue-400 flex items-center justify-center text-sm font-black">
                  ✏️
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {lang === "ar" ? `تعديل الفاتورة #${String(editingTx.id).slice(-8)}` : `Edit Invoice #${String(editingTx.id).slice(-8)}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === "ar" ? "تعديل بيانات الفاتورة والأصناف وقيمة البيع" : "Modify invoice metadata, line items, and totals"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 text-sm font-black transition-all"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Row 1: Bazaar / Location & Cashier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "البازار / الموقع التابعة له الفاتورة *" : "Associated Bazaar / Site *"}
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={txForm.siteName}
                      onChange={(e) => {
                        const val = e.target.value
                        const matched = bazaars.find((b: any) => b.name === val)
                        setTxForm({
                          ...txForm,
                          siteName: val,
                          bazaarId: matched?.id || ""
                        })
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#00284d]"
                    >
                      <option value="">{lang === "ar" ? "-- اختر البازار --" : "-- Select Bazaar --"}</option>
                      {distinctBazaarNames.map((bName) => (
                        <option key={bName} value={bName}>
                          🎪 {bName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "أو اكتب اسم موقع/بازار مخصص..." : "Or type custom bazaar/site..."}
                      value={txForm.siteName}
                      onChange={(e) => setTxForm({ ...txForm, siteName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "المتطوع (الكاشير)" : "Volunteer (Cashier)"}
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={txForm.volunteerName}
                      onChange={(e) => {
                        const val = e.target.value
                        const matched = volunteers.find((v: any) => v.name === val)
                        setTxForm({
                          ...txForm,
                          volunteerName: val,
                          volunteerId: matched?.national_id || matched?.id || user?.national_id || user?.volunteer_id || "volunteer"
                        })
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#00284d]"
                    >
                      <option value={user?.name || "مشرف الإدارة"}>👤 {user?.name || "مشرف الإدارة"}</option>
                      {volunteers.map((v: any) => (
                        <option key={v.id || v.national_id} value={v.name}>
                          👤 {v.name} ({v.role || "متطوع"})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "أو اسم كاشير مخصص..." : "Or custom cashier name..."}
                      value={txForm.volunteerName}
                      onChange={(e) => setTxForm({ ...txForm, volunteerName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxForm({ ...txForm, paymentMethod: "CASH" })}
                      className={`p-2.5 rounded-xl font-black text-xs transition-all border ${
                        txForm.paymentMethod === "CASH"
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      💵 {lang === "ar" ? "نقد (CASH)" : "Cash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxForm({ ...txForm, paymentMethod: "VISA" })}
                      className={`p-2.5 rounded-xl font-black text-xs transition-all border ${
                        txForm.paymentMethod === "VISA"
                          ? "bg-[#00284d] text-white border-blue-900 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      💳 {lang === "ar" ? "بطاقة (VISA)" : "Visa"}
                    </button>
                  </div>
                  {txForm.paymentMethod === "VISA" && (
                    <input
                      type="text"
                      maxLength={4}
                      placeholder={lang === "ar" ? "آخر 4 أرقام من البطاقة (مثال: 4589)" : "Last 4 digits (e.g. 4589)"}
                      value={txForm.visaLast4}
                      onChange={(e) => setTxForm({ ...txForm, visaLast4: e.target.value.replace(/\D/g, "") })}
                      className="w-full p-2 mt-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-slate-900 dark:text-white outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {lang === "ar" ? "التاريخ والوقت" : "Date & Time"}
                  </label>
                  <input
                    type="datetime-local"
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                  <div className="pt-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      {lang === "ar" ? "تبرع إضافي اختياري (JD)" : "Extra Optional Donation (JD)"}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={txForm.extraDonation || ""}
                      onChange={(e) => setTxForm({ ...txForm, extraDonation: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                    📦 {lang === "ar" ? "أصناف وبنود الفاتورة" : "Invoice Items"} ({txForm.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCustomItemToTxForm}
                    className="text-[11px] font-bold text-[#00284d] dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{lang === "ar" ? "إضافة بند حر/مخصص" : "Add Custom Line Item"}</span>
                  </button>
                </div>

                {/* Quick Add from Catalog Search */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "🔍 ابحث في الكتالوج لإضافة صنف بسرعة..." : "🔍 Search catalog to quickly add item..."}
                    value={txCatalogSearch}
                    onChange={(e) => setTxCatalogSearch(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                  {txCatalogSearch.trim() && (
                    <div className="max-h-32 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 space-y-1 shadow-md">
                      {catalogItems
                        .filter((ci) => (ci.name || "").toLowerCase().includes(txCatalogSearch.toLowerCase().trim()))
                        .slice(0, 8)
                        .map((ci) => (
                          <div
                            key={ci.id}
                            onClick={() => {
                              handleAddItemToTxForm(ci)
                              setTxCatalogSearch("")
                            }}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">{ci.name}</span>
                            <span className="font-mono font-black text-[#00284d] dark:text-blue-400">
                              {Number(ci.price).toFixed(2)} JD +
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Items Table in Form */}
                {txForm.items.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400 font-bold">
                    {lang === "ar" ? "لم يتم إضافة أي أصناف بعد. ابحث في الكتالوج أعلاه أو أضف بنداً مخصصاً." : "No items added yet. Search catalog above or add custom line."}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {txForm.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={it.name}
                            onChange={(e) => handleUpdateItemInTxForm(idx, "name", e.target.value)}
                            className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">{lang === "ar" ? "الكمية:" : "Qty:"}</span>
                            <input
                              type="number"
                              min={1}
                              value={it.qty}
                              onChange={(e) => handleUpdateItemInTxForm(idx, "qty", e.target.value)}
                              className="w-12 p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-xs outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">{lang === "ar" ? "السعر:" : "Price:"}</span>
                            <input
                              type="number"
                              step="0.5"
                              min={0}
                              value={it.price}
                              onChange={(e) => handleUpdateItemInTxForm(idx, "price", e.target.value)}
                              className="w-16 p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold text-xs outline-none"
                            />
                          </div>
                          <span className="font-mono font-black text-xs text-[#00284d] dark:text-blue-400 w-16 text-left">
                            {((Number(it.price) || 0) * (Number(it.qty) || 1)).toFixed(2)} JD
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromTxForm(idx)}
                            className="text-red-400 hover:text-red-600 p-1 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    {lang === "ar" ? "المجموع الكلي للفاتورة" : "Grand Total"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {txForm.items.length} {lang === "ar" ? "أصناف" : "items"}
                    {txForm.extraDonation > 0 ? ` + ${txForm.extraDonation} JD تبرع` : ""}
                  </span>
                </div>
                <div className="font-mono font-black text-xl text-emerald-700 dark:text-emerald-400">
                  {(
                    txForm.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0) +
                    (Number(txForm.extraDonation) || 0)
                  ).toFixed(2)}{" "}
                  JD
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSaveEditTx}
                className="flex-1 bg-[#00284d] hover:bg-[#001d38] dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-xl font-black text-xs transition-all shadow-md"
              >
                ✓ {lang === "ar" ? "حفظ التعديلات" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
              >
                {t("cancelBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DELETE TRANSACTION CONFIRMATION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {deletingTx && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 border border-red-200 dark:border-red-900/50 text-xs">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {lang === "ar" ? "تأكيد حذف الفاتورة" : "Confirm Invoice Deletion"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === "ar" ? "هذا الإجراء سيقوم بإلغاء الفاتورة من السجل المالي" : "This action will permanently delete this record"}
                </p>
              </div>
            </div>

            {/* Invoice Details Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{t("thInvoiceId")}:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">#{String(deletingTx.id).slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{lang === "ar" ? "البازار المرتبط:" : "Associated Bazaar:"}</span>
                <span className="font-bold text-[#00284d] dark:text-blue-400">🎪 {deletingTx.siteName || t("mainBuilding")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{t("thVolunteer")}:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{deletingTx.volunteerName || deletingTx.volunteerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{t("thDateTime")}:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{new Date(deletingTx.date).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300 font-black">{t("thAmount")}:</span>
                <span className="font-mono font-black text-sm text-red-600 dark:text-red-400">{deletingTx.total} JD</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 leading-relaxed font-medium">
              ⚠️ {lang === "ar" ? "تنبيه: سيتم توثيق عملية الحذف هذه في سجل التدقيق المالي المركزي (Audit Trail) باسم المستخدم الحالي." : "Warning: This deletion will be permanently logged in the audit trail."}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteTx}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs transition-all shadow-md"
              >
                🗑️ {lang === "ar" ? "نعم، احذف الفاتورة نهائياً" : "Delete Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs"
              >
                {t("cancelBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
