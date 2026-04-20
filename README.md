# FlowBiz - Business Management Platform

> A comprehensive business management platform with invoicing, timesheets, expenses tracking, and client portal.

## 🚀 Project Status

**Current Phase:** ✅ **PROJECT COMPLETE — All 10 Milestones Delivered**

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

### ✅ Week 4 - Clients Module **COMPLETED**
- [x] Client CRUD operations
- [x] Search & validation
- [x] Frontend listing + modals

### ✅ Week 5 - Products/Services & Business Settings **COMPLETED**
- [x] Products/Services CRUD
- [x] VAT settings
- [x] Company info management
- [x] Logo upload (S3)
- [x] Branding colors

### ✅ Week 6 - Invoicing System Core **COMPLETED**
- [x] Create/Edit/Delete invoices
- [x] Auto invoice numbering
- [x] VAT calculations
- [x] Invoice builder UI

### ✅ Week 7 - PDF Generation & Storage **COMPLETED**
- [x] Server-side PDF generation
- [x] S3 file upload
- [x] Branded templates (logo, company info)
- [x] View/Download PDF in UI

### ✅ Week 8 - Timesheets & Expenses **COMPLETED**
- [x] Timer + manual time entries
- [x] Receipt uploads (S3)
- [x] Categories & filtering

### ✅ Week 9 - Email & Client Portal **COMPLETED**
- [x] Invoice email notifications (send with PDF attachment)
- [x] Password reset flow (forgot/reset pages + API)
- [x] Client portal (CLIENT role, own invoices, PDF download)

### ✅ Week 10 - Testing & Deployment **COMPLETED**
- [x] Bug fixes (dashboard auth, next.config, email env vars)
- [x] Security headers + serverExternalPackages
- [x] `.env.example` with all variables documented
- [x] `vercel.json` deployment config
- [x] `DEPLOYMENT.md` full production guide

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
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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

### Admin login (local development)

After `npx prisma db push`, create a default admin user:

```bash
npm run seed:admin
```

Default credentials (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

- **Email:** `admin@flowbiz.local`
- **Password:** `FlowBizAdmin123!`

Sign in at `/login`, then change the password in production.

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

## 📖 Additional Documentation

- `PROJECT_SCOPE.md` - Complete 10-week milestone breakdown with budget
- `MILESTONE_1_COMPLETE.md` - Week 1 completion summary
- `MILESTONE_1_SUMMARY.md` - Detailed milestone breakdown
- `MILESTONE_2_COMPLETE.md` - Week 2 completion summary (Authentication & User Roles)
- `MILESTONE_3_COMPLETE.md` - Week 3 completion summary (Dashboard & Analytics)
- `MILESTONE_4_COMPLETE.md` - Week 4 completion summary (Clients Module)
- `MILESTONE_5_COMPLETE.md` - Week 5 completion summary (Products & Services + Business Settings)
- `MILESTONE_6_COMPLETE.md` - Week 6 completion summary (Invoicing System Core)
- `MILESTONE_7_COMPLETE.md` - Week 7 completion summary (PDF Generation & Storage)
- `MILESTONE_8_COMPLETE.md` - Week 8 completion summary (Timesheets & Expenses)
- `MILESTONE_9_COMPLETE.md` - Week 9 completion summary (Email & Client Portal)
- `MILESTONE_10_COMPLETE.md` - Week 10 completion summary (Testing & Deployment)
- `DEPLOYMENT.md` - Full production deployment guide
- `CONTRIBUTING.md` - Contribution guidelines
- `KNOWN_ISSUES.md` - Known issues and workarounds

---

**Built with ❤️ for efficient business management**



