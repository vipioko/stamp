import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getStates, State } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

export const SelectState = () => {
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await getStates();
        // If no states in database, add some sample data for demo
        if (statesData.length === 0) {
          setStates([
            { id: "1", name: "Maharashtra", code: "MH" },
            { id: "2", name: "Gujarat", code: "GJ" },
            { id: "3", name: "Karnataka", code: "KA" },
            { id: "4", name: "Tamil Nadu", code: "TN" },
            { id: "5", name: "Uttar Pradesh", code: "UP" },
            { id: "6", name: "Delhi", code: "DL" },
            { id: "7", name: "West Bengal", code: "WB" },
            { id: "8", name: "Rajasthan", code: "RJ" }
          ]);
        } else {
          setStates(statesData);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
        toast({
          title: "Error",
          description: "Failed to load states. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [toast]);

  const handleNext = () => {
    if (!selectedState) {
      toast({
        title: "State Required",
        description: "Please select a state to continue.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/select-district?state=${selectedState}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading states...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 1 of 6</span>
            <span>Select State</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '16.66%' }}></div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Select Your State</CardTitle>
            <p className="text-muted-foreground">
              Choose the state where you need the e-stamp
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">State *</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  Selected: {states.find(s => s.id === selectedState)?.name}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              
              <Button onClick={handleNext} disabled={!selectedState}>
                Next: Select District
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Trusted by 50,000+ customers
          </p>
          <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              SSL Secured
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              Government Authorized
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              Instant Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};