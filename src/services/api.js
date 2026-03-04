const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Auth APIs
export const authAPI = {
  login: async (userId, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });
    return response.json();
  },
  
  getCurrentAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

// Policy APIs
export const policyAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/policies?${queryString}`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  create: async (formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/policies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },
  
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },
  
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/policies/stats/overview`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

// User APIs
export const userAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  getUserAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/users`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

// Scheme APIs
export const schemeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/schemes`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/schemes/stats`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/schemes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Report APIs
export const reportAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: getHeaders()
    });
    return response.json();
  }
};

// Settings APIs
export const settingsAPI = {
  getAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/admins`, {
      headers: getHeaders()
    });
    return response.json();
  },
  
  updateAdmin: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/settings/admins/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  createAdmin: async (data) => {
    const response = await fetch(`${API_BASE_URL}/settings/admins`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
