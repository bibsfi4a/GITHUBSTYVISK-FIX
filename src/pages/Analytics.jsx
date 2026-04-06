const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Download, 
  Calendar as CalendarIcon,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import ProductViewsTrend from "../components/analytics/ProductViewsTrend";
import CampaignROI from "../components/analytics/CampaignROI";
import LeadConversionBySource from "../components/analytics/LeadConversionBySource";
import CustomerEngagement from "../components/analytics/CustomerEngagement";
import MetricsOverview from "../components/analytics/MetricsOverview";
import CategoryPerformance from "../components/analytics/CategoryPerformance";

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState("overview");

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    db.auth.me().then(setUser);
  }, []);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Product.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user,
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Campaign.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user,
  });

  const { data: leads, isLoading: loadingLeads } = useQuery({
    queryKey: ['leads', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Lead.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user,
  });

  const filteredData = useMemo(() => {
    const range = {
      start: startOfDay(dateRange.from),
      end: endOfDay(dateRange.to)
    };

    return {
      products: products.filter(p => 
        isWithinInterval(new Date(p.created_date), range)
      ),
      campaigns: campaigns.filter(c => 
        isWithinInterval(new Date(c.created_date), range)
      ),
      leads: leads.filter(l => 
        isWithinInterval(new Date(l.created_date), range)
      )
    };
  }, [products, campaigns, leads, dateRange]);

  const exportToCSV = () => {
    const csvData = [];
    
    // Header
    csvData.push(['Analytics Report']);
    csvData.push([`Date Range: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`]);
    csvData.push([]);
    
    // Products Summary
    csvData.push(['Products Summary']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Products', filteredData.products.length]);
    csvData.push(['Active Products', filteredData.products.filter(p => p.status === 'active').length]);
    csvData.push(['Total Views', filteredData.products.reduce((sum, p) => sum + (p.views || 0), 0)]);
    csvData.push([]);
    
    // Campaigns Summary
    csvData.push(['Campaigns Summary']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Campaigns', filteredData.campaigns.length]);
    csvData.push(['Active Campaigns', filteredData.campaigns.filter(c => c.status === 'active').length]);
    csvData.push(['Total Impressions', filteredData.campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)]);
    csvData.push(['Total Clicks', filteredData.campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)]);
    csvData.push(['Total Conversions', filteredData.campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)]);
    csvData.push([]);
    
    // Leads Summary
    csvData.push(['Leads Summary']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Leads', filteredData.leads.length]);
    csvData.push(['New Leads', filteredData.leads.filter(l => l.status === 'new').length]);
    csvData.push(['Converted Leads', filteredData.leads.filter(l => l.status === 'converted').length]);
    csvData.push(['Conversion Rate', `${((filteredData.leads.filter(l => l.status === 'converted').length / filteredData.leads.length) * 100 || 0).toFixed(1)}%`]);
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = loadingProducts || loadingCampaigns || loadingLeads;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Track performance and gain insights into your marketing efforts</p>
        </div>
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-slate-300">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setDateRange({ from: subDays(new Date(), 90), to: new Date() })}
                >
                  Last 90 days
                </Button>
              </div>
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => range?.from && range?.to && setDateRange({ from: range.from, to: range.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Engagement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <MetricsOverview 
            products={filteredData.products}
            campaigns={filteredData.campaigns}
            leads={filteredData.leads}
            isLoading={isLoading}
          />
          
          <div className="grid lg:grid-cols-2 gap-6">
            <ProductViewsTrend 
              products={filteredData.products}
              dateRange={dateRange}
              isLoading={isLoading}
            />
            <CampaignROI 
              campaigns={filteredData.campaigns}
              isLoading={isLoading}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <LeadConversionBySource 
              leads={filteredData.leads}
              isLoading={isLoading}
            />
            <CategoryPerformance 
              products={filteredData.products}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <ProductViewsTrend 
              products={filteredData.products}
              dateRange={dateRange}
              isLoading={isLoading}
            />
            <CategoryPerformance 
              products={filteredData.products}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <CampaignROI 
            campaigns={filteredData.campaigns}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6 mt-6">
          <LeadConversionBySource 
            leads={filteredData.leads}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6 mt-6">
          <CustomerEngagement 
            leads={filteredData.leads}
            products={filteredData.products}
            campaigns={filteredData.campaigns}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}