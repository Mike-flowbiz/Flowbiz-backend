'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

type Client = { id: string; name: string };

type TimesheetEntry = {
  id: string;
  clientId: string | null;
  date: string;
  hours: number;
  description: string | null;
  isTimerMode: boolean;
  startTime: string | null;
  endTime: string | null;
  client?: { id: string; name: string } | null;
};

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatElapsed(startTime: string): string {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsedSec = Math.floor((now - start) / 1000);
  const h = Math.floor(elapsedSec / 3600);
  const m = Math.floor((elapsedSec % 3600) / 60);
  const s = elapsedSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TimesheetsPage() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [filterClient, setFilterClient] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  // Active timer tick
  const [tick, setTick] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal state
  type ModalMode = 'add-manual' | 'start-timer' | 'edit';
  const [modalMode, setModalMode] = useState<ModalMode>('add-manual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);

  // Form fields
  const [formClient, setFormClient] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(todayISO());
  const [formHours, setFormHours] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stop-timer loading
  const [stoppingTimer, setStoppingTimer] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<TimesheetEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const activeTimer = entries.find((e) => e.isTimerMode && !e.endTime) ?? null;

  // Start/stop interval for active timer
  useEffect(() => {
    if (activeTimer) {
      tickRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [activeTimer?.id]);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterClient) params.set('clientId', filterClient);
      if (filterStart) params.set('startDate', filterStart);
      if (filterEnd) params.set('endDate', filterEnd);
      const url = `/api/timesheets${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch timesheets');
      const data = await res.json();
      setEntries(data.timesheets || []);
      setTotalHours(data.totalHours || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  }, [filterClient, filterStart, filterEnd]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    fetch('/api/clients', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setClients(d.clients || []); })
      .catch(() => {});
  }, []);

  const openModal = (mode: ModalMode, entry?: TimesheetEntry) => {
    setModalMode(mode);
    setFormError(null);
    if (mode === 'edit' && entry) {
      setEditingEntry(entry);
      setFormClient(entry.clientId || '');
      setFormDescription(entry.description || '');
      setFormDate(entry.date.slice(0, 10));
      setFormHours(String(entry.hours));
    } else {
      setEditingEntry(null);
      setFormClient('');
      setFormDescription('');
      setFormDate(todayISO());
      setFormHours('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (modalMode === 'start-timer') {
        const res = await fetch('/api/timesheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            clientId: formClient || undefined,
            description: formDescription.trim() || undefined,
            isTimerMode: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start timer');
        closeModal();
        fetchEntries();
        return;
      }

      if (modalMode === 'add-manual') {
        if (!formHours || parseFloat(formHours) <= 0) {
          setFormError('Please enter a valid number of hours');
          return;
        }
        const res = await fetch('/api/timesheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            clientId: formClient || undefined,
            description: formDescription.trim() || undefined,
            date: formDate,
            hours: parseFloat(formHours),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to log time');
        closeModal();
        fetchEntries();
        return;
      }

      if (modalMode === 'edit' && editingEntry) {
        if (!formHours || parseFloat(formHours) <= 0) {
          setFormError('Please enter a valid number of hours');
          return;
        }
        const res = await fetch(`/api/timesheets/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            clientId: formClient || null,
            description: formDescription.trim() || null,
            date: formDate,
            hours: parseFloat(formHours),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update entry');
        closeModal();
        fetchEntries();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    setStoppingTimer(true);
    try {
      const res = await fetch(`/api/timesheets/${activeTimer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stopTimer: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to stop timer');
      fetchEntries();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to stop timer');
    } finally {
      setStoppingTimer(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/timesheets/${deleteConfirm.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete entry');
      }
      setDeleteConfirm(null);
      fetchEntries();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setDeleteLoading(false);
    }
  };

  const completedEntries = entries.filter((e) => !e.isTimerMode || e.endTime);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
          <p className="mt-2 text-gray-600">Track your time and billable hours</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('add-manual')}
            disabled={!!activeTimer}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors text-sm font-medium"
          >
            Log Time
          </button>
          <button
            onClick={() => openModal('start-timer')}
            disabled={!!activeTimer}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Timer
          </button>
        </div>
      </div>

      {/* Active Timer Card */}
      {activeTimer && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-700">Timer Running</p>
              {activeTimer.client && (
                <p className="text-xs text-blue-600">{activeTimer.client.name}</p>
              )}
              {activeTimer.description && (
                <p className="text-xs text-blue-600">{activeTimer.description}</p>
              )}
            </div>
            <span className="text-2xl font-mono font-bold text-blue-800 tabular-nums">
              {activeTimer.startTime ? formatElapsed(activeTimer.startTime) : '00:00:00'}
            </span>
          </div>
          <button
            onClick={handleStopTimer}
            disabled={stoppingTimer}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            {stoppingTimer ? 'Stopping…' : 'Stop Timer'}
          </button>
        </div>
      )}

      {/* Stats + Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:col-span-1">
          <p className="text-sm text-gray-500">Total Hours (filtered)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-400 mt-1">{completedEntries.length} entries</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:col-span-2 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {(filterClient || filterStart || filterEnd) && (
            <button
              onClick={() => { setFilterClient(''); setFilterStart(''); setFilterEnd(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            Loading timesheets…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button onClick={fetchEntries} className="mt-4 text-blue-600 hover:underline">Try again</button>
          </div>
        ) : completedEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No time entries found</p>
            <p className="text-sm mt-1">Start a timer or log time manually to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.client?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{entry.description || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.isTimerMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.isTimerMode ? 'Timer' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {formatHours(entry.hours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal('edit', entry)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(entry)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && completedEntries.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between text-sm text-gray-500">
            <span>{completedEntries.length} entr{completedEntries.length === 1 ? 'y' : 'ies'}</span>
            <span className="font-medium text-gray-700">Total: {totalHours.toFixed(2)} hours</span>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'start-timer' ? 'Start Timer' : modalMode === 'edit' ? 'Edit Entry' : 'Log Time'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">No client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What did you work on?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {modalMode !== 'start-timer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.25"
                        value={formHours}
                        onChange={(e) => setFormHours(e.target.value)}
                        placeholder="e.g. 2.5"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </>
                )}

                {modalMode === 'start-timer' && (
                  <p className="text-sm text-gray-500 bg-blue-50 rounded-lg p-3">
                    The timer will start immediately. You can stop it from the timesheets page.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    {formLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    )}
                    {modalMode === 'start-timer' ? 'Start Timer' : modalMode === 'edit' ? 'Save Changes' : 'Log Time'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900">Delete Entry</h3>
              <p className="mt-2 text-gray-600">
                Delete this time entry ({formatHours(deleteConfirm.hours)} on {formatDate(deleteConfirm.date)})? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center gap-2"
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
