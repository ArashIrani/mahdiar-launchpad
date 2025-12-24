import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/landing/Footer";

const Refund = () => {
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
          <h1 className="text-heading md:text-display-sm text-foreground mb-8">
            شرایط بازگشت وجه
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <p className="text-body font-medium text-foreground">
                ✅ ما به کیفیت محصولاتمان اطمینان داریم و ضمانت بازگشت وجه ۷ روزه ارائه می‌دهیم.
              </p>
            </div>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">شرایط بازگشت وجه</h2>
              <ul className="list-disc list-inside space-y-2 text-body">
                <li>درخواست بازگشت وجه باید ظرف ۷ روز از تاریخ خرید ثبت شود</li>
                <li>دلیل منطقی برای عدم رضایت ارائه شود</li>
                <li>لایسنس استفاده نشده یا حداقل استفاده شده باشد</li>
              </ul>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">مواردی که شامل بازگشت وجه نمی‌شوند</h2>
              <ul className="list-disc list-inside space-y-2 text-body">
                <li>گذشتن بیش از ۷ روز از تاریخ خرید</li>
                <li>استفاده کامل از محتوای آموزشی</li>
                <li>نقض قوانین استفاده (کپی، انتشار و...)</li>
                <li>عدم سازگاری با سیستم به دلیل نادیده گرفتن پیش‌نیازها</li>
              </ul>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">نحوه درخواست</h2>
              <ol className="list-decimal list-inside space-y-2 text-body">
                <li>به صفحه پشتیبانی مراجعه کنید</li>
                <li>شماره سفارش و دلیل درخواست را ارسال کنید</li>
                <li>تیم پشتیبانی ظرف ۲۴ ساعت بررسی و پاسخ می‌دهد</li>
                <li>در صورت تأیید، وجه ظرف ۳ تا ۷ روز کاری به حساب شما واریز می‌شود</li>
              </ol>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">نکات مهم</h2>
              <p className="text-body leading-relaxed">
                پس از تأیید بازگشت وجه، لایسنس شما غیرفعال خواهد شد و دیگر امکان استفاده از محصول را نخواهید داشت. بازگشت وجه به همان روش پرداخت اولیه انجام می‌شود.
              </p>
            </section>
          </div>

          <p className="mt-12 text-caption text-muted-foreground">
            آخرین بروزرسانی: دی ۱۴۰۳
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Refund;
