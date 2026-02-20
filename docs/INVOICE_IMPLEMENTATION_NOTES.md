# Invoice Implementation – Where Things Live

## 1. `getNextInvoiceNumber()`

**Location:** `src/app/api/invoices/route.ts` (lines 6–21)

- **Purpose:** Returns the next invoice number in sequence (e.g. `INV-0001`, `INV-0002`).
- **Logic:** Loads all invoices, parses numbers matching `INV-(\d+)`, takes the max, adds 1, and formats with 4-digit zero-padding.
- **Used in:** `POST /api/invoices` when creating a new invoice (line 113).

```ts
async function getNextInvoiceNumber(): Promise<string> {
  const invoices = await prisma.invoice.findMany({
    select: { invoiceNumber: true },
    orderBy: { createdAt: 'desc' },
  });
  let maxNum = 0;
  for (const inv of invoices) {
    const match = inv.invoiceNumber.match(/^INV-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `INV-${String(next).padStart(4, '0')}`;
}
```

---

## 2. VAT calculation

VAT is calculated in **three** places (backend create, backend update, frontend modal).

### Backend – Create invoice

**File:** `src/app/api/invoices/route.ts`  
**VAT rate:** `getVatRate()` (lines 22–25) – from `BusinessSetting` or default 20%.  
**Calculation:** Lines 112–130 (after building line items):

- `subtotal` = sum of line item amounts  
- `vatAmount = round(subtotal * (vatRate / 100) * 100) / 100`  
- `total = round((subtotal + vatAmount) * 100) / 100`

### Backend – Update invoice

**File:** `src/app/api/invoices/[id]/route.ts`  
**VAT rate:** Same `getVatRate()` (lines 6–9).  
**Calculation:** Lines 136–144 when `items` are provided:

- `subtotal` from line items  
- `vatAmount = round(subtotal * (vatRate / 100) * 100) / 100`  
- `total = round((subtotal + vatAmount) * 100) / 100`  
- Stored in `updateData` and persisted.

### Frontend – Invoice modal (live preview)

**File:** `src/app/(dashboard)/invoices/page.tsx`  
**VAT rate:** `settings?.vatRate ?? VAT_RATE_DEFAULT` (20) – from Business Settings API.  
**Calculation:** `getModalTotals()` (lines 217–229):

- Subtotal from current line items in the form  
- `vatAmount = round(subtotal * (vatRate / 100) * 100) / 100`  
- `total = round((subtotal + vatAmount) * 100) / 100`  

Used for the live Subtotal / VAT / Total display in the create/edit modal (e.g. around line 319/656).

---

## Summary table

| What                     | File                          | Notes                                      |
|--------------------------|-------------------------------|--------------------------------------------|
| `getNextInvoiceNumber()` | `src/app/api/invoices/route.ts` | Lines 6–21, used in POST                   |
| VAT rate (source)        | Both API route files          | `getVatRate()` → BusinessSetting or 20%    |
| VAT on create            | `src/app/api/invoices/route.ts` | Lines 112, 129–130, 145–146                |
| VAT on update            | `src/app/api/invoices/[id]/route.ts` | Lines 106, 136–144                         |
| VAT in UI (modal)        | `src/app/(dashboard)/invoices/page.tsx` | `getModalTotals()` 217–229, VAT display in modal |

---

## Screenshots / video checklist

To show the invoice flow (3–5 screenshots or a short screen recording), capture:

1. **Create invoice** – Invoices page → “Create invoice” (or “New invoice”) → modal open with client dropdown, due date, and one empty line item.
2. **Add items** – Same modal with 2+ line items (e.g. product selected on one row, second row filled manually); show description, quantity, unit price, amount.
3. **VAT / total** – Same modal scrolled so the totals block is visible: **Subtotal**, **VAT (20%)**, **Total** with correct calculated values.
4. **Status change** – Edit an existing invoice and change status (e.g. DRAFT → SENT or SENT → PAID); show the status dropdown and Save, then list view with updated status.
5. **Delete** – Click delete on an invoice, show the confirmation dialog, then confirm and show the invoice gone from the list.

**How to capture:** Run `npm run dev`, log in as `demo@flowbiz.test` / `Password123!`, go to **Invoices**, then perform the steps above and screenshot or record the screen.
