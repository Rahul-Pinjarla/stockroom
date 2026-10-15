import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyRevenue } from '../api';
import { formatDay, formatMoney, formatMoneyCompact, formatNumber } from '../format';

const ACCENT = 'oklch(0.52 0.18 264)';
const TICK = { fill: 'oklch(0.5 0.012 260)', fontSize: 12 };

interface TooltipProps {
  active?: boolean;
  payload?: { payload: DailyRevenue }[];
}

function RevenueTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{formatDay(point.day)}</p>
      <div className="chart-tooltip-row">
        <span>Revenue</span>
        <strong>{formatMoney(point.revenue)}</strong>
      </div>
      <div className="chart-tooltip-row">
        <span>Orders</span>
        <strong>{formatNumber(point.orders)}</strong>
      </div>
    </div>
  );
}

export function RevenueChart({ data }: { data: DailyRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.16} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="oklch(0.93 0.005 260)" />
        <XAxis
          dataKey="day"
          tickFormatter={formatDay}
          tick={TICK}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tickMargin={8}
        />
        <YAxis
          tickFormatter={formatMoneyCompact}
          tick={TICK}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'oklch(0.85 0.006 260)' }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#revenue-fill)"
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'white' }}
          animationDuration={300}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
