import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import { UserProvider } from './contexts/UserContext';

// Lazy load all components
const Dashboard = lazy(() => import('./components/Dashboard'));
const UnlockedOrders = lazy(() => import('./components/UnlockedOrders'));
const LockedOrders = lazy(() => import('./components/LockedOrders'));
const CancelledOrders = lazy(() => import('./components/CancelledOrders'));
const Expenses = lazy(() => import('./components/Expenses'));
const Inventory = lazy(() => import('./components/Inventory'));
const ShippingCompanies = lazy(() => import('./components/ShippingCompanies'));
const PaymentMethodsDashboard = lazy(() => import('./components/PaymentMethodsDashboard'));
const EmployeeBalances = lazy(() => import('./components/EmployeeBalances'));
const Suppliers = lazy(() => import('./components/Suppliers'));
const CustomReports = lazy(() => import('./components/CustomReports'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const SystemLogsPage = lazy(() => import('./components/SystemLogsPage'));

interface UserData {
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

// Loading Component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#B0B0B0]">جاري تحميل البيانات...</p>
    </div>
  </div>
);

// Settings Placeholder
const SettingsPage = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-12 text-center max-w-2xl">
      <h2 className="text-white text-3xl font-bold mb-4">الإعدادات</h2>
      <p className="text-[#B0B0B0] text-lg">إعدادات النظام والشركة والتخصيصات</p>
    </div>
  </div>
);

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
        
      case 'reports':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard />
          </Suspense>
        );
        
      case 'custom-reports':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <CustomReports />
          </Suspense>
        );
        
      case 'orders-new':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <UnlockedOrders />
          </Suspense>
        );
        
      case 'orders-locked':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <LockedOrders />
          </Suspense>
        );
        
      case 'orders-cancelled':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <CancelledOrders />
          </Suspense>
        );
        
      case 'shipping-companies':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <ShippingCompanies />
          </Suspense>
        );
        
      case 'payment-methods':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <PaymentMethodsDashboard />
          </Suspense>
        );
        
      case 'employee-balance':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <EmployeeBalances />
          </Suspense>
        );
        
      case 'suppliers':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Suppliers />
          </Suspense>
        );
        
      case 'expenses':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Expenses />
          </Suspense>
        );
        
      case 'inventory':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Inventory />
          </Suspense>
        );
        
      case 'users':
        if (userData.role === 'admin') {
          return (
            <Suspense fallback={<LoadingScreen />}>
              <UserManagement />
            </Suspense>
          );
        }
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-12 text-center">
              <h2 className="text-white text-2xl font-bold mb-4">غير مصرح</h2>
              <p className="text-[#B0B0B0]">هذه الصفحة متاحة للمدير فقط</p>
            </div>
          </div>
        );
        
      case 'logs':
        if (userData.role === 'admin') {
          return (
            <Suspense fallback={<LoadingScreen />}>
              <SystemLogsPage />
            </Suspense>
          );
        }
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-12 text-center">
              <h2 className="text-white text-2xl font-bold mb-4">غير مصرح</h2>
              <p className="text-[#B0B0B0]">هذه الصفحة متاحة للمدير فقط</p>
            </div>
          </div>
        );
        
      case 'settings':
        if (userData.role === 'admin') {
          return <SettingsPage />;
        }
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-12 text-center">
              <h2 className="text-white text-2xl font-bold mb-4">غير مصرح</h2>
              <p className="text-[#B0B0B0]">هذه الصفحة متاحة للمدير فقط</p>
            </div>
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
            <Suspense fallback={<LoadingScreen />}>
              {renderPage()}
            </Suspense>
          </Layout>
        ) : null}
      </div>
    </UserProvider>
  );
}

export default App;
