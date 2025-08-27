import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  FileText, 
  DollarSign, 
  Truck, 
  Mail, 
  MessageCircle,
  Upload,
  Save,
  RefreshCw
} from 'lucide-react';
import { getOrderById, updateOrderAdmin, type Order } from '@/lib/firestore';
import { format } from 'date-fns';

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!id) {
      navigate('/admin/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(id);
        if (orderData) {
          setOrder(orderData);
          setStatus(orderData.status);
          setPdfUrl(orderData.pdfUrl || '');
          setTrackingId(orderData.courierTrackingId || '');
        } else {
          toast({
            title: "Order Not Found",
            description: "The requested order could not be found.",
            variant: "destructive",
          });
          navigate('/admin/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, toast]);

  const handleUpdateOrder = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const updates: Partial<Order> = {
        status: status as Order['status'],
      };

      if (pdfUrl !== (order.pdfUrl || '')) {
        updates.pdfUrl = pdfUrl;
      }

      if (trackingId !== (order.courierTrackingId || '')) {
        updates.courierTrackingId = trackingId;
      }

      await updateOrderAdmin(order.id, updates);
      
      // Update local state
      setOrder({ ...order, ...updates });
      
      toast({
        title: "Order Updated",
        description: "Order details have been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order details.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleResendNotification = async (type: 'email' | 'whatsapp') => {
    if (!order) return;

    try {
      // Simulate notification sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notification Sent",
        description: `${type === 'email' ? 'Email' : 'WhatsApp'} notification sent successfully.`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: `Failed to send ${type} notification.`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-orange-50 text-orange-700 border-orange-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
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
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-medium">{order.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="font-medium">{order.phone}</p>
            </div>
            {order.whatsapp && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                <p className="font-medium">{order.whatsapp}</p>
              </div>
            )}
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">First Party</label>
              <p className="font-medium">{order.party1Name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Second Party</label>
              <p className="font-medium">{order.party2Name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">State</label>
              <p className="font-medium">{order.stateId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">District</label>
              <p className="font-medium">{order.districtId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tehsil</label>
              <p className="font-medium">{order.tehsilId}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Delivery Type</label>
              <p className="font-medium capitalize">{order.deliveryType}</p>
            </div>
            {order.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="font-medium">{order.address}</p>
                {order.pincode && <p className="text-sm text-muted-foreground">PIN: {order.pincode}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Paid</span>
              <span>₹{order.totalPaid.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">PDF URL</label>
              <Input
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="Enter PDF download URL"
              />
            </div>

            {order.deliveryType === 'door' && (
              <div>
                <label className="text-sm font-medium">Courier Tracking ID</label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking ID"
                />
              </div>
            )}

            <Button 
              onClick={handleUpdateOrder} 
              disabled={updating}
              className="w-full"
            >
              {updating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Order
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Internal Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => handleResendNotification('email')}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend Email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleResendNotification('whatsapp')}
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};