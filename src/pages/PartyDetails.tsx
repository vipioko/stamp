import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, FileText, AlertCircle } from "lucide-react";

const partyDetailsSchema = z.object({
  firstPartyName: z.string().min(2, "First party name must be at least 2 characters"),
  firstPartyAddress: z.string().min(10, "Address must be at least 10 characters"),
  secondPartyName: z.string().min(2, "Second party name must be at least 2 characters"),
  secondPartyAddress: z.string().min(10, "Address must be at least 10 characters"),
  documentType: z.string().min(1, "Please select a document type"),
  propertyDescription: z.string().min(10, "Property description must be at least 10 characters"),
  transactionValue: z.string().min(1, "Transaction value is required"),
  executionDate: z.string().min(1, "Execution date is required"),
});

type PartyDetailsForm = z.infer<typeof partyDetailsSchema>;

const documentTypes = [
  { value: "sale_deed", label: "Sale Deed" },
  { value: "lease_deed", label: "Lease Deed" },
  { value: "gift_deed", label: "Gift Deed" },
  { value: "power_of_attorney", label: "Power of Attorney" },
  { value: "agreement_to_sell", label: "Agreement to Sell" },
  { value: "mortgage_deed", label: "Mortgage Deed" },
  { value: "partition_deed", label: "Partition Deed" },
  { value: "release_deed", label: "Release Deed" },
];

export const PartyDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stateId = searchParams.get("state");
  const districtId = searchParams.get("district");
  const tehsilId = searchParams.get("tehsil");

  const form = useForm<PartyDetailsForm>({
    resolver: zodResolver(partyDetailsSchema),
    defaultValues: {
      firstPartyName: "",
      firstPartyAddress: "",
      secondPartyName: "",
      secondPartyAddress: "",
      documentType: "",
      propertyDescription: "",
      transactionValue: "",
      executionDate: "",
    },
  });

  const handleBack = () => {
    navigate(`/select-district?state=${stateId}`);
  };

  const onSubmit = async (data: PartyDetailsForm) => {
    if (!stateId || !districtId || !tehsilId) {
      toast({
        title: "Missing Location Info",
        description: "Please go back and select your location.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate form processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const params = new URLSearchParams({
        state: stateId,
        district: districtId,
        tehsil: tehsilId,
        ...data,
      });
      
      navigate(`/stamp-selection?${params.toString()}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process party details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step 3 of 6</span>
            <span className="text-sm text-muted-foreground">Party Details</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Party & Document Details</CardTitle>
            <CardDescription className="text-base">
              Provide details about the parties involved and the document
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Document Type */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Document Type <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* First Party Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                      First Party Details
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="firstPartyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Full Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter full name"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="firstPartyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Address <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter complete address"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Second Party Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                      Second Party Details
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="secondPartyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Full Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter full name"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondPartyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Address <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter complete address"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property & Transaction Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2">
                    Property & Transaction Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="transactionValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Transaction Value (₹) <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              placeholder="Enter amount in rupees"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="executionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Execution Date <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="propertyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Property Description <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe the property in detail"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Important Notice */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 mb-1">Important Notice</p>
                    <p className="text-orange-700">
                      Please ensure all details are accurate as they will appear on the e-stamp. 
                      Incorrect information may cause legal issues.
                    </p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Location
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base font-semibold"
                  >
                    {isSubmitting ? "Processing..." : "Next: Select Stamp"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};