import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge } from '../components/ui'
import { Search, Filter, Download, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { policyAPI } from '../services/api'

const categoryColors = {
  Tax: 'info',
  MSME: 'success',
  Housing: 'warning',
  Sustainability: 'success',
  Agriculture: 'warning',
  Education: 'info',
  Technology: 'info',
  Employment: 'default'
}

export default function ManagePolicies() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    fetchPolicies()
  }, [searchTerm, filterCategory, filterStatus])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (filterCategory !== 'all') params.category = filterCategory
      if (filterStatus !== 'all') params.status = filterStatus

      const result = await policyAPI.getAll(params)
      if (result.success) {
        setPolicies(result.data.policies || [])
      } else if (result.message && result.message.includes('authentication')) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setError(result.message || 'Failed to fetch policies')
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
      setError('Unable to connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Pagination
  const totalPages = Math.ceil(policies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPolicies = policies.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        const result = await policyAPI.delete(id)
        if (result.success) {
          fetchPolicies() // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting policy:', error)
        alert('Failed to delete policy')
      }
    }
  }

  const handleView = (policy) => {
    if (policy.filePath) {
      if (policy.filePath.startsWith('http')) {
        window.open(policy.filePath, '_blank')
      } else {
        window.open(`http://localhost:5000/${policy.filePath}`, '_blank')
      }
    } else {
      alert('PDF file not available for this policy')
    }
  }

  const handleEdit = (policy) => {
    // For now, show policy details in an alert
    // TODO: Implement edit modal or navigation to edit page
    const editInfo = `
Policy: ${policy.title}
Category: ${policy.category}
Status: ${policy.status}
Upload Date: ${new Date(policy.uploadDate).toLocaleDateString()}
Views: ${policy.views || 0}

Edit functionality will be implemented in a future update.
    `
    alert(editInfo)
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Policies</h2>
            <p className="text-sm text-gray-500 mt-1">
              {policies.length} policies found
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">All Categories</option>
            <option value="Tax">Tax</option>
            <option value="MSME">MSME</option>
            <option value="Housing">Housing</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Education">Education</option>
            <option value="Sustainability">Sustainability</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Policies Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Policy Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-600">Loading policies...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <p className="font-semibold mb-2">Error Loading Policies</p>
                      <p className="text-sm text-gray-600">{error}</p>
                      <button
                        onClick={fetchPolicies}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedPolicies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No policies found
                  </td>
                </tr>
              ) : (
                paginatedPolicies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{policy.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={categoryColors[policy.category] || 'default'}>
                        {policy.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(policy.uploadDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {policy.views?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={policy.status === 'Active' ? 'success' : 'default'}>
                        {policy.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="View PDF"
                          onClick={() => handleView(policy)}
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                          title="Edit Policy"
                          onClick={() => handleEdit(policy)}
                        >
                          <Edit className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Delete"
                          onClick={() => handleDelete(policy._id)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, policies.length)} of {policies.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                    ? 'bg-primary-700 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
