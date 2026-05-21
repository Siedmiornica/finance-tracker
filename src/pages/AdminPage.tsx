import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import Heatmap from '../components/Heatmap';
import { AboutSection } from '../components/AboutSection';
import { useTransactions } from '../hooks/useTransactions';
import { useAbout } from '../hooks/useAbout';
import { useAuth } from '../hooks/useAuth';
import { calcStats, calcHeatmapData } from '../lib/calculations';
import type { Transaction, TransactionInput, ValidationResult } from '../lib/types';

export default function AdminPage() {
  const { transactions, walletBalance, add, update, remove, filterCategories } =
    useTransactions();
  const { about, save } = useAbout();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const stats = calcStats(transactions);
  const heatmapData = calcHeatmapData(transactions);

  function handleFormSubmit(input: TransactionInput): ValidationResult {
    if (editingTransaction) {
      const result = update(editingTransaction.id, input);
      if (result.success) {
        setEditingTransaction(null);
      }
      return result;
    }
    return add(input);
  }

  function handleMarkAsSold(id: string, input: TransactionInput): ValidationResult {
    return update(id, input);
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
  }

  function handleCancelEdit() {
    setEditingTransaction(null);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const editInitialData: TransactionInput | undefined = editingTransaction
    ? {
        title: editingTransaction.title,
        description: editingTransaction.description,
        category: editingTransaction.category,
        status: editingTransaction.status,
        purchasePrice: editingTransaction.purchasePrice,
        purchaseDate: editingTransaction.purchaseDate,
        salePrice: editingTransaction.salePrice,
        saleDate: editingTransaction.saleDate,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with logout */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-100">Panel Administracyjny</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Wyloguj
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Dashboard with stats and wallet */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Dashboard</h2>
          <Dashboard stats={stats} walletBalance={walletBalance} showWallet={true} />
        </section>

        {/* Heatmap */}
        <section>
          <Heatmap data={heatmapData} />
        </section>

        {/* Transaction Form */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">
            {editingTransaction ? 'Edytuj transakcję' : 'Dodaj transakcję'}
          </h2>
          {editingTransaction && (
            <button
              onClick={handleCancelEdit}
              className="mb-3 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 border border-gray-600"
            >
              Anuluj edycję
            </button>
          )}
          <TransactionForm
            key={editingTransaction?.id ?? 'create'}
            onSubmit={handleFormSubmit}
            filterCategories={filterCategories}
            initialData={editInitialData}
            mode={editingTransaction ? 'edit' : 'create'}
          />
        </section>

        {/* Transaction List */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Lista transakcji</h2>
          <TransactionList
            transactions={transactions}
            isAdmin={true}
            onEdit={handleEdit}
            onDelete={remove}
            onMarkAsSold={handleMarkAsSold}
          />
        </section>

        {/* About Section */}
        <section>
          <AboutSection about={about} onSave={save} isAdmin={true} />
        </section>
      </main>
    </div>
  );
}
