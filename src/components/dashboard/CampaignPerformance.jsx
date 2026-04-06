import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Megaphone, TrendingUp, Eye, MousePointerClick, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignPerformance({ campaigns, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active').slice(0, 3);

  if (activeCampaigns.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No active campaigns</h3>
            <p className="text-sm text-slate-600 mb-6">Launch a campaign to start reaching customers</p>
            <Link to={createPageUrl("Campaigns")}>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600">
                Create Campaign
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Campaign Performance
        </CardTitle>
        <Link to={createPageUrl("Campaigns")}>
          <Button variant="ghost" size="sm" className="text-blue-600">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCampaigns.map(campaign => {
          const ctr = campaign.impressions > 0 
            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1)
            : 0;
          
          return (
            <Link
              key={campaign.id}
              to={createPageUrl("Campaigns")}
              className="block p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {campaign.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <Eye className="w-3 h-3" />
                    <span>Impressions</span>
                  </div>
                  <p className="font-semibold text-slate-900">{campaign.impressions || 0}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span>Clicks</span>
                  </div>
                  <p className="font-semibold text-slate-900">{campaign.clicks || 0}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>CTR</span>
                  </div>
                  <p className="font-semibold text-blue-600">{ctr}%</p>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Conversions</div>
                  <p className="font-semibold text-green-600">{campaign.conversions || 0}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}