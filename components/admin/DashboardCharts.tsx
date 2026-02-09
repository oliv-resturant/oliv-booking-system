'use client';

import { Bar, BarChart, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  month: string;
  bookings: number;
  revenue: number;
  [key: string]: string | number;
}

interface DashboardChartsProps {
  data?: ChartData[];
}

const COLORS = ['#9DAE91', '#262D39', '#6B7280', '#10B981', '#F59E0B'];

export function BookingsChart({ data = [] }: DashboardChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="month"
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'var(--font-family)' }}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'var(--font-family)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'var(--font-family)'
          }}
        />
        <Bar
          dataKey="bookings"
          fill="#9DAE91"
          radius={[8, 8, 0, 0]}
          style={{ cursor: 'pointer' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data = [] }: DashboardChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="month"
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'var(--font-family)' }}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'var(--font-family)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'var(--font-family)'
          }}
          formatter={(value: number) => [`CHF ${value.toLocaleString()}`, 'Revenue']}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--font-family)' }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#9DAE91"
          strokeWidth={3}
          dot={{ fill: '#9DAE91', r: 6, strokeWidth: 2 }}
          activeDot={{ r: 8, stroke: '#8A9D82', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export function StatusDistributionChart({ data }: { data: StatusData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          style={{ fontFamily: 'var(--font-family)', fontSize: '13px' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'var(--font-family)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle style={{
          fontSize: 'var(--text-h3)',
          fontWeight: 'var(--font-weight-semibold)',
          fontFamily: 'var(--font-family)'
        }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
