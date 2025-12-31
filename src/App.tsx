import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  Shield,
  Package,
  Eye,
  DollarSign,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Settings,
  ChevronLeft,
} from 'lucide-react';

// Components
import RoleSelection from './components/RoleSelection';
import AssetAcceptance from './components/AssetAcceptance';
import SystemLogsPage from './components/SystemLogsPage';
import SupplierLedgerPage from './components/SupplierLedgerPage';

// Context
import { UserProvider, useUser } from './contexts/UserContext';

// Lazy load existing components
const Dashboard = lazy(() => import('./components/Dashboard'));
const UnlockedOrders = lazy(() => import('./components/UnlockedOrders'));
const LockedOrders = lazy(() => import('./components/LockedOrders'));
const Expenses = lazy(() => import('./components/Expenses'));
const Inventory = lazy(() => import('./components/Inventory'));

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  category?: string;
}

function AppContent() {
  const { user, setUser, logout } = useUser();
  const [activeView, setActiveView] = useState('assets');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // قائمة الصفحات مع التصنيفات
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home, category: 'الرئيسية' },
    { id: 'assets', label: 'إدارة الأصول والعهد', icon: Package, category: 'الإدارة' },
    { id: 'orders', label: 'الطلبات المفتوحة', icon: FileText, category: 'الطلبات' },
    { id: 'locked', label: 'الطلبات المقفلة', icon: Shield, category: 'الطلبات' },
    { id: 'expenses', label: 'المصروفات', icon: DollarSign, category: 'المالية' },
    { id: 'inventory', label: 'المخزون', icon: Package, category: 'المخزون' },
    { id: 'supplier_ledger', label: 'دفتر الموردين', icon: DollarSign, category: 'المالية' },
    { id: 'system_logs', label: 'الصندوق الأسود', icon: Eye, category: 'الرقابة', adminOnly: true },
  ];

  // فلترة القائمة حسب الصلاحيات
  const filteredMenu = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  // تجميع حسب الفئة
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    const category = item.category || 'أخرى';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // اختيار الدور
  const handleRoleSelect = (role: 'admin' | 'employee') => {
    const userName = prompt(`أدخل اسمك (${role === 'admin' ? 'المدير' : 'الموظف'}):`);
    if (userName) {
      setUser({ role, name: userName });
    }
  };

  // إذا لم يتم تسجيل الدخول
  if (!user) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  // عرض المحتوى
  const renderContent = () => {
    switch (activeView) {
      case 'assets':
        return <AssetAcceptance />;
      case 'system_logs':
        return <SystemLogsPage />;
      case 'supplier_ledger':
        return <SupplierLedgerPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <UnlockedOrders />;
      case 'locked':
        return <LockedOrders />;
      case 'expenses':
        return <Expenses />;
      case 'inventory':
        return <Inventory />;
      default:
        return <AssetAcceptance />;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? (sidebarCollapsed ? 'w-20' : 'w-72') : 'w-0'
        } bg-gradient-to-b from-gray-900 via-black to-gray-900 border-l border-[#D4AF37]/20 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-2.5 rounded-lg">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#D4AF37]">مهووس برو</h1>
                  <p className="text-xs text-gray-500">نظام إدارة متقدم</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg bg-gray-800 text-[#D4AF37] hover:bg-gray-700 transition-all"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-[#D4AF37]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                  <span className="text-black font-bold text-lg">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.role === 'admin' ? 'مدير النظام' : 'موظف'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {category}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                        activeView === item.id
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-black font-semibold shadow-lg'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'text-black' : 'text-[#D4AF37]'}`} />
                      {!sidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#D4AF37]/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-900/20 text-red-400 border border-red-600 hover:bg-red-900/40 transition-all"
            title={sidebarCollapsed ? 'تسجيل الخروج' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">تسجيل الخروج</span>}
          </button>

          {!sidebarCollapsed && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">طور من قبل</p>
              <p className="text-sm font-semibold text-[#D4AF37]">شركة مهووس البرمجية</p>
              <p className="text-xs text-gray-600 mt-1">© 2025 جميع الحقوق محفوظة</p>
            </div>
          )}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-[#D4AF37]/20 p-4 flex items-center justify-between shadow-lg">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-800 text-[#D4AF37] hover:bg-gray-700 transition-all active:scale-95"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-left hidden md:block">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.role === 'admin' ? 'مدير' : 'موظف'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] flex items-center justify-center shadow-lg">
              <span className="text-black font-bold text-lg">{user.name.charAt(0)}</span>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="flex-1 overflow-auto bg-black">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37] border-t-transparent mb-4"></div>
                  <p className="text-[#D4AF37] text-xl font-semibold">جاري التحميل...</p>
                </div>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #D4AF37',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.95rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
