import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="text-3xl font-bold text-blue-600">FlowBiz</div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Business Management Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage invoices, track time, handle expenses, and grow your business with FlowBiz
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Invoicing</h3>
            <p className="text-gray-600">
              Create professional invoices with VAT calculations and PDF generation
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Time Tracking</h3>
            <p className="text-gray-600">
              Track billable hours with built-in timer and manual entries
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expense Management</h3>
            <p className="text-gray-600">
              Keep track of business expenses with receipt uploads
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Client Portal</h3>
            <p className="text-gray-600">
              Give clients access to view and download their invoices
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              Get insights into revenue, activities, and business performance
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">
              Role-based access control and secure data storage
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p>© 2025 FlowBiz. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
