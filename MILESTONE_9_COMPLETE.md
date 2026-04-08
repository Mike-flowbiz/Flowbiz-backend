# Milestone 9 - Email & Client Portal ✅ COMPLETED

**Date:** April 2026  
**Status:** ✅ **100% COMPLETE**

---

## 📋 All Deliverables Completed

### ✅ 1. Invoice Email Notifications
- `POST /api/invoices/[id]/send` — generates PDF, attaches it to email, sends to client
- Branded HTML email with invoice details, totals, and a "View PDF" button (if S3 URL available)
- Marks invoice status → SENT, sets `sentAt` timestamp, stores `pdfUrl` if upload succeeds
- "Send" / "Resend" action button added to every non-cancelled invoice in the invoices list
- **Status:** COMPLETE

### ✅ 2. Password Reset Flow
- `POST /api/auth/forgot-password` — generates secure 32-byte random token (1h expiry), sends reset email. Returns success regardless of whether email exists (prevents enumeration)
- `POST /api/auth/reset-password` — validates token + expiry, updates hashed password, clears token
- `/forgot-password` page — email form with success confirmation state
- `/reset-password?token=…` page — new password + confirm form, auto-redirects to login on success
- "Forgot password?" link on login page now navigates to `/forgot-password`
- `resetToken` + `resetTokenExpiry` fields added to User schema
- **Status:** COMPLETE

### ✅ 3. Client Portal
- `GET /api/portal/invoices` — CLIENT-only route, auto-scopes to invoices for the client whose email matches the logged-in user
- `GET /api/portal/invoices/[id]` — single invoice with ownership check
- `/portal` page — expandable invoice list with status filter, outstanding/paid summary cards, inline line-item breakdown, PDF download button
- `(portal)` route group with minimal top-bar layout (no sidebar — clients only see invoices)
- CLIENT users are auto-redirected to `/portal` after login; ADMIN/CONTRACTOR go to `/dashboard`
- Dashboard layout now restricted to `ADMIN` and `CONTRACTOR` roles; CLIENT users attempting to access `/dashboard` are redirected to `/portal`
- **Status:** COMPLETE

---

## 🏗️ Implementation Details

### Email System (`src/backend/utils/email.ts`)
- Nodemailer SMTP transport; configured via env vars:  
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SECURE`
- `isEmailConfigured()` — graceful no-op detection (503 response if not set up)
- `buildInvoiceEmail()` — branded HTML template with invoice table, totals, view button, notes
- `buildPasswordResetEmail()` — security-conscious template with expiry warning

### New API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/invoices/[id]/send` | POST | Generate PDF, send to client email, mark SENT |
| `/api/auth/forgot-password` | POST | Generate reset token, send email |
| `/api/auth/reset-password` | POST | Validate token, update password |
| `/api/portal/invoices` | GET | CLIENT: list own invoices |
| `/api/portal/invoices/[id]` | GET | CLIENT: get single invoice (ownership check) |

### Schema Changes (`prisma/schema.prisma`)
```
model User {
  ...
  resetToken         String?
  resetTokenExpiry   DateTime?
  ...
}
```
> Run `npx prisma db push` to apply to database.

### Frontend Changes

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | CLIENT role → redirect to `/portal` after login/register |
| `src/components/ProtectedRoute.tsx` | Role-mismatch redirects CLIENT to `/portal`, others to `/dashboard` |
| `src/app/(dashboard)/layout.tsx` | Restricted to `ADMIN` + `CONTRACTOR` roles |
| `src/app/(dashboard)/invoices/page.tsx` | Send / Resend button per invoice row |
| `src/app/(auth)/login/page.tsx` | "Forgot password?" → real link to `/forgot-password` |

### New Frontend Pages

| Page | Description |
|------|-------------|
| `/forgot-password` | Email input form; success state with instructions |
| `/reset-password` | Token + new password form; auto-redirect on success |
| `/portal` | Client invoice list with expandable details and PDF download |

### Dependencies Added
- `nodemailer` + `@types/nodemailer`

---

## 🚀 Next Steps (Milestone 10)

- QA & bug fixes across all modules
- Performance optimisation
- Production deployment (Vercel + Railway/Render)

---

**MILESTONE 9 IS COMPLETE!** 🎉
