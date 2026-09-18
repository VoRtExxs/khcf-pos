"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../store/AuthContext'
import itemsDataRaw from "../../../../public/items_db.json"

export default function CatalogManager() {
  const { user, logout, isAuthLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthLoading) return
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERVISOR")) {
      router.push("/")
    }
  }, [user, isAuthLoading, router])

  const [items, setItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("الكل")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Map the items similar to the POS page
  useEffect(() => {
    const processed = itemsDataRaw.map((item: any, index: number) => {
      let cat = "أخرى"
      const nameLower = item.name.toLowerCase()
      if (nameLower.includes('t-shirt') || nameLower.includes('t shirt')) cat = "تيشرتات"
      else if (nameLower.includes('hoodie')) cat = "سترات"
      else if (nameLower.includes('ceramic') || nameLower.includes('plant pot') || nameLower.includes('tray') || nameLower.includes('incense')) cat = "خزفيات"
      else if (nameLower.includes('mug') || nameLower.includes('cup') || nameLower.includes('istikan')) cat = "أكواب"
      else if (nameLower.includes('notebook') || nameLower.includes('pen') || nameLower.includes('bookmark') || nameLower.includes('coloring') || nameLower.includes('puzzle')) cat = "قرطاسية"
      else if (nameLower.includes('cushion') || nameLower.includes('table') || nameLower.includes('lampshade') || nameLower.includes('plexi') || nameLower.includes('ottoman') || nameLower.includes('frame') || nameLower.includes('canvas')) cat = "اكسسوارات منزلية"
      else if (nameLower.includes('bracelet') || nameLower.includes('necklace') || nameLower.includes('keychain') || nameLower.includes('pin ') || nameLower.includes('pouch') || nameLower.includes('tote') || nameLower.includes('wallet') || nameLower.includes('bangle') || nameLower.includes('cufflink') || nameLower.includes('bag') || nameLower.includes('mask') || nameLower.includes('ribbon')) cat = "اكسسوارات"
      else if (nameLower.includes('onesie') || nameLower.includes('socks') || nameLower.includes('koffeyeh')) cat = "ملابس أخرى"
      
      return {
        id: index + 1,
        name: item.name,
        price: item.price,
        category: cat,
        img: item.img
      }
    })
    setItems(processed)
  }, [])

  const categories = ["الكل", ...Array.from(new Set(items.map(i => i.category)))]

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === "الكل" || item.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setItems(items.map(i => i.id === editingItem.id ? editingItem : i))
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setEditingItem(null)
    }, 1500)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, upload to Supabase Storage. Here we create a local object URL for preview.
      const url = URL.createObjectURL(file)
      setEditingItem({ ...editingItem, img: url })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col" dir="rtl">
      {/* Navbar matching POS branding */}
      <nav className="bg-[#005295] text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <img src="/shop_logo.png" alt="دكان الخير" className="h-12 object-contain bg-white/10 rounded-lg p-1 backdrop-blur-sm" />
          <div className="hidden md:flex gap-2">
            <Link href="/admin" className="font-bold px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">اللوحة الرئيسية</Link>
            <span className="font-bold px-4 py-2 bg-white/20 rounded-lg shadow-inner">إدارة الكتالوج</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {user && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold">{user.name}</span>
            </div>
          )}
          <Link href="/pos" className="text-sm bg-[#C8B18B] hover:bg-[#b09a76] text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md">شاشة البيع (POS)</Link>
          <button onClick={() => { logout(); router.push('/') }} className="text-sm hover:text-red-300 transition-colors font-bold">خروج</button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#005295] mb-2">إدارة الكتالوج والمنتجات</h1>
            <p className="text-slate-500 font-medium">راجع المنتجات، صحح الصور، وعدل الأسعار قبل الاعتماد النهائي.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
                   {items.filter(i => i.img).length}
                </div>
                <div className="text-sm">
                  <p className="text-slate-500">منتجات بصور</p>
                </div>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold">
                   {items.filter(i => !i.img).length}
                </div>
                <div className="text-sm">
                  <p className="text-slate-500">تحتاج مراجعة</p>
                </div>
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="ابحث عن منتج بالاسم..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C8B18B] focus:ring-1 focus:ring-[#C8B18B] outline-none transition-all"
            />
            <div className="absolute right-4 top-3.5 text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C8B18B] outline-none font-bold text-[#005295]"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
              <div className="h-40 bg-slate-100 relative flex items-center justify-center p-4 border-b border-slate-100">
                {item.img ? (
                  <img src={item.img} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="text-slate-300 flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <span className="text-xs">بدون صورة</span>
                  </span>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#005295]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="bg-white text-[#005295] font-bold py-2 px-6 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-all"
                  >
                    تعديل المنتج
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md mb-2 inline-block">{item.category}</span>
                  <h3 className="font-bold text-[#005295] text-sm leading-snug line-clamp-2" title={item.name}>{item.name}</h3>
                </div>
                <div className="mt-3 font-black text-[#C8B18B]">{item.price} JD</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-[#005295]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {saveSuccess ? (
              <div className="p-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-2xl font-black text-[#005295]">تم الحفظ بنجاح!</h2>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
                {/* Left Side: Image Editor */}
                <div className="w-full md:w-2/5 bg-slate-50 border-l border-slate-100 p-8 flex flex-col items-center justify-center relative">
                   <div className="w-48 h-48 bg-white rounded-2xl shadow-inner border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-6 relative group">
                      {editingItem.img ? (
                        <img src={editingItem.img} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <span className="text-slate-400">لا يوجد صورة</span>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <label className="text-white font-bold cursor-pointer flex flex-col items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                           رفع صورة جديدة
                           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                   </div>
                   <p className="text-xs text-slate-400 text-center">اضغط على الصورة لتغييرها بصورة صحيحة من جهازك.</p>
                </div>
                
                {/* Right Side: Form */}
                <form onSubmit={handleSave} className="flex-1 p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-[#005295]">تعديل المنتج</h2>
                    <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                  
                  <div className="space-y-5 flex-1">
                    <div>
                      <label className="block text-sm font-bold text-[#005295] mb-2">اسم المنتج</label>
                      <input 
                        type="text" 
                        value={editingItem.name}
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#005295] outline-none font-medium"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-[#005295] mb-2">السعر (JD)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={editingItem.price}
                          onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#005295] outline-none font-bold text-[#C8B18B]"
                          required
                          dir="ltr"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-[#005295] mb-2">القسم</label>
                        <select 
                          value={editingItem.category}
                          onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#005295] outline-none font-medium"
                        >
                          {categories.filter(c => c !== "الكل").map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">إلغاء</button>
                    <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#005295] hover:bg-[#003a6b] shadow-md transition-colors flex items-center justify-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                       حفظ التعديلات
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
