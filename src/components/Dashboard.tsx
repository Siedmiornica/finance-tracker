import type { DashboardStats } from '../lib/types';

interface DashboardProps {
  stats: DashboardStats;
  walletBalance?: number;
  showWallet?: boolean;
}

export default function Dashboard({ stats, walletBalance, showWallet }: DashboardProps) {
  const hasCompleted = stats.bestTransaction !== null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Łączna liczba transakcji" value={stats.totalCount} />

        {hasCompleted ? (
          <>
            <StatCard
              label="Średni zysk %"
              value={`${stats.avgProfitPercent.toFixed(2)}%`}
            />
            <StatCard
              label="Średni czas (dni)"
              value={stats.avgDays}
            />
            <StatCard
              label="Najlepsza transakcja"
              value={`${stats.bestTransaction!.title} (${stats.bestTransaction!.profitPercent.toFixed(2)}%)`}
            />
            <StatCard
              label="Najgorsza transakcja"
              value={`${stats.worstTransaction!.title} (${stats.worstTransaction!.profitPercent.toFixed(2)}%)`}
            />
            <StatCard
              label="Łączny zysk (kwota)"
              value={`${stats.totalProfitAmount.toFixed(2)} zł`}
            />
            <StatCard
              label="Łączny zysk %"
              value={`${stats.totalProfitPercent.toFixed(2)}%`}
            />
          </>
        ) : (
          <div className="col-span-full bg-gray-800 rounded-lg p-6 text-center text-gray-400 border border-gray-700">
            Brak zakończonych transakcji do wyświetlenia
          </div>
        )}
      </div>

      {showWallet && walletBalance !== undefined && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Saldo portfela</h3>
          <p
            className={`text-2xl font-bold ${
              walletBalance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {walletBalance < 0 && '⚠ '}
            {walletBalance.toFixed(2)} zł
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-100">{String(value)}</p>
    </div>
  );
}
