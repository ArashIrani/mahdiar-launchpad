import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { 
  Phone, 
  Key, 
  Package, 
  Calendar, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  LogOut,
  ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";

interface License {
  id: string;
  license_key: string;
  status: string;
  created_at: string;
  activated_at: string | null;
  expires_at: string | null;
  product_id: string;
  products?: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  amount: number;
  original_amount: number | null;
  discount_amount: number | null;
  status: string;
  created_at: string;
  ref_id: string | null;
  products?: {
    name: string;
    image_url: string | null;
  };
}

const MyLicenses = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthenticated(true);
        fetchData();
      }
    };
    checkAuth();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*, products(name, image_url)")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch licenses
      const { data: licensesData, error: licensesError } = await supabase
        .from("licenses")
        .select("*, products(name, image_url)")
        .order("created_at", { ascending: false });

      if (licensesError) throw licensesError;
      setLicenses(licensesData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!/^09\d{9}$/.test(phone)) {
      toast.error("شماره موبایل نامعتبر است");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setOtpSent(true);
      setCountdown(120);
      toast.success("کد تأیید ارسال شد");
    } catch (error: any) {
      toast.error(error.message || "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("کد تأیید باید ۶ رقم باشد");
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, code: otp },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.session) {
        await supabase.auth.setSession(data.session);
        setAuthenticated(true);
        fetchData();
        toast.success("ورود موفق");
      }
    } catch (error: any) {
      toast.error(error.message || "کد تأیید اشتباه است");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setLicenses([]);
    setOrders([]);
    setPhone("");
    setOtp("");
    setOtpSent(false);
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("کلید لایسنس کپی شد");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 ml-1" /> فعال</Badge>;
      case "revoked":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" /> باطل شده</Badge>;
      case "expired":
        return <Badge variant="secondary"><Clock className="w-3 h-3 ml-1" /> منقضی</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Login form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                <span>بازگشت به سایت</span>
              </Link>
              <h1 className="text-xl font-bold">پنل مشتریان</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Key className="w-6 h-6" />
                  ورود به پنل
                </CardTitle>
                <CardDescription>
                  برای مشاهده لایسنس‌ها و سفارشات خود، با شماره موبایل وارد شوید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">شماره موبایل</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="09123456789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pr-10"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendOtp} 
                      disabled={loading} 
                      className="w-full"
                    >
                      {loading ? "در حال ارسال..." : "دریافت کد تأیید"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-center">
                      <label className="text-sm font-medium">کد تأیید ارسال شده به {phone}</label>
                      <div className="flex justify-center" dir="ltr">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <Button 
                      onClick={handleVerifyOtp} 
                      disabled={verifying || otp.length !== 6} 
                      className="w-full"
                    >
                      {verifying ? "در حال بررسی..." : "تأیید و ورود"}
                    </Button>
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          ارسال مجدد کد تا {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                        </p>
                      ) : (
                        <Button variant="ghost" onClick={handleSendOtp} disabled={loading}>
                          ارسال مجدد کد
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => { setOtpSent(false); setOtp(""); }}
                      className="w-full"
                    >
                      تغییر شماره موبایل
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowRight className="w-5 h-5" />
              <span>بازگشت</span>
            </Link>
            <h1 className="text-xl font-bold">پنل مشتریان</h1>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Licenses Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5" />
            <h2 className="text-lg font-semibold">لایسنس‌های من</h2>
          </div>

          {dataLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : licenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>هنوز لایسنسی ندارید</p>
                <Link to="/products">
                  <Button variant="link">مشاهده محصولات</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {licenses.map((license) => (
                <Card key={license.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{license.products?.name || "محصول"}</CardTitle>
                      {getStatusBadge(license.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(license.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                      <code className="text-sm font-mono" dir="ltr">{license.license_key}</code>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyLicenseKey(license.license_key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    {license.expires_at && (
                      <p className="text-sm text-muted-foreground mt-2">
                        انقضا: {formatDate(license.expires_at)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Orders Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold">سفارشات من</h2>
          </div>

          {dataLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>هنوز سفارشی ثبت نکرده‌اید</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{order.products?.name || "محصول"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                          {order.ref_id && ` • کد پیگیری: ${order.ref_id}`}
                        </p>
                      </div>
                      <div className="text-left">
                        {order.discount_amount && order.discount_amount > 0 && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(order.original_amount || order.amount + order.discount_amount)}
                          </p>
                        )}
                        <p className="font-bold text-primary">{formatPrice(order.amount)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyLicenses;