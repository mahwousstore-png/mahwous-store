import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Shield,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  userData: {
    name: string;
    email: string;
    role: 'admin' | 'employee';
  };
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export default function Layout({
  children,
  currentPage,
  onPageChange,
  userData,
  onLogout,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'assets',
      label: 'إدارة الأصول والعهد',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'orders',
      label: 'الطلبات',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      id: 'expenses',
      label: 'المصروفات',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: 'suppliers',
      label: 'دفتر الموردين',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'logs',
      label: 'الصندوق الأسود',
      icon: <Eye className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: <Settings className="w-5 h-5" />,
      adminOnly: true,
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || userData.role === 'admin'
  );

  const handleLogout = () => {
    toast.success('تم تسجيل الخروج بنجاح');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#000000] flex" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-[#1A1A1A] border-l border-[rgba(212,175,55,0.2)] transition-all duration-300 ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-[rgba(212,175,55,0.2)]">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">مهووس برو</h2>
                  <p className="text-[#707070] text-xs">نظام إدارة متقدم</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-[#D4AF37] hover:bg-[#252525] p-2 rounded-lg transition-all"
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform ${
                  isSidebarOpen ? 'rotate-0' : 'rotate-180'
                }`}
              />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-[rgba(212,175,55,0.2)]">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center">
                {userData.role === 'admin' ? (
                  <Shield className="w-6 h-6 text-black" />
                ) : (
                  <User className="w-6 h-6 text-black" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{userData.name}</p>
                <p className="text-[#D4AF37] text-sm">
                  {userData.role === 'admin' ? '👑 مدير النظام' : '👤 موظف'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center">
                {userData.role === 'admin' ? (
                  <Shield className="w-5 h-5 text-black" />
                ) : (
                  <User className="w-5 h-5 text-black" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-[#D4AF37] text-black'
                  : 'text-[#B0B0B0] hover:bg-[#252525] hover:text-white'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[rgba(212,175,55,0.2)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#252525] transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">تسجيل الخروج</span>}
          </button>
        </div>

        {/* Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-[rgba(212,175,55,0.2)]">
            <p className="text-[#707070] text-xs text-center">
              طور بواسطة
              <br />
              <span className="text-[#D4AF37] font-medium">شركة مهووس البرمجية</span>
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <aside
            className="absolute right-0 top-0 bottom-0 w-72 bg-[#1A1A1A] border-l border-[rgba(212,175,55,0.2)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="p-6 border-b border-[rgba(212,175,55,0.2)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">مهووس برو</h2>
                  <p className="text-[#707070] text-xs">نظام إدارة متقدم</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#D4AF37] hover:bg-[#252525] p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-[rgba(212,175,55,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center">
                  {userData.role === 'admin' ? (
                    <Shield className="w-6 h-6 text-black" />
                  ) : (
                    <User className="w-6 h-6 text-black" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{userData.name}</p>
                  <p className="text-[#D4AF37] text-sm">
                    {userData.role === 'admin' ? '👑 مدير النظام' : '👤 موظف'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-[#D4AF37] text-black'
                      : 'text-[#B0B0B0] hover:bg-[#252525] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-[rgba(212,175,55,0.2)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#252525] transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-[#1A1A1A] border-b border-[rgba(212,175,55,0.2)] p-4 lg:p-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-[#D4AF37] hover:bg-[#252525] p-2 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-white text-xl lg:text-2xl font-bold">
                {filteredMenuItems.find((item) => item.id === currentPage)?.label || 'الرئيسية'}
              </h1>
            </div>

            {/* Notifications */}
            <button className="relative text-[#B0B0B0] hover:text-[#D4AF37] hover:bg-[#252525] p-2 rounded-lg transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
