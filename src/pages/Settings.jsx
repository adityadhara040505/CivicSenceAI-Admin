import { useState, useEffect } from 'react'
import { Card, Button, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { settingsAPI } from '../services/api'
import { Users, X } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [adminAccounts, setAdminAccounts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    email: '',
    role: 'Analyst'
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const result = await settingsAPI.getAdmins()
      if (result.success) {
        setAdminAccounts(result.data.admins || [])
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      showMessage('Error loading admins', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/settings/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      
      if (result.success) {
        showMessage('Admin created successfully')
        setShowAddModal(false)
        setFormData({ userId: '', password: '', name: '', email: '', role: 'Analyst' })
        fetchAdmins()
      } else {
        showMessage(result.message || 'Failed to create admin', 'error')
      }
    } catch (error) {
      showMessage('Error creating admin', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAdmin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/settings/admins/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status
        })
      })
      const result = await response.json()
      
      if (result.success) {
        showMessage('Admin updated successfully')
        setShowEditModal(false)
        setSelectedAdmin(null)
        fetchAdmins()
      } else {
        showMessage(result.message || 'Failed to update admin', 'error')
      }
    } catch (error) {
      showMessage('Error updating admin', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (admin) => {
    setSelectedAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage administrator accounts and permissions
        </p>
      </Card>

      {/* Admin Accounts Section */}
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Manage the Admin Accounts</h3>
              <p className="text-sm text-gray-500 mt-1">Manage administrator access</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Users className="w-4 h-4" />
              Add New Admin
            </Button>
          </div>

          {loading && !adminAccounts.length ? (
            <div className="text-center py-8 text-gray-500">Loading admins...</div>
          ) : adminAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No admins found. Add your first admin above.</div>
          ) : (
            <div className="space-y-3">
              {adminAccounts.map((admin) => (
                <div 
                  key={admin._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{admin.name}</h4>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {admin.role}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{admin.status}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(admin)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Role Permissions</h3>
          <div className="space-y-4">
            {['Super Admin', 'Policy Admin', 'Analyst', 'Viewer'].map((role, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{role}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {idx === 0 ? 'Full system access' : 
                     idx === 1 ? 'Policy management access' :
                     idx === 2 ? 'Analytics and reporting' : 'Read-only access'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add New Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Admin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <Input
                label="User ID"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                placeholder="Enter user ID"
                required
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter password"
                required
              />
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email"
                required
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Policy Admin">Policy Admin</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Admin'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Admin</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email"
                required
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Policy Admin">Policy Admin</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Admin'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
