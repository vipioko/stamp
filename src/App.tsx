import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Layout/Header";
import { Landing } from "./pages/Landing";
import { SelectState } from "./pages/SelectState";
import { SelectDistrict } from "./pages/SelectDistrict";
import { PartyDetails } from "./pages/PartyDetails";
import { StampSelection } from "./pages/StampSelection";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/select-state" element={<SelectState />} />
                <Route path="/select-district" element={<SelectDistrict />} />
                <Route path="/party-details" element={<PartyDetails />} />
                <Route path="/stamp-selection" element={<StampSelection />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
