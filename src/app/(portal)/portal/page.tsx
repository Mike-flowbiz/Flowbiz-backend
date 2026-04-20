'use client';

import { useEffect, useState, useCallback } from 'react';

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] as const;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes: string | null;
  pdfUrl: string | null;
  invoiceItems: InvoiceItem[];
};

type Client = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PortalPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      const res = await fetch(`/api/portal/invoices${params.toString() ? `?${params}` : ''}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to load invoices');
      }
      const data = await res.json();
      setInvoices(data.invoices || []);
      setClient(data.client || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDownloadPdf = async (inv: Invoice) => {
    try {
      setPdfLoading(inv.id);
      const res = await fetch(`/api/portal/invoices/${inv.id}/pdf`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to download PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${inv.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const totalOutstanding = invoices
    .filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((s, i) => s + i.total, 0);

  const totalPaid = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {client ? `Welcome, ${client.name}` : 'Your Invoices'}
        </h1>
        {client?.companyName && (
          <p className="mt-1 text-gray-500">{client.companyName}</p>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading your invoices…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchInvoices} className="mt-3 text-blue-600 hover:underline text-sm">
              Try again
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No invoices found</p>
            {filterStatus !== 'ALL' && (
              <button onClick={() => setFilterStatus('ALL')} className="mt-2 text-blue-600 hover:underline text-sm">
                Show all invoices
              </button>
            )}
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Invoice row */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-gray-50 gap-3"
                onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">
                      Issued {formatDate(inv.issueDate)} · Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {inv.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownloadPdf(inv); }}
                    disabled={pdfLoading === inv.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {pdfLoading === inv.id ? 'Preparing…' : 'Download PDF'}
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expanded === inv.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === inv.id && (
                <div className="border-t border-gray-100 p-5">
                  <table className="min-w-full mb-4">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Qty</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Unit Price</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inv.invoiceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 text-sm text-gray-700">{item.description}</td>
                          <td className="py-2.5 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="py-2.5 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2.5 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end">
                    <div className="w-56 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(inv.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>VAT ({inv.vatRate}%)</span>
                        <span>{formatCurrency(inv.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base pt-1.5 border-t border-gray-200">
                        <span>Total</span>
                        <span>{formatCurrency(inv.total)}</span>
                      </div>
                    </div>
                  </div>

                  {inv.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Notes: </span>{inv.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
