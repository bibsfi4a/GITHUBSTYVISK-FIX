import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap } from "lucide-react";
import AICampaignGenerator from "./AICampaignGenerator";

export default function CampaignDialog({ open, onOpenChange, campaign, products, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product_id: "",
    budget: 0,
    daily_budget: 0,
    start_date: "",
    end_date: "",
    status: "draft",
    phase: "learning",
    launch_boost_enabled: true,
    target_audience: "",
    location_targeting: "",
    geo_radius_expanded: false,
    featured_in_marketplace: false
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        ...campaign,
        launch_boost_enabled: campaign.launch_boost_enabled ?? true
      });
    } else {
      setFormData({
        name: "",
        description: "",
        product_id: products[0]?.id || "",
        budget: 0,
        daily_budget: 50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        status: "draft",
        phase: "learning",
        launch_boost_enabled: true,
        target_audience: "",
        location_targeting: "",
        geo_radius_expanded: false,
        featured_in_marketplace: false
      });
    }
  }, [campaign, products, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate readiness score
    const readinessScore = 
      (formData.budget > 0 ? 20 : 0) +
      (formData.target_audience ? 20 : 0) +
      (formData.location_targeting ? 20 : 0) +
      (formData.description ? 20 : 0) +
      (formData.launch_boost_enabled ? 20 : 0);
    
    // Auto-enable geo expansion if budget is low
    const shouldExpandGeo = formData.daily_budget < 100;
    
    onSave({
      ...formData,
      readiness_score: readinessScore,
      geo_radius_expanded: shouldExpandGeo || formData.geo_radius_expanded
    });
  };
  
  // Calculate readiness in real-time
  const readinessScore = 
    (formData.budget > 0 ? 20 : 0) +
    (formData.target_audience ? 20 : 0) +
    (formData.location_targeting ? 20 : 0) +
    (formData.description ? 20 : 0) +
    (formData.launch_boost_enabled ? 20 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
          <p className="text-sm text-slate-600">
            {!campaign && "Enable Launch Boost to maximize your campaign's initial reach"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Generator — only for new campaigns */}
          {!campaign && (
            <AICampaignGenerator
              product={products.find(p => p.id === formData.product_id) || products[0]}
              onApply={(suggested) => setFormData(prev => ({ ...prev, ...suggested }))}
            />
          )}

          {/* Readiness Score */}
          {!campaign && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900">Campaign Readiness</p>
                <Badge variant="outline" className={readinessScore >= 80 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                  {readinessScore}%
                </Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {readinessScore >= 80 ? "Ready to launch!" : "Complete more fields for better performance"}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Campaign Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Get More Leads - Product Name - Location"
              />
              <p className="text-xs text-slate-500 mt-1">Format: [Goal] - [Product] - [Location]</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What makes your offering unique? Why should customers choose you?"
                rows={3}
                required
              />
            </div>

            {/* Product */}
            <div className="md:col-span-2">
              <Label htmlFor="product_id">Associated Product *</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Daily Budget */}
            <div>
              <Label htmlFor="daily_budget">Daily Budget ($) *</Label>
              <Input
                id="daily_budget"
                type="number"
                min="10"
                step="1"
                value={formData.daily_budget}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_budget: parseFloat(e.target.value) }))}
                placeholder="50"
                required
              />
              {formData.daily_budget < 50 && formData.daily_budget > 0 && (
                <div className="flex items-start gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5" />
                  <p className="text-xs text-orange-600">Low budget may limit reach</p>
                </div>
              )}
            </div>

            {/* Total Budget */}
            <div>
              <Label htmlFor="budget">Total Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="1"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                placeholder="1000"
              />
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>

            {/* Target Audience */}
            <div className="md:col-span-2">
              <Label htmlFor="target_audience">Target Audience *</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="e.g., Small business owners, 25-45 years old"
                required
              />
            </div>

            {/* Location Targeting */}
            <div className="md:col-span-2">
              <Label htmlFor="location_targeting">Location Targeting *</Label>
              <Input
                id="location_targeting"
                value={formData.location_targeting}
                onChange={(e) => setFormData(prev => ({ ...prev, location_targeting: e.target.value }))}
                placeholder="e.g., New York, Los Angeles, Chicago"
                required
              />
            </div>

            {/* Launch Boost Toggle */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <Label htmlFor="launch_boost" className="font-semibold text-slate-900 cursor-pointer">
                      Launch Boost (Recommended)
                    </Label>
                  </div>
                  <p className="text-xs text-slate-600">
                    Increases visibility for first 24-48 hours to generate early impressions
                  </p>
                </div>
                <Switch
                  id="launch_boost"
                  checked={formData.launch_boost_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, launch_boost_enabled: checked }))}
                />
              </div>
            </div>

            {/* Status */}
            {campaign && (
              <div className="md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || readinessScore < 60}
              className="bg-gradient-to-r from-orange-600 to-red-600"
            >
              {isSaving ? "Saving..." : campaign ? "Update Campaign" : "Launch Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}