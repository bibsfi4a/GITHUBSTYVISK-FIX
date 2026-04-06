import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Eye, TrendingUp, ArrowRight, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentProducts({ products, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products yet</h3>
            <p className="text-slate-600 mb-6">Start by creating your first product listing</p>
            <Link to={createPageUrl("Products")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Create Product
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
          <Package className="w-5 h-5" />
          Recent Products
        </CardTitle>
        <Link to={createPageUrl("Products")}>
          <Button variant="ghost" size="sm" className="text-blue-600">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map(product => (
          <Link 
            key={product.id}
            to={createPageUrl("Products")}
            className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
                  {product.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2 line-clamp-1">{product.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-blue-600">${product.price}</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <Eye className="w-4 h-4" />
                  <span>{product.views || 0} views</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}