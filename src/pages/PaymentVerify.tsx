import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Footer from "@/components/landing/Footer";

interface VerifyResult {
  success: boolean;
  license_key?: string;
  ref_id?: string;
  product_name?: string;
  deep_link_scheme?: string;
  error?: string;
  already_processed?: boolean;
}

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get("order_id");
      const authority = searchParams.get("Authority");
      const status = searchParams.get("Status");

      if (!orderId || !authority) {
        setResult({ success: false, error: "اطلاعات پرداخت ناقص است" });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("zarinpal-verify", {
          body: { order_id: orderId, authority, status },
        });

        if (error) {
          console.error("Verify error:", error);
          setResult({ success: false, error: "خطا در تایید پرداخت" });
        } else {
          setResult(data);
        }
      } catch (err) {
        console.error("Error:", err);
        setResult({ success: false, error: "خطا در ارتباط با سرور" });
      }

      setLoading(false);
    };

    verifyPayment();
  }, [searchParams]);

  const copyLicenseKey = () => {
    if (result?.license_key) {
      navigator.clipboard.writeText(result.license_key);
      toast.success("کد لایسنس کپی شد");
    }
  };

  const openInApp = () => {
    if (result?.deep_link_scheme && result?.license_key) {
      window.location.href = `${result.deep_link_scheme}://activate?license=${result.license_key}`;
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-md">
          <Card className="border-2">
            <CardHeader className="text-center">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <CardTitle>در حال بررسی پرداخت...</CardTitle>
                </div>
              ) : result?.success ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <CardTitle className="text-green-600">پرداخت موفق</CardTitle>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <CardTitle className="text-destructive">پرداخت ناموفق</CardTitle>
                </div>
              )}
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {loading ? (
                <p className="text-muted-foreground">لطفاً صبر کنید...</p>
              ) : result?.success ? (
                <>
                  {result.already_processed && (
                    <p className="text-sm text-muted-foreground">
                      این پرداخت قبلاً پردازش شده است
                    </p>
                  )}
                  
                  {result.ref_id && (
                    <p className="text-sm text-muted-foreground">
                      شماره پیگیری: {result.ref_id}
                    </p>
                  )}

                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">کد لایسنس شما:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-lg font-mono text-primary font-bold tracking-wider">
                        {result.license_key}
                      </code>
                      <Button variant="ghost" size="icon" onClick={copyLicenseKey}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    این کد به ایمیل شما نیز ارسال خواهد شد
                  </p>

                  <div className="flex flex-col gap-3">
                    {result.deep_link_scheme && (
                      <Button onClick={openInApp} className="w-full">
                        <ExternalLink className="w-4 h-4 ml-2" />
                        باز کردن در اپلیکیشن
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate("/")}>
                      بازگشت به صفحه اصلی
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">{result?.error}</p>
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => navigate("/product")}>
                      تلاش مجدد
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/")}>
                      بازگشت به صفحه اصلی
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default PaymentVerify;
