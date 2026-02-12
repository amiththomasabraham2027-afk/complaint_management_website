# 🚀 ResolveX - Complaint Management System

A production-ready, modern complaint management platform built with **Next.js SSR**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. Features secure authentication, role-based access control, real-time tracking, and a powerful admin dashboard.

## ✨ Features

- ✅ **User Authentication** - Secure registration & login with JWT & bcrypt
- ✅ **Complaint Management** - Submit, track, and manage complaints
- ✅ **Real-time Status Tracking** - Live status updates
- ✅ **Admin Dashboard** - Comprehensive complaint analytics & filtering
- ✅ **Role-Based Access Control** - Separate user and admin interfaces
- ✅ **Server-Side Rendering** - Optimized performance with Next.js SSR
- ✅ **Input Validation** - Zod schema validation
- ✅ **Responsive Design** - Mobile-first, glassmorphism UI
- ✅ **Smooth Animations** - Framer Motion animations
- ✅ **Docker Support** - Easy deployment with Docker Compose
- ✅ **Production Ready** - Error handling, logging, security best practices

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Zod** - Schema validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MongoDB Atlas** - Cloud database (optional)

## 📋 Prerequisites

- Node.js 20+ or Docker
- npm or yarn
- MongoDB (local or cloud)
- Git

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Complaint-management-web

# Create .env.local with Docker configuration
cp .env.example .env.local

# Update with your desired values:
# MONGODB_URI=mongodb://admin:password123@mongodb:27017/resolvex?authSource=admin
# JWT_SECRET=your-super-secret-jwt-key
# NEXTAUTH_SECRET=your-nextauth-secret-key

# Start all services
docker-compose up --build

# Access the application
# Open http://localhost:3000 in your browser
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Update environment variables for your MongoDB instance
# Example for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/resolvex

# Start MongoDB (if running locally)
mongod

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
project-root/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── logout/
│   │   └── complaints/           # Complaint endpoints
│   │       ├── route.ts          # GET (list), POST (create)
│   │       └── [id]/route.ts     # GET, PUT, PATCH, DELETE
│   ├── auth/                     # Auth pages
│   ├── dashboard/                # Dashboard pages
│   │   ├── user/                 # User dashboard
│   │   └── admin/                # Admin dashboard
│   ├── complaint/                # Complaint pages
│   │   ├── new/                  # Submit complaint
│   │   ├── history/              # View complaints
│   │   └── [id]/                 # Complaint detail
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── not-found.tsx             # 404 page
│
├── components/                    # React components
│   ├── ui/                        # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── alerts.tsx
│   ├── layout/                    # Layout components
│   │   ├── sidebar.tsx            # Navigation sidebar
│   │   └── page-header.tsx        # Page headers
│   ├── cards/                     # Card components
│   │   └── complaint-card.tsx
│   └── forms/                     # Form components
│       └── complaint-form.tsx
│
├── lib/                           # Utility & helper functions
│   ├── auth/                      # Authentication utilities
│   │   ├── jwt.ts                 # JWT functions
│   │   ├── password.ts            # Bcrypt functions
│   │   └── cookies.ts             # Cookie management
│   ├── db/                        # Database
│   │   └── connection.ts          # MongoDB connection
│   ├── validation/                # Input validation
│   │   └── schemas.ts             # Zod schemas
│   ├── utils/                     # Utility functions
│   │   ├── cn.ts                  # Classname merger
│   │   ├── responses.ts           # API responses
│   │   └── formatting.ts          # Formatting helpers
│   └── middleware/                # Middleware
│       └── api.ts                 # API middleware
│
├── models/                        # MongoDB models
│   ├── User.ts                    # User schema
│   └── Complaint.ts               # Complaint schema
│
├── types/                         # TypeScript types
│   └── index.ts                   # Type definitions
│
├── styles/                        # Global styles
│   └── globals.css                # Tailwind styles
│
├── public/                        # Static assets
│
├── .env.example                   # Environment variables template
├── .env.local                     # Environment variables (not in repo)
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
├── postcss.config.js              # PostCSS config
├── next.config.js                 # Next.js config
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker Compose config
└── README.md                      # This file
```

## 🔐 Authentication Flow

### Registration
1. User fills registration form
2. Password is hashed with bcrypt (10 salt rounds)
3. User created in MongoDB
4. JWT token generated and returned
5. Token stored in HTTP-only cookie

### Login
1. User provides email and password
2. User found in database
3. Password compared with bcrypt
4. JWT token generated
5. User redirected to appropriate dashboard

### Protected Routes
1. API middleware validates JWT token
2. Token verified using JWT secret
3. User data extracted from token payload
4. Role-based authorization checked
5. Request processed or rejected

## 📊 Database Schema

### User Schema
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Schema
```typescript
{
  title: String (5-100 chars),
  description: String (10-2000 chars),
  category: String (enum),
  priority: "Low" | "Medium" | "High",
  status: "Pending" | "In Progress" | "Resolved" | "Rejected",
  userId: ObjectId (ref: User),
  adminNotes?: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Complaints
- `GET /api/complaints` - List complaints (with filtering & pagination)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/[id]` - Get complaint details
- `PUT /api/complaints/[id]` - Update complaint status (admin only)
- `PATCH /api/complaints/[id]` - Add admin notes (admin only)
- `DELETE /api/complaints/[id]` - Delete complaint (admin only)

## 📝 Query Parameters

### GET /api/complaints
```bash
# Filtering
?status=Pending
?priority=High
?category=Service Quality
?startDate=2024-01-01
?endDate=2024-12-31

# Search
?search=complaint title

# Pagination
?page=1
?limit=10

# Combined
?status=Pending&priority=High&search=billing&page=1&limit=10
```

## 🎨 Design System

### Colors
- **Primary:** `#00ff88` (Neon Green)
- **Secondary:** `#00d9ff` (Cyan)
- **Accent:** `#ff006e` (Pink)
- **Background:** `#0f0f1e` (Dark Navy)
- **Border:** `#1a1a2e`

### Components
- Glass-morphism cards with backdrop blur
- Neon glow effects on hover
- Smooth Framer Motion animations
- Responsive grid layouts
- Mobile-first design

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up --build

# Rebuild specific service
docker-compose up --build app

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v
```

### Environment Variables

Create `.env.local`:
```env
# Database
MONGODB_URI=mongodb://user:password@host:port/database

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📱 User Roles

### User (Regular User)
- Register & login
- Submit complaints
- View own complaints
- Track complaint status
- Cannot access admin features

### Admin
- Access admin dashboard
- View all complaints
- Filter & search complaints
- Update complaint status
- Add internal notes
- Delete complaints
- Access statistics

## ✅ Testing

### Manual Testing Checklist
- Register new user ✓
- Login with credentials ✓
- Submit complaint ✓
- View complaint history ✓
- Filter complaints ✓
- Search complaints ✓
- View complaint details ✓
- Admin: Update status ✓
- Admin: Add notes ✓
- Admin: View all complaints ✓
- Logout ✓

### Test Accounts
```
User Account:
Email: user@example.com
Password: password123

Admin Account:
Email: admin@example.com
Password: password123
```

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing (10 rounds)
- ✅ HTTP-only secure cookies
- ✅ Input validation with Zod
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ CORS enabled for authorized domains
- ✅ Environment variable protection
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection via React

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## 📈 Performance Optimizations

- ✅ Server-side rendering (SSR) for faster initial load
- ✅ MongoDB query indexing for fast searches
- ✅ Lazy loading of components
- ✅ Image optimization
- ✅ CSS-in-JS with Tailwind
- ✅ Optimized bundle size
- ✅ Caching strategies

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Framer Motion](https://www.framer.com/motion)

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for better complaint management**

### Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server on :3000

# Production
npm run build        # Build for production
npm start           # Start production server

# Lint & Type Check
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking

# Docker
docker-compose up --build      # Start services
docker-compose down            # Stop services
docker-compose logs -f app     # View logs
docker-compose ps              # View running containers
```

**Current Version:** 1.0.0  
**Last Updated:** February 2026
