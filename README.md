# CivicSense AI - Admin Portal

A production-grade React-based admin dashboard for CivicSense AI with full backend integration using MongoDB, Express, and JWT authentication.

## 🚀 Features

- **Authentication System**: Secure login with JWT tokens
- **Dashboard Analytics**: Real-time statistics and visualizations
- **Policy Management**: Upload, view, edit, and delete policy documents
- **User Analytics**: Geographic distribution, demographics, and device usage
- **Scheme Insights**: Government scheme statistics and performance metrics
- **Reports Generation**: Export data and analytics reports
- **Admin Settings**: Manage admin accounts and system configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (configured)

## 🛠️ Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ..
npm install
```

### 3. Database Setup

**Initialize with seed data:**
```bash
node backend/scripts/seedData.js
```

This creates:
- 100 sample users
- 8 sample policies
- 8 government schemes

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
node server.js
```

Backend API: `http://localhost:5000`

### Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

## 🔐 Default Login Credentials

```
User ID: aditya
Password: 123456
```

## 📁 Project Structure

```
CivicSenceAdminProtal/
├── backend/
│   ├── models/          # MongoDB schemas (Admin, Policy, User, Scheme)
│   ├── routes/          # API endpoints (auth, policies, users, analytics, etc.)
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Database initialization scripts
│   ├── uploads/         # File uploads directory
│   ├── server.js        # Express server
│   └── .env            # Environment variables
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/        # React Context (Auth)
│   ├── pages/          # Page components (Dashboard, Login, etc.)
│   ├── services/       # API service layer
│   └── App.jsx         # Main app component
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin

### Policies
- `GET /api/policies` - List all policies
- `POST /api/policies` - Upload new policy
- `DELETE /api/policies/:id` - Delete policy

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/users` - User analytics

### Schemes
- `GET /api/schemes/stats` - Scheme statistics

## 🎨 Tech Stack

### Frontend
- React 18.2.0
- Vite 5.1.4
- Tailwind CSS 3.4.1
- React Router 6.22.0
- Recharts 2.12.0
- Lucide Icons

### Backend
- Node.js & Express 4.18.2
- MongoDB with Mongoose 8.1.1
- JWT Authentication
- Bcryptjs for password hashing
- Multer for file uploads

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB connection in `.env`
- Ensure port 5000 is available

**Login not working:**
- Ensure backend server is running
- Use credentials: `aditya` / `123456`

**No data showing:**
- Run seed script: `node backend/scripts/seedData.js`

## 📝 Notes

- JWT tokens expire after 7 days
- File uploads stored in `backend/uploads/policies/`
- All passwords are hashed with bcrypt
- Default admin automatically created on first server start

## License

© 2026 CivicSense AI. All rights reserved.
