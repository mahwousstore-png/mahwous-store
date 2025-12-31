import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import AssetAcceptance from './components/AssetAcceptance';
import SystemLogsPage from './components/SystemLogsPage';
import SupplierLedgerPage from './components/SupplierLedgerPage';
import { UserProvider } from './contexts/UserContext';

// Import existing components
import Dashboard from './components/Dashboard';
import UnlockedOrders from './components/UnlockedOrders';
import LockedOrders from './components/LockedOrders';
import Expenses from './components/Expenses';
import Inventory from './components/Inventory';

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

    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'assets':
        return <AssetAcceptance />;
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
              <h2 className="text-white text-2xl font-bold mb-4">الطلبات المفتوحة</h2>
              <UnlockedOrders />
            </div>
          </div>
        );
      case 'locked-orders':
        return (
          <div className="space-y-6">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
              <h2 className="text-white text-2xl font-bold mb-4">الطلبات المقفلة</h2>
              <LockedOrders />
            </div>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
              <h2 className="text-white text-2xl font-bold mb-4">المصروفات</h2>
              <Expenses />
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
              <h2 className="text-white text-2xl font-bold mb-4">المخزون</h2>
              <Inventory />
            </div>
          </div>
        );
      case 'suppliers':
        return <SupplierLedgerPage />;
      case 'logs':
        if (userData.role === 'admin') {
          return <SystemLogsPage />;
        }
        return (
          <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">غير مصرح</h2>
            <p className="text-[#B0B0B0]">هذه الصفحة متاحة للمدير فقط</p>
          </div>
        );
      case 'settings':
        if (userData.role === 'admin') {
          return (
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-8 text-center">
              <h2 className="text-white text-2xl font-bold mb-4">الإعدادات</h2>
              <p className="text-[#B0B0B0]">قريباً... سيتم إضافة صفحة الإعدادات</p>
            </div>
          );
        }
        return (
          <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">غير مصرح</h2>
            <p className="text-[#B0B0B0]">هذه الصفحة متاحة للمدير فقط</p>
          </div>
        );
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
            {renderPage()}
          </Layout>
        ) : null}
      </div>
    </UserProvider>
  );
}

export default App;
