const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Star, ExternalLink, MapPin, Eye, Plus, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductDetailDialog from "../components/marketplace/ProductDetailDialog";

export default function Marketplace() {
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

  React.useEffect(() => {
    db.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    const matchesMinPrice = minPrice === "" || product.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || product.price <= parseFloat(maxPrice);
    
    const matchesLocation = locationFilter === "all" || (product.location && product.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    // Find seller for brand filtering
    const seller = allUsers.find(u => u.email === product.created_by);
    const brandName = seller ? (seller.business_name || seller.full_name) : "Unknown";
    const matchesBrand = brandFilter === "all" || brandName === brandFilter;

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation && matchesBrand;
  });

  // Extract unique locations and brands for dropdowns
  const uniqueLocations = [...new Set(products.map(p => p.location).filter(Boolean))];
  const uniqueBrands = [...new Set(products.map(product => {
    const seller = allUsers.find(u => u.email === product.created_by);
    return seller ? (seller.business_name || seller.full_name) : "Unknown";
  }))];

  const handleProductClick = (product) => {
    // Increment view count
    db.entities.Product.update(product.id, { views: (product.views || 0) + 1 });
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleListProduct = () => {
    if (isAuthenticated) {
      window.location.href = '/products';
    } else {
      db.auth.redirectToLogin(window.location.pathname);
    }
  };

  const categories = [
    "all", "technology", "retail", "food_beverage", "health_wellness", "education",
    "professional_services", "real_estate", "automotive", "fashion", "home_garden",
    "entertainment", "sports_fitness", "beauty", "finance", "other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Products</h1>
              <p className="text-xl text-blue-100 mb-8">Search through thousands of products from businesses around the world</p>
            </div>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <Button
                  onClick={handleListProduct}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  List Your Product
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => db.auth.redirectToLogin(window.location.pathname)}
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    onClick={handleListProduct}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    List Your Product
                  </Button>
                </>
              )}
            </div>
          </div>
          
        {/* Search Bar & Filters */}
          <div className="bg-white rounded-xl p-4 shadow-2xl max-w-4xl mx-auto space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search for products, services, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-slate-50 focus-visible:ring-1 text-slate-900"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="text-slate-900 border-slate-200">
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="text-slate-900 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="text-slate-900 border-slate-200 bg-slate-50">
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
                  <SelectTrigger className="text-slate-900 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min $" 
                    value={minPrice} 
                    onChange={e => setMinPrice(e.target.value)}
                    className="text-slate-900 border-slate-200 bg-slate-50 w-full"
                  />
                  <span className="text-slate-400">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max $" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(e.target.value)}
                    className="text-slate-900 border-slate-200 bg-slate-50 w-full"
                  />
                </div>
              </div>
            )}
            
            {/* Active Filters Display */}
            {(categoryFilter !== 'all' || brandFilter !== 'all' || locationFilter !== 'all' || minPrice || maxPrice) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 cursor-pointer" onClick={() => setCategoryFilter('all')}>
                    Category: {categoryFilter} ×
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
                    Price: {minPrice || '0'} - {maxPrice || 'Any'} ×
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
            </h2>
            <p className="text-slate-600 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} className="border-0 shadow-lg animate-pulse">
                <div className="h-48 bg-slate-200" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-6 bg-slate-200 rounded" />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const seller = allUsers.find(u => u.email === product.created_by);
              
              return (
                <Card 
                  key={product.id}
                  className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    {product.website_url && (
                      <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-xs mb-2">
                      {product.category?.replace(/_/g, ' ')}
                    </Badge>
                    
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="w-3 h-3" />
                        {product.views || 0}
                      </div>
                    </div>

                    {seller && (
                      <div className="text-xs text-slate-600 pt-3 border-t border-slate-100">
                        <p className="font-medium">{seller.business_name || seller.full_name}</p>
                        {product.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{product.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Call to Action for Guests */}
      {!isAuthenticated && (
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Want to List Your Products?</h2>
              <p className="text-blue-100 mb-6">Join thousands of businesses showcasing their products to customers worldwide</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => db.auth.redirectToLogin(window.location.pathname)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to List Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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