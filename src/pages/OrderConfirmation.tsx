import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, Mail, MessageCircle, FileText, Calendar, User, MapPin, Home } from "lucide-react";

interface OrderData {
  email: string;
  phone: string;
  stampAmount: number;
  deliveryType: string;
  totalAmount: number;
  firstPartyName: string;
  secondPartyName: string;
  documentType: string;
  transactionValue: string;
  executionDate: string;
}

export const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderId] = useState(() => `EST${Date.now().toString().slice(-8)}`);

  useEffect(() => {
    const storedOrderData = localStorage.getItem('orderData');
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    } else {
      // Redirect to home if no order data
      navigate('/');
    }
  }, [navigate]);

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const generatePDF = () => {
    // Simulate PDF generation and download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('E-Stamp PDF Document'));
    element.setAttribute('download', `e-stamp-${orderId}.pdf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendEmail = () => {
    // Simulate sending email
    alert(`E-stamp has been sent to ${orderData?.email}`);
  };

  const sendWhatsApp = () => {
    // Simulate WhatsApp sharing
    const message = `Your e-stamp (Order: ${orderId}) is ready! Download it from our portal.`;
    const whatsappUrl = `https://wa.me/${orderData?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-success">Step 6 of 6</span>
            <span className="text-sm text-muted-foreground">Order Complete</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Success Header */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur mb-6">
          <CardContent className="text-center py-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-success mb-2">Order Successful!</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your e-stamp has been generated successfully
            </p>
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 inline-block">
              <p className="text-sm font-medium text-success">Order ID</p>
              <p className="text-xl font-bold text-success">{orderId}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Download & Actions */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Download E-Stamp</CardTitle>
                <CardDescription>
                  Your digital stamp is ready for download
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Button 
                  onClick={generatePDF}
                  className="w-full h-12 font-semibold"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button 
                  onClick={sendEmail}
                  variant="outline" 
                  className="w-full h-12"
                  size="lg"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email to Me
                </Button>
                
                <Button 
                  onClick={sendWhatsApp}
                  variant="outline" 
                  className="w-full h-12"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Status */}
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Delivery Status</CardTitle>
              </CardHeader>
              
              <CardContent>
                {orderData.deliveryType === "digital" ? (
                  <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-success">Digital - Ready</p>
                      <p className="text-sm text-muted-foreground">Available for download</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Physical - Processing</p>
                      <p className="text-sm text-orange-600">3-5 business days</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Order Details</CardTitle>
                <CardDescription>
                  Complete information about your e-stamp order
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Document Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Document Type:</span>
                      <p>{formatDocumentType(orderData.documentType)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Transaction Value:</span>
                      <p>₹{parseInt(orderData.transactionValue).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Execution Date:</span>
                      <p>{new Date(orderData.executionDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Stamp Duty:</span>
                      <p>₹{orderData.stampAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Party Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Party Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">First Party:</span>
                      <p>{orderData.firstPartyName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Second Party:</span>
                      <p>{orderData.secondPartyName}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Summary */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                    Payment Summary
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Stamp Duty</span>
                      <span>₹{orderData.stampAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery ({orderData.deliveryType})</span>
                      <span>{orderData.deliveryType === "digital" ? "Free" : "₹50"}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total Paid</span>
                      <span className="text-success">₹{orderData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Delivery Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Email:</span> {orderData.email}</p>
                    <p><span className="font-medium">Phone:</span> {orderData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-8 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1 h-12 text-base"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem('orderData');
              navigate("/select-state");
            }}
            className="flex-1 h-12 text-base font-semibold"
          >
            Create New E-Stamp
          </Button>
        </div>

        {/* Support Info */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur mt-8">
          <CardContent className="text-center py-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you face any issues with your e-stamp, our support team is here to help.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <span>📧 support@estamp.gov.in</span>
              <span>📞 1800-XXX-XXXX</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};