# ResolveX - Complaint Management System
# Development Environment Setup Guide

## Prerequisites Installation

### Windows
1. **Node.js**
   - Download from https://nodejs.org/ (v20 or higher)
   - Install with npm
   - Verify: `node --version` and `npm --version`

2. **MongoDB (Optional - Use Docker Instead)**
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **Docker & Docker Compose**
   - Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop
   - Includes Docker and Docker Compose
   - Verify: `docker --version` and `docker-compose --version`

### macOS
```bash
# Using Homebrew
brew install node
brew install docker

# Verify
node --version
docker --version
docker-compose --version
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm docker.io docker-compose

# Verify
node --version
npm --version
docker --version
docker-compose --version
```

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd Complaint-management-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Update with local MongoDB URI (if using local MongoDB)
MONGODB_URI=mongodb://localhost:27017/resolvex
JWT_SECRET=dev-secret-key-change-in-production
NEXTAUTH_SECRET=dev-nextauth-secret-change-in-production
```

### 4. Start MongoDB (if local)
```bash
# Start MongoDB service
# Windows: Services > MongoDB > Start
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Test connection
mongo --version
```

### 5. Run Development Server
```bash
npm run dev
```

Access at http://localhost:3000

## Docker Development Setup (Recommended)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Complaint-management-web
```

### 2. Configure Environment
```bash
cp .env.example .env.local

# Default Docker values:
MONGODB_URI=mongodb://admin:password123@mongodb:27017/resolvex?authSource=admin
JWT_SECRET=dev-secret-key-change-in-production
NEXTAUTH_SECRET=dev-nextauth-secret-change-in-production
```

### 3. Start All Services
```bash
docker-compose up --build
```

Services will be available at:
- **App:** http://localhost:3000
- **MongoDB:** localhost:27017

### 4. View Logs
```bash
docker-compose logs -f app
docker-compose logs -f mongodb
```

### 5. Stop Services
```bash
docker-compose down   # Stop containers
docker-compose down -v  # Stop and remove volumes
```

## Testing the Application

### 1. Register New User
- Go to http://localhost:3000
- Click "Get Started"
- Fill in name, email, password
- Submit

### 2. Login
- Use registered credentials
- Should redirect to user dashboard

### 3. Submit Complaint
- Click "New Complaint" button
- Fill in all required fields
- Submit

### 4. View Complaints
- Click "My Complaints"
- See all submitted complaints
- Click on complaint to view details

### 5. Admin Access (Test)
```bash
# Set up an admin account in MongoDB

# In MongoDB shell:
use resolvex
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

Then login with that email - you'll now see the admin dashboard.

## Common Commands

### npm
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run linter
npm run type-check  # Check TypeScript
```

### Docker
```bash
docker-compose up --build              # Start all services
docker-compose down                    # Stop all services
docker-compose restart                 # Restart services
docker-compose logs -f app             # View app logs
docker-compose exec app npm run build  # Build inside container
docker-compose ps                      # View running containers
```

### Database
```bash
# Access MongoDB in Docker
docker-compose exec mongodb mongosh

# In mongosh:
use resolvex
show collections
db.users.find()
db.complaints.find()
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Refused
```bash
# Check if MongoDB service is running
# Check connection string in .env.local
# For local MongoDB ensure it's started
# Check MongoDB logs
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Docker Issues
```bash
# Remove and rebuild containers
docker-compose down -v
docker-compose up --build

# View Docker logs
docker logs <container-id>
docker-compose logs
```

## IDE Setup

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens
- Prettier
- ESLint

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Next Steps

1. ✅ Setup complete
2. Read [README.md](./README.md) for full documentation
3. Review [API endpoints](#) in README
4. Check [Database schema](#) in README
5. Start building features!

## Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Docker Docs](https://docs.docker.com)

---

**Need help?** Check the main README.md file for more information!
