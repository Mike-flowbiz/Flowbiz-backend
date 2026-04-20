'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type Client = {
  id: string;
  name: string;
  email: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string | null;
};

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productId?: string | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  total: number;
  notes: string | null;
  pdfUrl: string | null;
  client?: { name: string; email: string } | null;
  invoiceItems: InvoiceItem[];
};

type LineItemForm = {
  tempId: string;
  productId: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

function generateTempId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const emptyLineItem = (): LineItemForm => ({
  tempId: generateTempId(),
  productId: '',
  description: '',
  quantity: '1',
  unitPrice: '',
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

export default function InvoiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vatRate, setVatRate] = useState(20);

  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([emptyLineItem()]);

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch invoice
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/invoices/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load invoice');
        }
        const data = await res.json();
        const inv: Invoice = data.invoice;
        if (!cancelled) {
          setInvoice(inv);
          setClientId(inv.clientId);
          setDueDate(inv.dueDate.slice(0, 10));
          setNotes(inv.notes || '');
          setStatus(inv.status);
          setLineItems(
            inv.invoiceItems.length > 0
              ? inv.invoiceItems.map((item) => ({
                  tempId: item.id,
                  productId: item.productId || '',
                  description: item.description,
                  quantity: String(item.quantity),
                  unitPrice: String(item.unitPrice),
                }))
              : [emptyLineItem()]
          );
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch clients, products, settings
  useEffect(() => {
    async function loadRef() {
      const [clientsRes, productsRes, settingsRes] = await Promise.allSettled([
        fetch('/api/clients', { credentials: 'include' }),
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' }),
      ]);
      if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
        const d = await clientsRes.value.json();
        setClients(d.clients || []);
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const d = await productsRes.value.json();
        setProducts(d.products || []);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
        const d = await settingsRes.value.json();
        if (d.settings?.vatRate) setVatRate(d.settings.vatRate);
      }
    }
    loadRef();
  }, []);

  // Line item helpers
  const addLineItem = () => setLineItems((prev) => [...prev, emptyLineItem()]);

  const removeLineItem = (tempId: string) => {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.tempId !== tempId)));
  };

  const updateLineItem = (tempId: string, field: keyof LineItemForm, value: string) => {
    setLineItems((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i)));
  };

  const fillFromProduct = (tempId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLineItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? { ...i, productId, description: product.description || product.name, unitPrice: String(product.price) }
          : i
      )
    );
  };

  // Totals
  const getTotals = () => {
    let subtotal = 0;
    for (const item of lineItems) {
      subtotal += (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    }
    subtotal = Math.round(subtotal * 100) / 100;
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    return { subtotal, vatAmount, total };
  };

  const { subtotal, vatAmount, total } = getTotals();

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    if (!clientId) { setFormError('Please select a client'); return; }

    const validItems = lineItems.filter(
      (i) => i.description.trim() && (parseFloat(i.quantity) || 0) > 0 && (parseFloat(i.unitPrice) || 0) >= 0
    );
    if (validItems.length === 0) {
      setFormError('Add at least one line item with description, quantity and unit price');
      return;
    }

    const items = validItems.map((i) => ({
      productId: i.productId || undefined,
      description: i.description.trim(),
      quantity: parseFloat(i.quantity) || 0,
      unitPrice: parseFloat(i.unitPrice) || 0,
    }));

    setFormLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clientId, dueDate: dueDate || undefined, notes: notes.trim() || undefined, status, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save invoice');
      setSaved(true);
      setTimeout(() => router.push(`/invoices/${id}`), 800);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">{error || 'Invoice not found'}</p>
          <Link href="/invoices" className="mt-3 inline-block text-blue-600 hover:underline">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/invoices/${id}`}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Invoice {invoice.invoiceNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Modify the details below and save your changes
            </p>
          </div>
        </div>
      </div>

      {/* Success message */}
      {saved && (
        <div className="p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Invoice saved! Redirecting...
        </div>
      )}

      {formError && (
        <div className="p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client, Date, Status */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes (visible on invoice)"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => {
              const q = parseFloat(item.quantity) || 0;
              const p = parseFloat(item.unitPrice) || 0;
              const amount = Math.round(q * p * 100) / 100;
              return (
                <div key={item.tempId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-400 uppercase">Item {index + 1}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.tempId)}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                        disabled={lineItems.length === 1}
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Product (optional)</label>
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          updateLineItem(item.tempId, 'productId', e.target.value);
                          fillFromProduct(item.tempId, e.target.value);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">None (custom item)</option>
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} ({formatCurrency(prod.price)}/{prod.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs text-gray-500 mb-1">Description <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.tempId, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                        placeholder="e.g. Labour, materials, specific job details..."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.tempId, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.tempId, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT ({vatRate}%)</span>
                <span className="font-medium">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/invoices/${id}`}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={formLoading || saved}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
          >
            {formLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
