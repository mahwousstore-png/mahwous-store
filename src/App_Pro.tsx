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
}

function AppContent() {
  const { user, setUser, logout } = useUser();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // قائمة الصفحات
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Shield },
    { id: 'assets', label: 'إدارة الأصول والعهد', icon: Package },
    { id: 'orders', label: 'الطلبات المفتوحة', icon: Shield },
    { id: 'locked', label: 'الطلبات المقفلة', icon: Shield },
    { id: 'expenses', label: 'المصروفات', icon: DollarSign },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'supplier_ledger', label: 'دفتر الموردين', icon: DollarSign },
    { id: 'system_logs', label: 'الصندوق الأسود', icon: Eye, adminOnly: true },
  ];

  // فلترة القائمة حسب الصلاحيات
  const filteredMenu = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

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
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-black" dir="rtl">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-gray-900 to-black border-l border-[#D4AF37]/20 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          {/* الشعار */}
          <div className="mb-8 text-center">
            <div className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-3 rounded-full mb-3">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-[#D4AF37]">مهووس برو</h1>
            <p className="text-gray-500 text-sm">{user.role === 'admin' ? 'مدير النظام' : 'موظف'}</p>
            <p className="text-[#D4AF37] text-sm font-semibold">{user.name}</p>
          </div>

          {/* القائمة */}
          <nav className="space-y-2">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-[#D4AF37] text-black font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* زر تسجيل الخروج */}
          <button
            onClick={logout}
            className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-[#D4AF37]/20 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-800 text-[#D4AF37] hover:bg-gray-700 transition-all"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.role === 'admin' ? 'مدير' : 'موظف'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <span className="text-black font-bold text-lg">{user.name.charAt(0)}</span>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="flex-1 overflow-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-[#D4AF37] text-xl">جاري التحميل...</div>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #D4AF37',
          },
        }}
      />
    </UserProvider>
  );
}

export default App;
