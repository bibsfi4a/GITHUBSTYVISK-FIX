import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Zap, TrendingUp, Share2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CampaignCard({ campaign, products, onEdit, onDelete }) {
  const product = products.find(p => p.id === campaign.product_id);
  
  // Calculate campaign phase and metrics
  const daysSinceStart = campaign.start_date ? 
    Math.floor((new Date() - new Date(campaign.start_date)) / (1000 * 60 * 60 * 24)) : 0;
  
  const isNew = daysSinceStart <= 2;
  const hasMinimumData = campaign.impressions >= 100;
  const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : 0;
  
  // Determine phase
  let phase = campaign.phase || 'learning';
  if (campaign.status === 'active') {
    if (isNew) {
      phase = 'learning';
    } else if (!hasMinimumData) {
      phase = 'gathering_data';
    } else if (parseFloat(ctr) > 2.0) {
      phase = 'performing_well';
    } else if (campaign.impressions < 50 || parseFloat(ctr) < 0.5) {
      phase = 'needs_attention';
    }
  }
  
  // Phase configuration
  const phaseConfig = {
    learning: {
      label: "Learning Phase",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
    },
    gathering_data: {
      label: "Gathering Data",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: TrendingUp,
    },
    performing_well: {
      label: "Performing Well",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    needs_attention: {
      label: "Needs Attention",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      icon: AlertCircle,
    }
  };
  
  const statusColors = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    active: "bg-green-100 text-green-700 border-green-200",
    paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200"
  };
  
  // Generate AI insights
  const getAIInsight = () => {
    if (campaign.ai_insight) return campaign.ai_insight;
    
    if (phase === 'learning') {
      return "Most campaigns start delivering data within 24-48 hours. Your campaign is in the learning phase.";
    } else if (phase === 'needs_attention') {
      if (campaign.impressions < 50) {
        return "Your audience is too small to generate impressions. Expand targeting to reach 10× more users.";
      } else if (parseFloat(ctr) < 0.5) {
        return "Low click-through rate detected. Consider improving your headline and description.";
      }
    } else if (phase === 'gathering_data') {
      return `You're on track! ${100 - campaign.impressions} more impressions needed for optimization data.`;
    } else if (phase === 'performing_well') {
      return "Great performance! Consider increasing your budget to scale this campaign.";
    }
    return null;
  };
  
  // Smart action button
  const getSmartAction = () => {
    if (phase === 'learning') {
      return { label: "Boost Visibility", action: "boost", variant: "default" };
    } else if (phase === 'needs_attention') {
      if (campaign.impressions < 50) {
        return { label: "Fix Targeting", action: "edit", variant: "destructive" };
      } else {
        return { label: "Improve Copy", action: "edit", variant: "default" };
      }
    } else if (phase === 'gathering_data') {
      return { label: "View Details", action: "edit", variant: "outline" };
    } else if (phase === 'performing_well') {
      return { label: "Scale Campaign", action: "scale", variant: "default" };
    }
    return { label: "Edit Campaign", action: "edit", variant: "outline" };
  };
  
  const aiInsight = getAIInsight();
  const smartAction = getSmartAction();
  const PhaseIcon = phaseConfig[phase].icon;
  
  // Readiness score calculation
  const readinessScore = campaign.readiness_score || (
    (campaign.budget > 0 ? 20 : 0) +
    (campaign.target_audience ? 20 : 0) +
    (campaign.location_targeting ? 20 : 0) +
    (campaign.description ? 20 : 0) +
    (campaign.launch_boost_enabled ? 20 : 0)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-slate-900">{campaign.name}</h3>
                {campaign.is_trending && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                    🔥 Trending
                  </Badge>
                )}
              </div>
              {product && (
                <p className="text-sm text-slate-600">For: {product.name}</p>
              )}
            </div>
          </div>
          
          {/* Status & Phase Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusColors[campaign.status]} border`}>
              {campaign.status}
            </Badge>
            <span className="text-slate-400">·</span>
            <Badge className={`${phaseConfig[phase].color} border flex items-center gap-1`}>
              <PhaseIcon className="w-3 h-3" />
              {phaseConfig[phase].label}
            </Badge>
            {campaign.launch_boost_enabled && isNew && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                ⚡ Launch Boost
              </Badge>
            )}
          </div>
          
          {/* Readiness Score */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Campaign Readiness</span>
              <span className="font-bold">{readinessScore}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Context Banner for New/Low Data */}
          {(isNew || !hasMinimumData) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ℹ️ Most campaigns start delivering data within 24-48 hours. Be patient!
              </p>
            </div>
          )}
          
          {/* AI Insight Panel */}
          {aiInsight && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🧠 AI Insight</p>
                  <p className="text-sm text-purple-800">{aiInsight}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Contextual Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Impressions</p>
              <p className="text-xl font-bold text-slate-900">
                {campaign.impressions || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {campaign.impressions === 0 ? "Too early to judge" : 
                 campaign.impressions < 100 ? "Gathering data..." : "Delivering well"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Clicks</p>
              <p className="text-xl font-bold text-slate-900">
                {campaign.clicks || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {campaign.clicks === 0 ? "No clicks yet" :
                 parseFloat(ctr) > 2.0 ? "Above average" : "Normal range"}
              </p>
            </div>
          </div>
          
          {/* Smart Action Button (PRIMARY) */}
          <Button
            onClick={() => onEdit(campaign)}
            className={`w-full ${
              smartAction.variant === 'destructive' 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : smartAction.variant === 'default'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'border-slate-300'
            }`}
            variant={smartAction.variant === 'outline' ? 'outline' : 'default'}
          >
            {smartAction.label}
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(campaign)}
                className="text-slate-600 hover:text-slate-900"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(campaign.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {campaign.featured_in_marketplace && (
              <Badge variant="outline" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}