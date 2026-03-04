import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      fetchCurrentAdmin()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchCurrentAdmin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.data.admin)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Fetch admin error:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (userId, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.data.token)
        setToken(data.data.token)
        setAdmin(data.data.admin)
        navigate('/dashboard')
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setAdmin(null)
    navigate('/login')
  }

  const value = {
    admin,
    login,
    logout,
    loading,
    isAuthenticated: !!admin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
