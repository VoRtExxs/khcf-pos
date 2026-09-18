"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Theme = "light" | "dark"
export type Language = "ar" | "en"

// Comprehensive Dictionary for Admin & POS
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand & System
    appName: "دكان الخير",
    appSubtitle: "منصة الرقابة والإدارة",
    posTitle: "بوابة نقطة البيع للمتطوعين",
    cloudConnected: "السحابة متصلة",
    openPos: "فتح شاشة الكاشير (POS)",
    logout: "تسجيل الخروج",
    logoutConfirm: "هل تريد تسجيل الخروج؟",
    superAdmin: "إشراف وتدقيق مالي",
    volunteerCashier: "كادر المبيعات (متطوع)",

    // Navigation Sections
    navAnalytics: "الرقابة والتحليل",
    navOverview: "نظرة عامة والتحليلات",
    navLedger: "سجل الحركات والتدقيق",
    navFieldOps: "العمليات الميدانية",
    navBazaars: "البازارات والفعاليات",
    navStaff: "كادر المتطوعين",
    navCatalogGov: "المنتجات والحوكمة",
    navCatalog: "كتالوج المنتجات والأسعار",
    navSecurity: "المطابقات وسجل الرقابة",

    // Header Actions
    financialActions: "إجراءات رقابية ومالية ▾",
    shiftCloseZReport: "تقفيل الصندوق اليومي (Z-Report)",
    printExecutiveReport: "طباعة التقرير المالي المعتمد (PDF)",
    instantSync: "مزامنة فورية مع قاعدة البيانات",

    // Time Filters
    filterToday: "اليوم",
    filterWeek: "7 أيام",
    filterMonth: "الشهر",
    filterAll: "الكل",

    // Top 4 KPIs
    kpiRevenueTitle: "صافي الإيرادات المحصلة",
    kpiCashTitle: "النقد في الصناديق (CASH)",
    kpiVisaTitle: "المدفوعات الإلكترونية (VISA)",
    kpiOrdersTitle: "العمليات ومتوسط الفاتورة",
    periodLabel: "الفترة:",
    todaySales: "مبيعات اليوم",
    selectedPeriod: "المحددة",
    auditedStatus: "100% مدقق",
    cashRatio: "نسبة السيولة النقدية:",
    visaRatio: "نسبة التحصيل الإلكتروني:",
    invoiceCount: "فاتورة",
    itemCount: "قطعة",
    aovLabel: "متوسط الفاتورة (AOV):",

    // Charts & Overview
    incomeComparison: "مقارنة مصادر الدخل (نقد vs بطاقات إلكترونية)",
    cashShort: "نقد",
    visaShort: "فيزا",
    topProductsTitle: "أعلى الأصناف مساهمة في الإيرادات",
    noSalesPeriod: "لا توجد بيانات مبيعات في هذه الفترة",
    bazaarsStatusTitle: "حالة البازارات المجدولة",
    manageBazaarsLink: "إدارة البازارات ←",
    noBazaarsScheduled: "لم يتم جدولة أي بازار حالياً",
    scheduleNewBazaarBtn: "+ جدولة بازار جديد",

    // Statuses
    statusActive: "🟢 نشط",
    statusActiveNow: "🟢 نشط الآن",
    statusUpcoming: "🟡 قادم",
    statusEnded: "⚫ منتهي",
    statusLockedTime: "🔒 مغلق زمنياً",
    statusAvailableNow: "🟢 متاح للبيع الآن",

    // Ledger
    ledgerSearchPlaceholder: "بحث برقم الفاتورة، المتطوع، أو الصنف...",
    paymentAll: "الدفع: الكل",
    paymentCash: "نقد (CASH)",
    paymentVisa: "بطاقة (VISA)",
    exportCsv: "تصدير CSV",
    thInvoiceId: "رقم الفاتورة",
    thDateTime: "الوقت والتاريخ",
    thVolunteer: "المتطوع (الكاشير)",
    thLocation: "الموقع / البازار",
    thPayment: "طريقة الدفع",
    thSync: "المزامنة",
    thAmount: "المبلغ",
    thReceipt: "الإيصال",
    noLedgerFound: "لا توجد فواتير تطابق شروط البحث المحددة",
    mainBuilding: "المبنى الرئيسي",
    syncCloud: "سحابي ✓",
    syncLocal: "محلي 💾",

    // Bazaars
    bazaarMgmtTitle: "جدولة وتعيين البازارات الميدانية",
    bazaarMgmtSub: "تحديد مواعيد الفعاليات وإلحاق المتطوعين بها",
    uploadCsvSchedule: "رفع جدول CSV",
    addNewBazaar: "إضافة بازار جديد",
    startPrefix: "البداية:",
    endPrefix: "النهاية:",
    volunteersTitle: "المتطوعون",
    assignVolunteerBtn: "+ تعيين متطوع",
    noVolunteersAssigned: "لم يعين أي متطوع",
    viewInvoicesLink: "عرض الفواتير ←",
    deleteBazaarBtn: "حذف البازار",
    bazaarAnalyticsBtn: "📊 تقرير الأداء المالي",
    bazaarReportTitle: "التقرير المالي التنفيذي للبازار",
    bazaarTotalRevenue: "إجمالي مبيعات البازار",
    bazaarCashRevenue: "مبيعات نقدية (CASH)",
    bazaarVisaRevenue: "مبيعات بطاقات (VISA)",
    bazaarInvoicesCount: "عدد الفواتير",
    bazaarAov: "متوسط الفاتورة",
    volunteersContribution: "مساهمة الكادر في هذا البازار",
    topBazaarItems: "الأصناف الأكثر مبيعاً بالبازار",
    volunteersLeaderboard: "لوحة شرف المتطوعين الأكثر مبيعاً",
    printBazaarReport: "طباعة التقرير المالي الرسمي A4",
    supervisorSignature: "مشرف البازار",
    cashierSignature: "أمين الصندوق الميداني",
    auditorSignature: "المدير المالي والتدقيق",
    viewOnlyCatalogNotice: "وضع العرض فقط: لا تملك صلاحية تعديل الأسعار أو حذف المنتجات (خاص بالمدير العام)",
    statusOnline: "متصل بالإنترنت",
    statusOffline: "وضع محلي غير متصل",
    activeTerminals: "كواشير نشطة الآن",
    pendingSyncBadge: "حركات تنتظر المزامنة",
    forceSyncBtn: "مزامنة سحابية شاملة",
    syncingInProgress: "جارِ المزامنة...",
    allSyncedSuccess: "تمت مزامنة كافة الفواتير والعمليات بنجاح ✅",

    // Staff
    staffMgmtTitle: "إدارة كادر المتطوعين",
    staffMgmtSub: "إنشاء حسابات المتطوعين، وتعديل كلمات المرور",
    addVolunteerBtn: "إضافة متطوع",
    thStaffName: "اسم المتطوع",
    thStaffId: "الرقم الوطني / اسم الدخول",
    thRole: "الدور",
    thStatus: "الحالة",
    thActions: "إجراءات",
    roleAdmin: "مدير عام",
    roleSupervisor: "مشرف ميداني",
    roleVolunteer: "متطوع بيع",
    statusActiveStaff: "نشط",
    statusSuspended: "معلق",
    changePassBtn: "تغيير الرمز 🔑",

    // Catalog
    catalogSearchPlaceholder: "بحث عن منتج في الكتالوج...",
    registeredProducts: "منتج مسجل",
    noImageText: "بدون صورة",
    editProductBtn: "تعديل",
    addProductBtn: "+ إضافة منتج جديد",
    editProductModalTitle: "تعديل بيانات وسعر المنتج",
    addProductModalTitle: "إضافة منتج جديد للكتالوج",
    productNameLabel: "اسم المنتج",
    productPriceLabel: "السعر (JD)",
    productCategoryLabel: "القسم التصنيفي",
    productSubcategoryLabel: "القسم الفرعي",
    productSubcategoryAll: "القسم الفرعي: الكل",
    productImageLabel: "رابط الصورة (URL)",
    productSaveSuccess: "تم حفظ التعديلات بنجاح!",
    productDeleteConfirm: "هل أنت متأكد من رغبتك في حذف هذا المنتج من الكتالوج نهائياً؟",
    productDeleteSuccess: "تم حذف المنتج بنجاح",
    prevPageBtn: "السابق",
    nextPageBtn: "التالي",
    pageIndicator: "صفحة",
    ofPages: "من",

    // Security & Z-Report
    zReportHistoryTitle: "سجل المطابقات النقدية وإغلاق الصناديق (Z-Reports)",
    newZReportBtn: "+ إجراء تقفيل صندوق جديد",
    noShiftsRecorded: "لم يتم تسجيل أي إغلاق صندوق سابقاً",
    thReportId: "رقم التقرير",
    thSystemExpected: "المقيد بالنظام",
    thActualCounted: "الفعلي المعدود",
    thView: "عرض",
    auditLogTitle: "سجل التدقيق الأمني والرقابي (Audit Log)",
    thAction: "الإجراء المنفذ",
    thActor: "المسؤول",
    thDetails: "التفاصيل",

    // POS Screen
    posBazaarLabel: "البازار:",
    modeCart: "سلة مشتريات (متعدد)",
    modeQuick: "بيع سريع (قطعة واحدة)",
    mySalesToday: "مبيعاتي اليوم",
    searchProductsPlaceholder: "بحث في المنتجات...",
    cartTitle: "سلة المشتريات",
    clearCart: "إفراغ السلة",
    cartEmptyTitle: "السلة فارغة",
    cartEmptyDesc: "اضغط على أي صنف لإضافته للسلة",
    dueAmountLabel: "المبلغ المطلوب للدفع:",
    checkoutBtn: "إتمام الدفع (CASH / VISA)",
    perItem: "JD للقطعة",
    addBtn: "+ إضافة",
    inCartBadge: "في السلة",

    // Checkout Modal
    checkoutModalTitle: "تأكيد عملية الدفع",
    totalAmountLabel: "المبلغ الإجمالي",
    choosePaymentLabel: "اختر طريقة الدفع:",
    payCashBtn: "نقداً (Cash)",
    payVisaBtn: "بطاقة (Visa)",
    visaLast4Label: "آخر 4 أرقام من بطاقة الفيزا *",
    confirmPaymentBtn: "تأكيد وحفظ الفاتورة",
    cancelBtn: "إلغاء",
    successSaleTitle: "تم تسجيل البيع بنجاح",
    successSaleSub: "شكراً لدعم مؤسسة الحسين للسرطان",

    // Bazaar Selector
    selectBazaarScreenTitle: "اختر البازار الميداني للبدء",
    selectBazaarScreenSub: "تظهر هنا فقط الفعاليات المجدولة التي تم تعيينك فيها من قبل إدارة مؤسسة الحسين للسرطان",
    noBazaarsAssignedTitle: "لم يتم تعيينك لأي بازار حالياً",
    noBazaarsAssignedSub: "يرجى التواصل مع المشرف الميداني لإلحاقك بجدول البازارات المعتمد.",
    manualOverrideBtn: "أو الدخول يدوياً (حالة استثنائية) ←",
    startSellingBtn: "ابدأ البيع في هذا البازار ✅",
    startsAtPrefix: "يفتح عند",
    eventEndedText: "انتهت الفعالية",

    // Modals
    receiptAuditTitle: "إيصال مالي مدقق",
    netAmountLabel: "المبلغ الصافي:",
    printReceiptBtn: "طباعة الإيصال",
    closeBtn: "إغلاق",

    // Feature 3: Bazaar Analytics & Performance
    bazaarPerformance: "أداء البازار المالي",
    bazaarAnalyticsReport: "تقرير أداء البازار والتدقيق المالي",
    bazaarAnalyticsBtn: "📊 تقرير الأداء المالي",
    volunteersBreakdown: "مساهمة كادر المتطوعين في البازار",
    topSellingInBazaar: "الأصناف الأكثر مبيعاً في هذا البازار",
    volunteerLeaderboard: "لوحة شرف المتطوعين والأعلى إنجازاً",
    officialAuditVoucher: "سند تدقيق وإغلاق مالي معتمد",
    bazaarSupervisorSignature: "مشرف البازار الميداني",
    cashierSignature: "أمين الصندوق الميداني",
    financialAuditSignature: "المدير المالي والتدقيق",
    printVoucherBtn: "طباعة سند الإغلاق المعتمد (PDF / A4)",
    salesContribution: "المساهمة من الإجمالي",
    salesAmount: "حجم المبيعات",
    invoicesIssued: "الفواتير المصدرة",
    noStaffSalesInBazaar: "لم يتم تسجيل مبيعات بواسطة المتطوعين في هذا البازار حتى الآن",
    noItemsSoldInBazaar: "لم يتم بيع أي أصناف في هذا البازار بعد",
    
    // Feature 4: Live Operational Monitor
    liveOperationalMonitor: "المراقب التشغيلي المباشر",
    networkOnline: "متصل بالإنترنت",
    networkOffline: "بدون إنترنت (أوفلاين)",
    activeTerminals: "أجهزة كاشير نشطة",
    unsyncedRecords: "حركات بانتظار المزامنة",
    forceSyncBtn: "مزامنة سحابية شاملة ⚡",
    syncAllSuccess: "تمت المزامنة السحابية بنجاح",
    allSynced: "متزامن بالكامل",

    // Feature 5: Role-Based Permissions & Governance
    roleSupervisor: "مشرف ميداني (Supervisor)",
    supervisorBadge: "مشرف ميداني",
    viewOnlyCatalogNotice: "وضع العرض فقط للمشرف: تعديل الكتالوج والأسعار وحذف البازارات مقتصر على الإدارة المركزية.",
    supervisorRestrictedAction: "هذا الإجراء مقتصر على المدير العام",

    // Volunteer POS & Checkout Upgrades
    cashTenderedLabel: "المبلغ المستلم نقداً (د.أ)",
    changeDueLabel: "الباقي المستحق للمشتري:",
    exactAmountBtn: "بالضبط",
    keepChangeDonationBtn: "تبرع بالباقي لدعم مرضى السرطان 🎗️",
    donationConfirmedBadge: "تم قيد الباقي كتبرع إضافي لمرضى السرطان 🎗️",
    extraDonationItemName: "تبرع إضافي لمرضى السرطان",
    instantReceiptTitle: "تم تسجيل الفاتورة بنجاح",
    printReceiptBtn: "طباعة الإيصال (Print)",
    newSaleBtn: "عملية بيع جديدة (↵)",
    receiptNumber: "رقم الفاتورة",
    thankYouMessage: "شكراً لمساهمتكم الكريمة في دعم علاج مرضى مركز الحسين للسرطان",
    barcodeDetectedToast: "تم مسح المنتج بالباركود بنجاح",
    directQtyLabel: "الكمية",
    removeItemBtn: "حذف البند",
    changeBazaarBtn: "تغيير البازار",
    reprintReceiptBtn: "طباعة الإيصال",
    salesHistoryTitle: "سجل مبيعاتي اليومية",
    myDailySalesSubtitle: "كشف المبيعات المحققة لجهاز نقطة البيع الحالي",
    todaySalesTotal: "إجمالي مبيعات اليوم",
    todayCashTotal: "المحصل نقداً (CASH)",
    todayVisaTotal: "المحصل بالبطاقات (VISA)",
    todayInvoicesCount: "عدد الفواتير الصادرة",
    backToPosBtn: "العودة لشاشة الكاشير (POS)",
    noSalesTodayMsg: "لم تسجل أي عمليات بيع اليوم حتى الآن",
    receiptDetailsTitle: "تفاصيل الإيصال المالي",
    closeReceiptBtn: "إغلاق الإيصال"
  },
  en: {
    // Brand & System
    appName: "Dukan Al-Khair",
    appSubtitle: "Executive & Control Platform",
    posTitle: "Volunteer POS Portal",
    cloudConnected: "Cloud Connected",
    openPos: "Open POS Terminal",
    logout: "Sign Out",
    logoutConfirm: "Are you sure you want to sign out?",
    superAdmin: "Financial & Oversight Admin",
    volunteerCashier: "Sales Staff (Volunteer)",

    // Navigation Sections
    navAnalytics: "Analytics & Oversight",
    navOverview: "Overview & Analytics",
    navLedger: "Transaction Audit Ledger",
    navFieldOps: "Field Operations",
    navBazaars: "Bazaars & Events",
    navStaff: "Volunteer Staff",
    navCatalogGov: "Catalog & Governance",
    navCatalog: "Product Catalog & Prices",
    navSecurity: "Cash Reconciliations & Audit",

    // Header Actions
    financialActions: "Financial Actions ▾",
    shiftCloseZReport: "Daily Shift Close (Z-Report)",
    printExecutiveReport: "Print Executive Report (PDF)",
    instantSync: "Instant Database Sync",

    // Time Filters
    filterToday: "Today",
    filterWeek: "7 Days",
    filterMonth: "Month",
    filterAll: "All",

    // Top 4 KPIs
    kpiRevenueTitle: "Total Net Revenue",
    kpiCashTitle: "Cash in Drawers (CASH)",
    kpiVisaTitle: "Electronic Payments (VISA)",
    kpiOrdersTitle: "Orders & Average Basket",
    periodLabel: "Period:",
    todaySales: "Today's Sales",
    selectedPeriod: "Selected",
    auditedStatus: "100% Audited",
    cashRatio: "Cash Ratio:",
    visaRatio: "Electronic Ratio:",
    invoiceCount: "Invoices",
    itemCount: "Items",
    aovLabel: "Average Order Value (AOV):",

    // Charts & Overview
    incomeComparison: "Revenue Sources Comparison (Cash vs Electronic)",
    cashShort: "Cash",
    visaShort: "Visa",
    topProductsTitle: "Top Revenue-Generating Products",
    noSalesPeriod: "No sales data available for this period",
    bazaarsStatusTitle: "Scheduled Bazaars Status",
    manageBazaarsLink: "Manage Bazaars →",
    noBazaarsScheduled: "No bazaars currently scheduled",
    scheduleNewBazaarBtn: "+ Schedule New Bazaar",

    // Statuses
    statusActive: "🟢 Active",
    statusActiveNow: "🟢 Active Now",
    statusUpcoming: "🟡 Upcoming",
    statusEnded: "⚫ Ended",
    statusLockedTime: "🔒 Time-Locked",
    statusAvailableNow: "🟢 Available for Sale",

    // Ledger
    ledgerSearchPlaceholder: "Search by receipt #, volunteer, or item...",
    paymentAll: "Payment: All",
    paymentCash: "Cash (CASH)",
    paymentVisa: "Card (VISA)",
    exportCsv: "Export CSV",
    thInvoiceId: "Invoice #",
    thDateTime: "Date & Time",
    thVolunteer: "Cashier (Volunteer)",
    thLocation: "Site / Bazaar",
    thPayment: "Payment",
    thSync: "Sync",
    thAmount: "Amount",
    thReceipt: "Receipt",
    noLedgerFound: "No transactions match the selected filter criteria",
    mainBuilding: "Main Center",
    syncCloud: "Cloud ✓",
    syncLocal: "Local 💾",

    // Bazaars
    bazaarMgmtTitle: "Bazaar Scheduling & Assignment",
    bazaarMgmtSub: "Set event timings and assign registered volunteers",
    uploadCsvSchedule: "Upload CSV Schedule",
    addNewBazaar: "Add New Bazaar",
    startPrefix: "Start:",
    endPrefix: "End:",
    volunteersTitle: "Assigned Volunteers",
    assignVolunteerBtn: "+ Assign Volunteer",
    noVolunteersAssigned: "No volunteers assigned yet",
    viewInvoicesLink: "View Invoices →",
    deleteBazaarBtn: "Delete Bazaar",
    bazaarAnalyticsBtn: "📊 Performance Report",
    bazaarReportTitle: "Executive Bazaar Financial Report",
    bazaarTotalRevenue: "Total Bazaar Revenue",
    bazaarCashRevenue: "Cash Revenue (CASH)",
    bazaarVisaRevenue: "Card Revenue (VISA)",
    bazaarInvoicesCount: "Invoices Count",
    bazaarAov: "Avg Order Value",
    volunteersContribution: "Staff Contribution in this Bazaar",
    topBazaarItems: "Top Selling Items in Bazaar",
    volunteersLeaderboard: "Top Volunteers Leaderboard",
    printBazaarReport: "Print Official A4 Financial Report",
    supervisorSignature: "Bazaar Supervisor",
    cashierSignature: "Field Cashier",
    auditorSignature: "Internal Financial Auditor",
    viewOnlyCatalogNotice: "View-only mode: You do not have permission to edit prices or delete items (Admin only)",
    statusOnline: "Online",
    statusOffline: "Offline (Local Mode)",
    activeTerminals: "Active Cashiers",
    pendingSyncBadge: "Pending Cloud Sync",
    forceSyncBtn: "Force Cloud Sync",
    syncingInProgress: "Syncing...",
    allSyncedSuccess: "All records synchronized successfully ✅",

    // Staff
    staffMgmtTitle: "Volunteer Staff Management",
    staffMgmtSub: "Register volunteer accounts and reset credentials",
    addVolunteerBtn: "Add Volunteer",
    thStaffName: "Volunteer Name",
    thStaffId: "National ID / Login",
    thRole: "Role",
    thStatus: "Status",
    thActions: "Actions",
    roleAdmin: "Admin",
    roleSupervisor: "Field Supervisor",
    roleVolunteer: "Sales Volunteer",
    statusActiveStaff: "Active",
    statusSuspended: "Suspended",
    changePassBtn: "Reset Key 🔑",

    // Catalog
    catalogSearchPlaceholder: "Search catalog items...",
    registeredProducts: "Items Registered",
    noImageText: "No Image",
    editProductBtn: "Edit",
    addProductBtn: "+ Add New Product",
    editProductModalTitle: "Edit Product Details",
    addProductModalTitle: "Add New Product to Catalog",
    productNameLabel: "Product Name",
    productPriceLabel: "Price (JD)",
    productCategoryLabel: "Category",
    productSubcategoryLabel: "Subcategory",
    productSubcategoryAll: "Subcategory: All",
    productImageLabel: "Image URL",
    productSaveSuccess: "Product saved successfully!",
    productDeleteConfirm: "Are you sure you want to permanently delete this product?",
    productDeleteSuccess: "Product deleted successfully",
    prevPageBtn: "Previous",
    nextPageBtn: "Next",
    pageIndicator: "Page",
    ofPages: "of",

    // Security & Z-Report
    zReportHistoryTitle: "Cash Reconciliations & Shift Closes (Z-Reports)",
    newZReportBtn: "+ Perform New Cash Reconciliation",
    noShiftsRecorded: "No shift closes have been recorded yet",
    thReportId: "Report #",
    thSystemExpected: "System Booked",
    thActualCounted: "Actual Counted",
    thView: "View",
    auditLogTitle: "Security & Governance Audit Log",
    thAction: "Action Executed",
    thActor: "Actor",
    thDetails: "Details",

    // POS Screen
    posBazaarLabel: "Bazaar:",
    modeCart: "Cart Mode (Multi)",
    modeQuick: "Quick Sale (Single)",
    mySalesToday: "My Sales Today",
    searchProductsPlaceholder: "Search products...",
    cartTitle: "Shopping Cart",
    clearCart: "Clear Cart",
    cartEmptyTitle: "Cart is Empty",
    cartEmptyDesc: "Tap any product to add it to the cart",
    dueAmountLabel: "Total Amount Due:",
    checkoutBtn: "Complete Sale (CASH / VISA)",
    perItem: "JD each",
    addBtn: "+ Add",
    inCartBadge: "in cart",

    // Checkout Modal
    checkoutModalTitle: "Confirm Payment",
    totalAmountLabel: "Total Amount",
    choosePaymentLabel: "Select Payment Method:",
    payCashBtn: "Cash (CASH)",
    payVisaBtn: "Card (VISA)",
    visaLast4Label: "Last 4 Digits of Card *",
    confirmPaymentBtn: "Confirm & Record Sale",
    cancelBtn: "Cancel",
    successSaleTitle: "Sale Recorded Successfully",
    successSaleSub: "Thank you for supporting King Hussein Cancer Foundation",

    // Bazaar Selector
    selectBazaarScreenTitle: "Select Bazaar to Begin",
    selectBazaarScreenSub: "Only bazaars officially assigned to you by KHCF management appear here",
    noBazaarsAssignedTitle: "No Bazaars Currently Assigned to You",
    noBazaarsAssignedSub: "Please contact your field supervisor to be assigned to an approved bazaar.",
    manualOverrideBtn: "Or enter manually (Exception mode) →",
    startSellingBtn: "Start Selling at this Bazaar ✅",
    startsAtPrefix: "Opens at",
    eventEndedText: "Event Concluded",

    // Modals
    receiptAuditTitle: "Audited Financial Receipt",
    netAmountLabel: "Net Total:",
    printReceiptBtn: "Print Receipt",
    closeBtn: "Close",

    // Feature 3: Bazaar Analytics & Performance
    bazaarPerformance: "Bazaar Financial Performance",
    bazaarAnalyticsReport: "Bazaar Audit & Analytics Report",
    bazaarAnalyticsBtn: "📊 Financial Performance",
    volunteersBreakdown: "Volunteer Staff Contribution",
    topSellingInBazaar: "Top-Selling Items in Bazaar",
    volunteerLeaderboard: "Volunteer Staff Honor Board & Leaderboard",
    officialAuditVoucher: "Certified Financial Audit & Closing Voucher",
    bazaarSupervisorSignature: "Field Bazaar Supervisor",
    cashierSignature: "Field Cashier",
    financialAuditSignature: "Financial Director & Auditor",
    printVoucherBtn: "Print Certified Voucher (PDF / A4)",
    salesContribution: "% Contribution",
    salesAmount: "Sales Generated",
    invoicesIssued: "Invoices",
    noStaffSalesInBazaar: "No volunteer sales recorded for this bazaar yet",
    noItemsSoldInBazaar: "No items sold in this bazaar yet",
    
    // Feature 4: Live Operational Monitor
    liveOperationalMonitor: "Live Operational Monitor",
    networkOnline: "Online",
    networkOffline: "Offline",
    activeTerminals: "Active Terminals",
    unsyncedRecords: "Pending Sync",
    forceSyncBtn: "Force Cloud Sync ⚡",
    syncAllSuccess: "Full cloud sync completed successfully",
    allSynced: "All synced",

    // Feature 5: Role-Based Permissions & Governance
    roleSupervisor: "Field Supervisor",
    supervisorBadge: "Field Supervisor",
    viewOnlyCatalogNotice: "Supervisor View-Only Mode: Editing catalog, prices, and deleting bazaars is restricted to Central Admin.",
    supervisorRestrictedAction: "This action is restricted to Super Admin",

    // Volunteer POS & Checkout Upgrades
    cashTenderedLabel: "Cash Received (JD)",
    changeDueLabel: "Change Due to Customer:",
    exactAmountBtn: "Exact",
    keepChangeDonationBtn: "Donate Change to Cancer Care 🎗️",
    donationConfirmedBadge: "Change added as extra cancer care donation 🎗️",
    extraDonationItemName: "Extra Cancer Care Donation",
    instantReceiptTitle: "Transaction Completed Successfully",
    printReceiptBtn: "Print Receipt",
    newSaleBtn: "New Transaction (↵)",
    receiptNumber: "Receipt #",
    thankYouMessage: "Thank you for supporting King Hussein Cancer Center patients",
    barcodeDetectedToast: "Product scanned via barcode successfully",
    directQtyLabel: "Qty",
    removeItemBtn: "Remove Item",
    changeBazaarBtn: "Change Bazaar",
    reprintReceiptBtn: "Reprint Receipt",
    salesHistoryTitle: "My Daily Sales History",
    myDailySalesSubtitle: "Sales audit log for current volunteer POS terminal",
    todaySalesTotal: "Today's Total Sales",
    todayCashTotal: "Collected Cash (CASH)",
    todayVisaTotal: "Collected Cards (VISA)",
    todayInvoicesCount: "Invoices Issued",
    backToPosBtn: "Back to POS Terminal",
    noSalesTodayMsg: "No sales recorded for today yet",
    receiptDetailsTitle: "Financial Receipt Details",
    closeReceiptBtn: "Close Receipt"
  }
}

type PreferencesContextType = {
  theme: Theme
  lang: Language
  toggleTheme: () => void
  toggleLang: () => void
  setTheme: (t: Theme) => void
  setLang: (l: Language) => void
  t: (key: string) => string
}

const PreferencesContext = createContext<PreferencesContextType>({
  theme: "light",
  lang: "ar",
  toggleTheme: () => {},
  toggleLang: () => {},
  setTheme: () => {},
  setLang: () => {},
  t: (key: string) => key
})

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [lang, setLangState] = useState<Language>("ar")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read persisted theme & language from localStorage
    const savedTheme = (localStorage.getItem("khcf_theme") as Theme) || "light"
    const savedLang = (localStorage.getItem("khcf_lang") as Language) || "ar"

    setThemeState(savedTheme)
    setLangState(savedLang)
    applyPreferences(savedTheme, savedLang)
    setMounted(true)
  }, [])

  const applyPreferences = (t: Theme, l: Language) => {
    if (typeof document === "undefined") return
    const root = document.documentElement

    // 1. Theme application (via .dark class on html element)
    if (t === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // 2. Language & Direction application
    root.lang = l
    root.dir = l === "ar" ? "rtl" : "ltr"
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("khcf_theme", newTheme)
    applyPreferences(newTheme, lang)
  }

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem("khcf_lang", newLang)
    applyPreferences(theme, newLang)
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
  }

  const toggleLang = () => {
    const next = lang === "ar" ? "en" : "ar"
    setLang(next)
  }

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["ar"]?.[key] || key
  }

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        lang,
        toggleTheme,
        toggleLang,
        setTheme,
        setLang,
        t
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  return useContext(PreferencesContext)
}
