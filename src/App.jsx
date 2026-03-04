import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UploadPolicy from './pages/UploadPolicy'
import ManagePolicies from './pages/ManagePolicies'
import SchemeInsights from './pages/SchemeInsights'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload-policy" element={<UploadPolicy />} />
            <Route path="manage-policies" element={<ManagePolicies />} />
            <Route path="scheme-insights" element={<SchemeInsights />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
