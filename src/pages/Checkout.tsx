import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Shield, Lock, FileText, User, MapPin, Calendar } from "lucide-react";

export const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const transactionValue = searchParams.get("transactionValue");
  const documentType = searchParams.get("documentType");
  const firstPartyName = searchParams.get("firstPartyName");
  const secondPartyName = searchParams.get("secondPartyName");
  const deliveryType = searchParams.get("deliveryType") || "digital";
  
  // Calculate stamp duty (same logic as StampSelection)
  const baseAmount = parseInt(transactionValue || "0");
  let stampDutyRate = 0.05;
  switch (documentType) {
    case "sale_deed": stampDutyRate = 0.05; break;
    case "lease_deed": stampDutyRate = 0.02; break;
    case "gift_deed": stampDutyRate = 0.03; break;
    case "power_of_attorney": stampDutyRate = 0.001; break;
    default: stampDutyRate = 0.02;
  }
  const stampAmount = Math.round(baseAmount * stampDutyRate);
  const deliveryFee = deliveryType === "physical" ? 50 : 0;
  const totalAmount = stampAmount + deliveryFee;

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/stamp-selection?${params.toString()}`);
  };

  const handlePayment = async () => {
    if (!email || !phone || !termsAccepted) {
      toast({
        title: "Required Information Missing",
        description: "Please fill all fields and accept terms to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        email,
        phone,
        stampAmount,
        deliveryType,
        totalAmount,
        ...Object.fromEntries(searchParams.entries())
      };
      
      // Store order data in localStorage for order confirmation page
      localStorage.setItem('orderData', JSON.stringify(orderData));
      
      navigate("/order-confirmation");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step 5 of 6</span>
            <span className="text-sm text-muted-foreground">Checkout & Payment</span>
          </div>
          <Progress value={83} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Document Details */}
                <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Document Type
                  </div>
                  <p className="text-sm">{formatDocumentType(documentType || "")}</p>
                  
                  <div className="flex items-center gap-2 text-sm font-medium mt-3">
                    <User className="h-4 w-4" />
                    Parties
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">First Party:</span> {firstPartyName}</p>
                    <p><span className="font-medium">Second Party:</span> {secondPartyName}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium mt-3">
                    <MapPin className="h-4 w-4" />
                    Transaction Value
                  </div>
                  <p className="text-sm font-semibold">₹{baseAmount.toLocaleString()}</p>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stamp Duty</span>
                    <span className="font-medium">₹{stampAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delivery ({deliveryType})</span>
                    <span className="font-medium">
                      {deliveryType === "digital" ? "Free" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success font-medium text-sm mb-2">
                    <Shield className="h-4 w-4" />
                    Secure Payment
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• 256-bit SSL encryption</p>
                    <p>• PCI DSS compliant</p>
                    <p>• Government authorized</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
              <CardHeader className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Complete Your Order</CardTitle>
                <CardDescription className="text-base">
                  Provide your details to receive the e-stamp
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                    Contact Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        E-stamp will be sent to this email
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        For order updates via SMS
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                    Payment Method
                  </h3>
                  
                  <div className="p-4 border rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Secure Card Payment</p>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard, Rupay</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        <Lock className="h-3 w-3 mr-1" />
                        Secure
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <span className="text-primary underline">Terms of Service</span> and{" "}
                      <span className="text-primary underline">Privacy Policy</span>. I understand that this e-stamp will be legally valid and binding.
                    </label>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 mb-1">Processing Time</p>
                      <ul className="text-orange-700 space-y-1">
                        <li>• Digital stamps: Instant delivery</li>
                        <li>• Physical stamps: 3-5 business days</li>
                        <li>• All stamps are government authorized</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12 text-base"
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Selection
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={!email || !phone || !termsAccepted || isProcessing}
                    className="flex-1 h-12 text-base font-semibold"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Processing...
                      </div>
                    ) : (
                      `Pay ₹${totalAmount.toLocaleString()}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};