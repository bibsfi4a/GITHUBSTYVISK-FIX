import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPerformance({ products, isLoading }) {
  const chartData = useMemo(() => {
    const categoryStats = {};
    
    products.forEach(product => {
      const category = product.category || 'other';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          views: 0,
          revenue: 0
        };
      }
      categoryStats[category].count++;
      categoryStats[category].views += product.views || 0;
      categoryStats[category].revenue += product.price || 0;
    });

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        name: category.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        products: stats.count,
        views: stats.views,
        avgPrice: stats.count > 0 ? (stats.revenue / stats.count).toFixed(0) : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [products]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
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
            <Package className="w-5 h-5 text-orange-600" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>No product data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-600" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b"
              style={{ fontSize: '11px' }}
              width={100}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="views" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {chartData.slice(0, 4).map((item, index) => (
            <div key={index} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">{item.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-slate-900">{item.views}</p>
                <p className="text-xs text-slate-600">views</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {item.products} products • ${item.avgPrice} avg
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}