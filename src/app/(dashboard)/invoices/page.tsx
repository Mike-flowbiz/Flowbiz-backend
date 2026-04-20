'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

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
  sentAt: string | null;
  paidAt: string | null;
  client?: { name: string; email: string };
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

const VAT_RATE_DEFAULT = 20;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<{ vatRate?: number } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([emptyLineItem()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState<string | null>(null);
  const [markPaidLoading, setMarkPaidLoading] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const url = `/api/invoices${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (_) { }
    };
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (_) { }
    };
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || null);
        }
      } catch (_) { }
    };
    fetchClients();
    fetchProducts();
    fetchSettings();
  }, []);

  const vatRate = settings?.vatRate ?? VAT_RATE_DEFAULT;

  const openAddModal = () => {
    setClientId('');
    setDueDate('');
    setNotes('');
    setLineItems([emptyLineItem()]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  };

  const removeLineItem = (tempId: string) => {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.tempId !== tempId)));
  };

  const updateLineItem = (tempId: string, field: keyof LineItemForm, value: string) => {
    setLineItems((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i))
    );
  };

  const fillFromProduct = (tempId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLineItems((prev) =>
      prev.map((i) =>
        i.tempId === tempId
          ? {
            ...i,
            productId,
            description: product.description || product.name,
            unitPrice: String(product.price),
          }
          : i
      )
    );
  };

  const getModalTotals = () => {
    let subtotal = 0;
    for (const item of lineItems) {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      subtotal += q * p;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    return { subtotal, vatAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clientId) {
      setFormError('Please select a client');
      return;
    }

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
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clientId, dueDate: dueDate || undefined, notes: notes.trim() || undefined, items }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save invoice');

      closeModal();
      fetchInvoices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/invoices/${deleteConfirm.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete invoice');
      }
      setDeleteConfirm(null);
      fetchInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewPdf = async (inv: Invoice) => {
    if (inv.pdfUrl) {
      window.open(inv.pdfUrl, '_blank');
      return;
    }

    // Generate PDF if not exists
    setPdfLoading(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/pdf`, {
        method: 'POST',
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate PDF');

        // Update local state if we got a URL
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, pdfUrl: data.pdfUrl } : i)));
        window.open(data.pdfUrl, '_blank');
      } else if (contentType?.includes('application/pdf')) {
        // Fallback: Direct binary stream
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleSend = async (inv: Invoice) => {
    if (!confirm(`Send invoice ${inv.invoiceNumber} to ${inv.client?.email ?? 'client'}?`)) return;
    setSendLoading(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/send`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invoice');
      // Update local status to SENT
      setInvoices((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: 'SENT' } : i))
      );
      alert(`Invoice ${inv.invoiceNumber} sent successfully!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setSendLoading(null);
    }
  };

  const handleMarkAsPaid = async (inv: Invoice) => {
    setMarkPaidLoading(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'PAID' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update invoice');
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === inv.id ? { ...i, status: 'PAID', paidAt: new Date().toISOString() } : i
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally {
      setMarkPaidLoading(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    DRAFT: {
      bg: 'bg-gray-100', text: 'text-gray-800',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      label: 'Draft',
    },
    SENT: {
      bg: 'bg-blue-100', text: 'text-blue-800',
      icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      label: 'Sent',
    },
    PAID: {
      bg: 'bg-green-100', text: 'text-green-800',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      label: 'Paid',
    },
    OVERDUE: {
      bg: 'bg-red-100', text: 'text-red-800',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      label: 'Overdue',
    },
    CANCELLED: {
      bg: 'bg-gray-100', text: 'text-gray-500',
      icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
      label: 'Cancelled',
    },
  };

  // Summary stats
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE' || (inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueDate) < new Date())).length;

  const { subtotal, vatAmount, total } = getModalTotals();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-gray-600">Create and manage invoices</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Outstanding</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Paid</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${overdueCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
            <svg className={`w-5 h-5 ${overdueCount > 0 ? 'text-red-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
            <p className={`text-lg font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{overdueCount} invoice{overdueCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            Loading invoices...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button onClick={fetchInvoices} className="mt-4 text-blue-600 hover:underline">
              Try again
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">No invoices found</p>
            <p className="mt-1">
              {filterStatus !== 'all' ? 'Try changing the filter' : 'Create your first invoice'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/invoices/${inv.id}`} className="text-blue-600 hover:text-blue-900 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inv.client?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const cfg = statusConfig[inv.status] ?? statusConfig.DRAFT;
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                            </svg>
                            {cfg.label}
                          </span>
                        );
                      })()}
                      {inv.paidAt && inv.status === 'PAID' && (
                        <p className="text-xs text-green-600 mt-0.5">{formatDate(inv.paidAt)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv)}
                            disabled={markPaidLoading === inv.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-medium disabled:opacity-50"
                            title="Mark as paid"
                          >
                            {markPaidLoading === inv.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-600 border-t-transparent" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Paid
                          </button>
                        )}
                        {inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleSend(inv)}
                            disabled={sendLoading === inv.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Send invoice"
                          >
                            {sendLoading === inv.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleViewPdf(inv)}
                          disabled={pdfLoading === inv.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="View PDF"
                        >
                          {pdfLoading === inv.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <Link
                          href={`/invoices/${inv.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit invoice"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(inv)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete invoice"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && invoices.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            />
            <div className="relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle bg-white rounded-xl shadow-xl transform transition-all">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Invoice
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional notes"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Line Items</label>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add line
                    </button>
                  </div>
                  <div className="fb-line-items-wrap border rounded-lg overflow-hidden">
                    <div className="fb-line-item fb-line-head">
                      <div className="fb-line-product">Product</div>
                      <div className="fb-line-desc">Description *</div>
                      <div className="fb-line-qty">Qty</div>
                      <div className="fb-line-price">Unit Price</div>
                      <div className="fb-line-amount">Amount</div>
                      <div className="fb-line-delete" />
                    </div>
                    {lineItems.map((item) => {
                      const q = parseFloat(item.quantity) || 0;
                      const p = parseFloat(item.unitPrice) || 0;
                      const amount = Math.round(q * p * 100) / 100;
                      return (
                        <div key={item.tempId} className="fb-line-item">
                          <select
                            className="fb-line-product px-2 py-1.5 border border-gray-300 rounded text-sm"
                            value={item.productId}
                            onChange={(e) => {
                              const v = e.target.value;
                              updateLineItem(item.tempId, 'productId', v);
                              fillFromProduct(item.tempId, v);
                            }}
                          >
                            <option value="">Product</option>
                            {products.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} ({formatCurrency(prod.price)}/{prod.unit})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            className="fb-line-desc px-2 py-1.5 border border-gray-300 rounded text-sm"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.tempId, 'description', e.target.value)}
                            placeholder="Description"
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="fb-line-qty px-2 py-1.5 border border-gray-300 rounded text-sm"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.tempId, 'quantity', e.target.value)}
                            placeholder="Qty"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="fb-line-price px-2 py-1.5 border border-gray-300 rounded text-sm"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.tempId, 'unitPrice', e.target.value)}
                            placeholder="Unit Price"
                          />
                          <div className="fb-line-amount text-sm text-gray-700">{formatCurrency(amount)}</div>
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.tempId)}
                            className="fb-line-delete text-red-500 hover:text-red-700"
                            disabled={lineItems.length === 1}
                            aria-label="Remove line"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-6 pt-4 border-t">
                  <div className="text-right text-sm text-gray-900">
                    <p>
                      Subtotal: <strong>{formatCurrency(subtotal)}</strong>
                    </p>
                    <p>
                      VAT ({vatRate}%): <strong>{formatCurrency(vatAmount)}</strong>
                    </p>
                    <p className="text-lg">
                      Total: <strong>{formatCurrency(total)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    )}
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900">Delete Invoice</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete invoice <strong>{deleteConfirm.invoiceNumber}</strong>? This cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
