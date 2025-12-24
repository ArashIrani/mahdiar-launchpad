import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/admin");
      }
      setCheckingAuth(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/admin");
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // شمارش معکوس
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "خطا در ورود",
        description: error.message === "Invalid login credentials" 
          ? "ایمیل یا رمز عبور اشتباه است" 
          : error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      toast({
        title: "خطا در ثبت‌نام",
        description: error.message === "User already registered"
          ? "این ایمیل قبلاً ثبت شده است"
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "ثبت‌نام موفق",
        description: "حساب شما ایجاد شد. لطفاً وارد شوید.",
      });
    }

    setLoading(false);
  };

  const handleSendOtp = async () => {
    // اعتبارسنجی شماره موبایل
    if (!phone || !/^09\d{9}$/.test(phone)) {
      toast({
        title: "خطا",
        description: "لطفاً شماره موبایل معتبر وارد کنید (مثال: 09123456789)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "خطا",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        setCountdown(120); // ۲ دقیقه
        toast({
          title: "کد ارسال شد",
          description: "کد تأیید به شماره موبایل شما ارسال شد",
        });

        // در حالت توسعه، کد رو نشون بده
        if (data.dev_code) {
          console.log("Dev OTP Code:", data.dev_code);
          toast({
            title: "کد تأیید (حالت توسعه)",
            description: `کد: ${data.dev_code}`,
          });
        }
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({
        title: "خطا",
        description: "خطا در ارسال کد تأیید. لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "خطا",
        description: "لطفاً کد ۶ رقمی را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code: otp }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "خطا",
          description: data.error,
          variant: "destructive",
        });
      } else if (data.session) {
        // ست کردن session
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: "ورود موفق",
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast({
        title: "خطا",
        description: "خطا در تأیید کد. لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">پنل مدیریت</CardTitle>
          <CardDescription>برای دسترسی به پنل وارد شوید</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mobile" className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                موبایل
              </TabsTrigger>
              <TabsTrigger value="login" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                ورود
              </TabsTrigger>
              <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
            </TabsList>

            {/* ورود با موبایل */}
            <TabsContent value="mobile">
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">شماره موبایل</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="09123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        required
                        dir="ltr"
                        className="text-center text-lg tracking-wider"
                      />
                    </div>
                    <Button 
                      onClick={handleSendOtp} 
                      className="w-full" 
                      disabled={loading || !phone}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ارسال کد تأیید"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        کد تأیید به شماره <span className="font-mono font-bold">{phone}</span> ارسال شد
                      </p>
                      <button 
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        تغییر شماره
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label>کد تأیید ۶ رقمی</Label>
                      <div className="flex justify-center" dir="ltr">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
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
                      className="w-full" 
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأیید و ورود"}
                    </Button>

                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          ارسال مجدد کد تا {formatCountdown(countdown)}
                        </p>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleSendOtp}
                          disabled={loading}
                        >
                          ارسال مجدد کد
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            {/* ورود با ایمیل */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">ایمیل</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">رمز عبور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ورود"}
                </Button>
              </form>
            </TabsContent>
            
            {/* ثبت‌نام با ایمیل */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">ایمیل</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">رمز عبور</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="حداقل ۶ کاراکتر"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    dir="ltr"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ثبت‌نام"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
