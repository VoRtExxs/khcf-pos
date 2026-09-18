"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../store/AuthContext"
import { fetchCatalog } from "../../lib/catalogService"
import { usePreferences } from "../../store/PreferencesContext"

// Icons
const Icons = {
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
  )
}

const getCategoryIcon = (categoryName: string) => {
  const name = (categoryName || "").toLowerCase()
  if (name.includes("كل") || name.includes("all")) return "🏷️"
  if (name.includes("قرطاسية") || name.includes("stationery")) return "📚"
  if (name.includes("إكسسوارات") || name.includes("accessories")) return "💍"
  if (name.includes("ديكور") || name.includes("decor")) return "🏺"
  if (name.includes("أكواب") || name.includes("cups") || name.includes("mugs")) return "☕"
  if (name.includes("ملابس") || name.includes("apparel")) return "👕"
  if (name.includes("سترات") || name.includes("hoodies")) return "🧥"
  if (name.includes("تيشرتات") || name.includes("t-shirts")) return "👔"
  return "📦"
}

export default function POSPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(["الكل"])
  const [isLoading, setIsLoading] = useState(true)

  const [saleMode, setSaleMode] = useState<"QUICK" | "CART">("CART")
  const [activeCategory, setActiveCategory] = useState("الكل")
  const [activeSubcategory, setActiveSubcategory] = useState("الكل")
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<any[]>([])

  // Quick Sale State
  const [quickItem, setQuickItem] = useState<any>(null)

  // Checkout & Cash Calculator State
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "VISA">("CASH")
  const [visaLast4, setVisaLast4] = useState("")
  const [cashTendered, setCashTendered] = useState("")
  const [extraDonation, setExtraDonation] = useState(0)
  const [completedTransaction, setCompletedTransaction] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [barcodeToast, setBarcodeToast] = useState<string | null>(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  // Site & Bazaar State
  const [currentSite, setCurrentSite] = useState("")
  const [hasTransactions, setHasTransactions] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [selectedBazaar, setSelectedBazaar] = useState<any>(null)
  const [availableBazaars, setAvailableBazaars] = useState<any[]>([])
  const [manualOverride, setManualOverride] = useState(false)

  const { user, logout, isAuthLoading } = useAuth()
  const { theme, lang, toggleTheme, toggleLang, t } = usePreferences()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      const dbItems = await fetchCatalog()
      setItems(dbItems)
      const catSet = new Set<string>()
      for (const i of dbItems) {
        const c = (i.category || "").trim()
        if (c && c !== "الكل") catSet.add(c)
      }
      const sortedCats = Array.from(catSet).sort((a: string, b: string) => a.localeCompare(b, "ar"))
      setCategories(["الكل", ...sortedCats])
      setIsLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("khcf_transactions") || "[]")
    const myTxs = existing.filter((t: any) => t.volunteerId === user?.volunteer_id)
    if (myTxs.length > 0) {
      setHasTransactions(true)
      if (!currentSite) setCurrentSite(myTxs[0].siteName)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      const allBazaars = JSON.parse(localStorage.getItem("khcf_bazaars") || "[]")
      const myBazaars = allBazaars.filter((b: any) =>
        (b.assignedVolunteers || []).some((v: any) => v.id === user.id)
      )
      setAvailableBazaars(myBazaars)
    }
  }, [user])

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { "الكل": items.length }
    items.forEach((i) => {
      const c = (i.category || "").trim()
      if (c) map[c] = (map[c] || 0) + 1
    })
    return map
  }, [items])

  const availableSubcategories = useMemo(() => {
    let relevant = items
    const activeCat = (activeCategory || "").trim()
    if (activeCat && activeCat !== "الكل") {
      relevant = items.filter((i) => (i.category || "").trim() === activeCat)
    }
    const subcatCounts: Record<string, number> = {}
    relevant.forEach((i) => {
      const sub = (i.subcategory || "عام").trim()
      if (sub && sub !== "الكل") {
        subcatCounts[sub] = (subcatCounts[sub] || 0) + 1
      }
    })
    const sorted = Object.keys(subcatCounts).sort((a, b) => a.localeCompare(b, "ar"))
    return [
      { name: "الكل", count: relevant.length },
      ...sorted.map((s) => ({ name: s, count: subcatCounts[s] }))
    ]
  }, [items, activeCategory])

  const filteredItems = useMemo(() => {
    const searchLower = (searchTerm || "").toLowerCase().trim()
    const activeCat = (activeCategory || "").trim()
    const activeSub = (activeSubcategory || "").trim()

    return items.filter((i) => {
      const matchesCat = activeCat === "الكل" || (i.category || "").trim() === activeCat
      const itemSub = (i.subcategory || "عام").trim()
      const matchesSub = activeSub === "الكل" || itemSub === activeSub
      const matchesSearch = !searchLower || (i.name || "").toLowerCase().includes(searchLower)
      return matchesCat && matchesSub && matchesSearch
    })
  }, [items, activeCategory, activeSubcategory, searchTerm])

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat)
    setActiveSubcategory("الكل")
  }

  const cartItemCountMap = useMemo(() => {
    const map: Record<number, number> = {}
    cart.forEach((it) => {
      map[it.id] = it.qty
    })
    return map
  }, [cart])

  const handleItemClick = (item: any) => {
    if (saleMode === "QUICK") {
      setQuickItem(item)
      setPaymentMethod("CASH")
      setVisaLast4("")
      setCashTendered("")
      setExtraDonation(0)
      setShowCheckout(true)
    } else {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id)
        if (existing) {
          return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        }
        return [...prev, { ...item, qty: 1 }]
      })
    }
  }

  // Barcode Handheld Scanner Listener
  useEffect(() => {
    let buffer = ""
    let lastKeyTime = Date.now()

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return
      }

      const currentTime = Date.now()
      const timeDiff = currentTime - lastKeyTime
      lastKeyTime = currentTime

      if (e.key === "Enter") {
        if (buffer.length >= 2) {
          const scannedCode = buffer.trim().toLowerCase()
          const matchedItem = items.find(
            (it) =>
              String(it.id).toLowerCase() === scannedCode ||
              it.name.toLowerCase().includes(scannedCode)
          )
          if (matchedItem) {
            handleItemClick(matchedItem)
            setBarcodeToast(matchedItem.name)
            setTimeout(() => setBarcodeToast(null), 2500)
          }
        }
        buffer = ""
      } else if (e.key.length === 1) {
        if (timeDiff > 250) {
          buffer = e.key
        } else {
          buffer += e.key
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [items, saleMode])

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.qty + delta
            return newQty > 0 ? { ...i, qty: newQty } : null
          }
          return i
        })
        .filter(Boolean) as any[]
    )
  }

  const setDirectQty = (id: number, val: number) => {
    const qty = Math.max(1, Math.min(999, val || 1))
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const isQuickCheckout = saleMode === "QUICK" && quickItem !== null
  const baseTotal = isQuickCheckout ? quickItem.price : cartTotal
  const total = Number((baseTotal + extraDonation).toFixed(2))
  const transactionItems = isQuickCheckout ? [{ ...quickItem, qty: 1 }] : cart

  const tenderedNum = parseFloat(cashTendered) || 0
  const changeDue = Math.max(0, Number((tenderedNum - total).toFixed(2)))

  const handleCheckout = () => {
    if (!currentSite.trim()) {
      alert(lang === "ar" ? "الرجاء تحديد اسم البازار أو الموقع أولاً." : "Please select or enter the bazaar location first.")
      setShowCheckout(false)
      return
    }

    if (paymentMethod === "VISA" && visaLast4.length !== 4) {
      alert(lang === "ar" ? "الرجاء إدخال آخر 4 أرقام من بطاقة الفيزا." : "Please enter the last 4 digits of the payment card.")
      return
    }

    const tx: any = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      volunteerId: user?.volunteer_id || (isDemoMode ? "DEMO-VOL" : "unknown"),
      volunteerName: user?.name ? (isDemoMode ? `${user.name} (تجريبي)` : user.name) : (isDemoMode ? "متطوع تجريبي" : "مجهول"),
      siteName: currentSite || (isDemoMode ? "بازار تدريب المتطوعين (تجريبي)" : "موقع غير محدد"),
      bazaarId: selectedBazaar?.id || (isDemoMode ? "demo-bazaar-1" : undefined),
      paymentMethod,
      visaLast4: paymentMethod === "VISA" ? visaLast4 : null,
      items: transactionItems,
      total,
      extraDonation: extraDonation > 0 ? extraDonation : 0,
      cashTendered: paymentMethod === "CASH" && tenderedNum > 0 ? tenderedNum : total,
      changeGiven: paymentMethod === "CASH" ? changeDue : 0,
      mode: saleMode,
      isDemo: isDemoMode
    }

    if (isDemoMode) {
      const existingDemo = JSON.parse(localStorage.getItem("khcf_demo_transactions") || "[]")
      localStorage.setItem("khcf_demo_transactions", JSON.stringify([tx, ...existingDemo]))
    } else {
      const existing = JSON.parse(localStorage.getItem("khcf_transactions") || "[]")
      localStorage.setItem("khcf_transactions", JSON.stringify([tx, ...existing]))
      setHasTransactions(true)
    }
    setCompletedTransaction(tx)

    if (!isQuickCheckout) setCart([])
    setQuickItem(null)
    setShowCheckout(false)
    setIsReceiptOpen(true)
    setVisaLast4("")
    setCashTendered("")
    setExtraDonation(0)
  }

  const handleBazaarSelect = (bazaar: any) => {
    setSelectedBazaar(bazaar)
    setCurrentSite(bazaar.name)
    setCashTendered("")
    setExtraDonation(0)
  }

  // =========================================================================
  // VIEW 1: BAZAAR SELECTOR (Pre-Sales Screening for Volunteers)
  // =========================================================================
  const requireBazaarSelection = user?.role !== "ADMIN" && !selectedBazaar && !manualOverride && !isDemoMode

  if (requireBazaarSelection) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <img src="/shop_logo.png" alt="دكان الخير" className="h-10 object-contain" />
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{t("posTitle")}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 transition-all"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 text-xs font-bold transition-all"
              title="Language Switcher"
            >
              <Icons.Globe />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>

            <div className="text-right">
              <span className="text-xs font-black text-[#00284d] dark:text-blue-400 block">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">
                {user?.role === "ADMIN" ? (lang === "ar" ? "المدير العام (ADMIN)" : "Administrator") : user?.volunteer_id}
              </span>
            </div>
            {(user?.role === "ADMIN" || user?.role === "SUPERVISOR") && (
              <Link
                href="/admin"
                className="text-xs text-white bg-[#00284d] hover:bg-[#00386b] dark:bg-blue-600 dark:hover:bg-blue-700 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
              >
                {lang === "ar" ? "لوحة الإدارة" : "Dashboard"}
              </Link>
            )}
            <button
              onClick={() => {
                logout()
                router.push("/")
              }}
              className="text-xs text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all font-bold"
            >
              {t("logout")}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto py-10 px-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1.5">{t("selectBazaarScreenTitle")}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t("selectBazaarScreenSub")}
            </p>
          </div>

          {availableBazaars.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-10 text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                ⚠️
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">{t("noBazaarsAssignedTitle")}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 leading-relaxed">
                {t("noBazaarsAssignedSub")}
              </p>
              <button onClick={() => setManualOverride(true)} className="text-xs font-bold text-[#00284d] dark:text-blue-400 hover:underline">
                {t("manualOverrideBtn")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableBazaars.map((bazaar, idx) => {
                const now = new Date()
                const start = new Date(bazaar.startDate)
                const end = new Date(bazaar.endDate)
                const isLocked = now < start
                const isEnded = now > end
                const isActive = !isLocked && !isEnded

                return (
                  <div
                    key={idx}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      isActive
                        ? "border-[#00284d] dark:border-blue-500 shadow-md hover:shadow-lg cursor-pointer"
                        : "border-slate-200 dark:border-slate-800 opacity-80"
                    }`}
                    onClick={() => isActive && handleBazaarSelect(bazaar)}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-base font-black text-slate-900 dark:text-white">{bazaar.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : isLocked
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {isActive ? t("statusAvailableNow") : isLocked ? t("statusLockedTime") : t("statusEnded")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{bazaar.location}</span>
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                        <div>{t("startPrefix")} {start.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")} • {start.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                        <div>{t("endPrefix")} {end.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")} • {end.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <button className="w-full bg-[#00284d] hover:bg-[#001d38] text-white font-black py-2.5 rounded-xl text-xs shadow-md transition-all">
                          {t("startSellingBtn")}
                        </button>
                      ) : isLocked ? (
                        <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed">
                          {t("startsAtPrefix")} {start.toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                        </button>
                      ) : (
                        <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed">
                          {t("eventEndedText")}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Demo Training Mode Quick Launch Card */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 text-right">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                🎯
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === "ar" ? "وضع التدريب وبازار الديمو (Sales Demo Mode)" : "Volunteer Sales Demo Mode"}</span>
                  <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">تجريبي</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === "ar"
                    ? "هل أنت متطوع جديد؟ جرب بيئة البيع والسلة وحساب الكاش وطباعة الفواتير بأمان دون التأثير على الحسابات الحقيقية."
                    : "New volunteer? Practice selling, cart handling, cash calculations, and receipt printing safely without affecting official accounts."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDemoMode(true)
                setSelectedBazaar({
                  id: "demo-bazaar-1",
                  name: lang === "ar" ? "بازار تدريب المتطوعين (تجريبي)" : "Volunteer Training Bazaar (Demo)",
                  location: lang === "ar" ? "قاعة التدريب التفاعلية" : "Interactive Training Room"
                })
                setCurrentSite(lang === "ar" ? "بازار تدريب المتطوعين (تجريبي)" : "Volunteer Training Bazaar (Demo)")
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-5 py-3 rounded-xl text-xs shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <span>{lang === "ar" ? "بدء بازار تجريبي للتدريب ←" : "Start Demo Bazaar →"}</span>
            </button>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: WORLD-CLASS CLEAN POS INTERFACE
  // =========================================================================
  const isSiteInputDisabled = hasTransactions || selectedBazaar != null

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden select-none transition-colors duration-200 relative">
      {/* Barcode Scanner Detection Toast */}
      {barcodeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#00284d] dark:bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span>📷</span>
          <span>{t("barcodeDetectedToast")}: {barcodeToast}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* LEFT AREA: CATALOG & SELECTION */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Streamlined Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between z-10 flex-shrink-0 shadow-sm transition-colors duration-200">
          {/* Brand & Current Location */}
          <div className="flex items-center gap-4">
            <img src="/shop_logo.png" alt="دكان الخير" className="h-9 object-contain" />
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800"></div>

            {/* Location Pill */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3 py-1 rounded-xl text-xs">
              <span className="text-slate-400 font-medium">{t("posBazaarLabel")}</span>
              <input
                type="text"
                value={currentSite}
                onChange={(e) => setCurrentSite(e.target.value)}
                disabled={isSiteInputDisabled}
                placeholder={lang === "ar" ? "اسم البازار..." : "Bazaar name..."}
                className="font-black text-[#00284d] dark:text-blue-400 bg-transparent outline-none w-36 text-xs disabled:cursor-not-allowed"
              />
              {selectedBazaar && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBazaar(null)
                    setManualOverride(false)
                  }}
                  className="text-[10px] text-[#005295] dark:text-blue-400 hover:underline font-bold px-1"
                  title={t("changeBazaarBtn")}
                >
                  🔄
                </button>
              )}
              {isSiteInputDisabled && <span className="text-emerald-600 font-bold text-[10px]" title="مقفل أمنياً">🔒</span>}
            </div>

            {/* Network dot */}
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
              title={isOnline ? "Online" : "Offline"}
            ></span>
          </div>

          {/* Center: Mode Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSaleMode("CART")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                saleMode === "CART"
                  ? "bg-white dark:bg-slate-700 text-[#00284d] dark:text-white shadow-sm font-black"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {t("modeCart")}
            </button>
            <button
              onClick={() => setSaleMode("QUICK")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                saleMode === "QUICK"
                  ? "bg-white dark:bg-slate-700 text-[#00284d] dark:text-white shadow-sm font-black"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {t("modeQuick")}
            </button>
          </div>

          {/* Left: Toggles, User & Exit */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 transition-all"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 text-xs font-bold transition-all"
              title="Language"
            >
              <Icons.Globe />
              <span>{lang === "ar" ? "EN" : "عربي"}</span>
            </button>
            {/* Demo Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextMode = !isDemoMode
                setIsDemoMode(nextMode)
                if (nextMode) {
                  if (!selectedBazaar) {
                    setSelectedBazaar({
                      id: "demo-bazaar-1",
                      name: lang === "ar" ? "بازار تدريب المتطوعين (تجريبي)" : "Volunteer Training Bazaar (Demo)",
                      location: lang === "ar" ? "قاعة التدريب التفاعلية" : "Interactive Training Room"
                    })
                    setCurrentSite(lang === "ar" ? "بازار تدريب المتطوعين (تجريبي)" : "Volunteer Training Bazaar (Demo)")
                  }
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border shadow-sm ${
                isDemoMode
                  ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20 animate-pulse"
                  : "bg-slate-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              }`}
              title={lang === "ar" ? "تبديل وضع التدريب التجريبي" : "Toggle Demo Training Mode"}
            >
              <span>🎯</span>
              <span>{isDemoMode ? (lang === "ar" ? "وضع الديمو مفعّل" : "Demo Mode ON") : (lang === "ar" ? "ديمو تجريبي" : "Demo Mode")}</span>
            </button>

            <div className="text-right">
              <span className="text-xs font-bold text-[#00284d] dark:text-blue-400 block">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user?.role === "ADMIN" ? (lang === "ar" ? "المدير العام (ADMIN)" : "Administrator") : t("volunteerCashier")}
              </span>
            </div>
            {(user?.role === "ADMIN" || user?.role === "SUPERVISOR") && (
              <Link
                href="/admin"
                className="text-xs font-bold text-white bg-[#00284d] dark:bg-blue-600 hover:bg-[#00386b] dark:hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
              >
                <span>⚙️</span>
                <span>{lang === "ar" ? "لوحة الإدارة" : "Dashboard"}</span>
              </Link>
            )}
            <Link
              href="/pos/history"
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#00284d] dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              {t("mySalesToday")}
            </Link>
            <button
              onClick={() => {
                logout()
                router.push("/")
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-500 px-2 py-1 transition-all"
            >
              {t("logout")}
            </button>
          </div>
        </header>

        {/* Active Demo Mode Warning & Controls Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold shadow-md z-20 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-base animate-bounce">⚡</span>
              <span>
                {lang === "ar"
                  ? "وضع التدريب التجريبي (DEMO) نشط — مبيعاتك هنا تجريبية وآمنة للتعلم ولا تُسجل في الحسابات الرسمية."
                  : "DEMO Training Mode Active — Transactions here are simulated and safe for practice."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("khcf_demo_transactions")
                  setCompletedTransaction(null)
                  setCart([])
                  alert(lang === "ar" ? "تم مسح جميع الفواتير والبيانات التجريبية بنجاح." : "Demo transactions reset successfully.")
                }}
                className="bg-black/25 hover:bg-black/40 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition-all border border-white/20"
              >
                {lang === "ar" ? "🗑️ مسح الفواتير التجريبية" : "Reset Demo Data"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoMode(false)
                  setSelectedBazaar(null)
                  setCurrentSite("")
                  setCart([])
                }}
                className="bg-white text-amber-900 hover:bg-amber-50 px-3 py-1 rounded-lg text-[11px] font-black transition-all shadow-sm"
              >
                {lang === "ar" ? "خروج من وضع التدريب" : "Exit Demo Mode"}
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace: Sidebar Category Tabs + Products & Subcategories */}
        <div className="flex-1 flex overflow-hidden">
          {/* Vertical Categories Sidebar (التبويبات الجانبية للأقسام) */}
          <aside className="w-52 lg:w-60 bg-white dark:bg-slate-900 border-l rtl:border-l-0 rtl:border-r border-slate-200/80 dark:border-slate-800 flex flex-col flex-shrink-0 z-10 transition-colors duration-200">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>📑</span>
                <span>{lang === "ar" ? "الأقسام الرئيسية" : "Categories"}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                {categories.length - 1}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {categories.map((cat, idx) => {
                const active = activeCategory === cat
                const count = categoryCounts[cat] || (cat === "الكل" ? items.length : 0)
                const icon = getCategoryIcon(cat)

                return (
                  <button
                    key={`pos-cat-${idx}-${cat}`}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                      active
                        ? "bg-[#00284d] dark:bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{icon}</span>
                      <span className="truncate">{cat === "الكل" && lang === "en" ? "All" : cat}</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Center Content Area: Subcategory Pills + Search + Grid */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#090d16]/50">
            {/* Subcategories & Search Strip */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
              {/* Dynamic Subcategories Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 flex-1">
                {availableSubcategories.map((sub, idx) => {
                  const active = activeSubcategory === sub.name
                  return (
                    <button
                      key={`pos-subcat-${idx}-${sub.name}`}
                      onClick={() => setActiveSubcategory(sub.name)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        active
                          ? "bg-[#C8B18B] text-slate-900 font-black shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700"
                      }`}
                    >
                      <span>{sub.name === "الكل" ? t("productSubcategoryAll") : sub.name}</span>
                      <span
                        className={`text-[10px] font-mono rounded-full px-1.5 py-0.2 ${
                          active
                            ? "bg-black/10 text-slate-900"
                            : "bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {sub.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64 flex-shrink-0">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("searchProductsPlaceholder")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00284d]"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute left-2.5 top-1.5 text-slate-400 text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Demo Step Training Guide (if Demo Mode is ON) */}
            {isDemoMode && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-4 py-2 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200 flex-shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">خطوات التدريب:</span>
                  <span className="text-[11px] flex items-center gap-1">1. اختر قسماً من القائمة الجانبية ➔</span>
                  <span className="text-[11px] flex items-center gap-1">2. اضغط على أي صنف لإضافته للسلة ➔</span>
                  <span className="text-[11px] flex items-center gap-1">3. اضغط "إتمام الدفع" ➔</span>
                  <span className="text-[11px] flex items-center gap-1">4. اعرض الفاتورة واطبعها</span>
                </div>
              </div>
            )}

            {/* Product Grid Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#00284d] animate-spin mb-3"></div>
                  <p className="text-xs font-bold">جاري تحميل المنتجات...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                  {lang === "ar" ? "لا توجد منتجات تطابق البحث" : "No products match your search"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
                  {filteredItems.map((item) => {
                    const countInCart = cartItemCountMap[item.id] || 0
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-sm hover:shadow-md hover:border-[#00284d]/40 dark:hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between group active:scale-95 relative"
                      >
                        {/* Badge if item is in cart */}
                        {countInCart > 0 && saleMode === "CART" && (
                          <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                            {countInCart}
                          </span>
                        )}

                        {/* Image Thumbnail */}
                        <div className="w-full h-28 bg-slate-50 dark:bg-slate-800/60 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2 group-hover:bg-slate-100/70 dark:group-hover:bg-slate-800 transition-colors">
                          {item.img ? (
                            <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                          ) : (
                            <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold">{t("noImageText")}</span>
                          )}
                        </div>

                        {/* Info with Subcategory Tag */}
                        <div>
                          <div className="flex items-center gap-1 flex-wrap mb-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold block truncate max-w-[80px]">
                              {item.category}
                            </span>
                            {item.subcategory && (
                              <>
                                <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-[10px] text-[#C8B18B] dark:text-amber-400 font-bold block truncate max-w-[80px]">
                                  {item.subcategory}
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight min-h-[32px]" title={item.name}>
                            {item.name}
                          </h4>
                        </div>

                        {/* Price & Action */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-black text-sm text-[#00284d] dark:text-blue-400 font-mono">{item.price} JD</span>
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-[#00284d] dark:group-hover:text-blue-400 transition-colors">
                            {t("addBtn")}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* RIGHT AREA: STREAMLINED CART SIDEBAR */}
      {/* --------------------------------------------------------------------- */}
      {saleMode === "CART" && (
        <aside className="w-[340px] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col z-20 shadow-[-4px_0_20px_rgba(0,0,0,0.02)] transition-colors duration-200">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900 dark:text-white">{t("cartTitle")}</span>
              <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                {cart.reduce((sum, it) => sum + it.qty, 0)} {t("itemCount")}
              </span>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-[11px] text-red-500 hover:underline font-bold">
                {t("clearCart")}
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                <span className="text-3xl mb-2 opacity-40">🛒</span>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("cartEmptyTitle")}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t("cartEmptyDesc")}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.name}</h5>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {item.price} {t("perItem")}
                    </span>
                  </div>

                  {/* Quantity Stepper & Direct Input */}
                  <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={item.qty}
                      onChange={(e) => setDirectQty(item.id, parseInt(e.target.value) || 1)}
                      className="w-8 text-center font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent outline-none p-0"
                    />
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <span className="font-mono font-black text-xs text-[#00284d] dark:text-blue-400 w-12 text-left">
                    {(item.price * item.qty).toFixed(1)} JD
                  </span>

                  {/* Quick Trash Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                    title={t("removeItemBtn")}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold">{t("dueAmountLabel")}</span>
              <span className="text-xl font-black text-[#00284d] dark:text-blue-400 font-mono">{total.toFixed(2)} JD</span>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="w-full bg-[#00284d] hover:bg-[#001d38] dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-black py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>{t("checkoutBtn")}</span>
            </button>
          </div>
        </aside>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CHECKOUT MODAL (Cash vs Visa) */}
      {/* --------------------------------------------------------------------- */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 text-xs">
            {checkoutSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("successSaleTitle")}</h3>
                <p className="text-slate-400 dark:text-slate-500">{t("successSaleSub")}</p>
              </div>
            ) : (
              <>
                <div className="bg-[#00284d] dark:bg-[#031326] text-white p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm">{t("checkoutModalTitle")}</h4>
                    <p className="text-[10px] text-white/70">{t("posBazaarLabel")} {currentSite}</p>
                  </div>
                  <button onClick={() => setShowCheckout(false)} className="text-white text-sm font-bold">
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Total Card */}
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 font-bold block mb-1">{t("totalAmountLabel")}</span>
                    <span className="text-3xl font-black text-[#00284d] dark:text-blue-400 font-mono">{total.toFixed(2)} JD</span>
                    {extraDonation > 0 && (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-1">
                        (يشمل تبرع إضافي: +{extraDonation.toFixed(2)} JD)
                      </span>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">{t("choosePaymentLabel")}</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("CASH")
                          setVisaLast4("")
                        }}
                        className={`p-3 rounded-xl border text-center font-bold transition-all ${
                          paymentMethod === "CASH"
                            ? "border-[#00284d] dark:border-blue-500 bg-[#00284d]/5 dark:bg-blue-500/10 text-[#00284d] dark:text-blue-400 font-black"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-base block mb-1">💵</span>
                        <span>{t("payCashBtn")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("VISA")
                          setCashTendered("")
                          setExtraDonation(0)
                        }}
                        className={`p-3 rounded-xl border text-center font-bold transition-all ${
                          paymentMethod === "VISA"
                            ? "border-[#00284d] dark:border-blue-500 bg-[#00284d]/5 dark:bg-blue-500/10 text-[#00284d] dark:text-blue-400 font-black"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-base block mb-1">💳</span>
                        <span>{t("payVisaBtn")}</span>
                      </button>
                    </div>
                  </div>

                  {/* CASH CALCULATOR & CHANGE DUE */}
                  {paymentMethod === "CASH" && (
                    <div className="space-y-3 pt-1 animate-in fade-in">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                            {t("cashTenderedLabel")}
                          </label>
                          <span className="text-[10px] text-slate-400">فئات سريعة:</span>
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCashTendered(baseTotal.toString())
                              setExtraDonation(0)
                            }}
                            className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#00284d] hover:text-white dark:hover:bg-blue-600 rounded-lg font-bold text-[11px] font-mono transition-all text-center"
                          >
                            {t("exactAmountBtn")}
                          </button>
                          {[5, 10, 20, 50].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setCashTendered(amt.toString())
                                setExtraDonation(0)
                              }}
                              className={`py-1.5 px-1 rounded-lg font-bold text-[11px] font-mono transition-all text-center ${
                                tenderedNum === amt
                                  ? "bg-[#00284d] dark:bg-blue-600 text-white shadow-sm"
                                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {amt} JD
                            </button>
                          ))}
                        </div>

                        {/* Direct Tender Input */}
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          value={cashTendered}
                          onChange={(e) => {
                            setCashTendered(e.target.value)
                            setExtraDonation(0)
                          }}
                          placeholder={`المبلغ المدفوع (مثال: ${baseTotal})`}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center text-base font-black text-slate-900 dark:text-white outline-none focus:border-[#00284d]"
                        />
                      </div>

                      {/* Change Due & Cancer Donation Box */}
                      {tenderedNum >= baseTotal && (
                        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                              {t("changeDueLabel")}
                            </span>
                            <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-base">
                              {changeDue.toFixed(2)} JD
                            </span>
                          </div>

                          {/* Extra Donation Button */}
                          {changeDue > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setExtraDonation(changeDue)
                              }}
                              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <span>🎗️</span>
                              <span>{t("keepChangeDonationBtn")} (+{changeDue.toFixed(2)} JD)</span>
                            </button>
                          )}

                          {extraDonation > 0 && (
                            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold text-center border border-amber-200 dark:border-amber-800 flex items-center justify-between px-2">
                              <span>🎗️ {t("donationConfirmedBadge")} (+{extraDonation.toFixed(2)} JD)</span>
                              <button
                                type="button"
                                onClick={() => setExtraDonation(0)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "VISA" && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">{t("visaLast4Label")}</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={visaLast4}
                        onChange={(e) => setVisaLast4(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center text-lg font-black tracking-widest text-slate-900 dark:text-white outline-none focus:border-[#00284d]"
                        dir="ltr"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCheckout}
                      disabled={paymentMethod === "VISA" && visaLast4.length !== 4}
                      className="flex-1 bg-[#00284d] hover:bg-[#001d38] dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white py-3 rounded-xl font-black transition-all shadow-md"
                    >
                      {t("confirmPaymentBtn")}
                    </button>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                    >
                      {t("cancelBtn")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* INSTANT RECEIPT & PRINT MODAL */}
      {/* --------------------------------------------------------------------- */}
      {isReceiptOpen && completedTransaction && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Printable Receipt Box (80mm thermal / standard) */}
            <div id="pos-printable-receipt" className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 font-mono text-[11px] space-y-3">
              {completedTransaction.isDemo && (
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 border-2 border-dashed border-amber-400 dark:border-amber-600 text-center text-amber-900 dark:text-amber-200 font-black text-xs space-y-0.5">
                  <div>🎯 {lang === "ar" ? "فاتورة تدريبية تجريبية" : "DEMO TRAINING RECEIPT"}</div>
                  <div className="text-[9px] font-normal text-amber-700 dark:text-amber-300">
                    {lang === "ar" ? "غير مخصصة للمحاسبة الرسمية" : "Not valid for official accounting"}
                  </div>
                </div>
              )}
              <div className="text-center space-y-1">
                <img src="/shop_logo.png" alt="Logo" className="h-10 mx-auto object-contain" />
                <h4 className="font-black text-xs text-slate-900 dark:text-white">
                  {lang === "ar" ? "مؤسسة ومركز الحسين للسرطان" : "King Hussein Cancer Foundation"}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  {t("appName")} • {t("posTitle")}
                </p>
                <p className="text-[9px] text-slate-400">
                  {new Date(completedTransaction.date).toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")} • {new Date(completedTransaction.date).toLocaleTimeString(lang === "ar" ? "ar-JO" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>{t("receiptNumber")}:</span>
                <span className="font-bold font-mono">#{completedTransaction.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>{t("posBazaarLabel")}:</span>
                <span className="font-bold">{completedTransaction.siteName}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>{t("volunteerCashier")}:</span>
                <span className="font-bold">{completedTransaction.volunteerName}</span>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                {(completedTransaction.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-[10px]">
                    <span className="truncate max-w-[170px] text-slate-800 dark:text-slate-200 font-medium">
                      {it.name} × {it.qty}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {(it.price * it.qty).toFixed(2)} JD
                    </span>
                  </div>
                ))}

                {completedTransaction.extraDonation > 0 && (
                  <div className="flex justify-between items-center text-[10px] p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                    <span>🎗️ {t("extraDonationItemName")}</span>
                    <span className="font-mono">+{completedTransaction.extraDonation.toFixed(2)} JD</span>
                  </div>
                )}
              </div>

              {/* Total & Payment */}
              <div className="pt-2 border-t-2 border-slate-800 dark:border-slate-200 flex justify-between items-center font-bold text-xs text-slate-900 dark:text-white">
                <span>{t("totalAmountLabel")}:</span>
                <span className="text-sm font-black font-mono text-[#00284d] dark:text-blue-400">
                  {completedTransaction.total.toFixed(2)} JD
                </span>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{t("thPayment")}:</span>
                <span>
                  {completedTransaction.paymentMethod === "VISA"
                    ? `VISA (**** ${completedTransaction.visaLast4})`
                    : `CASH (${completedTransaction.cashTendered ? `المستلم: ${completedTransaction.cashTendered} JD` : "نقداً"})`}
                </span>
              </div>

              {completedTransaction.changeGiven > 0 && (
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{t("changeDueLabel")}</span>
                  <span className="font-bold font-mono">{completedTransaction.changeGiven.toFixed(2)} JD</span>
                </div>
              )}

              {/* Thank you footer */}
              <div className="text-center pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-[9px] text-slate-400 leading-tight">
                <p>🎗️ {t("thankYouMessage")}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>🖨️</span>
                <span>{t("printReceiptBtn")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReceiptOpen(false)
                  setCompletedTransaction(null)
                }}
                className="flex-1 bg-[#00284d] hover:bg-[#001d38] dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-md"
              >
                {t("newSaleBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
