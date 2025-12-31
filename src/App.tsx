import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Home,
  ShoppingCart,
  Lock,
  FileText,
  DollarSign,
  Users,
  Menu,
  User,
  LogOut,
  Users2,
  CreditCard,
  Wallet,
  Loader2,
  Package,
  X,
  Truck,
} from 'lucide-react';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const UnlockedOrders = lazy(() => import('./components/UnlockedOrders'));
const LockedOrders = lazy(() => import('./components/LockedOrders'));
const Expenses = lazy(() => import('./components/Expenses'));
const Inventory = lazy(() => import('./components/Inventory'));
const CancelledOrders = lazy(() => import('./components/CancelledOrders'));
const ShippingCompanies = lazy(() => import('./components/ShippingCompanies'));
const Reports = lazy(() => import('./components/Reports'));
const CustomReports = lazy(() => import('./components/CustomReports'));
const Suppliers = lazy(() => import('./components/Suppliers'));
const PaymentMethodsDashboard = lazy(() => import('./components/PaymentMethodsDashboard'));
const EmployeeBalances = lazy(() => import('./components/EmployeeBalances'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const LoginPage = lazy(() => import('./components/LoginPage'));

import { useOrders } from './hooks/useOrders';
import { authService } from './lib/auth';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { totalOrders, unlockedOrders, lockedOrders, cancelledOrders } = useOrders();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setIsAuthenticated(true);
      setCurrentUser(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home, category: 'main' },
    { id: 'reports', label: 'التقارير', icon: FileText, category: 'main' },
    { id: 'custom-reports', label: 'التقارير المخصصة', icon: FileText, category: 'main' },
    { id: 'unlocked', label: 'الطلبات', icon: ShoppingCart, category: 'orders' },
    { id: 'new-orders', label: 'الطلبات الجديدة', icon: Package, category: 'orders' },
    { id: 'locked', label: 'الطلبات المقفلة', icon: Lock, category: 'orders' },
    { id: 'cancelled', label: 'الطلبات الملغية', icon: X, category: 'orders' },
    { id: 'finance', label: 'المالية', icon: DollarSign, category: 'finance' },
    { id: 'shipping', label: 'شركات الشحن', icon: Truck, category: 'operations' },
    { id: 'payment-methods', label: 'طرق الدفع', icon: CreditCard, category: 'operations' },
    { id: 'employee-balances', label: 'أرصدة الموظفين', icon: Wallet, category: 'operations' },
    { id: 'suppliers', label: 'إدارة الموردين', icon: Users2, category: 'operations' },
    { id: 'expenses', label: 'المصروفات', icon: DollarSign, category: 'finance' },
    { id: 'inventory', label: 'المخزون', icon: Package, category: 'operations' },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, category: 'admin' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'unlocked':
        return <UnlockedOrders />;
      case 'new-orders':
        return <UnlockedOrders />;
      case 'locked':
        return <LockedOrders />;
      case 'cancelled':
        return <CancelledOrders />;
      case 'expenses':
        return <Expenses />;
      case 'inventory':
        return <Inventory />;
      case 'shipping':
        return <ShippingCompanies />;
      case 'reports':
        return <Reports />;
      case 'custom-reports':
        return <CustomReports />;
      case 'suppliers':
        return <Suppliers />;
      case 'payment-methods':
        return <PaymentMethodsDashboard />;
      case 'employee-balances':
        return <EmployeeBalances />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categoryLabels: Record<string, string> = {
    main: 'الرئيسية',
    orders: 'الطلبات',
    finance: 'المالية',
    operations: 'العمليات',
    admin: 'الإدارة',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-purple-50 text-purple-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">م</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Mahwous | محوص
                  </h1>
                  <p className="text-sm text-gray-500">نظام إدارة الطلبات</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  {currentUser?.email || 'مدير النظام'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white shadow-lg border-l border-purple-100 transition-transform duration-300 ease-in-out overflow-y-auto`}
        >
          <div className="p-4">
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-900">القائمة</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-6">
              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {categoryLabels[category]}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                              : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
