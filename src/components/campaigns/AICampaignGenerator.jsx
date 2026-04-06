const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2 } from "lucide-react";

export default function AICampaignGenerator({ product, onApply }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(true);

  if (!product) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    const generated = await db.integrations.Core.InvokeLLM({
      prompt: `You are an expert digital marketing strategist. Analyze this product and generate a complete ad campaign plan.

Product Name: ${product.name}
Category: ${product.category}
Description: ${product.description}
Price: $${product.price} (${product.pricing_type})
Location: ${product.location || "Not specified"}
Features: ${(product.features || []).join(", ") || "Not specified"}
Tags: ${(product.tags || []).join(", ") || "Not specified"}

Generate a compelling ad campaign with:
1. A punchy campaign name (format: [Goal] - [Product] - [Location hint])
2. A compelling ad description (2-3 sentences, benefit-focused, emotional hook)
3. Three target audience options ranked by potential
4. Budget recommendations with daily budget (minimum $10) and total budget for 30-day run
5. Location targeting suggestions based on product type

Be specific and actionable. Tailor everything to the product category and price point.`,
      response_json_schema: {
        type: "object",
        properties: {
          campaign_name: { type: "string" },
          description: { type: "string" },
          target_audiences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                rationale: { type: "string" }
              }
            }
          },
          daily_budget: { type: "number" },
          total_budget: { type: "number" },
          location_targeting: { type: "string" },
          budget_rationale: { type: "string" }
        }
      }
    });

    setResult(generated);
    setIsGenerating(false);
    setExpanded(true);
  };

  const handleApplyAll = () => {
    onApply({
      name: result.campaign_name,
      description: result.description,
      target_audience: result.target_audiences?.[0]?.label || "",
      daily_budget: result.daily_budget,
      budget: result.total_budget,
      location_targeting: result.location_targeting
    });
  };

  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-900">AI Campaign Generator</p>
            <p className="text-xs text-violet-600">Powered by AI • Based on "{product.name}"</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={() => setExpanded(!expanded)} className="text-violet-500 hover:text-violet-700">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-xs"
          >
            {isGenerating ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-3 h-3 mr-1" /> {result ? "Regenerate" : "Generate"}</>
            )}
          </Button>
        </div>
      </div>

      {/* Generating state */}
      {isGenerating && (
        <div className="px-4 py-6 text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-violet-700">Analyzing your product and crafting campaign...</p>
        </div>
      )}

      {/* Results */}
      {result && expanded && !isGenerating && (
        <div className="px-4 py-4 space-y-4">
          {/* Campaign Name */}
          <div>
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Campaign Name</p>
            <p className="text-sm font-bold text-slate-900 bg-white rounded-lg px-3 py-2 border border-violet-100">{result.campaign_name}</p>
          </div>

          {/* Ad Description */}
          <div>
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Ad Copy</p>
            <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-violet-100 leading-relaxed">{result.description}</p>
          </div>

          {/* Target Audiences */}
          <div>
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">Target Audiences</p>
            <div className="space-y-2">
              {result.target_audiences?.map((audience, i) => (
                <div key={i} className="bg-white rounded-lg px-3 py-2 border border-violet-100 flex items-start gap-2">
                  <Badge className={`text-xs mt-0.5 flex-shrink-0 ${i === 0 ? "bg-violet-600" : i === 1 ? "bg-purple-400" : "bg-slate-400"}`}>
                    #{i + 1}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{audience.label}</p>
                    <p className="text-xs text-slate-500">{audience.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg px-3 py-2 border border-violet-100 text-center">
              <p className="text-xs text-violet-600 mb-0.5">Daily Budget</p>
              <p className="text-lg font-bold text-slate-900">${result.daily_budget}</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-violet-100 text-center">
              <p className="text-xs text-violet-600 mb-0.5">30-Day Total</p>
              <p className="text-lg font-bold text-slate-900">${result.total_budget}</p>
            </div>
          </div>
          {result.budget_rationale && (
            <p className="text-xs text-violet-600 italic">{result.budget_rationale}</p>
          )}

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Location Targeting</p>
            <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-violet-100">{result.location_targeting}</p>
          </div>

          {/* Apply Button */}
          <Button
            type="button"
            onClick={handleApplyAll}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Apply All Suggestions to Form
          </Button>
        </div>
      )}
    </div>
  );
}