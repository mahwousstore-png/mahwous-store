import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react';
import * as echarts from 'echarts';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../utils/dateFormatter';

interface DashboardStats {
  totalSales: number;
  totalAssets: number;
  netProfit: number;
  activeOrders: number;
  salesChange: number;
  assetsChange: number;
  profitChange: number;
  ordersChange: number;
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
    totalSales: 0,
    totalAssets: 0,
    netProfit: 0,
    activeOrders: 0,
    salesChange: 0,
    assetsChange: 0,
    profitChange: 0,
    ordersChange: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load assets data
      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      // Load system logs for recent activities
      const { data: logs } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate stats
      const totalAssets = assets?.length || 0;
      const acceptedAssets = assets?.filter((a) => a.status === 'accepted').length || 0;
      const totalAssetsValue = assets?.reduce((sum, a) => sum + (a.price || 0), 0) || 0;

      setStats({
        totalSales: totalAssetsValue,
        totalAssets: totalAssets,
        netProfit: totalAssetsValue * 0.3, // افتراضي: 30% ربح
        activeOrders: acceptedAssets,
        salesChange: 12.5,
        assetsChange: 8.3,
        profitChange: 15.2,
        ordersChange: -3.1,
      });

      // Format recent activities
      const activities: RecentActivity[] =
        logs?.map((log) => ({
          id: log.id,
          type: log.action,
          description: log.details || log.action,
          timestamp: log.created_at,
          user: log.user_name,
        })) || [];

      setRecentActivities(activities);

      // Initialize charts
      setTimeout(() => {
        initCharts(assets || []);
      }, 100);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initCharts = (assets: any[]) => {
    // Sales Chart
    const salesChartDom = document.getElementById('salesChart');
    if (salesChartDom) {
      const salesChart = echarts.init(salesChartDom);
      
      // Generate last 7 days data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
      });

      const salesData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000) + 2000);

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
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
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
            name: 'المبيعات',
            type: 'line',
            smooth: true,
            data: salesData,
            lineStyle: {
              color: '#D4AF37',
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
                  { offset: 0, color: 'rgba(212, 175, 55, 0.3)' },
                  { offset: 1, color: 'rgba(212, 175, 55, 0.05)' },
                ],
              },
            },
            itemStyle: {
              color: '#D4AF37',
            },
          },
        ],
      };

      salesChart.setOption(option);

      // Resize chart on window resize
      window.addEventListener('resize', () => {
        salesChart.resize();
      });
    }

    // Assets Distribution Chart
    const assetsChartDom = document.getElementById('assetsChart');
    if (assetsChartDom) {
      const assetsChart = echarts.init(assetsChartDom);

      const acceptedCount = assets.filter((a) => a.status === 'accepted').length;
      const pendingCount = assets.filter((a) => a.status === 'pending').length;
      const rejectedCount = assets.filter((a) => a.status === 'rejected').length;

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
            name: 'حالة الأصول',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            data: [
              { value: acceptedCount, name: 'معتمد', itemStyle: { color: '#10B981' } },
              { value: pendingCount, name: 'معلق', itemStyle: { color: '#F59E0B' } },
              { value: rejectedCount, name: 'مرفوض', itemStyle: { color: '#EF4444' } },
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

      assetsChart.setOption(option);

      window.addEventListener('resize', () => {
        assetsChart.resize();
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
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString('ar-SA')} ر.س`}
          change={stats.salesChange}
          icon={<TrendingUp className="w-6 h-6 text-black" />}
          color="from-[#D4AF37] to-[#B8941F]"
        />
        <StatCard
          title="إجمالي الأصول"
          value={stats.totalAssets.toString()}
          change={stats.assetsChange}
          icon={<Package className="w-6 h-6 text-black" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="صافي الربح"
          value={`${stats.netProfit.toLocaleString('ar-SA')} ر.س`}
          change={stats.profitChange}
          icon={<DollarSign className="w-6 h-6 text-black" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="الطلبات النشطة"
          value={stats.activeOrders.toString()}
          change={stats.ordersChange}
          icon={<ShoppingCart className="w-6 h-6 text-black" />}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white text-lg font-bold">الأداء المالي</h2>
          </div>
          <div id="salesChart" style={{ width: '100%', height: '300px' }}></div>
        </div>

        {/* Assets Distribution Chart */}
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-white text-lg font-bold">توزيع الأصول</h2>
          </div>
          <div id="assetsChart" style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-white text-lg font-bold">آخر العمليات</h2>
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
                  <p className="text-[#D4AF37] text-sm">{formatDateTime(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#707070] text-center py-8">لا توجد عمليات حديثة</p>
          )}
        </div>
      </div>
    </div>
  );
}
