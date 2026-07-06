"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#6f4f2f", "#c0a16b", "#32443b", "#5e4228", "#ded0bd", "#b8945d"];

type BarData = { name: string; views: number; whatsappClicks: number; interestAdds: number };
type PieData = { name: string; value: number };

export function TopProductsChart({ data }: { data: BarData[] }) {
  if (data.length === 0) return null;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="views" fill="#6f4f2f" radius={[4, 4, 0, 0]} name="مشاهدات" />
          <Bar dataKey="whatsappClicks" fill="#c0a16b" radius={[4, 4, 0, 0]} name="واتساب" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficSourcesChart({ data }: { data: PieData[] }) {
  if (data.length === 0) return null;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} label={pieLabel} dataKey="value">
            {data.map((_entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function pieLabel(entry: { name?: unknown; percent?: unknown }) {
  return `${String(entry.name ?? "")} ${entry.percent != null ? (Number(entry.percent) * 100).toFixed(0) : "0"}%`;
}
