import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Search, ShoppingBag, Star, Users, Filter, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string | null;
  sales_count: number;
  average_rating: number | null;
  ratings_count: number;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
      
      // Set max price
      const max = Math.max(...data.map(p => p.price), 10000000);
      setMaxPrice(max);
      setPriceRange([0, max]);
    }
    setLoading(false);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = search === "" || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
          return b.sales_count - a.sales_count;
        case "rating":
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "newest":
        default:
          return 0; // already sorted by created_at desc
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    setSortBy("newest");
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Header />
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container">
          <h1 className="text-heading md:text-display-sm text-foreground text-center mb-4">
            محصولات
          </h1>
          <p className="text-body-lg text-muted-foreground text-center max-w-2xl mx-auto">
            مجموعه کامل محصولات و دوره‌های آموزشی ما
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو در محصولات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="مرتب‌سازی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">جدیدترین</SelectItem>
                    <SelectItem value="price-low">ارزان‌ترین</SelectItem>
                    <SelectItem value="price-high">گران‌ترین</SelectItem>
                    <SelectItem value="popular">پرفروش‌ترین</SelectItem>
                    <SelectItem value="rating">بالاترین امتیاز</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  فیلترها
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">دسته‌بندی</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب دسته‌بندی" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">همه دسته‌ها</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-sm font-medium">محدوده قیمت</label>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          min={0}
                          max={maxPrice}
                          step={10000}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatPrice(priceRange[0])} تومان</span>
                        <span>{formatPrice(priceRange[1])} تومان</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" onClick={resetFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      پاک کردن فیلترها
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length} محصول یافت شد
          </p>

          {/* Products Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">محصولی یافت نشد</p>
              <Button variant="link" onClick={resetFilters}>پاک کردن فیلترها</Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const discount = product.original_price 
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0;

                return (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => navigate("/product")}
                  >
                    {/* Product Image */}
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {discount > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                          {discount}٪ تخفیف
                        </Badge>
                      )}
                      {product.category && (
                        <Badge variant="secondary" className="absolute top-2 left-2">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      {product.description && (
                        <CardDescription className="line-clamp-2">
                          {product.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        {product.average_rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {product.average_rating.toFixed(1)}
                            <span className="text-xs">({product.ratings_count})</span>
                          </span>
                        )}
                        {product.sales_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {product.sales_count} فروش
                          </span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)} تومان
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Products;
