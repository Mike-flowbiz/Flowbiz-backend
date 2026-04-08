# FlowBiz — Deployment Guide

This guide covers production deployment of FlowBiz on **Vercel** (frontend + API) with a **PostgreSQL** database.

---

## Prerequisites

- Node.js 18+
- A PostgreSQL database (Prisma Postgres / Railway / Render / Supabase)
- A Vercel account
- (Optional) AWS S3 bucket for file uploads
- (Optional) SMTP credentials for email

---

## 1. Database Setup

### Option A — Prisma Postgres (recommended, already configured)
Your existing `DATABASE_URL` in `.env` points to Prisma Postgres. Use that directly.

### Option B — Railway
1. Create a new PostgreSQL service at [railway.app](https://railway.app)
2. Copy the `DATABASE_URL` from Railway → Variables

### Option C — Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Settings → Database → Connection String (URI mode)

### Push the schema
```bash
npx prisma db push
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Long random secret — `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app's public URL (e.g. `https://flowbiz.vercel.app`) |
| `AWS_ACCESS_KEY_ID` | Optional | S3 file uploads (logo, receipts, PDFs) |
| `AWS_SECRET_ACCESS_KEY` | Optional | S3 |
| `AWS_REGION` | Optional | e.g. `eu-west-2` |
| `AWS_S3_BUCKET` | Optional | S3 bucket name |
| `SMTP_HOST` | Optional | Invoice emails + password reset |
| `SMTP_PORT` | Optional | Default `587` |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password |
| `SMTP_FROM` | Optional | From address, e.g. `FlowBiz <noreply@example.com>` |

> Without S3: PDF generation works but files won't be stored (streamed directly).  
> Without SMTP: Invoice send and password reset emails will return 503.

---

## 3. AWS S3 Setup (optional)

1. **Create an S3 bucket** in your chosen region
2. **Bucket policy** — allow public read for the `logos/` prefix (or use presigned URLs)
3. **CORS configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-app.vercel.app"],
    "ExposeHeaders": []
  }
]
```
4. **IAM user** with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions on your bucket
5. Copy the Access Key ID and Secret to your env vars

---

## 4. SMTP Email Setup (optional)

### Gmail (easiest for testing)
1. Enable 2FA on your Google account
2. Generate an **App Password**: Google Account → Security → App Passwords
3. Set:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=FlowBiz <your@gmail.com>
   ```

### Mailgun / SendGrid / Resend
Follow your provider's SMTP docs and set the variables accordingly.

### AWS SES
```
SMTP_HOST=email-smtp.eu-west-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=<SMTP username from SES>
SMTP_PASS=<SMTP password from SES>
```

---

## 5. Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — GitHub Integration
1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Vercel auto-detects Next.js and uses the settings in `vercel.json`
4. Add all environment variables in **Project Settings → Environment Variables**
5. Deploy

### After deployment
```bash
# Run database migration (one-time, from local with production DATABASE_URL)
DATABASE_URL="<your-production-url>" npx prisma db push
```

---

## 6. First-Time Setup

### Option A — Seed an admin user (recommended)

From your machine with `DATABASE_URL` pointing at the target database:

```bash
npx prisma db push
npm run seed:admin
```

Default login (change immediately in production, or set env vars when seeding):

| Field | Value |
|-------|--------|
| Email | `admin@flowbiz.local` |
| Password | `FlowBizAdmin123!` |

Override defaults:

```bash
ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='YourSecurePass1!' npm run seed:admin
```

### Option B — Manual promotion

1. Navigate to `https://your-app.vercel.app/register`
2. Register with your details
3. In Prisma Studio or directly in the DB, set `role = 'ADMIN'` on your user row:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```
4. Log in — you now have full admin access

### Create a Client Portal user
1. Register a user with the email that matches a Client record's email
2. In the DB, set `role = 'CLIENT'` on that user
3. That user will be redirected to `/portal` after login and can view their invoices

---

## 7. Build & Run Locally (production mode)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Start
npm start
```

---

## 8. Checklist Before Go-Live

- [ ] `JWT_SECRET` is a long, random, unique secret (not the default)
- [ ] `NEXT_PUBLIC_APP_URL` is set to the live domain
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Admin user created and role set to `ADMIN`
- [ ] Business Settings filled in (company name, VAT rate, bank details)
- [ ] S3 bucket configured (if using file uploads)
- [ ] SMTP credentials verified (send a test invoice)
- [ ] `NODE_ENV=production` in Vercel env vars

---

## 9. Monitoring & Maintenance

- **Logs:** Vercel Dashboard → Deployments → Functions log
- **Database:** Run `npx prisma studio` locally (point `DATABASE_URL` at production) to inspect data
- **Backups:** Set up automated backups on your DB provider

---

**Built with Next.js 16, Prisma, PostgreSQL, AWS S3, Nodemailer.**
