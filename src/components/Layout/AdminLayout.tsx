import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  FileText,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Products',
    href: '/admin/catalog/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/admin/catalog/categories',
    icon: FileText,
  },
  {
    title: 'States',
    href: '/admin/geo/states',
    icon: MapPin,
  },
  {
    title: 'Districts',
    href: '/admin/geo/districts',
    icon: MapPin,
  },
  {
    title: 'Tehsils',
    href: '/admin/geo/tehsils',
    icon: MapPin,
  },
  {
    title: 'Bulk Upload',
    href: '/admin/catalog/bulk-upload',
    icon: Package,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-card border-r">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">e-StampExpress</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Site
                </Link>
              </Button>
              
              <Separator className="my-4" />
              
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    asChild
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};