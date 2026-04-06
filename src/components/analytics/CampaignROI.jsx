import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignROI({ campaigns, isLoading }) {
  const chartData = useMemo(() => {
    return campaigns.slice(0, 8).map(campaign => {
      const spend = campaign.spend || campaign.budget || 0;
      const revenue = (campaign.conversions || 0) * 50; // Assume avg $50 per conversion
      const roi = spend > 0 ? ((revenue - spend) / spend * 100).toFixed(0) : 0;
      
      return {
        name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
        spend,
        revenue,
        roi: parseFloat(roi),
        impressions: campaign.impressions || 0,
        clicks: campaign.clicks || 0,
        conversions: campaign.conversions || 0
      };
    });
  }, [campaigns]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Campaign ROI Analysis</CardTitle>
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
            <DollarSign className="w-5 h-5 text-green-600" />
            Campaign ROI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>No campaign data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Campaign ROI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value, name) => {
                if (name === 'ROI') return `${value}%`;
                return `$${value}`;
              }}
            />
            <Legend />
            <Bar dataKey="spend" fill="#ef4444" name="Spend" radius={[8, 8, 0, 0]} />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Spend</p>
              <p className="text-lg font-bold text-red-600">
                ${chartData.reduce((sum, c) => sum + c.spend, 0).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-green-600">
                ${chartData.reduce((sum, c) => sum + c.revenue, 0).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Avg ROI</p>
              <p className="text-lg font-bold text-blue-600">
                {chartData.length > 0 
                  ? (chartData.reduce((sum, c) => sum + c.roi, 0) / chartData.length).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}