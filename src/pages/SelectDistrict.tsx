import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Shield, Clock, CheckCircle } from "lucide-react";
import { getDistricts, getTehsils, type District, type Tehsil } from "@/lib/firestore";

export const SelectDistrict = () => {
  const [searchParams] = useSearchParams();
  const stateId = searchParams.get("state");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [districts, setDistricts] = useState<District[]>([]);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTehsil, setSelectedTehsil] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [tehsilLoading, setTehsilLoading] = useState(false);

  useEffect(() => {
    if (!stateId) {
      navigate("/select-state");
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const fetchedDistricts = await getDistricts(stateId);
        
        if (fetchedDistricts.length === 0) {
          // Fallback sample data for demonstration
          const sampleDistricts: District[] = [
            { id: "dist1", stateId, name: "Mumbai" },
            { id: "dist2", stateId, name: "Pune" },
            { id: "dist3", stateId, name: "Nashik" },
            { id: "dist4", stateId, name: "Nagpur" },
            { id: "dist5", stateId, name: "Aurangabad" }
          ];
          setDistricts(sampleDistricts);
        } else {
          setDistricts(fetchedDistricts);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
        toast({
          title: "Error",
          description: "Failed to load districts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [stateId, navigate, toast]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchTehsils = async () => {
        try {
          setTehsilLoading(true);
          const fetchedTehsils = await getTehsils(selectedDistrict);
          
          if (fetchedTehsils.length === 0) {
            // Fallback sample data for demonstration
            const sampleTehsils: Tehsil[] = [
              { id: "teh1", districtId: selectedDistrict, name: "Tehsil 1" },
              { id: "teh2", districtId: selectedDistrict, name: "Tehsil 2" },
              { id: "teh3", districtId: selectedDistrict, name: "Tehsil 3" }
            ];
            setTehsils(sampleTehsils);
          } else {
            setTehsils(fetchedTehsils);
          }
        } catch (error) {
          console.error("Error fetching tehsils:", error);
          toast({
            title: "Error",
            description: "Failed to load tehsils. Please try again.",
            variant: "destructive",
          });
        } finally {
          setTehsilLoading(false);
        }
      };

      fetchTehsils();
    } else {
      setTehsils([]);
      setSelectedTehsil("");
    }
  }, [selectedDistrict, toast]);

  const handleBack = () => {
    navigate("/select-state");
  };

  const handleNext = () => {
    if (!selectedDistrict || !selectedTehsil) {
      toast({
        title: "Selection Required",
        description: "Please select both district and tehsil to continue.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/party-details?state=${stateId}&district=${selectedDistrict}&tehsil=${selectedTehsil}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading districts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step 2 of 6</span>
            <span className="text-sm text-muted-foreground">Select Location</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>

        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Select District & Tehsil</CardTitle>
            <CardDescription className="text-base">
              Choose your district and tehsil for accurate e-stamp processing
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* District Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select District <span className="text-destructive">*</span>
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose your district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tehsil Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select Tehsil <span className="text-destructive">*</span>
              </label>
              <Select 
                value={selectedTehsil} 
                onValueChange={setSelectedTehsil}
                disabled={!selectedDistrict || tehsilLoading}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={
                    !selectedDistrict 
                      ? "Select district first" 
                      : tehsilLoading 
                        ? "Loading tehsils..." 
                        : "Choose your tehsil"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {tehsils.map((tehsil) => (
                    <SelectItem key={tehsil.id} value={tehsil.id}>
                      {tehsil.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selection Summary */}
            {selectedDistrict && selectedTehsil && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">Location Selected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  District: {districts.find(d => d.id === selectedDistrict)?.name} | 
                  Tehsil: {tehsils.find(t => t.id === selectedTehsil)?.name}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-base"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to State
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedDistrict || !selectedTehsil}
                className="flex-1 h-12 text-base font-semibold"
              >
                Next: Party Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur rounded-lg border">
            <Shield className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Secure Process</h4>
              <p className="text-xs text-muted-foreground">Bank-grade security</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur rounded-lg border">
            <Clock className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Quick Delivery</h4>
              <p className="text-xs text-muted-foreground">Same day processing</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur rounded-lg border">
            <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">100% Legal</h4>
              <p className="text-xs text-muted-foreground">Government approved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};