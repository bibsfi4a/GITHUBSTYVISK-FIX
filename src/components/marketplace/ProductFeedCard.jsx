const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, UserPlus, UserCheck, Package, MapPin, ExternalLink } from "lucide-react";

export default function ProductFeedCard({ 
  product, 
  seller, 
  currentUser, 
  likes, 
  follows, 
  comments,
  onProductClick,
  isAuthenticated 
}) {
  const queryClient = useQueryClient();
  
  const productLikes = likes?.filter(l => l.product_id === product.id) || [];
  const isLiked = productLikes.some(l => l.user_email === currentUser?.email);
  const likeCount = productLikes.length;
  
  const isFollowing = follows?.some(
    f => f.follower_email === currentUser?.email && f.following_email === product.created_by
  );
  
  const commentCount = comments?.filter(c => c.product_id === product.id)?.length || 0;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        const existingLike = productLikes.find(l => l.user_email === currentUser?.email);
        if (existingLike) {
          await db.entities.ProductLike.delete(existingLike.id);
        }
      } else {
        await db.entities.ProductLike.create({
          product_id: product.id,
          user_email: currentUser?.email
        });
        
        // Capture lead with higher interest level when liking
        const existingLeads = await db.entities.Lead.filter({ 
          email: currentUser.email, 
          product_id: product.id 
        });
        
        if (existingLeads.length === 0) {
          await db.entities.Lead.create({
            name: currentUser.full_name || currentUser.email.split('@')[0],
            email: currentUser.email,
            product_id: product.id,
            source: 'product_like',
            interest_category: product.category,
            interest_level: 7,
            status: 'new',
            is_public: true
          });
        } else {
          await db.entities.Lead.update(existingLeads[0].id, {
            interest_level: Math.min((existingLeads[0].interest_level || 3) + 3, 10),
            source: 'product_like'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-likes'] });
    }
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        const existingFollow = follows?.find(
          f => f.follower_email === currentUser?.email && f.following_email === product.created_by
        );
        if (existingFollow) {
          await db.entities.UserFollow.delete(existingFollow.id);
        }
      } else {
        await db.entities.UserFollow.create({
          follower_email: currentUser?.email,
          following_email: product.created_by
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
    }
  });

  const handleLike = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      db.auth.redirectToLogin(window.location.pathname);
      return;
    }
    likeMutation.mutate();
  };

  const handleFollow = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      db.auth.redirectToLogin(window.location.pathname);
      return;
    }
    if (currentUser?.email === product.created_by) return;
    followMutation.mutate();
  };

  const handleComment = (e) => {
    e.stopPropagation();
    onProductClick(product);
  };

  const isOwnProduct = currentUser?.email === product.created_by;

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Banner/Cover Image Section */}
      <div 
        className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden cursor-pointer group"
        onClick={() => onProductClick(product)}
      >
        {product.banner_image ? (
          <img
            src={product.banner_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Follow Button on Banner */}
        {!isOwnProduct && (
          <Button
            size="sm"
            variant={isFollowing ? "secondary" : "default"}
            className={`absolute top-2 right-2 ${
              isFollowing 
                ? "bg-white/90 text-slate-700 hover:bg-white" 
                : "bg-white text-slate-900 hover:bg-white/90"
            }`}
            onClick={handleFollow}
            disabled={followMutation.isPending}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}

        {product.website_url && (
          <Badge className="absolute top-2 left-2 bg-white/90 text-slate-900 text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            Website
          </Badge>
        )}
      </div>

      {/* Like & Comment Bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-100">
        <button 
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className="flex items-center gap-1 text-slate-600 hover:text-red-500 transition-colors"
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>
        
        <button 
          onClick={handleComment}
          className="flex items-center gap-1 text-slate-600 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 cursor-pointer" onClick={() => onProductClick(product)}>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {product.category?.replace(/_/g, ' ')}
          </Badge>
        </div>
        
        <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {product.features && product.features.length > 0 && (
          <div className="mb-3 space-y-1">
            {product.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-green-600">✓</span>
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          {product.price === 0 ? (
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-green-600">Free</p>
              <span className="text-xs text-slate-500">forever</span>
            </div>
          ) : (
            <p className="text-lg font-bold text-blue-600">${product.price}</p>
          )}
        </div>

        {seller && (
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
            <p className="font-medium truncate">{seller.business_name || seller.full_name}</p>
            {product.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{product.location}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}