"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface SignupChartProps {
  data: { date: string; count: number }[];
}

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(month) - 1]}`;
}

export default function SignupChart({ data }: SignupChartProps) {
  const formatted = data.map((d) => ({ ...d, label: formatDate(d.date) }));

  return (
    <div className="bg-page-surface border border-line rounded-xl p-5">
      <p className="text-sm font-medium text-text-primary mb-4">New signups — last 30 days</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#a3a3a3" }}
            itemStyle={{ color: "#0d9488" }}
            cursor={{ stroke: "#333" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Signups"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#signupGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#0d9488" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
