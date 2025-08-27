import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { getOrdersCountByStatus, getTotalRevenue, getRecentOrders } from '@/lib/firestore';

interface DashboardStats {
  totalOrders: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalRevenue: number;
  todayOrders: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [orderCounts, revenue, recentOrders] = await Promise.all([
          getOrdersCountByStatus(),
          getTotalRevenue(),
          getRecentOrders(10)
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = recentOrders.filter(order => {
          const orderDate = order.createdAt.toDate();
          return orderDate >= today;
        }).length;

        setStats({
          totalOrders: orderCounts.pending + orderCounts.processing + orderCounts.completed + orderCounts.failed,
          pending: orderCounts.pending,
          processing: orderCounts.processing,
          completed: orderCounts.completed,
          failed: orderCounts.failed,
          totalRevenue: revenue,
          todayOrders,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Orders",
      value: stats.pending,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Processing",
      value: stats.processing,
      icon: Package,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your e-stamp operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your e-stamp operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Success Rate</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {stats.totalOrders > 0 ? Math.round((stats.completed / stats.totalOrders) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Orders</span>
              <Badge variant="outline">
                {stats.pending + stats.processing}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Orders</span>
              <Badge variant="secondary">
                {stats.totalOrders}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Orders Processing</span>
              <Badge variant={stats.processing > 0 ? "default" : "secondary"}>
                {stats.processing > 0 ? "Active" : "Idle"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Failed Orders</span>
              <Badge variant={stats.failed > 0 ? "destructive" : "secondary"}>
                {stats.failed > 0 ? "Attention Needed" : "All Good"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">System Health</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Operational
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};