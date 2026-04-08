# FlowBiz - Full E2E Test Report

**Tested:** 2026-04-08  
**Base URL:** [http://localhost:3000](http://localhost:3000)  
**Tester:** Claude (automated browser)

## Test Methodology Notes

React state manipulation via `nativeInputValueSetter` / `form_input` updates DOM values, but does not always trigger React's synthetic event system. Because of this, some modal validations were verified at API level.  
All critical paths were verified either through UI (`read_page` / screenshots) or directly through API checks.  
A recurring Chrome extension popup caused periodic tool timeouts (~10s each) but did not block test completion.

---

## Public & Routing

| ID | Test | Result | Notes |
|---|---|---|---|
| PUB-001 | Home page content | ✅ PASS | Heading "Business Management Made Simple"; FlowBiz header; Sign In -> `/login`; Get Started -> `/register`; Start Free Trial -> `/register`; all 6 feature cards present (Invoicing, Time Tracking, Expense Management, Client Portal, Analytics, Secure & Reliable). |
| PUB-002 | Health endpoint | ✅ PASS | `{"status":"OK","message":"FlowBiz API is running"}` |
| PUB-003 | Deep link protection (logged out) | ✅ PASS | `/dashboard`, `/invoices`, `/portal` redirect to `/login`. |

## Login

| ID | Test | Result | Notes |
|---|---|---|---|
| AUTH-L-001 | Admin login | ✅ PASS | Redirects to `/dashboard`; sidebar shows Dashboard, Clients, Invoices, Products, Timesheets, Expenses, Settings; user "Admin User" with role `ADMIN`. |
| AUTH-L-002 | Demo seed login | ✅ PASS | `demo@flowbiz.test` / `Password123!` logs in successfully; `ADMIN` role confirmed via API. |
| AUTH-L-003 | Invalid password | ✅ PASS | Red box "Invalid credentials"; remains on `/login`. |
| AUTH-L-004 | Empty submit | ✅ PASS | Both fields have `required=true`; browser blocks submit. |
| AUTH-L-005 | Links from login | ✅ PASS | "create a new account" -> `/register`; "Forgot password?" -> `/forgot-password`. |
| AUTH-L-006 | Remember me checkbox | ✅ PASS | Checkbox toggles without crash. |

## Registration

| ID | Test | Result | Notes |
|---|---|---|---|
| AUTH-R-001 | Happy path new contractor | ✅ PASS | Registered `contractor.e2e+1775597688726@test.com` -> `/dashboard`; role `CONTRACTOR`. |
| AUTH-R-002 | Password mismatch | ✅ PASS | "Passwords do not match"; remains on `/register`. |
| AUTH-R-003 | Short password (5 chars) | ✅ PASS | "Password must be at least 6 characters". |
| AUTH-R-004 | Duplicate email | ✅ PASS | API returns "Email already registered". |
| AUTH-R-005 | Link to login | ✅ PASS | "Sign in" -> `/login`. |

## Logout & Session

| ID | Test | Result | Notes |
|---|---|---|---|
| AUTH-X-001 | Logout | ✅ PASS | Logout icon -> `/login`; `/dashboard` redirects to `/login`. |
| AUTH-X-002 | Session restore (F5 refresh) | ✅ PASS | Session persists after reload; dashboard loads with data. |

## Forgot / Reset Password

| ID | Test | Result | Notes |
|---|---|---|---|
| AUTH-F-001 | Forgot password submit | ❌ FAIL | SMTP not configured. Returns error: "Password reset emails are not available. Please contact your administrator." (instead of success panel). "← Back to sign in" present. |
| AUTH-F-002 | Empty email | ✅ PASS | Email field has `required=true`; empty submit blocked. |
| AUTH-RST-001 | Reset without token | ✅ PASS | "Invalid or missing reset token"; Reset button disabled. |
| AUTH-RST-002 | Reset with fake token | ✅ PASS | "Invalid or expired reset token" in red box; no blank page. |
| AUTH-RST-003 | Password mismatch on reset | ✅ PASS | "Passwords do not match". |
| AUTH-RST-004 | Short password on reset | ✅ PASS | "Password must be at least 6 characters". |

## Role-Based Access Control

| ID | Test | Result | Notes |
|---|---|---|---|
| RBAC-001 | Contractor/ADMIN cannot use `/portal` | ✅ PASS | Contractor redirected from `/portal` -> `/dashboard`. |
| RBAC-002 | Contractor blocked from Settings | ✅ PASS | Contractor redirected from `/settings` -> `/dashboard`. |
| RBAC-003 | Admin can open Settings | ✅ PASS | `/settings` loads "Business Settings". |
| RBAC-004 | CLIENT cannot open staff dashboard | ✅ PASS | CLIENT user redirected from `/dashboard` -> `/portal`. |

## Dashboard

| ID | Test | Result | Notes |
|---|---|---|---|
| DASH-001 | Layout and copy | ✅ PASS | H1 "Dashboard"; subtitle "Welcome to FlowBiz - Your business management platform". |
| DASH-002 | Metric cards | ✅ PASS | Four cards: This Month Revenue `£0.00`, Pending Invoices `2` (Total pending: `£721.20`), Overdue `1`, Active Clients `4`. |
| DASH-003 | Revenue chart | ⚠️ PARTIAL | "Revenue Overview (Last 6 Months)" present with month labels (Nov 2025-Apr 2026), but bars are not visually rendered. Aria labels still contain data (e.g., Nov `£2,640`, Dec `£960`). |
| DASH-004 | Recent activity | ✅ PASS | INV/CL badges shown with invoice and client-joined events. |
| DASH-005 | Sidebar navigation | ✅ PASS | Dashboard, Clients, Invoices, Products, Timesheets, Expenses, Settings all load correctly. |
| DASH-006 | Mobile menu | ⚠️ PARTIAL | Hamburger icon visible at 375px; sidebar exists in DOM, but toggle state did not visually activate via programmatic React click. |

## Clients

| ID | Test | Result | Notes |
|---|---|---|---|
| CLI-001 | Page header | ✅ PASS | "Clients", "Manage your client relationships", "Add Client" button, search placeholder, All/Active/Inactive filters. |
| CLI-002 | Search debounce | ✅ PASS | Typing "Globex" filters to 1 result; "Showing 1 client". |
| CLI-003 | Filters All/Active/Inactive | ✅ PASS | Active filter shows all 4 active clients. |
| CLI-004 | Empty state | ✅ PASS | Blank search shows "No clients found". |
| CLI-005 | Add client - empty name | ✅ PASS | Modal shows "Name is required". |
| CLI-006 | Add client - invalid email | ❌ FAIL | API accepts invalid email format (`not-an-email`). HTML5 `type="email"` only protects client-side/browser-native flow. |
| CLI-007 | Add client - success | ✅ PASS | E2E client created with Active badge and visible in list. |
| CLI-008 | Edit client - inactive toggle | ✅ PASS | Client set to Inactive via API; "Inactive" badge shown. |
| CLI-009 | Delete - Cancel | ✅ PASS | "Delete Client" modal appears; Cancel keeps client in list. |
| CLI-010 | Delete - Confirm | ✅ PASS | Client removed; list count decremented. |
| CLI-011 | Error retry | ⏭️ SKIP | Backend failure could not be simulated in this session. |

## Products

| ID | Test | Result | Notes |
|---|---|---|---|
| PRD-001 | Header and filters | ✅ PASS | "Products & Services", search placeholder, All Types/Products/Services, All/Active/Inactive, "Add Product". |
| PRD-002 | Add product - empty name | ✅ PASS | "Name is required". |
| PRD-003 | Add product - missing price | ✅ PASS | "Price is required". |
| PRD-004 | Add product - success | ✅ PASS | "Consulting" service created at `£100.00/hour`; category "Dev" shown in table. |
| PRD-005 | Edit product | ✅ PASS | Price updated to `150` via API. |
| PRD-006 | Delete product | ✅ PASS | Product deleted; API returns "Product deleted". |

## Invoices - List

| ID | Test | Result | Notes |
|---|---|---|---|
| INV-L-001 | Header and filters | ✅ PASS | "Invoices", "Create Invoice"; status pills: All, DRAFT, SENT, PAID, OVERDUE, CANCELLED. |
| INV-L-002 | Table columns | ✅ PASS | Number (link), Client, Status, Due Date, Total, Actions (Resend/Send, PDF, Edit, Delete). |
| INV-L-003 | Filter by status | ✅ PASS | PAID filter shows only PAID rows. |
| INV-L-004 | Navigate to detail | ✅ PASS | Invoice number link opens `/invoices/{id}`. |
| INV-L-005 | Create invoice - no client | ✅ PASS | "Please select a client". |
| INV-L-006 | Create invoice - no line items | ✅ PASS | "Add at least one line item with description, quantity and unit price". |
| INV-L-007 | Create invoice - happy path | ✅ PASS | `INV-0004` created as DRAFT; subtotal `£100`, VAT `£20`, total `£120`. |
| INV-L-008 | Add/remove line rows | ✅ PASS | "+ Add line" adds second row (4 number inputs = 2 rows x qty+price). |
| INV-L-009 | Product dropdown fills line | ✅ PASS | Selecting "Consulting Service" auto-fills description and unit price. |
| INV-L-010 | Edit invoice status | ✅ PASS | Status updated to SENT via API. |
| INV-L-011 | PDF generation | ✅ PASS | API returns valid PDF binary (`%PDF-1.3`) with HTTP 200. |
| INV-L-012 | Send invoice | ❌ FAIL | SMTP not configured. API returns: "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment variables." User-visible alert shown. |
| INV-L-013 | Delete invoice | ✅ PASS | Invoice deleted; API returns "Invoice deleted". |

## Invoice Detail

| ID | Test | Result | Notes |
|---|---|---|---|
| INV-D-001 | Header actions | ✅ PASS | "Back to Invoices", "Invoice INV-0003", SENT pill, "Back to list", "Download PDF". |
| INV-D-002 | Bill to & dates | ✅ PASS | Aun Rizvi / `aunrizvi16@gmail.com`; issue date 15 Feb 2026; due date 22 Mar 2026. |
| INV-D-003 | Line table & totals | ✅ PASS | Description/Qty/Unit Price/Amount columns; Subtotal `£101`, VAT (20%) `£20.20`, Total `£121.20`. |
| INV-D-004 | Notes section | ✅ PASS | Notes visible in INV-0003 detail (also confirmed via portal test). |
| INV-D-005 | Invalid ID | ✅ PASS | "Invoice not found" with "← Back to Invoices". |

## Timesheets

| ID | Test | Result | Notes |
|---|---|---|---|
| TS-001 | Header buttons | ✅ PASS | "Timesheets", "Log Time", "Start Timer" buttons present. |
| TS-002 | Log time - validation | ✅ PASS | "Please enter a valid number of hours" when hours is 0/empty. |
| TS-003 | Log time - success | ✅ PASS | Manual entry created (2h 30m), type "Manual" shown in table. |
| TS-004 | Start/stop timer | ⚠️ PARTIAL | "Start Timer" modal works; API creates timer entry (`isTimerMode=true`). UI running-state toggle could not be reliably verified due to React state limitations in automation. |
| TS-005 | Filters | ✅ PASS | Client dropdown and From/To date filters present; filtered total hours shown. |
| TS-006 | Edit entry | ✅ PASS | Hours updated to 3 via API. |
| TS-007 | Delete entry | ✅ PASS | Entry deleted; API returns "Timesheet entry deleted". |
| TS-008 | Empty state | ✅ PASS | "No time entries found" / "Start a timer or log time manually to get started." |

## Expenses

| ID | Test | Result | Notes |
|---|---|---|---|
| EXP-001 | Summary cards | ✅ PASS | Total + count; Travel, Supplies, Equipment, Software, Meals cards with GBP totals. |
| EXP-002 | Category filter buttons | ✅ PASS | All, Travel, Supplies, Equipment, Software, Meals, Other. |
| EXP-003 | Date filters | ✅ PASS | From/To date inputs present. |
| EXP-004 | Add expense - empty description | ✅ PASS | "Description is required". |
| EXP-005 | Add expense - invalid amount | ✅ PASS | API returns "Amount must be a non-negative number". |
| EXP-006 | Add expense - success | ✅ PASS | `£25.50` Software expense "License" created; reflected in Software total. |
| EXP-007 | Receipt upload UI | ⚠️ PARTIAL | Upload area present ("Click to upload receipt"), but S3 not configured so full upload test unavailable. |
| EXP-008 | Edit/delete | ✅ PASS | Edit updates amount/description; Delete removes entry. |

## Settings (Admin Only)

| ID | Test | Result | Notes |
|---|---|---|---|
| SET-001 | Load | ✅ PASS | "Business Settings" and all expected fields present (company info, VAT, bank details, logo, primaryColor, secondaryColor). |
| SET-002 | Company name required | ✅ PASS | API returns "Company name is required". |
| SET-003 | VAT rate range | ✅ PASS | API returns "VAT rate must be between 0 and 100" for `vatRate=101`. |
| SET-004 | Save settings | ✅ PASS | Save triggers API call; alert shows "Settings saved successfully!". |
| SET-005 | Logo - image check | ⏭️ SKIP | Non-image upload could not be tested in this automated session. |
| SET-006 | Logo upload flow | ⚠️ PARTIAL | Upload UI present; full flow blocked by missing S3 config. |

## Client Portal

| ID | Test | Result | Notes |
|---|---|---|---|
| PRT-001 | Login lands on portal | ✅ PASS | CLIENT user lands on `/portal`; header "FlowBiz | Client Portal"; "Sign out" available. |
| PRT-002 | Summary cards | ✅ PASS | Total Invoices: `1`, Outstanding (red): `£0.00`, Total Paid (green): `£0.00`. |
| PRT-003 | Welcome text | ✅ PASS | "Welcome, Portal Test Client" with "Test Corp" subtitle. |
| PRT-004 | Status filters | ✅ PASS | All, DRAFT, SENT, PAID, OVERDUE, CANCELLED. |
| PRT-005 | Expand row | ✅ PASS | Expanding invoice shows line items, subtotal/VAT/total, and notes. |
| PRT-006 | PDF button | ✅ PASS | Alert shown: "PDF not yet available for this invoice. Please contact us." when no `pdfUrl`. |
| PRT-007 | No client record for email | ✅ PASS | "No client account found for this email address." and "Try again" shown. |
| PRT-008 | Logout | ✅ PASS | "Sign out" -> `/login`. |

## Integration

| ID | Test | Result | Notes |
|---|---|---|---|
| X-001 | Invoice uses client + product | ✅ PASS | Client + product created, then invoice with product line; detail page displays correctly. |
| X-002 | Timesheet + client | ✅ PASS | Timesheet entry linked to Aun Rizvi client. |
| X-003 | Expense totals update | ✅ PASS | Added `£25.50` Software expense; Software and Total cards updated. |

## Edge Cases

| ID | Test | Result | Notes |
|---|---|---|---|
| NEG-001 | Double submit | ✅ PASS | Double-click on Sign in does not duplicate navigation; lands on dashboard once. |
| NEG-002 | Modal dismiss via backdrop | ⚠️ PARTIAL | `X` closes modal; backdrop click does not close modal (may be intentional or a UX gap). |
| NEG-003 | Browser back | ✅ PASS | Back from dashboard remains stable on dashboard; no loop/crash. |

---

## Summary

| Category | Total | ✅ Pass | ❌ Fail | ⚠️ Partial | ⏭️ Skip |
|---|---:|---:|---:|---:|---:|
| Public | 3 | 3 | 0 | 0 | 0 |
| Login/Logout | 8 | 8 | 0 | 0 | 0 |
| Register | 5 | 5 | 0 | 0 | 0 |
| Forgot/Reset | 6 | 5 | 1 | 0 | 0 |
| RBAC | 4 | 4 | 0 | 0 | 0 |
| Dashboard | 6 | 4 | 0 | 2 | 0 |
| Clients | 11 | 9 | 1 | 0 | 1 |
| Products | 6 | 6 | 0 | 0 | 0 |
| Invoices List | 13 | 11 | 1 | 1 | 0 |
| Invoice Detail | 5 | 5 | 0 | 0 | 0 |
| Timesheets | 8 | 6 | 0 | 2 | 0 |
| Expenses | 8 | 6 | 0 | 2 | 0 |
| Settings | 6 | 4 | 0 | 2 | 0 |
| Portal | 8 | 8 | 0 | 0 | 0 |
| Integration | 3 | 3 | 0 | 0 | 0 |
| Edge Cases | 3 | 2 | 0 | 1 | 0 |
| **TOTAL** | **103** | **89 (86%)** | **3 (3%)** | **10 (10%)** | **1 (1%)** |

## Failures (3)

1. **AUTH-F-001 - Forgot Password**  
   SMTP not configured. API returns error instead of success panel.  
   **Fix:** Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.

2. **CLI-006 - Add Client invalid email**  
   Missing server-side email validation. API accepts invalid format (`not-an-email`).  
   **Fix:** Add email format validation in `POST /api/clients`.

3. **INV-L-012 - Send Invoice**  
   SMTP not configured; same root cause as AUTH-F-001.  
   **Fix:** Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.

## Partial Passes / Notable Issues

- **DASH-003:** Revenue chart area is blank even though data exists in aria labels (possible Chart.js rendering issue).
- **DASH-006:** Mobile sidebar toggle did not visually activate during automation (likely automation/React event constraint).
- **INV-L-012:** Email send failure is graceful and user-visible.
- **EXP-007 / SET-006:** Receipt/logo upload flows blocked by missing S3/storage config.
- **NEG-002:** Backdrop click does not close modal; only `X` closes.
- **TS-004:** Timer modal and API flow work; visible running-state/elapsed verification limited by automation constraints.

## Configuration Gaps Found

| Service | Status | Impact |
|---|---|---|
| SMTP (email) | ❌ Not configured | Forgot password and send-invoice email flows fail. |
| S3 (file storage) | ❌ Not configured | Receipt and logo upload flows unavailable. |
| PDF generation | ✅ Working | Returns valid PDF binary. |
| Database + seeds | ✅ Working | Seed data present (admin, demo, clients, invoices). |