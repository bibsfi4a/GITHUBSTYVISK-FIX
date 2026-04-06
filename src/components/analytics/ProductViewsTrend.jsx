import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, eachDayOfInterval, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductViewsTrend({ products, dateRange, isLoading }) {
  const chartData = useMemo(() => {
    if (!products.length) return [];

    const days = eachDayOfInterval({ start: dateRange.from, to: dateRange.to });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayProducts = products.filter(p => 
        startOfDay(new Date(p.created_date)).getTime() <= dayStart.getTime()
      );
      
      // Simulate daily views (in real app, you'd track this)
      const totalViews = dayProducts.reduce((sum, p) => sum + (p.views || 0), 0);
      const dailyViews = Math.floor(totalViews / days.length) + Math.floor(Math.random() * 20);
      
      return {
        date: format(day, 'MMM d'),
        views: dailyViews,
        products: dayProducts.filter(p => p.status === 'active').length
      };
    });
  }, [products, dateRange]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Product Views Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Product Views Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Daily Views"
            />
            <Line 
              type="monotone" 
              dataKey="products" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              name="Active Products"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}