import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, Megaphone, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsOverview({ products, campaigns, leads, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const conversionRate = leads.length > 0 
    ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1)
    : 0;
  const avgCTR = totalImpressions > 0 
    ? ((totalClicks / totalImpressions) * 100).toFixed(2)
    : 0;

  const metrics = [
    {
      title: "Total Product Views",
      value: totalViews.toLocaleString(),
      change: "+12%",
      isPositive: true,
      icon: Package,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Campaign Impressions",
      value: totalImpressions.toLocaleString(),
      change: "+8%",
      isPositive: true,
      icon: Megaphone,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Lead Conversion Rate",
      value: `${conversionRate}%`,
      change: "+5%",
      isPositive: true,
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Avg Campaign CTR",
      value: `${avgCTR}%`,
      change: "+3%",
      isPositive: true,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{metric.change}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{metric.title}</p>
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}