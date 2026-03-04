import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, Building2 } from 'lucide-react'
import { Button, Input } from '../components/ui'

export default function Login() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!userId || !password) {
      setError('Please enter both User ID and Password')
      return
    }

    setLoading(true)
    
    const result = await login(userId, password)
    
    if (!result.success) {
      setError(result.message || 'Login failed. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <Building2 className="w-10 h-10 text-primary-700" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CivicSense AI</h1>
          <p className="text-primary-200">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to access the admin panel</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="User ID"
              type="text"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Default credentials for testing:
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              User ID: <span className="font-mono font-semibold">aditya</span> | 
              Password: <span className="font-mono font-semibold">123456</span>
            </p>
          </div>
        </div>

        <p className="text-center text-primary-200 text-sm mt-6">
          © 2026 CivicSense AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
