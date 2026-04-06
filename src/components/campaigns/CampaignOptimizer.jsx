const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, DollarSign, Users, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

export default function CampaignOptimizer({ campaigns }) {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);

  const optimizeCampaigns = async () => {
    setLoading(true);
    try {
      const campaignData = campaigns.map(c => ({
        name: c.name,
        status: c.status,
        budget: c.budget,
        impressions: c.impressions || 0,
        clicks: c.clicks || 0,
        conversions: c.conversions || 0,
        spend: c.spend || 0
      }));

      const prompt = `Analyze these marketing campaigns and provide specific optimization recommendations:

${JSON.stringify(campaignData, null, 2)}

Provide optimization strategies in this JSON format:
{
  "budgetOptimization": [
    {
      "campaignName": "name",
      "currentBudget": 1000,
      "recommendedBudget": 1200,
      "reason": "why adjust",
      "expectedROI": "projected improvement"
    }
  ],
  "targetingImprovements": [
    {
      "campaignName": "name",
      "currentPerformance": "description",
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
    }
  ],
  "contentOptimization": [
    {
      "campaignName": "name",
      "issue": "what needs improvement",
      "recommendations": ["recommendation 1", "recommendation 2"]
    }
  ],
  "pauseRecommendations": [
    {
      "campaignName": "name",
      "reason": "why pause/stop",
      "alternatives": "what to do instead"
    }
  ],
  "scalingOpportunities": [
    {
      "campaignName": "name",
      "currentMetrics": "summary",
      "scalingStrategy": "how to scale",
      "potentialImpact": "expected results"
    }
  ]
}`;

      const result = await db.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            budgetOptimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaignName: { type: "string" },
                  currentBudget: { type: "number" },
                  recommendedBudget: { type: "number" },
                  reason: { type: "string" },
                  expectedROI: { type: "string" }
                }
              }
            },
            targetingImprovements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaignName: { type: "string" },
                  currentPerformance: { type: "string" },
                  suggestions: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            contentOptimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaignName: { type: "string" },
                  issue: { type: "string" },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            pauseRecommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaignName: { type: "string" },
                  reason: { type: "string" },
                  alternatives: { type: "string" }
                }
              }
            },
            scalingOpportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaignName: { type: "string" },
                  currentMetrics: { type: "string" },
                  scalingStrategy: { type: "string" },
                  potentialImpact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setOptimization(result);
    } catch (error) {
      console.error("Error optimizing campaigns:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-600" />
          AI Campaign Optimizer
        </CardTitle>
        <Button
          onClick={optimizeCampaigns}
          disabled={loading}
          size="sm"
          className="bg-gradient-to-r from-orange-600 to-red-600"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Optimize Campaigns
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!optimization && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Target className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-slate-600">Get AI-powered optimization strategies for your campaigns</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {optimization && !loading && (
          <div className="space-y-6">
            {/* Budget Optimization */}
            {optimization.budgetOptimization && optimization.budgetOptimization.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Budget Optimization
                </h3>
                <div className="space-y-3">
                  {optimization.budgetOptimization.map((item, i) => (
                    <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="font-semibold text-slate-900 mb-2">{item.campaignName}</p>
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="text-xs text-slate-600">Current</p>
                          <p className="text-lg font-bold text-slate-900">${item.currentBudget}</p>
                        </div>
                        <div className="text-slate-400">→</div>
                        <div>
                          <p className="text-xs text-green-600">Recommended</p>
                          <p className="text-lg font-bold text-green-600">${item.recommendedBudget}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{item.reason}</p>
                      <div className="p-2 bg-white rounded border border-green-200">
                        <p className="text-xs font-medium text-green-700">Expected: {item.expectedROI}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targeting Improvements */}
            {optimization.targetingImprovements && optimization.targetingImprovements.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Targeting Improvements
                </h3>
                <div className="space-y-3">
                  {optimization.targetingImprovements.map((item, i) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-semibold text-slate-900 mb-2">{item.campaignName}</p>
                      <p className="text-sm text-slate-600 mb-3">{item.currentPerformance}</p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700">Suggestions:</p>
                        {item.suggestions?.map((suggestion, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <Badge className="bg-blue-100 text-blue-700 flex-shrink-0">{j + 1}</Badge>
                            <span className="text-sm text-slate-600">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scaling Opportunities */}
            {optimization.scalingOpportunities && optimization.scalingOpportunities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Scaling Opportunities
                </h3>
                <div className="space-y-3">
                  {optimization.scalingOpportunities.map((item, i) => (
                    <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="font-semibold text-slate-900 mb-2">{item.campaignName}</p>
                      <p className="text-sm text-slate-600 mb-2">{item.currentMetrics}</p>
                      <div className="p-3 bg-white rounded-lg mb-2">
                        <p className="text-xs font-medium text-slate-700 mb-1">Scaling Strategy:</p>
                        <p className="text-sm text-slate-600">{item.scalingStrategy}</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded">
                        <p className="text-xs font-medium text-purple-700">{item.potentialImpact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pause Recommendations */}
            {optimization.pauseRecommendations && optimization.pauseRecommendations.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Consider Pausing
                </h3>
                <div className="space-y-3">
                  {optimization.pauseRecommendations.map((item, i) => (
                    <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="font-semibold text-slate-900 mb-2">{item.campaignName}</p>
                      <p className="text-sm text-red-700 mb-2">⚠️ {item.reason}</p>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs font-medium text-slate-700 mb-1">Alternative:</p>
                        <p className="text-sm text-slate-600">{item.alternatives}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}