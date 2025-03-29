
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import StockManagement from "./pages/StockManagement";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import CashManagement from "./pages/CashManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ element, allowedRoles }: { element: JSX.Element, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role authorization if roles are specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/sales" />;
  }

  return element;
};

// Redirect to sales if already logged in
const PublicRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return element;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute element={<Login />} />} />
      <Route path="/" element={<ProtectedRoute element={<Index />} />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/stock" element={<ProtectedRoute element={<StockManagement />} allowedRoles={['admin']} />} />
      <Route path="/sales" element={<ProtectedRoute element={<Sales />} />} />
      <Route path="/expenses" element={<ProtectedRoute element={<Expenses />} allowedRoles={['admin']} />} />
      <Route path="/cash" element={<ProtectedRoute element={<CashManagement />} allowedRoles={['admin']} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
