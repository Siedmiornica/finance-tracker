import { useTransactions } from '../hooks/useTransactions';
import { useAbout } from '../hooks/useAbout';
import { calcStats, calcHeatmapData } from '../lib/calculations';
import Dashboard from '../components/Dashboard';
import { TransactionList } from '../components/TransactionList';
import Heatmap from '../components/Heatmap';
import { AboutSection } from '../components/AboutSection';

export default function PublicPage() {
  const { transactions } = useTransactions();
  const { about } = useAbout();

  const stats = calcStats(transactions);
  const heatmapData = calcHeatmapData(transactions);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-100">Finance Tracker</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Statystyki</h2>
        <Dashboard stats={stats} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Zakończone transakcje</h2>
        <TransactionList transactions={transactions} isAdmin={false} />
      </section>

      <section>
        <Heatmap data={heatmapData} />
      </section>

      <section>
        <AboutSection about={about} isAdmin={false} />
      </section>
    </div>
  );
}
