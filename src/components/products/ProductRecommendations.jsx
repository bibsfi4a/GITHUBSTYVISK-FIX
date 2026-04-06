const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Target, RefreshCw, Package } from "lucide-react";

export default function ProductRecommendations({ products }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeProducts = async () => {
    setLoading(true);
    try {
      const productData = products.map(p => ({
        name: p.name,
        category: p.category,
        price: p.price,
        views: p.views || 0,
        status: p.status
      }));

      const prompt = `Analyze these products and provide specific recommendations:

${JSON.stringify(productData, null, 2)}

Provide analysis in this JSON format:
{
  "topPerformers": [
    {
      "productName": "name",
      "reason": "why it's performing well",
      "recommendation": "how to capitalize on success"
    }
  ],
  "needsAttention": [
    {
      "productName": "name",
      "issue": "what's wrong",
      "solutions": ["solution 1", "solution 2", "solution 3"]
    }
  ],
  "pricingInsights": [
    {
      "productName": "name",
      "currentPrice": 100,
      "suggestedPrice": 120,
      "reasoning": "why adjust pricing"
    }
  ],
  "crossSellOpportunities": [
    {
      "product1": "name",
      "product2": "name",
      "strategy": "how to bundle/cross-sell"
    }
  ]
}

Focus on actionable, specific recommendations based on views and category performance.`;

      const result = await db.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            topPerformers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productName: { type: "string" },
                  reason: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            needsAttention: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productName: { type: "string" },
                  issue: { type: "string" },
                  solutions: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            pricingInsights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productName: { type: "string" },
                  currentPrice: { type: "number" },
                  suggestedPrice: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            crossSellOpportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product1: { type: "string" },
                  product2: { type: "string" },
                  strategy: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error("Error analyzing products:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Product Insights
        </CardTitle>
        <Button
          onClick={analyzeProducts}
          disabled={loading}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Products
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!recommendations && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-600">Get AI-powered insights on your product performance</p>
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

        {recommendations && !loading && (
          <div className="space-y-6">
            {/* Top Performers */}
            {recommendations.topPerformers && recommendations.topPerformers.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Products
                </h3>
                <div className="space-y-3">
                  {recommendations.topPerformers.map((product, i) => (
                    <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="font-semibold text-slate-900 mb-2">{product.productName}</p>
                      <p className="text-sm text-slate-600 mb-2">{product.reason}</p>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs font-medium text-slate-700 mb-1">Recommendation:</p>
                        <p className="text-sm text-slate-600">{product.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Needs Attention */}
            {recommendations.needsAttention && recommendations.needsAttention.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Products Needing Attention
                </h3>
                <div className="space-y-3">
                  {recommendations.needsAttention.map((product, i) => (
                    <div key={i} className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="font-semibold text-slate-900 mb-2">{product.productName}</p>
                      <p className="text-sm text-orange-700 mb-3">⚠️ {product.issue}</p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700">Suggested Actions:</p>
                        {product.solutions?.map((solution, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm">
                            <Badge className="bg-orange-100 text-orange-700 flex-shrink-0">{j + 1}</Badge>
                            <span className="text-slate-600">{solution}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Insights */}
            {recommendations.pricingInsights && recommendations.pricingInsights.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Pricing Optimization
                </h3>
                <div className="space-y-3">
                  {recommendations.pricingInsights.map((insight, i) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-semibold text-slate-900 mb-2">{insight.productName}</p>
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="text-xs text-slate-600">Current</p>
                          <p className="text-lg font-bold text-slate-900">${insight.currentPrice}</p>
                        </div>
                        <div className="text-slate-400">→</div>
                        <div>
                          <p className="text-xs text-blue-600">Suggested</p>
                          <p className="text-lg font-bold text-blue-600">${insight.suggestedPrice}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{insight.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cross-Sell Opportunities */}
            {recommendations.crossSellOpportunities && recommendations.crossSellOpportunities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Cross-Sell Opportunities
                </h3>
                <div className="space-y-3">
                  {recommendations.crossSellOpportunities.map((opportunity, i) => (
                    <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-200 text-purple-800">{opportunity.product1}</Badge>
                        <span className="text-slate-400">+</span>
                        <Badge className="bg-purple-200 text-purple-800">{opportunity.product2}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{opportunity.strategy}</p>
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