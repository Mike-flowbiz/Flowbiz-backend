Below is a much larger, execution-oriented test spec aligned with the actual FlowBiz UI (labels, buttons, modals, validations). You can paste the whole block into Claude and add: “Run every case in order; record Pass/Fail, URL, and screenshot on failure.”

Replace BASE_URL with your app origin (default http://localhost:3000).

0. Instructions for the browser tester (Claude)

Base URL: BASE_URL (e.g. http://localhost:3000).

Auth: The app uses cookies + optional localStorage token after login. Prefer one browser context per role when tests conflict (e.g. admin vs client).

Wait strategy: After navigation or submit, wait until loading spinners disappear or error/success UI appears (2–5 s typical).

Pass: Visible UI matches Expected; no blank crash; for destructive actions, confirm API error is user-visible if backend fails.

Fail: Wrong redirect, missing control, unhandled exception, or Expected not met.

Network (optional): Open DevTools → Network; confirm calls to listed API paths where noted.

Seeds: Run npm run seed:admin and npm run seed:m3 for repeatable data (demo user + invoices + clients).

Accounts (defaults from repo):

RoleEmailPasswordNotesADMINadmin@flowbiz.localFlowBizAdmin123!seed:adminADMIN (demo)demo@flowbiz.testPassword123!seed:m3CLIENTmanual DBmanualUser role=CLIENT and same email as a Client row

1. API surface (for optional verification)

MethodPathNotesGET/api/healthPublicPOST/api/auth/loginBody: email, passwordPOST/api/auth/registerBody: email, password, firstName, lastName, optional rolePOST/api/auth/logoutCookie sessionGET/api/auth/meCurrent userPOST/api/auth/forgot-password{ email }POST/api/auth/reset-password{ token, password }GET/api/dashboard/metricsAuthGET/api/dashboard/revenue-chartAuthGET/api/dashboard/activitiesAuthGET/POST/PUT/DELETE/api/clients, /api/clients/[id]AuthGET/POST/PUT/DELETE/api/products, /api/products/[id]AuthGET/POST/PUT/DELETE/api/invoices, /api/invoices/[id]AuthPOST/api/invoices/[id]/pdfGenerate PDFPOST/api/invoices/[id]/sendEmailGET/POST/PUT/DELETE/api/timesheets, /api/timesheets/[id]AuthGET/POST/PUT/DELETE/api/expenses, /api/expenses/[id]AuthGET/PUT/api/settingsTypically ADMINPOST/api/upload/logo, /api/upload/receiptMultipartGET/api/portal/invoices, /api/portal/invoices/[id]CLIENT

2. Public & routing

PUB-001 — Home page content

Steps: Open BASE_URL/.

Expected: Heading “Business Management Made Simple”; header FlowBiz; buttons Sign In (→ /login), Get Started (→ /register); hero CTA Start Free Trial (→ /register); feature cards (Invoicing, Time Tracking, Expense Management, Client Portal, Analytics, Secure & Reliable).

PUB-002 — Health endpoint

Steps: Open BASE_URL/api/health.

Expected: JSON includes "status":"OK" and message mentioning API running.

PUB-003 — Deep link protection (logged out)

Pre: Clear cookies for BASE_URL.

Steps: Visit BASE_URL/dashboard, BASE_URL/invoices, BASE_URL/portal.

Expected: Redirect to /login (after brief loading).

3. Login (/login)

AUTH-L-001 — Successful login (admin seed)

Steps: Go /login. Fill Email address admin@flowbiz.local, Password FlowBizAdmin123!. Click Sign in.

Expected: URL /dashboard. Sidebar FlowBiz; nav: Dashboard, Clients, Invoices, Products, Timesheets, Expenses, Settings. User area shows initials and role ADMIN.

AUTH-L-002 — Successful login (demo seed)

Pre: Logout if logged in.

Steps: Login with demo@flowbiz.test / Password123!.

Expected: /dashboard; role ADMIN (demo user is ADMIN in seed).

AUTH-L-003 — Invalid password

Steps: Login with valid email + wrong password.

Expected: Red error box; message contains Invalid credentials (or generic login failure). Stay on /login.

AUTH-L-004 — Empty submit (HTML5)

Steps: Clear fields; click Sign in.

Expected: Browser may block submit (required fields) — email/password required.

AUTH-L-005 — Links from login

Steps: On /login, click create a new account → /register. Back. Click Forgot password? → /forgot-password.

AUTH-L-006 — Remember me checkbox (UI only)

Steps: Toggle Remember me.

Expected: Checkbox toggles (no crash). (App may not implement persistence beyond UI.)

4. Registration (/register)

AUTH-R-001 — Happy path new contractor

Pre: Logout. Use unique email e.g. contractor.e2e+{timestamp}@test.com.

Steps: /register. Fill First name Test, Last name User, email, password ≥6 chars, confirm same. Submit.

Expected: Lands on /dashboard; user acts as CONTRACTOR (default registration).

AUTH-R-002 — Password mismatch

Steps: Password aaaaaa, confirm bbbbbb. Submit.

Expected: Red error Passwords do not match; no navigation.

AUTH-R-003 — Short password

Steps: Password 12345 (5 chars). Submit.

Expected: Error Password must be at least 6 characters.

AUTH-R-004 — Duplicate email

Steps: Register again with same email as AUTH-R-001.

Expected: Error indicating email exists (Email already registered or similar).

AUTH-R-005 — Link to login

Steps: Click Sign in on register page.

Expected: /login.

5. Logout & session

AUTH-X-001 — Logout from dashboard

Steps: While logged in, click logout icon in sidebar footer.

Expected: /login. /dashboard redirects to login.

AUTH-X-002 — Session restore

Steps: Login, refresh page (F5).

Expected: Still authenticated; dashboard loads (may show loading then content).

6. Forgot / reset password

AUTH-F-001 — Forgot password submit

Steps: /forgot-password. Enter registered email. Click Send reset link.

Expected: Green success panel Check your email with text about If {email} is registered…; link ← Back to sign in.

AUTH-F-002 — Forgot password invalid email handling

Steps: Use obviously invalid format if browser allows, or submit empty (required).

Expected: Validation or error; no crash.

AUTH-RST-001 — Reset page without token

Steps: Open /reset-password (no query).

Expected: Red error Invalid or missing reset token; Reset password button disabled (disabled={loading || !token}).

AUTH-RST-002 — Reset with dummy token

Steps: /reset-password?token=fake. Enter new password ≥6, matching confirm. Submit.

Expected: API error in red box (invalid/expired token) — not a blank page.

AUTH-RST-003 — Password mismatch on reset

Steps: /reset-password?token=anything. Two different passwords ≥6. Submit.

Expected: Passwords do not match.

AUTH-RST-004 — Short password on reset

Steps: Password 12345, matching.

Expected: Password must be at least 6 characters.

7. Role-based access

RBAC-001 — Contractor / admin cannot use client portal URL

Pre: Logged in as demo@flowbiz.test or contractor.

Steps: Navigate to /portal.

Expected: Redirect to /dashboard (ProtectedRoute sends non-CLIENT away).

RBAC-002 — Settings page admin-only

Pre: Log in as contractor (from AUTH-R-001).

Steps: Click sidebar Settings OR go /settings.

Expected: SettingsPage uses ProtectedRoute allowedRoles={[ADMIN]} — user redirected to /dashboard (not CLIENT portal).

RBAC-003 — Admin can open settings

Pre: Login admin@flowbiz.local.

Steps: /settings.

Expected: Title Business Settings; form loads.

RBAC-004 — Client cannot open staff dashboard

Pre: CLIENT user (see §15).

Steps: Visit /dashboard.

Expected: Redirect to /portal.

8. Dashboard (/dashboard)

DASH-001 — Layout and copy

Steps: As seeded admin, open /dashboard.

Expected: H1 Dashboard; subtitle Welcome to FlowBiz - Your business management platform.

DASH-002 — Metric cards

Expected: Four cards: This Month Revenue (shows Loading... then GBP or —); Pending Invoices + subtext Total pending:; Overdue Invoices; Active Clients. If API fails, — on revenue card.

DASH-003 — Revenue chart

Expected: Section Revenue Overview (Last 6 Months). Either Loading chart…, bar chart with month labels, Unable to load revenue data (red), or No revenue data available yet.

DASH-004 — Recent activity

Expected: Recent Activity — loading, error Unable to load recent activity, No recent activity., or rows with INV / CL badges.

DASH-005 — Sidebar navigation

Steps: Click each: Dashboard, Clients, Invoices, Products, Timesheets, Expenses, Settings (admin).

Expected: Each route loads; active state highlights current item.

DASH-006 — Mobile menu (if narrow viewport)

Steps: Resize width < lg, open menu from top bar.

Expected: Sidebar opens; backdrop click closes (layout has mobile controls).

9. Clients (/clients)

CLI-001 — Page header

Expected: Clients; Manage your client relationships; button Add Client.

CLI-002 — Search debounce

Steps: Type slowly in Search clients by name, email, or company....

Expected: List updates (~300ms debounce); footer Showing N client(s) when data present.

CLI-003 — Filters All / Active / Inactive

Steps: Click All, Active, Inactive.

Expected: Highlight changes; table filters (inactive clients from seed if present).

CLI-004 — Empty state

Pre: Filter so no results OR fresh DB.

Expected: No clients found; hint to adjust search or Get started by adding your first client.

CLI-005 — Add client — validation (modal)

Steps: Add Client. Leave Name empty, submit.

Expected: Name is required.

CLI-006 — Add client — invalid email

Steps: Name A, Email not-an-email. Submit.

Expected: Please enter a valid email address.

CLI-007 — Add client — success

Steps: Name E2E Client, Email e2e.client+{ts}@test.com, optional Phone, Company, VAT, Address, Notes. Submit Add Client.

Expected: Modal closes; new row in table; Active badge; Edit/Delete visible.

CLI-008 — Edit client — inactive toggle

Steps: Edit on CLI-007. Uncheck Active client. Save Changes.

Expected: Status Inactive (red badge). Active filter hides it.

CLI-009 — Delete client — cancel

Steps: Delete → modal Delete Client → Cancel.

Expected: Client still in list.

CLI-010 — Delete client — confirm

Steps: Delete → Delete Client.

Expected: Row removed; list refetches.

CLI-011 — Error retry

Pre: Simulate failure only if you can (e.g. stop API).

Expected: Try again link visible on error state.

10. Products (/products)

PRD-001 — Header and filters

Expected: Products & Services; Add Product. Search placeholder Search products by name, description, or category...; All Types, Products, Services; second group All / Active / Inactive.

PRD-002 — Add product — validation name

Steps: Add Product → submit empty name.

Expected: Name is required.

PRD-003 — Add product — validation price

Steps: Name Item, clear price or negative.

Expected: Price is required or Price must be a valid positive number.

PRD-004 — Add product — success

Steps: Name Consulting, Type Service, Price 100, Unit hour, Category Dev. Add Product.

Expected: Row in table; SERVICE badge; price £100.00 per hour.

PRD-005 — Edit product

Steps: Edit → change price; Save Changes.

PRD-006 — Delete product

Steps: Delete Product confirm.

11. Invoices — list (/invoices)

INV-L-001 — Header and filters

Expected: Invoices; Create Invoice. Filter pills: All, DRAFT, SENT, PAID, OVERDUE, CANCELLED.

INV-L-002 — Table columns

Expected: Number (link), Client, Status, Due Date, Total, Actions: Send/Resend, PDF, Edit, Delete (Send hidden if CANCELLED per code).

INV-L-003 — Filter by status

Steps: Click PAID.

Expected: Only PAID rows (or empty state Try changing the filter).

INV-L-004 — Navigate to detail

Steps: Click invoice number link.

Expected: URL /invoices/{id} detail page.

INV-L-005 — Create invoice — no client

Steps: Create Invoice → leave Client as Select client → Create Invoice.

Expected: Please select a client.

INV-L-006 — Create invoice — no line items

Steps: Select any client; clear line description/quantity.

Expected: Add at least one line item with description, quantity and unit price.

INV-L-007 — Create invoice — happy path

Steps: Client: pick seeded client. Due Date optional. Notes optional. Line: Description Line A, Qty 2, Unit Price 50. Observe footer Subtotal, VAT (X%), Total. Create Invoice.

Expected: Modal closes; new row; status DRAFT (new invoices).

INV-L-008 — Line items: add/remove row

Steps: Create Invoice → + Add line → second row appears; trash on row (disabled when only one line).

INV-L-009 — Product dropdown fills line

Pre: Product from PRD-004.

Steps: In line Product dropdown select product.

Expected: Description and unit price populate from product.

INV-L-010 — Edit invoice status

Steps: Edit on a draft → Status dropdown: Draft/Sent/Paid/Overdue/Cancelled → Save Changes.

INV-L-011 — PDF button — no existing PDF

Steps: PDF on invoice without pdfUrl.

Expected: Button shows Loading… briefly; new tab or download OR alert with error if PDF fails.

INV-L-012 — Send invoice

Steps: Send on non-cancelled invoice.

Expected: confirm() browser dialog — accept → Sending… then alert Invoice {number} sent successfully! OR error alert if SMTP missing.

INV-L-013 — Delete invoice

Steps: Delete → confirm Delete in modal.

12. Invoice detail (/invoices/[id])

INV-D-001 — Header actions

Expected: Back to Invoices; title Invoice {number}; status pill; Back to list; View PDF or Download PDF (depending on pdfUrl).

INV-D-002 — Bill to & dates

Expected: Bill to client name/email; Issue date, Due date.

INV-D-003 — Line table & totals

Expected: Columns Description, Qty, Unit price, Amount; Subtotal, VAT (rate%), Total in GBP.

INV-D-004 — Notes section

Pre: Invoice with notes.

Expected: Notes heading and text.

INV-D-005 — Invalid id

Steps: /invoices/00000000-0000-0000-0000-000000000000 (or bad id).

Expected: Red box error; link ← Back to Invoices.

13. Timesheets (/timesheets)

TS-001 — Header buttons

Expected: Timesheets; Log Time; Start Timer (disabled when timer active).

TS-002 — Log time — validation

Steps: Log Time → Log Time without valid hours (0 or empty).

Expected: Please enter a valid number of hours.

TS-003 — Log time — success

Steps: Log Time; optional Client; Description Manual entry; Date today; Hours 2.5; Log Time.

Expected: Row Type Manual; hours formatted.

TS-004 — Start / stop timer

Steps: Start Timer → optional client/description → Start Timer.

Expected: Timer Running card; elapsed HH:MM:SS; Log Time/Start Timer disabled. Click Stop Timer → entry appears with Timer type.

TS-005 — Filters

Steps: Set Client, From, To; observe Total Hours (filtered). Clear resets.

TS-006 — Edit entry

Steps: Edit → change hours → Save Changes.

TS-007 — Delete entry

Steps: Delete → Delete in Delete Entry modal.

TS-008 — Empty state

Pre: Filters excluding all data.

Expected: No time entries found; message to start timer or log time.

14. Expenses (/expenses)

EXP-001 — Summary cards

Expected: Total + count; category cards Travel, Supplies, Equipment, Software, Meals with GBP totals.

EXP-002 — Category filter buttons

Steps: Click All, Travel, … Other.

Expected: Table filters; empty state may suggest Try changing the filters.

EXP-003 — Date filters

Steps: From / To; Clear dates appears when set.

EXP-004 — Add expense — validation description

Steps: Add Expense → empty description.

Expected: Description is required.

EXP-005 — Add expense — validation amount

Steps: Invalid amount.

Expected: Please enter a valid amount.

EXP-006 — Add expense — success without receipt

Steps: Date, Amount 25.50, Category Software, Description License. Add Expense.

Expected: Row in table; Receipt — or View if uploaded.

EXP-007 — Receipt upload UI

Steps: Add Expense → click dashed Click to upload receipt → pick small JPG/PDF.

Expected: Uploading… then green Receipt uploaded link OR upload error text (S3); note: (you can still save without a receipt) if error.

EXP-008 — Edit / delete

Steps: Edit → Save Changes; Delete → confirm.

15. Settings (/settings) — ADMIN only

SET-001 — Load

Pre: Admin user.

Expected: Business Settings; Configure your business information and preferences; form fields: company name, email, phone, address, VAT number, VAT rate, bank details, primaryColor, secondaryColor, logo area.

SET-002 — Validation company name

Steps: Clear Company name, save.

Expected: Company name is required.

SET-003 — Validation VAT

Steps: VAT rate 101 or -1.

Expected: VAT rate must be between 0 and 100.

SET-004 — Save settings

Steps: Valid company name + VAT; Save (submit).

Expected: alert Settings saved successfully!; values persist after refresh.

SET-005 — Logo — client-side image check

Steps: Choose non-image file if OS allows.

Expected: Please select an image file or size less than 5MB for large files.

SET-006 — Logo upload flow

Steps: Select small PNG; save (triggers upload then PUT).

Expected: Success or clear API error if S3 not configured.

16. Client portal (/portal) — CLIENT user

Setup (manual): In DB: create Client with email portal.user@test.com. Create User with same email, role=CLIENT, bcrypt password. Create at least one Invoice for that clientId.

PRT-001 — Login lands on portal

Steps: Login as CLIENT.

Expected: URL /portal; header FlowBiz | Client Portal; Sign out.

PRT-002 — Summary cards

Expected: Total Invoices, Outstanding (red), Total Paid (green).

PRT-003 — Welcome text

Expected: Welcome, {client.name} if client found; company name subtitle if set.

PRT-004 — Status filters

Steps: All, DRAFT, SENT, …

Expected: List filters; Show all invoices when filtered empty.

PRT-005 — Expand row

Steps: Click invoice row.

Expected: Expands line items + subtotal/VAT/total; Notes if present.

PRT-006 — PDF button

Steps: Click PDF or View.

Expected: Opens URL or browser alert PDF not yet available for this invoice. Please contact us.

PRT-007 — No client record for email

Pre: CLIENT user with no matching Client.email.

Expected: Error No client account found for this email address. with Try again.

PRT-008 — Logout

Steps: Sign out.

Expected: /login.

17. Cross-module / integration flows

X-001 — Invoice uses client + product

Steps: Create client → create product → create invoice selecting that client and product on line → save → open detail → PDF.

X-002 — Timesheet + client

Steps: Create client → log time with that client → filter timesheet by client.

X-003 — Expense totals

Steps: Add expenses in multiple categories → Total and category cards update.

18. Negative / edge cases

NEG-001 — Double submit

Steps: Rapid double-click Sign in / Create Invoice.

Expected: No duplicate navigation or broken state (button disabled while loading).

NEG-002 — Modal dismiss

Steps: Open any modal; click backdrop.

Expected: Modal closes (clients, invoices, products, etc.).

NEG-003 — Browser back

Steps: Login → dashboard → browser Back.

Expected: Sensible behavior (may show login or cached page); no infinite loop.

19. Checklist for “whole project” coverage

AreaCase IDsPublicPUB-001–003Login/LogoutAUTH-L-001–006, AUTH-X-001–002RegisterAUTH-R-001–005Forgot/ResetAUTH-F-001–002, AUTH-RST-001–004RBACRBAC-001–004DashboardDASH-001–006ClientsCLI-001–011ProductsPRD-001–006Invoices listINV-L-001–013Invoice detailINV-D-001–005TimesheetsTS-001–008ExpensesEXP-001–008SettingsSET-001–006PortalPRT-001–008IntegrationX-001–003EdgeNEG-001–003

✅ Admin user ready:

   Email:    admin@flowbiz.local

   Password: FlowBizAdmin123!

   Role:     ADMIN

test this project carefully and i allowed all things just do and give me detailed report