const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Plus } from "lucide-react";

const categories = [
  "technology", "retail", "food_beverage", "health_wellness", "education",
  "professional_services", "real_estate", "automotive", "fashion", "home_garden",
  "entertainment", "sports_fitness", "beauty", "finance", "other"
];

const pricingTypes = ["fixed", "hourly", "monthly", "negotiable", "free"];

export default function ProductDialog({ open, onOpenChange, product, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "technology",
    price: 0,
    pricing_type: "fixed",
    location: "",
    status: "active",
    tags: [],
    banner_image: "",
    image_url: "",
    features: [],
    website_url: "",
    affiliate_link: ""
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "technology",
        price: 0,
        pricing_type: "fixed",
        location: "",
        status: "pending",
        tags: [],
        banner_image: "",
        image_url: "",
        features: [],
        website_url: "",
        affiliate_link: ""
      });
    }
  }, [product, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setUploading(false);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, banner_image: file_url }));
    } catch (error) {
      console.error("Error uploading banner:", error);
    }
    setUploadingBanner(false);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        features: [...(prev.features || []), featureInput.trim()] 
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Listing" : "Create New Listing"}</DialogTitle>
          <p className="text-sm text-slate-500">Promote your product, service, app, or company</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner Image Upload */}
          <div>
            <Label>Cover Banner (Recommended)</Label>
            <div className="mt-2">
              {formData.banner_image ? (
                <div className="relative">
                  <img
                    src={formData.banner_image}
                    alt="Banner"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, banner_image: "" }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    {uploadingBanner ? "Uploading..." : "Upload cover banner"}
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                    id="banner-upload"
                  />
                  <Label htmlFor="banner-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" disabled={uploadingBanner} asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Digital Marketing Suite"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Describe your offering, target audience, and benefits..."
                rows={4}
              />
            </div>

            {/* Features */}
            <div className="md:col-span-2">
              <Label htmlFor="features">Key Features</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="features"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="e.g., Smart targeting"
                />
                <Button type="button" onClick={addFeature} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.features && formData.features.length > 0 && (
                <div className="space-y-1 mt-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded text-sm">
                      <span>✓ {feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(idx)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (0 = Free) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
              {formData.price === 0 && (
                <p className="text-xs text-green-600 mt-1">Will display as "Free"</p>
              )}
            </div>

            {/* Pricing Type */}
            <div>
              <Label htmlFor="pricing_type">Pricing Type</Label>
              <Select
                value={formData.pricing_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricingTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logo/Icon Upload */}
            <div className="md:col-span-2">
              <Label>Logo/Icon (Optional)</Label>
              <div className="mt-2 flex gap-4 items-start">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Logo"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : null}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                      <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
                    </Button>
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">Square logo or icon</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State or Region"
              />
            </div>

            {/* Website URL */}
            <div className="md:col-span-1">
              <Label htmlFor="website_url">Website / App URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Affiliate Link */}
            <div className="md:col-span-1">
              <Label htmlFor="affiliate_link">Affiliate Link</Label>
              <Input
                id="affiliate_link"
                type="url"
                value={formData.affiliate_link}
                onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
                placeholder="https://store.com/ref?id=..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Link for affiliate tracking, e.g., Amazon, Shopify
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isSaving ? "Saving..." : product ? "Update Listing" : "Create Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}