# FlowBiz - Business Management Platform

> A comprehensive business management platform with invoicing, timesheets, expenses tracking, and client portal.

## 🚀 Project Status

**Current Phase:** Milestone 4 - Clients Module 🚧 **IN PROGRESS**

**Database:** ✅ Connected & Configured  
**Backend API:** ✅ Configured & Ready  
**Frontend:** ✅ Layouts & Routing Complete  
**Authentication:** ✅ JWT + bcrypt + Protected Routes  
**User Roles:** ✅ Role-based Access Control

---

## 📊 Database Connection

**Status:** ✅ Connected to Prisma Postgres

**Tables Created:** 8 tables
- ✅ Users (with role-based access)
- ✅ Clients
- ✅ Products & Services
- ✅ Invoices & Invoice Items
- ✅ Timesheets
- ✅ Expenses
- ✅ Business Settings

### View Your Database

Prisma Studio is running at: **http://localhost:51212**

Use Prisma Studio to visually inspect and manage your database.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + bcrypt ✅ Implemented
- **Storage:** AWS S3 (to be configured)
- **Deployment:** Vercel (frontend) + Railway/Render (backend)

---

## 🗓️ Development Milestones

### ✅ Week 1 - Project Setup **COMPLETED**
- [x] Next.js project setup
- [x] PostgreSQL + Prisma configuration
- [x] Database schema initialization
- [x] Node.js + Express backend setup
- [x] AWS S3 configuration
- [x] Base layouts & routing
- [x] CI/CD pipeline configuration

### ✅ Week 2 - Authentication & User Roles **COMPLETED**
- [x] JWT login/register
- [x] bcrypt password hashing
- [x] Protected routes + middleware
- [x] Role-based access (admin, contractor, client)

### ✅ Week 3 - Dashboard & Analytics **COMPLETED**
- [x] Revenue metrics APIs
- [x] Activities feed
- [x] Monthly revenue graph
- [x] Dashboard UI with charts

### 📅 Week 4 - Clients Module
- Client CRUD operations
- Search & validation
- Frontend listing + modals

### 📅 Week 5 - Products/Services & Business Settings
- Products/Services CRUD
- VAT settings
- Company info management
- Logo upload (S3)

### 📅 Week 6 - Invoicing System Core
- Create/Edit/Delete invoices
- Auto invoice numbering
- VAT calculations
- Invoice builder UI

### 📅 Week 7 - PDF Generation & Storage
- Server-side PDF generation
- S3 file upload
- Branded templates

### 📅 Week 8 - Timesheets & Expenses
- Timer + manual entries
- Receipt uploads
- Categories & filtering

### 📅 Week 9 - Email & Client Portal
- Invoice notifications
- Password reset
- Client portal access

### 📅 Week 10 - Testing & Deployment
- QA & bug fixes
- Performance optimization
- Production deployment

---

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env` file with:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
```

### Run Development Servers

```bash
# Run both frontend and backend together
npm run dev:all

# Or run separately:
npm run dev          # Frontend only (port 3000)
npm run dev:backend  # Backend API only (port 5000)
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Push schema changes to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your-migration-name
```

---

## 📁 Project Structure

```
FlowBiz/
├── src/
│   ├── app/              # Next.js App Router
│   ├── lib/              # Utilities & Prisma Client
│   └── generated/        # Generated Prisma types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json
```

---

## 🔐 Database Schema Overview

### User Roles
- **ADMIN** - Full system access
- **CONTRACTOR** - Create invoices, track time/expenses
- **CLIENT** - View own invoices (portal access)

### Core Features
- Multi-user support with role-based access
- Client management with contact details
- Products/Services catalog
- Invoice generation with VAT calculations
- Time tracking (timer + manual entries)
- Expense tracking with receipt uploads
- Business settings & branding

---

## 📝 Next Steps - Milestone 4 (Week 4)

Ready to start Milestone 4:

1. ✅ **Milestone 1 Complete!**
2. ✅ **Milestone 2 Complete!**
3. ✅ **Milestone 3 Complete!**
4. 🎯 Client CRUD operations
5. 🎯 Search & validation
6. 🎯 Frontend listing + modals

---

---

## 📖 Additional Documentation

- `PROJECT_SCOPE.md` - Complete 10-week milestone breakdown with budget
- `MILESTONE_1_COMPLETE.md` - Week 1 completion summary
- `MILESTONE_1_SUMMARY.md` - Detailed milestone breakdown
- `MILESTONE_2_COMPLETE.md` - Week 2 completion summary (Authentication & User Roles)
- `MILESTONE_3_COMPLETE.md` - Week 3 completion summary (Dashboard & Analytics)
- `CONTRIBUTING.md` - Contribution guidelines
- `KNOWN_ISSUES.md` - Known issues and workarounds

---

**Built with ❤️ for efficient business management**
