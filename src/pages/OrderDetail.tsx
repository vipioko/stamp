import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getOrderById, type Order } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  MapPin, 
  DollarSign, 
  Calendar,
  Download,
  Truck,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Package
} from "lucide-react";
import { format } from "date-fns";

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view order details.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, authLoading, id, navigate, toast]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const orderData = await getOrderById(id);
      
      if (!orderData) {
        toast({
          title: "Order Not Found",
          description: "The requested order could not be found.",
          variant: "destructive",
        });
        navigate("/my-orders");
        return;
      }

      // Check if order belongs to current user
      if (orderData.userId !== user?.uid) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this order.",
          variant: "destructive",
        });
        navigate("/my-orders");
        return;
      }

      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        icon: Clock, 
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        label: 'Pending',
        description: 'Your order is being processed'
      },
      processing: { 
        icon: Package, 
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Processing',
        description: 'Your e-stamp is being generated'
      },
      completed: { 
        icon: CheckCircle, 
        className: 'bg-green-50 text-green-700 border-green-200',
        label: 'Completed',
        description: 'Your e-stamp is ready for download'
      },
      failed: { 
        icon: XCircle, 
        className: 'bg-red-50 text-red-700 border-red-200',
        label: 'Failed',
        description: 'There was an issue with your order'
      },
    } as const;

    return configs[status as keyof typeof configs];
  };

  const downloadPDF = () => {
    if (order?.pdfUrl) {
      window.open(order.pdfUrl, '_blank');
    } else {
      toast({
        title: "PDF Not Available",
        description: "Your e-stamp PDF is being prepared. Please check back later.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-xl border-0 bg-card/90 backdrop-blur">
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested order could not be found.</p>
            <Button onClick={() => navigate("/my-orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/my-orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
              <p className="text-muted-foreground">
                Created {format(order.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          
          {statusConfig && (
            <Badge className={statusConfig.className}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusConfig.label}
            </Badge>
          )}
        </div>

        {/* Status Card */}
        {statusConfig && (
          <Card className="shadow-xl border-0 bg-card/90 backdrop-blur mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${statusConfig.className.replace('text-', 'bg-').replace('border-', '').replace('bg-', 'bg-').split(' ')[0]}/20`}>
                  <StatusIcon className={`h-8 w-8 ${statusConfig.className.split(' ')[1]}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{statusConfig.label}</h3>
                  <p className="text-muted-foreground">{statusConfig.description}</p>
                  {order.status === 'completed' && order.pdfUrl && (
                    <Button onClick={downloadPDF} className="mt-3">
                      <Download className="mr-2 h-4 w-4" />
                      Download E-Stamp PDF
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Type</label>
                <div className="flex items-center gap-2">
                  {order.deliveryType === 'digital' ? (
                    <Download className="h-4 w-4 text-primary" />
                  ) : (
                    <Truck className="h-4 w-4 text-primary" />
                  )}
                  <span className="capitalize">{order.deliveryType}</span>
                </div>
              </div>

              {order.deliveryType === 'door' && order.courierTrackingId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tracking ID</label>
                  <p className="font-mono text-sm">{order.courierTrackingId}</p>
                </div>
              )}

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Information</label>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.phone}</span>
                  </div>
                </div>
              </div>

              {order.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                  <p className="text-sm">{order.address}</p>
                  {order.pincode && <p className="text-sm text-muted-foreground">PIN: {order.pincode}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Party Details */}
          <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Party Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">First Party</label>
                <p className="font-medium">{order.party1Name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Second Party</label>
                <p className="font-medium">{order.party2Name}</p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.stateId} → {order.districtId} → {order.tehsilId}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Details */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Stamp Amount</span>
                  <span className="font-medium">₹{order.stampAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Platform Fee</span>
                  <span className="font-medium">₹{order.platformFee.toLocaleString()}</span>
                </div>
                {order.expressFee && order.expressFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Express Fee</span>
                    <span className="font-medium">₹{order.expressFee.toLocaleString()}</span>
                  </div>
                )}
                {order.deliveryFee && order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Delivery Fee</span>
                    <span className="font-medium">₹{order.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-3xl font-bold text-primary">₹{order.totalPaid.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paid on {format(order.createdAt.toDate(), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button variant="outline" onClick={() => navigate("/my-orders")} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Orders
          </Button>
          
          {order.status === 'completed' && order.pdfUrl && (
            <Button onClick={downloadPDF} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download E-Stamp
            </Button>
          )}
          
          <Button variant="outline" asChild className="flex-1">
            <Link to="/select-state">
              <FileText className="mr-2 h-4 w-4" />
              Create New Order
            </Link>
          </Button>
        </div>

        {/* Support */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur mt-6">
          <CardContent className="text-center py-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order, our support team is here to help.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@estamp.gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1800-XXX-XXXX</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};