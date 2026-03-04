import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui'
import { TrendingUp, Award, Target, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { schemeAPI } from '../services/api'

export default function SchemeInsights() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [topSchemes, setTopSchemes] = useState([])
  const [schemesByCategory, setSchemesByCategory] = useState([])
  const [stats, setStats] = useState({
    totalSchemes: 0,
    avgEligibility: 0,
    totalApplications: 0,
    approvedApplications: 0,
    approvalRate: 0,
    avgBenefit: '₹0'
  })

  useEffect(() => {
    fetchSchemeData()
  }, [])

  const fetchSchemeData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await schemeAPI.getStats()
      
      if (result.success) {
        const data = result.data
        setTopSchemes(data.topSchemes || [])
        setSchemesByCategory(data.schemesByCategory || [])
        setStats({
          totalSchemes: data.totalSchemes || 0,
          avgEligibility: data.avgEligibility || 0,
          totalApplications: data.totalApplications || 0,
          approvedApplications: data.approvedApplications || 0,
          approvalRate: data.approvalRate || 0,
          avgBenefit: data.avgBenefit || '₹0'
        })
      } else if (result.message && result.message.includes('authentication')) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setError(result.message || 'Failed to fetch scheme data')
      }
    } catch (error) {
      console.error('Error fetching scheme data:', error)
      setError('Unable to connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading scheme insights...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <div className="text-red-600">
          <p className="font-semibold text-lg mb-2">Error Loading Scheme Insights</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchSchemeData}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </Card>
    )
  }

  const simulationData = topSchemes.map(scheme => ({
    scenario: scheme.name,
    count: scheme.totalApplications || 0
  })).slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-2">Total Schemes</p>
              <h3 className="text-4xl font-bold">{stats.totalSchemes}</h3>
              <p className="text-sm text-blue-100 mt-2">Across all categories</p>
            </div>
            <Award className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-100 text-sm mb-2">Avg. Eligibility</p>
              <h3 className="text-4xl font-bold">{Math.round(stats.avgEligibility)}%</h3>
              <p className="text-sm text-green-100 mt-2">Success rate</p>
            </div>
            <Target className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-2">Total Applications</p>
              <h3 className="text-4xl font-bold">{(stats.totalApplications / 1000000).toFixed(1)}M</h3>
              <p className="text-sm text-purple-100 mt-2">This month</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-2">Avg. Benefit</p>
              <h3 className="text-4xl font-bold">{stats.avgBenefit}</h3>
              <p className="text-sm text-orange-100 mt-2">Per beneficiary</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Top Performing Schemes */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Top Performing Schemes</h3>
          <p className="text-sm text-gray-500 mt-1">Based on eligibility and applications</p>
        </div>
        <div className="space-y-4">
          {topSchemes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No schemes data available
            </div>
          ) : (
            topSchemes.map((scheme, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{scheme.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {(scheme.totalApplications || 0).toLocaleString()} applications • Avg. Benefit: {scheme.avgBenefit}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">{scheme.eligibilityRate || 0}%</span>
                    </div>
                    <p className="text-sm text-gray-600">Eligibility Rate</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-600 to-blue-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${scheme.eligibilityRate || 0}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Schemes by Category & Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schemes by Category */}
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Schemes by Category</h3>
            <p className="text-sm text-gray-500 mt-1">Distribution across policy areas</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schemesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="schemes" fill="#1e40af" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Most Popular Simulations */}
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Popular What-If Scenarios</h3>
            <p className="text-sm text-gray-500 mt-1">Most simulated scenarios</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={simulationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="scenario" type="category" tick={{ fontSize: 12 }} width={120} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Scheme Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-500">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Total Applications</h4>
          <p className="text-3xl font-bold text-gray-900">{(stats.totalApplications / 1000).toFixed(1)}K</p>
          <p className="text-sm text-gray-500 mt-1">Across all schemes</p>
        </Card>

        <Card className="border-l-4 border-green-500">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Approved Applications</h4>
          <p className="text-3xl font-bold text-gray-900">{(stats.approvedApplications / 1000).toFixed(1)}K</p>
          <p className="text-sm text-gray-500 mt-1">{stats.approvalRate}% approval rate</p>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Pending Applications</h4>
          <p className="text-3xl font-bold text-gray-900">{((stats.totalApplications - stats.approvedApplications) / 1000).toFixed(1)}K</p>
          <p className="text-sm text-gray-500 mt-1">Under review</p>
        </Card>
      </div>
    </div>
  )
}
