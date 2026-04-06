import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Activity } from "lucide-react";
import { format, eachDayOfInterval, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerEngagement({ leads, products, campaigns, dateRange, isLoading }) {
  const chartData = useMemo(() => {
    if (!leads.length && !products.length) return [];

    const days = eachDayOfInterval({ start: dateRange.from, to: dateRange.to });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      
      // Leads created on this day
      const dayLeads = leads.filter(l => 
        startOfDay(new Date(l.created_date)).getTime() === dayStart.getTime()
      ).length;
      
      // Products created on this day
      const dayProducts = products.filter(p => 
        startOfDay(new Date(p.created_date)).getTime() === dayStart.getTime()
      ).length;
      
      // Campaigns active on this day
      const activeCampaigns = campaigns.filter(c => {
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);
        return dayStart >= start && dayStart <= end;
      }).length;
      
      return {
        date: format(day, 'MMM d'),
        leads: dayLeads,
        products: dayProducts,
        campaigns: activeCampaigns,
        engagement: (dayLeads * 10) + (dayProducts * 5) + (activeCampaigns * 15) // Engagement score
      };
    });
  }, [leads, products, campaigns, dateRange]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg col-span-2">
        <CardHeader>
          <CardTitle>Customer Engagement Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalEngagement = chartData.reduce((sum, d) => sum + d.engagement, 0);
  const avgDailyEngagement = chartData.length > 0 ? (totalEngagement / chartData.length).toFixed(0) : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Customer Engagement Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area 
              type="monotone" 
              dataKey="engagement" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorEngagement)"
              name="Engagement Score"
            />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              name="New Leads"
            />
            <Line 
              type="monotone" 
              dataKey="campaigns" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
              name="Active Campaigns"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-xs text-purple-700 mb-1">Avg Daily Engagement</p>
            <p className="text-2xl font-bold text-purple-900">{avgDailyEngagement}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-xs text-green-700 mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-green-900">{leads.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 mb-1">Active Products</p>
            <p className="text-2xl font-bold text-blue-900">
              {products.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-xs text-orange-700 mb-1">Running Campaigns</p>
            <p className="text-2xl font-bold text-orange-900">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}