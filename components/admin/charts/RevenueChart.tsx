"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { RevenueByMonth } from "@/lib/admin";

export default function RevenueChart({ data }: { data: RevenueByMonth[] }) {
  return (
    <div className="bg-page-surface border border-line rounded-xl p-5">
      <p className="text-sm font-medium text-text-primary mb-4">Revenue by month (PKR)</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${v / 1000}k` : String(v)}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#a3a3a3" }}
            cursor={{ fill: "#ffffff08" }}
            formatter={(value) => [`₨ ${Number(value).toLocaleString()}`]}
          />
          <Legend
            iconType="square"
            iconSize={10}
            formatter={(value) => <span style={{ color: "#a3a3a3", fontSize: 12 }}>{value}</span>}
          />
          <Bar dataKey="monthly" name="Monthly" fill="#0d9488" radius={[3, 3, 0, 0]} maxBarSize={28} />
          <Bar dataKey="semester" name="Semester" fill="#fbbf24" radius={[3, 3, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
