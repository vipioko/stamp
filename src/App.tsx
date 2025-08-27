import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Layout/Header";
import { AdminRoute } from "@/components/Auth/AdminRoute";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { Landing } from "./pages/Landing";
import { SelectState } from "./pages/SelectState";
import { SelectDistrict } from "./pages/SelectDistrict";
import { PartyDetails } from "./pages/PartyDetails";
import { StampSelection } from "./pages/StampSelection";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./pages/admin/Dashboard";
import { Orders } from "./pages/admin/Orders";
import { OrderDetails } from "./pages/admin/OrderDetails";
import { Products } from "./pages/admin/catalog/Products";
import { ProductForm } from "./pages/admin/catalog/ProductForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="catalog/products" element={<Products />} />
                <Route path="catalog/products/new" element={<ProductForm />} />
                <Route path="catalog/products/:id/edit" element={<ProductForm />} />
                <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Users Management</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
                <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              </Route>
              
              {/* Public Routes */}
              <Route path="/*" element={
                <>
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
                </>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
