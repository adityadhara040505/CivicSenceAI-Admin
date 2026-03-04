import { ChevronDown, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const pageTitles = {
  '/dashboard': 'Admin Dashboard',
  '/upload-policy': 'Upload Policy',
  '/manage-policies': 'Manage Policies',
  '/scheme-insights': 'Scheme Insights',
  '/settings': 'Settings',
}

export default function Navbar() {
  const location = useLocation()
  const { admin } = useAuth()
  const pageTitle = pageTitles[location.pathname] || 'Admin Panel'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 card-shadow">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, Administrator
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{admin?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{admin?.role || 'Super Admin'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
