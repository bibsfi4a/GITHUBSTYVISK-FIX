const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MapPin, Eye, Package, Star, LogIn } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import ProductComments from "./ProductComments";
import CommentForm from "./CommentForm";

export default function ProductDetailDialog({ product, open, onOpenChange, seller }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    db.auth.isAuthenticated().then(async (auth) => {
      setIsAuthenticated(auth);
      if (auth) {
        const user = await db.auth.me();
        setCurrentUser(user);
        // Auto-capture lead when user views product
        await captureLeadFromView(user, product);
      }
    });
  }, [product?.id]);

  const captureLeadFromView = async (user, product) => {
    if (!user || !product || user.email === product.created_by) return;
    
    // Check if lead already exists
    const existingLeads = await db.entities.Lead.filter({ 
      email: user.email, 
      product_id: product.id 
    });
    
    if (existingLeads.length === 0) {
      // Create new lead
      await db.entities.Lead.create({
        name: user.full_name || user.email.split('@')[0],
        email: user.email,
        product_id: product.id,
        source: 'product_view',
        interest_category: product.category,
        interest_level: 3,
        status: 'new',
        is_public: true
      });
      
      // Increment leads_generated on product
      await db.entities.Product.update(product.id, {
        leads_generated: (product.leads_generated || 0) + 1
      });
    }
  };

  const handleAffiliateClick = async () => {
    if (!product) return;
    
    // Increment affiliate clicks
    await db.entities.Product.update(product.id, {
      clicks: (product.clicks || 0) + 1
    });

    const targetUrl = product.affiliate_link || product.website_url;
    if (!targetUrl) return;

    let finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    
    // Add UTM parameters
    if (finalUrl.includes('?')) {
      finalUrl += '&utm_source=advibra&utm_medium=affiliate';
    } else {
      finalUrl += '?utm_source=advibra&utm_medium=affiliate';
    }

    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = (platform) => {
    const url = window.location.href; // We could use a specific product page URL if exists
    const text = `Check out ${product.name} on the Fashion Discovery Platform!`;
    
    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(`${text} ${url}`);
        alert("Link copied to clipboard!");
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['product-comments', product?.id],
    queryFn: () => db.entities.ProductComment.filter({ 
      product_id: product.id, 
      is_approved: true 
    }, '-created_date'),
    enabled: !!product?.id,
    initialData: [],
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => db.entities.ProductComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-comments', product?.id] });
    },
  });

  const handleCommentSubmit = (commentData) => {
    if (!isAuthenticated) {
      db.auth.redirectToLogin(window.location.pathname);
      return;
    }
    
    createCommentMutation.mutate({
      ...commentData,
      product_id: product.id
    });
  };

  if (!product) return null;

  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.filter(c => c.rating).length).toFixed(1)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-slate-400" />
              </div>
            )}
          </div>

          {/* Price and Stats */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-1">${product.price}</p>
              <Badge variant="outline">{product.pricing_type}</Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-semibold">{avgRating || 'No ratings'}</span>
                {comments.filter(c => c.rating).length > 0 && (
                  <span className="text-sm text-slate-600">
                    ({comments.filter(c => c.rating).length} reviews)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Eye className="w-4 h-4" />
                <span>{product.views || 0} views</span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {seller && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Sold by</p>
              <p className="font-bold text-slate-900 text-lg">{seller.business_name || seller.full_name}</p>
              {product.location && (
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{product.location}</span>
                </div>
              )}
              {seller.website && (
                <a 
                  href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Business Website
                </a>
              )}
            </div>
          )}

          {/* Affiliate / Website Link */}
          {(product.affiliate_link || product.website_url) && (
            <Button 
              onClick={handleAffiliateClick}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-6 text-lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {product.affiliate_link ? "Buy Now / View Offer" : "Visit Product Website"}
            </Button>
          )}

          {/* Social Share Buttons */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-wrap gap-2 justify-center mt-2">
            <span className="w-full text-center text-sm font-semibold text-slate-500 mb-1">Share this product</span>
            <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')} className="border-green-200 text-green-700 hover:bg-green-50">
               WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('twitter')} className="border-slate-300 text-slate-900 hover:bg-slate-100">
               X (Twitter)
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('facebook')} className="border-blue-200 text-blue-700 hover:bg-blue-50">
               Facebook
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleShare('copy')} className="border-slate-300">
               Copy Link
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                Reviews ({comments.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Category</h3>
                <Badge className="bg-blue-100 text-blue-700">
                  {product.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {isAuthenticated ? (
                <CommentForm 
                  onSubmit={handleCommentSubmit}
                  isLoading={createCommentMutation.isPending}
                />
              ) : (
                <Card className="border-0 shadow-lg bg-blue-50">
                  <CardContent className="p-6 text-center">
                    <p className="text-slate-700 mb-4">Login to leave a review for this product</p>
                    <Button
                      onClick={() => db.auth.redirectToLogin(window.location.pathname)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login to Review
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <ProductComments 
                comments={comments}
                isLoading={loadingComments}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}