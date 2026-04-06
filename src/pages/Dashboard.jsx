const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingUp,
  Package,
  Megaphone,
  Plus,
  Eye,
  CheckCircle,
  Circle,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIInsights from "../components/dashboard/AIInsights";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: products } = useQuery({
    queryKey: ['products', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Product.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Campaign.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user
  });

  const { data: leads } = useQuery({
    queryKey: ['leads', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return db.entities.Lead.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user
  });

  const hasProducts = products.length > 0;
  const hasCampaigns = campaigns.length > 0;
  const hasLeads = leads.length > 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-2xl shadow-xl p-8 lg:p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Welcome to Your Marketing Dashboard
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Manage your listings, campaigns, and leads all in one place
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to={createPageUrl("Products")}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white text-base px-6 py-6 h-auto rounded-xl shadow-lg">
                <Package className="w-5 h-5 mr-2" />
                List Products
              </Button>
            </Link>
            <Link to={createPageUrl("Campaigns")}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white text-base px-6 py-6 h-auto rounded-xl shadow-lg">
                <Megaphone className="w-5 h-5 mr-2" />
                Make Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights
        products={products}
        campaigns={campaigns}
        leads={leads} />

    </div>);

}