import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Clock, Settings, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    db.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: pendingProducts = [], isLoading } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: async () => {
      // Fetch all pending products
      const products = await db.entities.Product.filter({ status: 'pending' }, 'created_date');
      return products;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ productId, newStatus }) => {
      return db.entities.Product.update(productId, { status: newStatus });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      // Simulate an SMS/Email notification
      alert(`Notification sent to seller: Your product has been ${variables.newStatus}.`);
    }
  });

  const handleApprove = (productId) => {
    updateStatusMutation.mutate({ productId, newStatus: 'active' });
  };

  const handleReject = (productId) => {
    updateStatusMutation.mutate({ productId, newStatus: 'rejected' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Manage the brand submission queue and approvals</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
            {pendingProducts.length} Pending
          </Badge>
          <Button variant="outline"><Settings className="w-4 h-4 mr-2"/> Settings</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Clock className="animate-spin w-8 h-8 text-slate-400" />
        </div>
      ) : pendingProducts.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <Check className="w-16 h-16 text-green-500 mb-4 bg-green-100 rounded-full p-2" />
            <h3 className="text-xl font-bold mb-2">Queue is Empty</h3>
            <p className="text-slate-500">All submissions have been reviewed. Great job!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/4 bg-slate-100 min-h-[160px]">
                  {product.banner_image || product.image_url ? (
                    <img
                      src={product.banner_image || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                      <span>No image provided</span>
                    </div>
                  )}
                </div>
                <div className="p-6 md:w-3/4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Awaiting Review
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-slate-500 block text-xs uppercase font-bold">Category</span>
                        {product.category}
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase font-bold">Price</span>
                        ${product.price} ({product.pricing_type})
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase font-bold">Seller Email</span>
                        <span className="truncate block" title={product.created_by}>{product.created_by}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs uppercase font-bold">Affiliate Link</span>
                        <a href={product.affiliate_link || product.website_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block">
                          {product.affiliate_link || product.website_url || "None"}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end border-t pt-4 mt-2">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(product.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(product.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
