'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_META } from '@/lib/constants';
import type { DashboardStats } from '@/types';

export function StatusPie({ data }: { data: DashboardStats['statusBreakdown'] }) {
  const chartData = data.map((d) => ({
    name: STATUS_META[d.status].label,
    value: d.count,
    color: STATUS_META[d.status].color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lokalizacje wg statusu</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MonthlyProgress({ data }: { data: DashboardStats['monthlyProgress'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Postęp miesięczny</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="signed" name="Podpisane" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="installed" name="Instalacje" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopRegions({ data }: { data: DashboardStats['topRegions'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regiony wg liczby lokalizacji</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Lokalizacje" fill="#4CAF50" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
