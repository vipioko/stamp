import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrders, type Order } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  Calendar, 
  DollarSign, 
  Download, 
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from "lucide-react";
import { format } from "date-fns";

export const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your orders.",
        variant: "destructive",
      });
      return;
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.party1Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.party2Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const fetchUserOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
      setFilteredOrders(userOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { 
        icon: Clock, 
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        label: 'Pending'
      },
      processing: { 
        icon: Package, 
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Processing'
      },
      completed: { 
        icon: CheckCircle, 
        className: 'bg-green-50 text-green-700 border-green-200',
        label: 'Completed'
      },
      failed: { 
        icon: XCircle, 
        className: 'bg-red-50 text-red-700 border-red-200',
        label: 'Failed'
      },
    } as const;

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const downloadPDF = (order: Order) => {
    if (order.pdfUrl) {
      window.open(order.pdfUrl, '_blank');
    } else {
      toast({
        title: "PDF Not Available",
        description: "Your e-stamp PDF is being prepared. Please check back later.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-xl border-0 bg-card/90 backdrop-blur">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please log in to view your orders.</p>
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/otp-login">Login with OTP</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your e-stamp orders</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg border-0 bg-card/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-card/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-card/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'processing').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-card/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ₹{orders.reduce((sum, order) => sum + order.totalPaid, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="shadow-lg border-0 bg-card/90 backdrop-blur mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, party names, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Orders
            </CardTitle>
            <CardDescription>
              View and track all your e-stamp orders
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground mb-6">
                  {orders.length === 0 
                    ? "You haven't placed any orders yet." 
                    : "No orders match your search criteria."
                  }
                </p>
                <Button asChild>
                  <Link to="/select-state">Create Your First E-Stamp</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium font-mono text-sm">#{order.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.deliveryType === 'digital' ? 'Digital' : 'Physical'} Delivery
                            </p>
                            {order.deliveryType === 'door' && order.courierTrackingId && (
                              <p className="text-xs text-primary">
                                Tracking: {order.courierTrackingId}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{order.party1Name}</p>
                            <p className="text-muted-foreground">{order.party2Name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{order.totalPaid.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              Stamp: ₹{order.stampAmount.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(order.createdAt.toDate(), 'MMM dd, yyyy')}</p>
                            <p className="text-muted-foreground">
                              {format(order.createdAt.toDate(), 'HH:mm')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/order/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {order.status === 'completed' && order.pdfUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => downloadPDF(order)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Card className="shadow-lg border-0 bg-card/90 backdrop-blur">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold mb-4">Need Another E-Stamp?</h3>
              <Button asChild size="lg">
                <Link to="/select-state">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New E-Stamp
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};