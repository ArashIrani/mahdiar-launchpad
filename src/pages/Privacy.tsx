import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/landing/Footer";

const Privacy = () => {
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
            حریم خصوصی
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۱. جمع‌آوری اطلاعات</h2>
              <p className="text-body leading-relaxed">
                ما تنها اطلاعات ضروری برای پردازش سفارش شما را جمع‌آوری می‌کنیم که شامل نام، شماره تماس و ایمیل می‌شود. این اطلاعات صرفاً برای ارائه خدمات بهتر استفاده خواهد شد.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۲. استفاده از اطلاعات</h2>
              <p className="text-body leading-relaxed">
                اطلاعات شما برای موارد زیر استفاده می‌شود:
              </p>
              <ul className="list-disc list-inside space-y-2 text-body mt-2">
                <li>پردازش و تأیید سفارش‌ها</li>
                <li>ارسال لایسنس و اطلاعات دسترسی</li>
                <li>پشتیبانی و پاسخگویی به سوالات</li>
                <li>اطلاع‌رسانی درباره بروزرسانی‌ها (در صورت رضایت شما)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۳. حفاظت از اطلاعات</h2>
              <p className="text-body leading-relaxed">
                ما از پروتکل‌های امنیتی استاندارد برای حفاظت از اطلاعات شما استفاده می‌کنیم. تمام تراکنش‌های مالی از طریق درگاه امن زرین‌پال انجام می‌شود و ما هیچ اطلاعات کارت بانکی شما را ذخیره نمی‌کنیم.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۴. عدم اشتراک‌گذاری</h2>
              <p className="text-body leading-relaxed">
                اطلاعات شخصی شما تحت هیچ شرایطی به شخص ثالث فروخته یا واگذار نخواهد شد، مگر در موارد قانونی که توسط مراجع ذی‌صلاح درخواست شود.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۵. کوکی‌ها</h2>
              <p className="text-body leading-relaxed">
                این وب‌سایت از کوکی‌ها برای بهبود تجربه کاربری استفاده می‌کند. شما می‌توانید از طریق تنظیمات مرورگر، کوکی‌ها را غیرفعال کنید.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۶. حقوق کاربران</h2>
              <p className="text-body leading-relaxed">
                شما حق دسترسی، اصلاح و حذف اطلاعات شخصی خود را دارید. برای این منظور با پشتیبانی تماس بگیرید.
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

export default Privacy;
