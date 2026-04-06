const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target, Lightbulb, RefreshCw, ChevronRight, Clock, Users, Package, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function AIInsights({ products, campaigns, leads }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Analyze product performance
      const topProducts = products
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3);
      
      const lowPerformingProducts = products
        .filter(p => p.status === 'active' && (p.views || 0) < 50)
        .slice(0, 3);

      // Analyze campaign effectiveness
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      const campaignCTR = activeCampaigns.map(c => ({
        name: c.name,
        ctr: c.impressions > 0 ? (c.clicks / c.impressions * 100).toFixed(2) : 0
      }));

      // Analyze lead conversion
      const leadsBySource = {};
      leads.forEach(lead => {
        const source = lead.source || 'unknown';
        if (!leadsBySource[source]) {
          leadsBySource[source] = { total: 0, converted: 0 };
        }
        leadsBySource[source].total++;
        if (lead.status === 'converted') {
          leadsBySource[source].converted++;
        }
      });

      // Analyze engagement patterns
      const highPriorityLeads = leads.filter(l => l.priority === 'high' && l.status === 'new').length;
      const avgConversionTime = 3.5; // Mock data
      
      const prompt = `As an expert marketing analyst, analyze this business data and provide 5 highly specific, actionable recommendations:

PRODUCTS DATA:
- Total products: ${products.length} (${products.filter(p => p.status === 'active').length} active)
- Top performing: ${topProducts.map(p => `${p.name} (${p.views} views)`).join(', ')}
- Low performing: ${lowPerformingProducts.map(p => `${p.name} (${p.views || 0} views)`).join(', ')}
- Categories: ${[...new Set(products.map(p => p.category))].join(', ')}

CAMPAIGNS DATA:
- Total campaigns: ${campaigns.length} (${activeCampaigns.length} active)
- Total impressions: ${campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)}
- Total clicks: ${campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)}
- Campaign CTRs: ${campaignCTR.map(c => `${c.name}: ${c.ctr}%`).join(', ')}

LEADS DATA:
- Total leads: ${leads.length}
- By source: ${Object.entries(leadsBySource).map(([source, stats]) => 
    `${source}: ${stats.total} (${((stats.converted/stats.total)*100).toFixed(1)}% conversion)`).join(', ')}
- High priority uncontacted: ${highPriorityLeads}
- New leads: ${leads.filter(l => l.status === 'new').length}
- Converted: ${leads.filter(l => l.status === 'converted').length}

Provide recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "title": "specific action title",
      "description": "detailed explanation of why and how",
      "priority": "high|medium|low",
      "category": "products|campaigns|leads|social|general",
      "impact": "description of expected impact",
      "actionItems": ["specific step 1", "specific step 2", "specific step 3"]
    }
  ]
}

Focus on:
1. Specific product recommendations based on performance data
2. Campaign optimization with exact adjustments
3. Lead engagement strategies for high-value prospects
4. Social media timing and content strategies
5. Budget reallocation suggestions`;

      const result = await db.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  category: { type: "string" },
                  impact: { type: "string" },
                  actionItems: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setInsights(result.recommendations);
    } catch (error) {
      console.error("Error generating insights:", error);
    }
    setLoading(false);
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200"
  };

  const categoryIcons = {
    products: Package,
    campaigns: Target,
    leads: Users,
    social: Zap,
    general: Lightbulb
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Marketing Intelligence
        </CardTitle>
        <Button
          onClick={generateInsights}
          disabled={loading}
          size="sm"
          variant="outline"
          className="border-purple-200"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-600 mb-2">Get AI-powered recommendations tailored to your business</p>
            <p className="text-sm text-slate-500">
              Our AI will analyze your products, campaigns, and leads to provide personalized strategies
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = categoryIcons[insight.category] || Lightbulb;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        <Badge className={`${priorityColors[insight.priority]} border flex-shrink-0`}>
                          {insight.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                      
                      {insight.impact && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-blue-900 mb-1">Expected Impact</p>
                              <p className="text-sm text-blue-700">{insight.impact}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {insight.actionItems && insight.actionItems.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700 mb-2">Action Steps:</p>
                          {insight.actionItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}