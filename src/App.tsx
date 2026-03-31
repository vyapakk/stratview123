import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RouteScrollToTop } from "@/components/RouteScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { dashboardRegistry } from "@/dashboards/registry";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DatasetDetail from "./pages/DatasetDetail";
import MyAccount from "./pages/MyAccount";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import QueryFormTab from "@/components/QueryFormTab";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RouteScrollToTop />
          <QueryFormTab />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/dataset/:datasetId" element={<ProtectedRoute><DatasetDetail /></ProtectedRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            {/* Auto-discovered dashboard routes */}
            {dashboardRegistry.map(({ routePath, component: Component }) => (
              <Route key={routePath} path={routePath} element={<ProtectedRoute><Component /></ProtectedRoute>} />
            ))}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
