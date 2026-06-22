import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import ReportIssue from '@/pages/ReportIssue';
import CommunityFeed from '@/pages/CommunityFeed';
import IssueDetails from '@/pages/IssueDetails';
import Analytics from '@/pages/Analytics';
import MapView from '@/pages/MapView';
import AdminDashboard from '@/pages/AdminDashboard';
import { Toaster } from "@/components/ui/sonner";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      
      <Route path="/app" element={
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="feed" element={<CommunityFeed />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="issue/:id" element={<IssueDetails />} />
        <Route path="map" element={<MapView />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}
