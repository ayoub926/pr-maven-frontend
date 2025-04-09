import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { EmailAccountsPage } from '@/pages/email-accounts/email-accounts-page';
import { EmailAccountForm } from '@/pages/email-accounts/email-account-form';
import { QueriesPage } from '@/pages/queries/queries-page';
import { RepliesPage } from '@/pages/replies/replies-page';
import { ReportingPage } from '@/pages/reporting/reporting-page';
import { UserSettingsPage } from '@/pages/user-settings/user-settings-page';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/email-accounts" replace />} />
              
              <Route path="email-accounts">
                <Route index element={<EmailAccountsPage />} />
                <Route path="add" element={<EmailAccountForm />} />
                <Route path="edit/:id" element={<EmailAccountForm />} />
              </Route>
              
              <Route path="queries" element={<QueriesPage />} />
              <Route path="replies" element={<RepliesPage />} />
              <Route path="reporting" element={<ReportingPage />} />
              <Route path="settings" element={<UserSettingsPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;