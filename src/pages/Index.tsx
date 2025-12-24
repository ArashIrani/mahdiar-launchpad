import Hero from "@/components/landing/Hero";
import FeatureCard from "@/components/landing/FeatureCard";
import TargetAudience from "@/components/landing/TargetAudience";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingCard from "@/components/landing/PricingCard";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import { 
  BookOpen, 
  Video, 
  Clock, 
  Award, 
  Headphones,
  Smartphone
} from "lucide-react";

// Product Data
const productData = {
  title: "حسابداری هلو را حرفه‌ای یاد بگیرید",
  subtitle: "دوره آموزشی جامع نرم‌افزار هلو با بیش از ۲۰ ساعت ویدیوی آموزشی، از مفاهیم پایه تا تکنیک‌های پیشرفته حسابداری",
  ctaText: "همین الان خرید کنید",
};

const features = [
  {
    icon: Video,
    title: "بیش از ۲۰ ساعت ویدیو",
    description: "آموزش گام به گام و کاربردی از صفر تا صد نرم‌افزار هلو",
  },
  {
    icon: BookOpen,
    title: "پروژه‌های عملی",
    description: "تمرینات واقعی برای تثبیت مطالب و آمادگی برای کار",
  },
  {
    icon: Clock,
    title: "دسترسی مادام‌العمر",
    description: "یکبار خرید کنید و برای همیشه به محتوا دسترسی داشته باشید",
  },
  {
    icon: Award,
    title: "گواهی پایان دوره",
    description: "پس از اتمام دوره، گواهی معتبر دریافت کنید",
  },
  {
    icon: Headphones,
    title: "پشتیبانی اختصاصی",
    description: "پاسخگویی به سوالات شما در سریع‌ترین زمان ممکن",
  },
  {
    icon: Smartphone,
    title: "اپلیکیشن موبایل",
    description: "در هر زمان و مکانی با گوشی خود آموزش ببینید",
  },
];

const forWho = [
  "حسابداران تازه‌کار که می‌خواهند هلو را یاد بگیرند",
  "صاحبان کسب‌وکار که می‌خواهند خودشان حساب‌هایشان را مدیریت کنند",
  "دانشجویان حسابداری که به دنبال مهارت عملی هستند",
  "کارمندان مالی که می‌خواهند مهارت‌هایشان را ارتقا دهند",
];

const notForWho = [
  "افرادی که انتظار یادگیری یک‌شبه دارند",
  "کسانی که وقت برای تمرین و تکرار ندارند",
  "افرادی که به نرم‌افزار دیگری نیاز دارند",
];

const pricing = {
  title: "آموزش جامع نرم‌افزار هلو",
  price: "۴۹۰,۰۰۰",
  originalPrice: "۹۸۰,۰۰۰",
  features: [
    "بیش از ۲۰ ساعت ویدیوی آموزشی",
    "دسترسی مادام‌العمر به محتوا",
    "پروژه‌های عملی و تمرینات",
    "پشتیبانی اختصاصی",
    "گواهی پایان دوره",
    "به‌روزرسانی‌های رایگان",
  ],
  ctaText: "خرید و دانلود فوری",
};

const faqItems = [
  {
    question: "آیا نیاز به دانش قبلی حسابداری دارم؟",
    answer: "خیر، این دوره از صفر شروع می‌شود و نیازی به دانش قبلی ندارید. ما از مفاهیم پایه شروع می‌کنیم و به تدریج به سطوح پیشرفته‌تر می‌رسیم.",
  },
  {
    question: "چگونه به دوره دسترسی پیدا می‌کنم؟",
    answer: "بلافاصله پس از خرید، یک کد لایسنس منحصر به فرد دریافت می‌کنید. این کد را در اپلیکیشن مهدیار تراز وارد کنید و به تمام محتوای دوره دسترسی خواهید داشت.",
  },
  {
    question: "آیا امکان بازگشت وجه وجود دارد؟",
    answer: "بله، اگر از کیفیت دوره راضی نبودید، تا ۷ روز پس از خرید می‌توانید درخواست بازگشت وجه بدهید.",
  },
  {
    question: "آیا دوره به‌روزرسانی می‌شود؟",
    answer: "بله، ما به طور مداوم محتوای دوره را با آخرین نسخه‌های نرم‌افزار هلو به‌روز می‌کنیم و شما به همه به‌روزرسانی‌ها دسترسی رایگان دارید.",
  },
  {
    question: "در چند دستگاه می‌توانم از لایسنس استفاده کنم؟",
    answer: "هر لایسنس برای استفاده در یک دستگاه (موبایل یا کامپیوتر) فعال می‌شود. در صورت تغییر دستگاه، با پشتیبانی تماس بگیرید.",
  },
];

const Index = () => {
  const handlePurchase = () => {
    // TODO: Integrate with ZarinPal
    console.log("Purchase clicked");
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title={productData.title}
        subtitle={productData.subtitle}
        ctaText={productData.ctaText}
        onCtaClick={handlePurchase}
      />

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="mb-4 text-center text-heading md:text-display-sm text-foreground">
            چرا این دوره؟
          </h2>
          <p className="mb-12 text-center text-body-lg text-muted-foreground max-w-2xl mx-auto">
            همه چیزهایی که برای تسلط بر نرم‌افزار هلو نیاز دارید
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <TargetAudience forWho={forWho} notForWho={notForWho} />

      {/* How It Works */}
      <HowItWorks />

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="mb-4 text-center text-heading md:text-display-sm text-foreground">
            سرمایه‌گذاری روی آینده‌تان
          </h2>
          <p className="mb-12 text-center text-body-lg text-muted-foreground">
            با تخفیف ویژه ۵۰٪ به دوره دسترسی پیدا کنید
          </p>

          <div className="mx-auto max-w-md">
            <PricingCard
              title={pricing.title}
              price={pricing.price}
              originalPrice={pricing.originalPrice}
              features={pricing.features}
              ctaText={pricing.ctaText}
              onCtaClick={handlePurchase}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection title="سوالات متداول" items={faqItems} />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Index;
