import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireInternal } from '@/components/auth/RequireInternal'
import { AppShell } from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/Toast'
import { HomePage } from '@/pages/HomePage'
import { SubmitPage } from '@/pages/SubmitPage'
import { MyRequestsPage } from '@/pages/MyRequestsPage'
import { RequestDetailPage } from '@/pages/RequestDetailPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { RevisionDetailPage as AdminRevisionDetailPage } from '@/pages/admin/RevisionDetailPage'
import { OrgAdminPage } from '@/pages/admin/OrgAdminPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell theme="client" />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/requests" element={<MyRequestsPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/confirm" element={<AuthCallbackPage />} />
          </Route>

          <Route element={<AppShell theme="internal" />}>
            <Route element={<RequireInternal />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/revisions/:id" element={<AdminRevisionDetailPage />} />
              <Route path="/admin/org" element={<OrgAdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
