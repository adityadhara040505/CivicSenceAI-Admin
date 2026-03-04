import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui'
import { 
  FileText, 
  Users, 
  UserCheck, 
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { analyticsAPI, userAPI, policyAPI, schemeAPI } from '../services/api'

function StatCard({ stat }) {
  const Icon = stat.icon
  
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          <div className="flex items-center gap-1 mt-2">
            {stat.isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              stat.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>
        <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [userAnalytics, setUserAnalytics] = useState(null)
  const [recentPolicies, setRecentPolicies] = useState([])
  const [topSchemes, setTopSchemes] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, userRes, policiesRes, schemesRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        userAPI.getStats(),
        policyAPI.getAll({ limit: 4, page: 1 }),
        schemeAPI.getStats()
      ])

      if (dashboardRes.success) {
        setDashboardData(dashboardRes.data)
      }
      if (userRes.success) {
        setUserAnalytics(userRes.data)
      }
      if (policiesRes.success) {
        setRecentPolicies(policiesRes.data.policies)
      }
      if (schemesRes.success) {
        console.log('📊 Schemes data received from database:', schemesRes.data.topSchemes)
        setTopSchemes(schemesRes.data.topSchemes.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const statsData = [
    {
      title: 'Total Policies Uploaded',
      value: stats.totalPolicies?.toLocaleString() || '0',
      change: '+12.5%',
      isPositive: true,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Registered Users',
      value: stats.totalUsers?.toLocaleString() || '0',
      change: '+18.2%',
      isPositive: true,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users Today',
      value: stats.activeToday?.toLocaleString() || '0',
      change: '-2.4%',
      isPositive: false,
      icon: UserCheck,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Simulations Run',
      value: stats.totalSimulations?.toLocaleString() || '0',
      change: '+24.8%',
      isPositive: true,
      icon: Activity,
      color: 'bg-orange-500'
    }
  ]

  const usersByState = userAnalytics?.usersByState?.slice(0, 6) || []
  const dailyActiveUsers = dashboardData?.dailyActiveUsers || []

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by State */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Users by State</h3>
            <p className="text-sm text-gray-500 mt-1">Top performing states</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usersByState}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="state" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="users" fill="#1e40af" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Active Users */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Active Users</h3>
            <p className="text-sm text-gray-500 mt-1">Last 7 days trend</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#1e40af" 
                strokeWidth={3}
                dot={{ fill: '#1e40af', strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Policies & Top Schemes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Policies</h3>
              <p className="text-sm text-gray-500 mt-1">Latest uploaded policies</p>
            </div>
            <button className="text-sm font-medium text-primary-700 hover:text-primary-800">
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {recentPolicies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No policies uploaded yet
              </div>
            ) : (
              recentPolicies.map((policy, index) => (
                <div 
                  key={policy._id || index} 
                  onClick={() => {
                    if (policy.filePath) {
                      // Open PDF in new tab
                      window.open(`http://localhost:5000/${policy.filePath}`, '_blank')
                    }
                  }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{policy.title || policy.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{policy.category}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(policy.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-primary-600 font-medium">Click to view PDF</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    policy.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {policy.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Schemes */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Schemes</h3>
            <p className="text-sm text-gray-500 mt-1">Most eligible schemes</p>
          </div>
          <div className="space-y-4">
            {topSchemes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No schemes available
              </div>
            ) : (
              topSchemes.map((scheme, index) => (
                <div 
                  key={scheme._id || index} 
                  className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{scheme.name}</h4>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">{scheme.eligibilityRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eligibility Rate</span>
                    <span className="text-sm font-medium text-gray-900">{(scheme.totalApplications / 1000).toFixed(0)}K applications</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${scheme.eligibilityRate}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to upload a new policy?</h3>
            <p className="text-primary-100">
              Upload and analyze policy documents with AI-powered insights
            </p>
          </div>
          <button 
            onClick={() => navigate('/upload-policy')}
            className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all shadow-lg"
          >
            Upload Policy
          </button>
        </div>
      </Card>
    </div>
  )
}
