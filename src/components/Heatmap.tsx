import type { HeatmapMonth } from '../lib/types';

interface HeatmapProps {
  data: HeatmapMonth[];
}

function formatCurrency(value: number): string {
  return (
    value
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł'
  );
}

function getCellColor(profitSum: number, maxAbsValue: number): string {
  if (maxAbsValue === 0 || profitSum === 0) {
    return 'bg-gray-700';
  }

  const intensity = Math.abs(profitSum) / maxAbsValue;

  if (profitSum > 0) {
    if (intensity > 0.75) return 'bg-green-600';
    if (intensity > 0.5) return 'bg-green-500';
    if (intensity > 0.25) return 'bg-green-700';
    return 'bg-green-800';
  } else {
    if (intensity > 0.75) return 'bg-red-600';
    if (intensity > 0.5) return 'bg-red-500';
    if (intensity > 0.25) return 'bg-red-700';
    return 'bg-red-800';
  }
}

function getCellStyle(profitSum: number, maxAbsValue: number): React.CSSProperties {
  if (maxAbsValue === 0 || profitSum === 0) {
    return {};
  }

  const intensity = Math.abs(profitSum) / maxAbsValue;
  const opacity = 0.4 + intensity * 0.6;

  return { opacity };
}

export default function Heatmap({ data }: HeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Brak danych do wizualizacji
      </div>
    );
  }

  const maxAbsValue = Math.max(...data.map((d) => Math.abs(d.profitSum)));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3 text-gray-100">Mapa cieplna — wyniki miesięczne</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {data.map((item) => {
          const tooltipText = `Zysk: ${formatCurrency(item.profitSum)} | Transakcje: ${item.transactionCount}`;
          const colorClass = getCellColor(item.profitSum, maxAbsValue);
          const style = getCellStyle(item.profitSum, maxAbsValue);

          return (
            <div
              key={item.month}
              className={`rounded p-2 text-center text-xs font-medium cursor-default ${colorClass} text-white`}
              style={style}
              title={tooltipText}
            >
              {item.month}
            </div>
          );
        })}
      </div>
    </div>
  );
}
