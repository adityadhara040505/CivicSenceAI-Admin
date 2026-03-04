import { useState, useEffect } from 'react'
import { Card } from '../components/ui'
import { Users, TrendingUp, MapPin, Smartphone } from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'
import { userAPI, analyticsAPI } from '../services/api'

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
const DEVICE_COLORS = ['#1e40af', '#10b981', '#f59e0b']

export default function UserAnalytics() {
  const [loading, setLoading] = useState(true)
  const [usersByState, setUsersByState] = useState([])
  const [dailyActiveUsers, setDailyActiveUsers] = useState([])
  const [userDemographics, setUserDemographics] = useState([])
  const [deviceUsage, setDeviceUsage] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    topState: { name: 'Loading...', count: 0 },
    mobilePercentage: 0
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [analyticsRes, userStatsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getUserAnalytics()
      ])

      if (analyticsRes.success) {
        setDailyActiveUsers(analyticsRes.data.dailyActiveUsers || [])
        setStats(prev => ({
          ...prev,
          activeToday: analyticsRes.data.activeToday || 0
        }))
      }

      if (userStatsRes.success) {
        const data = userStatsRes.data
        setUsersByState(data.usersByState || [])
        setUserDemographics(data.ageGroups || [])
        setDeviceUsage(data.deviceBreakdown || [])
        
        const topState = data.usersByState?.[0]
        const mobileData = data.deviceBreakdown?.find(d => d.name === 'Mobile')
        
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || 0,
          topState: topState ? { name: topState.state, count: topState.users } : { name: 'N/A', count: 0 },
          mobilePercentage: mobileData?.value || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+18.2%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Today',
      value: stats.activeToday.toLocaleString(),
      change: '+12.5%',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Top State',
      value: stats.topState.name,
      change: `${stats.topState.count.toLocaleString()} users`,
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      title: 'Mobile Users',
      value: `${stats.mobilePercentage}%`,
      change: '+5.2%',
      icon: Smartphone,
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Users by State */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Users by State</h3>
          <p className="text-sm text-gray-500 mt-1">Geographic distribution of registered users</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={usersByState}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="state" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
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

      {/* Daily Active Users Trend */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Daily Active Users</h3>
          <p className="text-sm text-gray-500 mt-1">User activity over the last 7 days</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#1e40af" 
              strokeWidth={3}
              dot={{ fill: '#1e40af', strokeWidth: 2, r: 5 }}
              name="Active Users"
            />
            <Line 
              type="monotone" 
              dataKey="newUsers" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Demographics & Device Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Demographics */}
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Age Demographics</h3>
            <p className="text-sm text-gray-500 mt-1">User distribution by age group</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDemographics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDemographics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {userDemographics.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[idx] }}></div>
                <p className="text-xs font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">{item.value}%</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Usage */}
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Device Usage</h3>
            <p className="text-sm text-gray-500 mt-1">Platform preference analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {deviceUsage.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: DEVICE_COLORS[idx] }}></div>
                <p className="text-xs font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">{item.value}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* User Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Avg. Session Duration</h4>
          <p className="text-3xl font-bold text-blue-700">8m 42s</p>
          <p className="text-sm text-blue-600 mt-1">+15% from last week</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <h4 className="text-sm font-semibold text-green-900 mb-2">Retention Rate</h4>
          <p className="text-3xl font-bold text-green-700">78.5%</p>
          <p className="text-sm text-green-600 mt-1">+3.2% from last month</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">Bounce Rate</h4>
          <p className="text-3xl font-bold text-purple-700">21.3%</p>
          <p className="text-sm text-purple-600 mt-1">-5.1% improvement</p>
        </Card>
      </div>
    </div>
  )
}
