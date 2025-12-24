import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/landing/Footer";

const Terms = () => {
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
            قوانین و مقررات
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۱. پذیرش قوانین</h2>
              <p className="text-body leading-relaxed">
                با خرید و استفاده از محصولات «مهدیار تراز»، شما موافقت خود را با تمامی قوانین و مقررات این سایت اعلام می‌کنید. لطفاً قبل از خرید، این قوانین را به دقت مطالعه فرمایید.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۲. نحوه استفاده از محصول</h2>
              <p className="text-body leading-relaxed">
                لایسنس خریداری شده صرفاً برای استفاده شخصی شما صادر می‌شود و حق واگذاری، فروش مجدد یا انتشار آن را ندارید. هرگونه تخلف منجر به ابطال لایسنس خواهد شد.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۳. محدودیت‌های استفاده</h2>
              <ul className="list-disc list-inside space-y-2 text-body">
                <li>استفاده همزمان در بیش از یک دستگاه مجاز نیست</li>
                <li>کپی، ضبط یا انتشار محتوای آموزشی ممنوع است</li>
                <li>واگذاری لایسنس به شخص ثالث ممنوع است</li>
              </ul>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۴. تغییرات قوانین</h2>
              <p className="text-body leading-relaxed">
                مهدیار تراز حق تغییر این قوانین را در هر زمان برای خود محفوظ می‌دارد. تغییرات از طریق همین صفحه اطلاع‌رسانی خواهد شد.
              </p>
            </section>

            <section>
              <h2 className="text-body-lg font-semibold text-foreground mb-3">۵. حل اختلاف</h2>
              <p className="text-body leading-relaxed">
                در صورت بروز هرگونه اختلاف، مرجع رسیدگی دادگاه‌های صالحه شهر تهران خواهد بود.
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

export default Terms;
