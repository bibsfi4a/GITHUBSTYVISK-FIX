import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function LeadConversionBySource({ leads, isLoading }) {
  const chartData = useMemo(() => {
    const sourceStats = {};
    
    leads.forEach(lead => {
      const source = lead.source || 'unknown';
      if (!sourceStats[source]) {
        sourceStats[source] = { total: 0, converted: 0 };
      }
      sourceStats[source].total++;
      if (lead.status === 'converted') {
        sourceStats[source].converted++;
      }
    });

    return Object.entries(sourceStats).map(([source, stats]) => ({
      name: source.charAt(0).toUpperCase() + source.slice(1),
      value: stats.total,
      converted: stats.converted,
      rate: ((stats.converted / stats.total) * 100).toFixed(1)
    }));
  }, [leads]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Lead Conversion by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Lead Conversion by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>No lead data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Lead Conversion by Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, rate }) => `${name}: ${rate}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value, name, props) => [
                `${props.payload.converted} converted of ${value} leads (${props.payload.rate}%)`,
                'Conversion'
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-3">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-600">
                    {item.converted} / {item.value} converted
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{item.rate}%</p>
                <p className="text-xs text-slate-600">conversion rate</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}