"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../store/AuthContext"
import { usePreferences } from "../store/PreferencesContext"

export default function LoginPage() {
  const [volunteerId, setVolunteerId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, user } = useAuth()
  const { theme, lang, toggleTheme, toggleLang } = usePreferences()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN" || user.role === "SUPERVISOR") router.push("/admin")
      else router.push("/pos")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!volunteerId || !password) {
      setError(lang === "ar" ? "الرجاء إدخال رقم المتطوع وكلمة المرور" : "Please enter ID and password")
      return
    }

    setIsLoading(true)
    const success = await login(volunteerId, password)
    setIsLoading(false)

    if (success) {
      const session = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("khcf_session") || "{}") : null
      if (session?.role === "ADMIN" || session?.role === "SUPERVISOR") {
        router.push("/admin")
      } else {
        router.push("/pos")
      }
    } else {
      setError(lang === "ar" ? "كلمة المرور أو رقم المتطوع غير صحيح" : "Invalid volunteer ID or password")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Decor */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-[#005295]/5 dark:bg-[#005295]/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-[#C8B18B]/10 dark:bg-[#C8B18B]/20 rounded-full blur-3xl"></div>

      {/* Top Floating Controls */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          onClick={toggleLang}
          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
          title="Switch Language"
        >
          <span>🌐</span>
          <span>{lang === "ar" ? "English" : "العربية"}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 md:p-14 w-full max-w-md relative z-10 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300 transition-colors duration-200">
        <div className="text-center mb-10">
          <img src="/shop_logo.png" alt="دكان الخير" className="h-24 mx-auto mb-6 object-contain drop-shadow-md" />
          <h1 className="text-3xl font-black text-[#005295] dark:text-blue-400 mb-2">
            {lang === "ar" ? "نظام نقاط البيع" : "Point of Sale System"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {lang === "ar" ? "تسجيل دخول المتطوعين والإدارة" : "Volunteer & Management Portal"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-300 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 text-center animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
              {lang === "ar" ? "الرقم الوطني / رقم الموبايل" : "National ID / Phone"}
            </label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`absolute ${lang === "ar" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-slate-400`}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                type="text"
                value={volunteerId}
                onChange={(e) => setVolunteerId(e.target.value)}
                className={`w-full ${lang === "ar" ? "pl-4 pr-12" : "pr-4 pl-12"} py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005295]/20 focus:border-[#005295] transition-all font-medium`}
                placeholder={lang === "ar" ? "أدخل مُعرّف الدخول الخاص بك" : "Enter your ID"}
                dir="ltr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
              {lang === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`absolute ${lang === "ar" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-slate-400`}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${lang === "ar" ? "pl-4 pr-12" : "pr-4 pl-12"} py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005295]/20 focus:border-[#005295] transition-all font-medium font-mono`}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#005295] hover:bg-[#003a6b] dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (lang === "ar" ? "جاري التحقق..." : "Verifying...") : (lang === "ar" ? "دخول للنظام" : "Sign In")}
          </button>
        </form>
      </div>
    </div>
  )
}
