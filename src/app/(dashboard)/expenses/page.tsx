export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-2 text-gray-600">Track and manage business expenses</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Expenses module will be implemented in Milestone 8</p>
      </div>
    </div>
  );
}

