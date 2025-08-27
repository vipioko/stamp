import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Truck, Download, Calculator, CheckCircle } from "lucide-react";
import { getStampCategories, getStampProducts, type StampCategory, type StampProduct } from "@/lib/firestore";

export const StampSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<StampCategory[]>([]);
  const [products, setProducts] = useState<StampProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"digital" | "physical">("digital");
  const [loading, setLoading] = useState(true);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const stateId = searchParams.get("state");
  const transactionValue = searchParams.get("transactionValue");
  const documentType = searchParams.get("documentType");

  useEffect(() => {
    if (!stateId || !transactionValue || !documentType) {
      navigate("/party-details");
      return;
    }

    const fetchStampData = async () => {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([
          getStampCategories(),
          getStampProducts(stateId)
        ]);

        // Sample data if database is empty
        if (categoriesData.length === 0) {
          setCategories([
            { id: "1", name: "Judicial Stamps", description: "For court proceedings" },
            { id: "2", name: "Non-Judicial Stamps", description: "For agreements and deeds" },
            { id: "3", name: "Revenue Stamps", description: "For government transactions" }
          ]);
        } else {
          setCategories(categoriesData);
        }

        if (productsData.length === 0) {
          // Calculate stamp duty based on transaction value and document type
          const baseAmount = parseInt(transactionValue || "0");
          let stampDutyRate = 0.05; // 5% default

          // Different rates for different document types
          switch (documentType) {
            case "sale_deed":
              stampDutyRate = 0.05; // 5%
              break;
            case "lease_deed":
              stampDutyRate = 0.02; // 2%
              break;
            case "gift_deed":
              stampDutyRate = 0.03; // 3%
              break;
            case "power_of_attorney":
              stampDutyRate = 0.001; // 0.1%
              break;
            default:
              stampDutyRate = 0.02; // 2%
          }

          const calculatedStampDuty = Math.round(baseAmount * stampDutyRate);
          setCalculatedAmount(calculatedStampDuty);

          setProducts([
            {
              id: "prod1",
              stateId,
              categoryId: "2",
              name: "Non-Judicial E-Stamp",
              amount: calculatedStampDuty,
              platformFee: 0,
              expressFee: 0,
              deliveryFee: deliveryType === "physical" ? 50 : 0,
              deliveryTime: deliveryType === "physical" ? "3-5 days" : "instant"
            }
          ]);
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching stamp data:", error);
        toast({
          title: "Error",
          description: "Failed to load stamp options. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStampData();
  }, [stateId, transactionValue, documentType, navigate, toast]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/party-details?${params.toString()}`);
  };

  const handleNext = () => {
    if (!selectedProduct) {
      toast({
        title: "Selection Required",
        description: "Please select a stamp product to continue.",
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("productId", selectedProduct);
    params.set("deliveryType", deliveryType);
    
    navigate(`/checkout?${params.toString()}`);
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Calculating stamp requirements...</p>
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
            <span className="text-sm font-medium text-primary">Step 4 of 6</span>
            <span className="text-sm text-muted-foreground">Stamp Selection</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Selection */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
              <CardHeader className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Select E-Stamp</CardTitle>
                <CardDescription className="text-base">
                  Choose the appropriate stamp for your document
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Calculated Amount Display */}
                {calculatedAmount > 0 && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-5 w-5 text-success" />
                      <span className="font-medium text-success">Calculated Stamp Duty</span>
                    </div>
                    <p className="text-2xl font-bold text-success">₹{calculatedAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on transaction value of ₹{parseInt(transactionValue || "0").toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Product Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Stamps</h3>
                  <RadioGroup value={selectedProduct} onValueChange={setSelectedProduct}>
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value={product.id} id={product.id} />
                        <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">Electronic stamp for legal documents</p>
                            </div>
                            <Badge variant="secondary" className="text-base font-semibold">
                              ₹{product.amount.toLocaleString()}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Delivery Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Method</h3>
                  <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value as "digital" | "physical")}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">Digital Download</h4>
                              <p className="text-sm text-muted-foreground">Instant PDF download</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            Free
                          </Badge>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value="physical" id="physical" />
                      <Label htmlFor="physical" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">Physical Delivery</h4>
                              <p className="text-sm text-muted-foreground">Printed stamp by post</p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            + ₹50
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {selectedProductData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Stamp Duty</span>
                      <span className="font-medium">₹{selectedProductData.amount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Delivery</span>
                      <span className="font-medium">
                        {deliveryType === "digital" ? "Free" : "₹50"}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₹{(selectedProductData.amount + (deliveryType === "physical" ? 50 : 0)).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 pt-2">
                      <p className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Government authorized
                      </p>
                      <p className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Legally valid
                      </p>
                      <p className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Instant processing
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-8 max-w-2xl">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedProduct}
            className="flex-1 h-12 text-base font-semibold"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};