import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import Footer from "@/components/landing/Footer";
import { 
  Video, 
  BookOpen, 
  Clock, 
  Award, 
  Headphones, 
  Smartphone,
  CheckCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { z } from "zod";

// Validation schema
const purchaseSchema = z.object({
  email: z.string().trim().email({ message: "ایمیل معتبر وارد کنید" }).max(255),
  phone: z.string().trim().regex(/^09\d{9}$/, { message: "شماره موبایل معتبر وارد کنید (مثال: 09123456789)" }),
});

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  deep_link_scheme: string | null;
  image_url: string | null;
}

const features = [
  { icon: Video, text: "۱۲ ساعت ویدیوی آموزشی" },
  { icon: BookOpen, text: "پروژه‌های عملی" },
  { icon: Clock, text: "دسترسی مادام‌العمر" },
  { icon: Award, text: "گواهی پایان دوره" },
  { icon: Headphones, text: "پشتیبانی اختصاصی" },
  { icon: Smartphone, text: "اپلیکیشن موبایل" },
];

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

const Product = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
        toast.error("خطا در بارگذاری محصول");
      } else if (data) {
        setProduct(data);
        // Fetch gallery images
        const { data: imagesData } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", data.id)
          .order("display_order", { ascending: true });
        
        if (imagesData && imagesData.length > 0) {
          setGalleryImages(imagesData);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, []);

  // Combine main image with gallery images
  const allImages = [
    ...(product?.image_url ? [{ id: "main", image_url: product.image_url, display_order: -1 }] : []),
    ...galleryImages
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !product) return;
    setApplyingCoupon(true);
    
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();
    
    setApplyingCoupon(false);
    
    if (error || !coupon) {
      toast.error("کوپن نامعتبر است");
      return;
    }
    
    // Check validity
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      toast.error("کوپن منقضی شده است");
      return;
    }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      toast.error("ظرفیت استفاده از کوپن تمام شده");
      return;
    }
    if (coupon.min_purchase && product.price < coupon.min_purchase) {
      toast.error(`حداقل خرید برای این کوپن ${formatPrice(coupon.min_purchase)} تومان است`);
      return;
    }
    if (coupon.product_id && coupon.product_id !== product.id) {
      toast.error("این کوپن برای این محصول قابل استفاده نیست");
      return;
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.floor((product.price * coupon.discount_value) / 100);
    } else {
      discountAmount = coupon.discount_value;
    }
    
    setAppliedCoupon({ code: coupon.code, discount: discountAmount });
    toast.success(`کوپن اعمال شد: ${formatPrice(discountAmount)} تومان تخفیف`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const finalPrice = product ? product.price - (appliedCoupon?.discount || 0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = purchaseSchema.safeParse({ email, phone });
    if (!result.success) {
      const fieldErrors: { email?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "phone") fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!product) {
      toast.error("محصول یافت نشد");
      return;
    }

    setSubmitting(true);
    toast.info("در حال اتصال به درگاه پرداخت...");

    try {
      const { data, error } = await supabase.functions.invoke("zarinpal-create", {
        body: {
          product_id: product.id,
          customer_email: email,
          customer_phone: phone,
          coupon_code: appliedCoupon?.code || null,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error("خطا در اتصال به درگاه پرداخت");
        setSubmitting(false);
        return;
      }

      if (data?.payment_url) {
        // Redirect to ZarinPal payment page
        window.location.href = data.payment_url;
      } else {
        toast.error(data?.error || "خطا در ایجاد لینک پرداخت");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("خطا در ارتباط با سرور");
      setSubmitting(false);
    }
  };

  const discount = product?.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <ShieldCheck className="w-4 h-4 ml-1" />
              ضمانت بازگشت وجه
            </Badge>
            {loading ? (
              <>
                <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <h1 className="text-heading md:text-display-sm text-foreground mb-4">
                  {product?.name}
                </h1>
                <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
                  {product?.description}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image & Features */}
            <div>
              {/* Product Image Gallery */}
              {loading ? (
                <Skeleton className="w-full aspect-video rounded-xl mb-8" />
              ) : allImages.length > 0 ? (
                <div className="mb-8">
                  <div className="relative rounded-xl overflow-hidden border border-border shadow-lg">
                    <img
                      src={allImages[currentImageIndex]?.image_url}
                      alt={product?.name}
                      className="w-full h-auto object-cover"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-md transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-md transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={img.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={img.image_url}
                            alt={`تصویر ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <h2 className="text-title-lg text-foreground mb-6">
                ویژگی‌های دوره
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-body text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-xl bg-secondary/50 border border-primary/20">
                <h3 className="text-title text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  گارانتی ۷ روزه
                </h3>
                <p className="text-body text-muted-foreground">
                  اگر از کیفیت دوره راضی نبودید، تا ۷ روز پس از خرید می‌توانید درخواست بازگشت وجه بدهید.
                </p>
              </div>
            </div>

            {/* Purchase Form */}
            <div>
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="text-center pb-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-8 w-32 mx-auto mb-2" />
                      <Skeleton className="h-12 w-48 mx-auto" />
                    </>
                  ) : (
                    <>
                      {discount > 0 && (
                        <Badge variant="destructive" className="w-fit mx-auto mb-2">
                          {discount}٪ تخفیف
                        </Badge>
                      )}
                      <CardTitle className="text-display-sm text-primary">
                        {formatPrice(product?.price || 0)} تومان
                      </CardTitle>
                      {product?.original_price && (
                        <CardDescription className="text-body line-through text-muted-foreground">
                          {formatPrice(product.original_price)} تومان
                        </CardDescription>
                      )}
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                        dir="ltr"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">شماره موبایل</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="09123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={errors.phone ? "border-destructive" : ""}
                        dir="ltr"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coupon">کد تخفیف</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="کد تخفیف"
                          disabled={!!appliedCoupon}
                          dir="ltr"
                        />
                        {appliedCoupon ? (
                          <Button type="button" variant="outline" onClick={removeCoupon}>حذف</Button>
                        ) : (
                          <Button type="button" variant="outline" onClick={applyCoupon} disabled={applyingCoupon || !couponCode}>
                            اعمال
                          </Button>
                        )}
                      </div>
                      {appliedCoupon && (
                        <p className="text-sm text-primary">
                          {formatPrice(appliedCoupon.discount)} تومان تخفیف اعمال شد
                        </p>
                      )}
                    </div>

                    {appliedCoupon && (
                      <div className="p-3 rounded-lg bg-primary/10 text-center">
                        <p className="text-sm text-muted-foreground">مبلغ نهایی:</p>
                        <p className="text-xl font-bold text-primary">{formatPrice(finalPrice)} تومان</p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-body-lg"
                      disabled={loading || submitting}
                    >
                      {submitting ? "در حال پردازش..." : "پرداخت و دریافت لایسنس"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      با کلیک روی دکمه بالا، به درگاه پرداخت زرین‌پال منتقل می‌شوید
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Product;
