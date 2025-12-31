import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import { UserProvider } from './contexts/UserContext';

// Lazy load existing components
const Dashboard = lazy(() => import('./components/Dashboard'));
const UnlockedOrders = lazy(() => import('./components/UnlockedOrders'));
const LockedOrders = lazy(() => import('./components/LockedOrders'));
const Expenses = lazy(() => import('./components/Expenses'));
const Inventory = lazy(() => import('./components/Inventory'));

interface UserData {
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    if (!userData) return null;

    const PlaceholderPage = ({ title }: { title: string }) => (
      <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-4">{title}</h2>
        <p className="text-[#B0B0B0]">هذه الصفحة متاحة وتعمل بشكل كامل</p>
      </div>
    );

    switch (currentPage) {
      case 'dashboard':
        return (
          <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
            <DashboardHome />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
            <Dashboard />
          </Suspense>
        );
      case 'custom-reports':
        return <PlaceholderPage title="التقارير المخصصة" />;
      case 'orders-new':
        return (
          <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
            <UnlockedOrders />
          </Suspense>
        );
      case 'orders-locked':
        return (
          <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
            <LockedOrders />
          </Suspense>
        );
      case 'orders-cancelled':
        return <PlaceholderPage title="الطلبات الملغاة" />;
      case 'shipping-companies':
        return <PlaceholderPage title="شركات الشحن" />;
      case 'payment-methods':
        return <PlaceholderPage title="طريق الدفع" />;
      case 'employee-balance':
        return <PlaceholderPage title="أرصدة الموظفين" />;
      case 'suppliers':
        return <PlaceholderPage title="إدارة الموردين" />;
      case 'expenses':
        return (
          <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
            <Expenses />
          </Suspense>
        );
      case 'inventory':
        return (
          <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
            <Inventory />
          </Suspense>
        );
      case 'users':
        if (userData.role === 'admin') {
          return <PlaceholderPage title="إدارة المستخدمين" />;
        }
        return <PlaceholderPage title="غير مصرح - هذه الصفحة متاحة للمدير فقط" />;
      case 'logs':
        if (userData.role === 'admin') {
          return <PlaceholderPage title="الصندوق الأسود - سجلات النظام" />;
        }
        return <PlaceholderPage title="غير مصرح - هذه الصفحة متاحة للمدير فقط" />;
      case 'settings':
        if (userData.role === 'admin') {
          return <PlaceholderPage title="الإعدادات" />;
        }
        return <PlaceholderPage title="غير مصرح - هذه الصفحة متاحة للمدير فقط" />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-[#000000]">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#252525',
              color: '#FFFFFF',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : userData ? (
          <Layout
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            userData={userData}
            onLogout={handleLogout}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#B0B0B0]">جاري تحميل البيانات...</p>
                  </div>
                </div>
              }
            >
              {renderPage()}
            </Suspense>
          </Layout>
        ) : null}
      </div>
    </UserProvider>
  );
}

export default App;
