import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-heading md:text-display-sm text-foreground mb-4">
            پشتیبانی
          </h1>
          <p className="text-body-lg text-muted-foreground mb-12">
            تیم پشتیبانی مهدیار تراز آماده پاسخگویی به سوالات شماست.
          </p>

          {/* Contact Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-body-lg font-semibold text-card-foreground">تلگرام</h3>
              </div>
              <p className="text-body text-muted-foreground mb-4">
                سریع‌ترین روش ارتباط با ما
              </p>
              <Button asChild className="w-full">
                <a href="https://t.me/mahdiartaraz_support" target="_blank" rel="noopener noreferrer">
                  پیام در تلگرام
                </a>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-body-lg font-semibold text-card-foreground">تماس تلفنی</h3>
              </div>
              <p className="text-body text-muted-foreground mb-4">
                برای مشاوره قبل از خرید
              </p>
              <Button variant="outline" asChild className="w-full">
                <a href="tel:09123456789">
                  ۰۹۱۲-۳۴۵-۶۷۸۹
                </a>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-body-lg font-semibold text-card-foreground">ایمیل</h3>
              </div>
              <p className="text-body text-muted-foreground mb-4">
                برای ارسال مستندات و فایل
              </p>
              <Button variant="outline" asChild className="w-full">
                <a href="mailto:support@mahdiartaraz.ir">
                  support@mahdiartaraz.ir
                </a>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-body-lg font-semibold text-card-foreground">ساعات پاسخگویی</h3>
              </div>
              <p className="text-body text-muted-foreground">
                شنبه تا پنجشنبه
              </p>
              <p className="text-body-lg font-semibold text-foreground">
                ۹ صبح تا ۶ عصر
              </p>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h3 className="text-body-lg font-semibold text-foreground mb-2">
              سوالات متداول را بررسی کردید؟
            </h3>
            <p className="text-body text-muted-foreground mb-4">
              شاید پاسخ سوال شما در بخش سوالات متداول موجود باشد.
            </p>
            <Button variant="outline" asChild>
              <Link to="/#faq">مشاهده سوالات متداول</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
