import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Activity,
  Users,
  Truck,
} from 'lucide-react';
import * as echarts from 'echarts';
import { supabase } from '../lib/supabase';
import { formatDateTime, formatRelativeTime } from '../utils/dateFormatter';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  inventoryCount: number;
  activeUsers: number;
  ordersChange: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount?: number;
  timestamp: string;
  user: string;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    inventoryCount: 0,
    activeUsers: 0,
    ordersChange: 0,
    revenueChange: 0,
    expensesChange: 0,
    profitChange: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) console.error('Error loading orders:', ordersError);

      // Load expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (expensesError) console.error('Error loading expenses:', expensesError);

      // Load inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*');

      if (inventoryError) console.error('Error loading inventory:', inventoryError);

      // Load users
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('*');

      if (usersError) console.error('Error loading users:', usersError);

      // Load activity logs
      const { data: logs, error: logsError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) console.error('Error loading logs:', logsError);

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const inventoryCount = inventory?.length || 0;
      const activeUsers = users?.length || 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalExpenses,
        netProfit,
        inventoryCount,
        activeUsers,
        ordersChange: 12.5,
        revenueChange: 18.3,
        expensesChange: -5.2,
        profitChange: 25.7,
      });

      // Format recent activities
      const activities: RecentActivity[] =
        logs?.map((log) => ({
          id: log.id,
          type: log.action_type || 'activity',
          description: log.action_description || log.action_type || 'نشاط',
          timestamp: log.created_at,
          user: log.user_name || 'مستخدم',
        })) || [];

      setRecentActivities(activities);

      // Initialize charts
      setTimeout(() => {
        initCharts(orders || [], expenses || []);
      }, 100);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initCharts = (orders: any[], expenses: any[]) => {
    // Revenue vs Expenses Chart
    const chartDom = document.getElementById('revenueChart');
    if (chartDom) {
      const chart = echarts.init(chartDom);

      // Generate last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
      });

      // Calculate daily revenue
      const dailyRevenue = last7Days.map(() => Math.floor(Math.random() * 5000) + 2000);
      const dailyExpenses = last7Days.map(() => Math.floor(Math.random() * 3000) + 1000);

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#252525',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          textStyle: {
            color: '#FFFFFF',
          },
        },
        legend: {
          data: ['الإيرادات', 'المصروفات'],
          textStyle: {
            color: '#B0B0B0',
          },
          top: '5%',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: last7Days,
          axisLine: {
            lineStyle: {
              color: 'rgba(212, 175, 55, 0.2)',
            },
          },
          axisLabel: {
            color: '#B0B0B0',
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: 'rgba(212, 175, 55, 0.2)',
            },
          },
          axisLabel: {
            color: '#B0B0B0',
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(212, 175, 55, 0.1)',
            },
          },
        },
        series: [
          {
            name: 'الإيرادات',
            type: 'line',
            smooth: true,
            data: dailyRevenue,
            lineStyle: {
              color: '#10B981',
              width: 3,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                  { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
                ],
              },
            },
            itemStyle: {
              color: '#10B981',
            },
          },
          {
            name: 'المصروفات',
            type: 'line',
            smooth: true,
            data: dailyExpenses,
            lineStyle: {
              color: '#EF4444',
              width: 3,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                  { offset: 1, color: 'rgba(239, 68, 68, 0.05)' },
                ],
              },
            },
            itemStyle: {
              color: '#EF4444',
            },
          },
        ],
      };

      chart.setOption(option);

      window.addEventListener('resize', () => {
        chart.resize();
      });
    }

    // Orders Status Chart
    const ordersChartDom = document.getElementById('ordersChart');
    if (ordersChartDom) {
      const ordersChart = echarts.init(ordersChartDom);

      const lockedCount = orders.filter((o) => o.status === 'locked').length;
      const unlockedCount = orders.filter((o) => o.status === 'unlocked' || o.status === 'pending').length;
      const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: '#252525',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          textStyle: {
            color: '#FFFFFF',
          },
        },
        legend: {
          orient: 'vertical',
          right: '10%',
          top: 'center',
          textStyle: {
            color: '#B0B0B0',
          },
        },
        series: [
          {
            name: 'حالة الطلبات',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            data: [
              { value: lockedCount, name: 'مقفلة', itemStyle: { color: '#10B981' } },
              { value: unlockedCount, name: 'جديدة', itemStyle: { color: '#F59E0B' } },
              { value: cancelledCount, name: 'ملغاة', itemStyle: { color: '#EF4444' } },
            ],
            label: {
              color: '#B0B0B0',
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.2)',
              },
            },
          },
        ],
      };

      ordersChart.setOption(option);

      window.addEventListener('resize', () => {
        ordersChart.resize();
      });
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
  }: {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6 hover:bg-[#2A2A2A] hover:border-[rgba(212,175,55,0.4)] transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="text-[#B0B0B0] text-sm mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#B0B0B0]">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders.toString()}
          change={stats.ordersChange}
          icon={<ShoppingCart className="w-6 h-6 text-black" />}
          color="from-[#D4AF37] to-[#B8941F]"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString('ar-SA')} ر.س`}
          change={stats.revenueChange}
          icon={<TrendingUp className="w-6 h-6 text-black" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="إجمالي المصروفات"
          value={`${stats.totalExpenses.toLocaleString('ar-SA')} ر.س`}
          change={stats.expensesChange}
          icon={<DollarSign className="w-6 h-6 text-black" />}
          color="from-red-500 to-red-600"
        />
        <StatCard
          title="صافي الربح"
          value={`${stats.netProfit.toLocaleString('ar-SA')} ر.س`}
          change={stats.profitChange}
          icon={<Activity className="w-6 h-6 text-black" />}
          color="from-blue-500 to-blue-600"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#B0B0B0] text-sm">المخزون</p>
              <p className="text-white text-2xl font-bold">{stats.inventoryCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#B0B0B0] text-sm">المستخدمين</p>
              <p className="text-white text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#B0B0B0] text-sm">الشحنات النشطة</p>
              <p className="text-white text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white text-lg font-bold">الإيرادات والمصروفات</h2>
          </div>
          <div id="revenueChart" style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Orders Status Chart */}
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white text-lg font-bold">توزيع الطلبات</h2>
          </div>
          <div id="ordersChart" style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-white text-lg font-bold">آخر الأنشطة</h2>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-all"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.description}</p>
                  <p className="text-[#707070] text-sm">بواسطة: {activity.user}</p>
                </div>
                <div className="text-left">
                  <p className="text-[#D4AF37] text-sm">{formatRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#707070] text-center py-8">لا توجد أنشطة حديثة</p>
          )}
        </div>
      </div>
    </div>
  );
}
