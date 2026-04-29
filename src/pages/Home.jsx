const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Plus, LogIn, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductDetailDialog from "../components/marketplace/ProductDetailDialog";
import ProductFeedCard from "../components/marketplace/ProductFeedCard";
import { createPageUrl } from "@/utils";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    db.auth.isAuthenticated().then(async (auth) => {
      setIsAuthenticated(auth);
      if (auth) {
        const user = await db.auth.me();
        setCurrentUser(user);
      }
    });
  }, []);

  // Marketplace shows ALL active products (public view)
  const { data: products, isLoading } = useQuery({
    queryKey: ['marketplace-products'],
    queryFn: () => db.entities.Product.filter({ status: 'active' }, '-created_date'),
    initialData: [],
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => db.entities.User.list(),
    initialData: [],
  });

  const { data: likes } = useQuery({
    queryKey: ['product-likes'],
    queryFn: () => db.entities.ProductLike.list(),
    initialData: [],
  });

  const { data: follows } = useQuery({
    queryKey: ['user-follows'],
    queryFn: () => db.entities.UserFollow.list(),
    initialData: [],
  });

  const { data: comments } = useQuery({
    queryKey: ['product-comments'],
    queryFn: () => db.entities.ProductComment.list(),
    initialData: [],
  });

  // Extract unique locations and brands for filter dropdowns
  const uniqueLocations = [...new Set(products.map(p => p.location).filter(Boolean))];
  const uniqueBrands = [...new Set(products.map(product => {
    const seller = allUsers.find(u => u.email === product.created_by);
    return seller ? (seller.business_name || seller.full_name) : "Unknown";
  }))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesMinPrice = minPrice === "" || product.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || product.price <= parseFloat(maxPrice);
    const matchesLocation = locationFilter === "all" || (product.location && product.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    const seller = allUsers.find(u => u.email === product.created_by);
    const brandName = seller ? (seller.business_name || seller.full_name) : "Unknown";
    const matchesBrand = brandFilter === "all" || brandName === brandFilter;

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation && matchesBrand;
  });

  const handleProductClick = (product) => {
    db.entities.Product.update(product.id, { views: (product.views || 0) + 1 });
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleListProduct = () => {
    if (isAuthenticated) {
      window.location.href = createPageUrl('Products');
    } else {
      db.auth.redirectToLogin(window.location.pathname);
    }
  };

  const categories = [
    "all", "technology", "retail", "food_beverage", "health_wellness", "education",
    "professional_services", "real_estate", "automotive", "fashion", "home_garden",
    "entertainment", "sports_fitness", "beauty", "finance", "other"
  ];

  const hasActiveFilters = categoryFilter !== 'all' || brandFilter !== 'all' || locationFilter !== 'all' || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 hidden sm:block">Styvisk</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search products, brands, styles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-9 ${showFilters ? 'bg-blue-600 text-white' : ''}`}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Button
                  onClick={() => db.auth.redirectToLogin(window.location.pathname)}
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
              <Button
                onClick={handleListProduct}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">List Product</span>
                <span className="sm:hidden">List</span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat.replace(/_/g, ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {uniqueBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 col-span-2 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <span className="text-slate-400 text-sm">–</span>
                  <Input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Active Filters Badges */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 cursor-pointer" onClick={() => setCategoryFilter('all')}>
                      {categoryFilter.replace(/_/g, ' ')} ×
                    </Badge>
                  )}
                  {brandFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 cursor-pointer" onClick={() => setBrandFilter('all')}>
                      Brand: {brandFilter} ×
                    </Badge>
                  )}
                  {locationFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 cursor-pointer" onClick={() => setLocationFilter('all')}>
                      Location: {locationFilter} ×
                    </Badge>
                  )}
                  {(minPrice || maxPrice) && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 cursor-pointer" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                      Price: {minPrice || '0'} – {maxPrice || 'Any'} ×
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer text-red-500 border-red-200 hover:bg-red-50" 
                    onClick={() => { setCategoryFilter('all'); setBrandFilter('all'); setLocationFilter('all'); setMinPrice(''); setMaxPrice(''); }}
                  >
                    Clear All
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Results Info */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <div className="h-48 bg-slate-200" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-5 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filters</p>
            <Button
              onClick={handleListProduct}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Be the first to list a product
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const seller = allUsers.find(u => u.email === product.created_by);
              
              return (
                <ProductFeedCard
                  key={product.id}
                  product={product}
                  seller={seller}
                  currentUser={currentUser}
                  likes={likes}
                  follows={follows}
                  comments={comments}
                  onProductClick={handleProductClick}
                  isAuthenticated={isAuthenticated}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        seller={selectedProduct ? allUsers.find(u => u.email === selectedProduct.created_by) : null}
      />
    </div>
  );
}