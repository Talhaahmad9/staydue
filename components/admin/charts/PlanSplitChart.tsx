"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  Monthly: "#0d9488",
  Semester: "#fbbf24",
};

export default function PlanSplitChart({ data }: { data: { name: string; value: number }[] }) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="bg-page-surface border border-line rounded-xl p-5">
      <p className="text-sm font-medium text-text-primary mb-4">Revenue by plan</p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? "#555"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: "#f5f5f5" }}
              formatter={(value) => [`₨ ${Number(value).toLocaleString()}`]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: "#a3a3a3", fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
          No revenue yet
        </div>
      )}
    </div>
  );
}
