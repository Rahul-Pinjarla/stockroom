import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Dashboard } from '../api';
import { formatMoney, formatMoneyCompact, formatNumber } from '../format';

type TopProduct = Dashboard['topProducts'][number];

interface TooltipProps {
  active?: boolean;
  payload?: { payload: TopProduct }[];
}

function ProductTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const product = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{product.name}</p>
      <div className="chart-tooltip-row">
        <span>Revenue</span>
        <strong>{formatMoney(product.revenue)}</strong>
      </div>
      <div className="chart-tooltip-row">
        <span>Units</span>
        <strong>{formatNumber(product.units)}</strong>
      </div>
    </div>
  );
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={14}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={136}
          tick={{ fill: 'oklch(0.22 0.012 260)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<ProductTooltip />} cursor={{ fill: 'oklch(0.97 0.004 260)' }} />
        <Bar
          dataKey="revenue"
          fill="oklch(0.52 0.18 264)"
          radius={[0, 6, 6, 0]}
          animationDuration={300}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey="revenue"
            position="right"
            formatter={(value) => formatMoneyCompact(Number(value))}
            style={{ fill: 'oklch(0.5 0.012 260)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
