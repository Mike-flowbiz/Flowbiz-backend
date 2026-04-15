'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  product?: { name: string; unit: string } | null;
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
  client?: { name: string; email: string } | null;
  user?: { firstName: string; lastName: string; email: string } | null;
  invoiceItems: InvoiceItem[];
};

const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  DRAFT: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    label: 'Draft',
  },
  SENT: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    label: 'Sent',
  },
  PAID: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Paid',
  },
  OVERDUE: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Overdue',
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    label: 'Cancelled',
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchInvoice() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/invoices/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load invoice');
        }
        const data = await res.json();
        if (!cancelled) setInvoice(data.invoice);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load invoice');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInvoice();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;

    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
      return;
    }

    setPdfLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        method: 'POST',
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate PDF');
        setInvoice((prev) => (prev ? { ...prev, pdfUrl: data.pdfUrl } : prev));
        window.open(data.pdfUrl, '_blank');
      } else if (contentType?.includes('application/pdf')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    if (!confirm(`Send invoice ${invoice.invoiceNumber} to ${invoice.client?.email ?? 'client'}?`)) return;

    setSendLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invoice');
      setInvoice((prev) => (prev ? { ...prev, status: 'SENT', sentAt: new Date().toISOString() } : prev));
      showMessage('success', `Invoice sent to ${invoice.client?.email}`);
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setSendLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    setMarkPaidLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'PAID' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update invoice');
      setInvoice((prev) =>
        prev ? { ...prev, status: 'PAID', paidAt: new Date().toISOString() } : prev
      );
      showMessage('success', 'Invoice marked as paid');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally {
      setMarkPaidLoading(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    if (!invoice) return;

    setMarkPaidLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'SENT' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update invoice');
      setInvoice((prev) =>
        prev ? { ...prev, status: 'SENT', paidAt: null } : prev
      );
      showMessage('success', 'Invoice marked as unpaid');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setMarkPaidLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[200px]">
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

  const statusCfg = statusConfig[invoice.status] ?? statusConfig.DRAFT;
  const isDue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Action Message */}
      {actionMessage && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            {actionMessage.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          {actionMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {invoice.client?.name ?? 'Unknown client'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusCfg.icon} />
            </svg>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Payment Status Banner */}
      {invoice.status === 'PAID' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">Payment Received</p>
            <p className="text-sm text-green-700">
              {formatCurrency(invoice.total)} paid
              {invoice.paidAt ? ` on ${formatDateTime(invoice.paidAt)}` : ''}
            </p>
          </div>
        </div>
      )}

      {isDue && invoice.status !== 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-800">Payment Overdue</p>
            <p className="text-sm text-red-700">
              {formatCurrency(invoice.total)} was due on {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Mark as Paid / Unpaid */}
          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <button
              onClick={handleMarkAsPaid}
              disabled={markPaidLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {markPaidLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Mark as Paid
            </button>
          )}

          {invoice.status === 'PAID' && (
            <button
              onClick={handleMarkAsUnpaid}
              disabled={markPaidLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {markPaidLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Mark as Unpaid
            </button>
          )}

          {/* Send Invoice */}
          {invoice.status !== 'CANCELLED' && (
            <button
              onClick={handleSendInvoice}
              disabled={sendLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {sendLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {invoice.status === 'SENT' || invoice.sentAt ? 'Resend' : 'Send'} Invoice
            </button>
          )}

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            {pdfLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {invoice.pdfUrl ? 'View PDF' : 'Download PDF'}
          </button>

          {/* Edit (go back to list and open edit modal) */}
          <Link
            href="/invoices"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Invoice
          </Link>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Client & dates info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Bill to
              </h3>
              <p className="font-medium text-gray-900">{invoice.client?.name ?? '—'}</p>
              <p className="text-sm text-gray-600">{invoice.client?.email ?? ''}</p>
            </div>
            <div className="text-left md:text-right space-y-1">
              <p className="text-sm text-gray-500">
                Issue date: <span className="text-gray-900 font-medium">{formatDate(invoice.issueDate)}</span>
              </p>
              <p className="text-sm text-gray-500">
                Due date: <span className={`font-medium ${isDue ? 'text-red-600' : 'text-gray-900'}`}>{formatDate(invoice.dueDate)}</span>
              </p>
              {invoice.sentAt && (
                <p className="text-sm text-gray-500">
                  Sent: <span className="text-gray-900 font-medium">{formatDateTime(invoice.sentAt)}</span>
                </p>
              )}
              {invoice.paidAt && (
                <p className="text-sm text-green-600">
                  Paid: <span className="font-medium">{formatDateTime(invoice.paidAt)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Line items table */}
          <div className="border-t border-gray-200 pt-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    Qty
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                    Unit price
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.invoiceItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-gray-900">
                      {item.description}
                      {item.product && (
                        <span className="block text-xs text-gray-500">{item.product.name}</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT ({invoice.vatRate}%)</span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.status === 'PAID' && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Amount Paid</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              )}
              {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <div className={`flex justify-between font-semibold ${isDue ? 'text-red-600' : 'text-gray-900'}`}>
                  <span>Balance Due</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
