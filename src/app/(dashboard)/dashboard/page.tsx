'use client';

import { useEffect, useState } from 'react';

type MetricsResponse = {
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  pendingAmount: number;
  pendingCount: number;
  overdueCount: number;
  totalClients: number;
};

type RevenuePoint = {
  month: string;
  revenue: number;
};

type RevenueChartResponse = {
  data: RevenuePoint[];
};

type InvoiceActivity = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  client?: {
    name: string;
  } | null;
};

type ClientActivity = {
  id: string;
  name: string;
  createdAt: string;
};

type ActivitiesResponse = {
  recentInvoices: InvoiceActivity[];
  recentClients: ClientActivity[];
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivitiesResponse | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/dashboard/metrics');
        if (!res.ok) throw new Error('Failed to load metrics');
        const data: MetricsResponse = await res.json();
        setMetrics(data);
      } catch (error) {
        setMetricsError('Unable to load metrics');
      } finally {
        setMetricsLoading(false);
      }
    };

    const fetchRevenue = async () => {
      try {
        const res = await fetch('/api/dashboard/revenue-chart');
        if (!res.ok) throw new Error('Failed to load revenue chart');
        const data: RevenueChartResponse = await res.json();
        setRevenueData(data.data);
      } catch (error) {
        setRevenueError('Unable to load revenue data');
      } finally {
        setRevenueLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/dashboard/activities');
        if (!res.ok) throw new Error('Failed to load activities');
        const data: ActivitiesResponse = await res.json();
        setActivities(data);
      } catch (error) {
        setActivitiesError('Unable to load recent activity');
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchMetrics();
    fetchRevenue();
    fetchActivities();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2,
    }).format(value || 0);

  const maxRevenue = revenueData.reduce((max, point) => (point.revenue > max ? point.revenue : max), 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to FlowBiz - Your business management platform</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metricsLoading ? 'Loading...' : metricsError ? '—' : formatCurrency(metrics?.currentMonthRevenue || 0)}
              </p>
              {!metricsLoading && !metricsError && (
                <p className="mt-1 text-xs text-gray-500">
                  Last month: {formatCurrency(metrics?.lastMonthRevenue || 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0118 5.414V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metricsLoading ? 'Loading...' : metricsError ? '—' : metrics?.pendingCount ?? 0}
              </p>
              {!metricsLoading && !metricsError && (
                <p className="mt-1 text-xs text-gray-500">
                  Total pending: {formatCurrency(metrics?.pendingAmount || 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-yellow-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue Invoices</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metricsLoading ? 'Loading...' : metricsError ? '—' : metrics?.overdueCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metricsLoading ? 'Loading...' : metricsError ? '—' : metrics?.totalClients ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview (Last 6 Months)</h2>
          <div className="h-64">
            {revenueLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Loading chart…</div>
            ) : revenueError ? (
              <div className="h-full flex items-center justify-center text-red-500 text-sm">{revenueError}</div>
            ) : revenueData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No revenue data available yet.
              </div>
            ) : (
              <div className="flex items-end h-full space-x-3">
                {revenueData.map((point) => (
                  <div key={point.month} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full bg-gray-100 rounded-md overflow-hidden flex items-end">
                      <div
                        className="w-full bg-blue-500 rounded-md transition-all"
                        style={{
                          height: `${(point.revenue / maxRevenue) * 100 || 4}%`,
                          minHeight: point.revenue > 0 ? '4%' : '0%',
                        }}
                        title={`${point.month}: ${formatCurrency(point.revenue)}`}
                      />
                    </div>
                    <span className="mt-2 text-xs text-gray-600 text-center">{point.month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {activitiesLoading ? (
            <p className="text-sm text-gray-500">Loading activity…</p>
          ) : activitiesError ? (
            <p className="text-sm text-red-500">{activitiesError}</p>
          ) : !activities || (activities.recentInvoices.length === 0 && activities.recentClients.length === 0) ? (
            <p className="text-sm text-gray-500">No recent activity.</p>
          ) : (
          <div className="space-y-4">
              {activities.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-start text-sm text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-blue-600">INV</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Invoice {invoice.number}{' '}
                      <span className="ml-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        {invoice.status}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.client?.name ? `Client: ${invoice.client.name} • ` : ''}
                      {new Date(invoice.createdAt).toLocaleString()} • {formatCurrency(invoice.total)}
                    </p>
                  </div>
                </div>
              ))}

              {activities.recentClients.map((client) => (
                <div key={client.id} className="flex items-start text-sm text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-green-600">CL</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New client: {client.name}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(client.createdAt).toLocaleString()}
                    </p>
                  </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

