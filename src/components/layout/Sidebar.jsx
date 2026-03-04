import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react'
import clsx from 'clsx'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload-policy', label: 'Upload Policy', icon: Upload },
  { path: '/manage-policies', label: 'Manage Policies', icon: FileText },
  { path: '/scheme-insights', label: 'Scheme Insights', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-primary-900 text-white min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CivicSense AI</h1>
            <p className="text-xs text-primary-300">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-primary-700 text-white shadow-lg"
                        : "text-primary-200 hover:bg-primary-800 hover:text-white"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={clsx(
                        "w-5 h-5 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-primary-300"
                      )} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary-800">
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-200 hover:bg-primary-800 hover:text-white transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
