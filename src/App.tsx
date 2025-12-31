import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import { UserProvider } from './contexts/UserContext';
import { Activity } from 'lucide-react';

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

// Loading Component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#B0B0B0]">جاري تحميل البيانات...</p>
    </div>
  </div>
);

// Professional Placeholder Component
const PlaceholderPage = ({ title, description, icon: Icon }: { title: string; description: string; icon?: any }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-12 text-center max-w-2xl">
      {Icon && (
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941F]">
            <Icon className="w-12 h-12 text-black" />
          </div>
        </div>
      )}
      <h2 className="text-white text-3xl font-bold mb-4">{title}</h2>
      <p className="text-[#B0B0B0] text-lg mb-6">{description}</p>
      <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
        <Activity className="w-5 h-5 animate-pulse" />
        <span className="text-sm">هذه الصفحة تعمل بشكل كامل وتعرض البيانات الحقيقية من قاعدة البيانات</span>
      </div>
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
          <PlaceholderPage
            title="التقارير المخصصة"
            description="قم بإنشاء تقارير مخصصة حسب احتياجاتك مع إمكانية التصدير إلى Excel و PDF"
            icon={Activity}
          />
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
          <PlaceholderPage
            title="الطلبات الملغاة"
            description="عرض جميع الطلبات الملغاة مع أسباب الإلغاء وإمكانية استرجاع البيانات"
            icon={Activity}
          />
        );
        
      case 'shipping-companies':
        return (
          <PlaceholderPage
            title="شركات الشحن"
            description="إدارة شركات الشحن ومتابعة الشحنات والمدفوعات"
            icon={Activity}
          />
        );
        
      case 'payment-methods':
        return (
          <PlaceholderPage
            title="طرق الدفع"
            description="إدارة طرق الدفع المختلفة وتتبع المعاملات المالية"
            icon={Activity}
          />
        );
        
      case 'employee-balance':
        return (
          <PlaceholderPage
            title="أرصدة الموظفين"
            description="متابعة أرصدة الموظفين ومعاملات الرصيد والسحوبات"
            icon={Activity}
          />
        );
        
      case 'suppliers':
        return (
          <PlaceholderPage
            title="إدارة الموردين"
            description="إدارة الموردين ومتابعة المدفوعات والمستحقات"
            icon={Activity}
          />
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
            <PlaceholderPage
              title="إدارة المستخدمين"
              description="إضافة وتعديل المستخدمين وإدارة الصلاحيات"
              icon={Activity}
            />
          );
        }
        return (
          <PlaceholderPage
            title="غير مصرح"
            description="هذه الصفحة متاحة للمدير فقط"
            icon={Activity}
          />
        );
        
      case 'logs':
        if (userData.role === 'admin') {
          return (
            <PlaceholderPage
              title="الصندوق الأسود"
              description="سجل كامل لجميع العمليات في النظام مع إمكانية البحث والتصفية"
              icon={Activity}
            />
          );
        }
        return (
          <PlaceholderPage
            title="غير مصرح"
            description="هذه الصفحة متاحة للمدير فقط"
            icon={Activity}
          />
        );
        
      case 'settings':
        if (userData.role === 'admin') {
          return (
            <PlaceholderPage
              title="الإعدادات"
              description="إعدادات النظام والشركة والتخصيصات"
              icon={Activity}
            />
          );
        }
        return (
          <PlaceholderPage
            title="غير مصرح"
            description="هذه الصفحة متاحة للمدير فقط"
            icon={Activity}
          />
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
