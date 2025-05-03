
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Circles from "./pages/Circles";
import Keystones from "./pages/Keystones";
import Settings from "./pages/Settings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CallbackPage from "./pages/auth/CallbackPage";
import ContactDetail from "./pages/contact/ContactDetail";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/guards/RequireAuth";
import UserOnboarding from "./components/UserOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<CallbackPage />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Home />
                  </MainLayout>
                  <UserOnboarding />
                </RequireAuth>
              }
            />
            <Route
              path="/circles"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Circles />
                  </MainLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/contacts/:id"
              element={
                <RequireAuth>
                  <MainLayout>
                    <ContactDetail />
                  </MainLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/keystones"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Keystones />
                  </MainLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </RequireAuth>
              }
            />
            
            {/* Fallback routes */}
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
