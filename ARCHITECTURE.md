# 🏗️ ResolveX Architecture Documentation

## System Overview

ResolveX is a production-grade complaint management platform built with modern web technologies. The system follows clean architecture principles with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React/Next.js)             │
├─────────────────────────────────────────────────────────────┤
│  Pages      │  Components  │  Forms    │  Hooks    │ Utils   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER (Next.js Routes)                 │
├─────────────────────────────────────────────────────────────┤
│ Auth Routes │ Complaint Routes │ Middleware │ Error Handling │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER (MongoDB)                        │
├─────────────────────────────────────────────────────────────┤
│  User Model  │  Complaint Model  │  Indexes  │  Validation   │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure Deep Dive

### `/app` - Next.js App Router

#### API Routes
```
/api
├── /auth
│   ├── /login          → POST: Authenticate user
│   ├── /register       → POST: Create new account
│   └── /logout         → POST: Destroy session
└── /complaints
    ├── /route.ts       → GET: List complaints
    │                     → POST: Create complaint
    └── /[id]/route.ts  → GET: Complaint details
                         → PUT: Update status (admin)
                         → PATCH: Add notes (admin)
                         → DELETE: Remove (admin)
```

#### Pages & Layouts
```
/app
├── /layout.tsx             → Root layout with metadata
├── /page.tsx               → Landing page
├── /not-found.tsx          → 404 error page
├── /auth
│   ├── /layout.tsx         → Auth layout (centered form)
│   ├── /login/page.tsx     → Login form
│   └── /register/page.tsx  → Registration form
├── /dashboard
│   ├── /layout.tsx         → Dashboard layout (with sidebar)
│   ├── /user/page.tsx      → User dashboard
│   └── /admin/page.tsx     → Admin dashboard
└── /complaint
    ├── /layout.tsx         → Complaint layout
    ├── /new/page.tsx       → Submit complaint
    ├── /history/page.tsx   → Complaint list
    └── /[id]/page.tsx      → Complaint details
```

### `/components` - React Components

#### UI Components (Base Layer)
- **button.tsx** - Versatile button with variants
- **input.tsx** - Styled input field
- **textarea.tsx** - Multi-line text input
- **select.tsx** - Dropdown selection
- **card.tsx** - Card container with sections
- **badge.tsx** - Status/category badges
- **alert.tsx** - Alert messages

#### Layout Components
- **sidebar.tsx** - Navigation sidebar with mobile support
- **page-header.tsx** - Reusable page header with title

#### Card Components
- **complaint-card.tsx** - Complaint preview card

#### Form Components
- **complaint-form.tsx** - Complete form with validation

### `/lib` - Business Logic

#### Authentication (`/auth`)
- **jwt.ts** - Token generation & verification
- **password.ts** - Bcrypt password hashing
- **cookies.ts** - Cookie management
- **hooks.ts** - useAuth & useProtectedRoute hooks

#### Database (`/db`)
- **connection.ts** - MongoDB connection & pooling

#### Validation (`/validation`)
- **schemas.ts** - Zod validation schemas for all inputs

#### Utilities (`/utils`)
- **cn.ts** - Classname merger (clsx + tailwind-merge)
- **responses.ts** - Standardized API response helpers
- **formatting.ts** - Date, status, priority formatting

#### Middleware (`/middleware`)
- **api.ts** - withAuth, withAdminAuth, withErrorHandling wrappers

### `/models` - MongoDB Schemas

#### User Model
- Email (unique index)
- Password (hashed)
- Name
- Role (user/admin)
- Timestamps

#### Complaint Model
- Title
- Description
- Category (enum)
- Priority (Low/Medium/High)
- Status (Pending/In Progress/Resolved/Rejected)
- User reference
- Admin notes
- Timestamps
- Indexes: userId, status, priority, category, createdAt

### `/types` - TypeScript Definitions
- Enums: UserRole, ComplaintStatus, ComplaintPriority, ComplaintCategory
- Interfaces: JwtPayload, ApiResponse, PaginationOptions, FilterOptions

### `/styles` - Global Styles
- Tailwind CSS utilities
- Custom glassmorphism effects
- Neon glow animations
- Scrollbar styling
- Global components

## Authentication System

### Flow Diagram

```
Registration:
┌──────────────┐
│ User Input   │
└──────┬───────┘
       ↓
┌──────────────────┐
│ Validate (Zod)   │
└──────┬───────────┘
       ↓
┌──────────────────────┐
│ Hash Password        │
│ (bcrypt 10 rounds)   │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Save to MongoDB      │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Generate JWT Token   │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Set HTTP-only Cookie │
│ Return Token & User  │
└──────────────────────┘
```

```
Login:
┌──────────────┐
│ User Input   │
└──────┬───────┘
       ↓
┌──────────────────────┐
│ Find User in DB      │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Compare Passwords    │
│ (bcrypt verify)      │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Generate JWT Token   │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Set HTTP-only Cookie │
│ Redirect to Dashboard│
└──────────────────────┘
```

```
Protected Route Access:
┌──────────────────────────┐
│ Client Request           │
│ + Bearer Token/Cookie    │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Extract Token            │
│ (Header or Cookie)       │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Verify JWT Signature     │
│ & Expiration             │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Extract User Payload     │
│ (userId, email, role)    │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Check Authorization      │
│ (Role-based if needed)   │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│ Process Request          │
│ or Return 401/403        │
└──────────────────────────┘
```

## API Design

### Request/Response Pattern

```typescript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}

// Error Response
{
  "success": false,
  "message": "User-friendly message",
  "error": "Technical error details"
}
```

### Authentication Headers
```
Authorization: Bearer <JWT_TOKEN>

OR Cookie:
authToken=<JWT_TOKEN>; HttpOnly; SameSite=Strict
```

### Standard HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Database Relationships

```
User (1) ──────────── (Many) Complaint
  _id                    userId (ref: User._id)
  name                   status
  email                  priority
  password               category
  role                   title
  createdAt              description
  updatedAt              adminNotes
                         createdAt
                         updatedAt
```

## Data Flow Diagram

### Complaint Submission Flow
```
User Form
    ↓
Zod Validation
    ↓
POST /api/complaints
    ↓
JWT Verification
    ↓
Create Complaint in DB
    ↓
Return Complaint Data
    ↓
Update UI
    ↓
Redirect to History
```

### Complaint Filtering Flow
```
Admin Dashboard
    ↓
Filter Selection
    ↓
GET /api/complaints?status=Pending&priority=High
    ↓
Build MongoDB Query
    ↓
Execute with Indexes
    ↓
Return Paginated Results
    ↓
Render Table with Animations
```

## Security Layers

### Layer 1: Input Validation
- Zod schema validation on client
- Validation on server before processing
- Type checking with TypeScript

### Layer 2: Authentication
- JWT token with secret
- HTTP-only cookies (no XSS access)
- Token expiration (7 days)

### Layer 3: Authorization
- Role-based access control (RBAC)
- User can only access own complaints
- Admin can access all complaints

### Layer 4: Password Security
- Bcryptjs hashing (10 salt rounds)
- Passwords never stored in plain text
- Passwords never sent in responses

### Layer 5: API Protection
- Middleware validates all requests
- Checks token signature & expiration
- Verifies user permissions

## Performance Optimizations

### Database Optimizations
```typescript
// Indexes created automatically:
- User.email (unique)
- Complaint.userId
- Complaint.status
- Complaint.priority
- Complaint.category
- Complaint.createdAt (for sorting)
```

### Frontend Optimizations
- Server-side rendering (SSR)
- Image optimization
- Lazy component loading
- CSS-in-JS with Tailwind
- Code splitting

### Query Optimization
- Filter on database side
- Pagination (default 10 per page)
- Text search with regex
- Response data minimization

## Testing Strategy

### Unit Testing
- Validation schemas
- Password hashing
- JWT generation/verification
- Formatting utilities

### Integration Testing
- API endpoint flows
- Database operations
- Authentication cycle
- Authorization checks

### E2E Testing
- User registration flow
- Complaint submission
- Admin dashboard operations
- Filtering and search

## Deployment Architecture

```
Docker Compose
├── MongoDB Container
│   ├── Port 27017
│   ├── Volume: mongodb_data
│   └── Health Check Enabled
└── Next.js App Container
    ├── Port 3000
    ├── Multi-stage build
    ├── Volume mounts for development
    └── Health Check Enabled
```

## Error Handling Strategy

### Client-Side
- Form validation errors displayed immediately
- API errors shown in alerts
- User-friendly error messages
- Silent failures logged to console

### Server-Side
- Try-catch wrappers on all routes
- Zod validation error parsing
- MongoDB error handling
- JWT verification errors
- Authorization errors

### Logger Pattern
```typescript
try {
  // Operation
} catch (error) {
  console.error("Feature Error:", error);
  return NextResponse.json({ /* error */ }, { status: 500 });
}
```

## Environment Configuration

### Development
- Hot reload enabled
- Verbose logging
- Local MongoDB
- JWT expiration: 7 days

### Production/Docker
- Optimized builds
- Health checks enabled
- MongoDB in container
- Strict CORS policies
- JWT expiration: 7 days

## Future Enhancement Paths

### Phase 2
- Complaint categories management
- File upload support
- Email notifications
- SMS integration

### Phase 3
- Real-time updates with Socket.io
- Advanced analytics & charts
- Complaint assignment to staff
- Priority escalation workflows

### Phase 4
- AI-based complaint classification
- Mobile app
- Multi-language support
- Audit trails

## Monitoring & Observability

### Health Checks
```
GET /api/health (future endpoint)
- MongoDB connectivity
- Redis connectivity (if added)
- Memory usage
- Response time
```

### Logging
- API request/response logging
- Error stack traces
- User action audit trail
- Performance metrics

### Metrics to Track
- API response times
- Error rates by endpoint
- Complaint processing time
- User engagement metrics

---

This architecture ensures:
- ✅ Scalability through modular design
- ✅ Security through layered validation
- ✅ Maintainability through clean code
- ✅ Reliability through error handling
- ✅ Performance through optimizations
