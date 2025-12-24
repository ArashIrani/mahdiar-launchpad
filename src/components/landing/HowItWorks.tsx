import { CreditCard, Download, Play } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    step: "۱",
    title: "خرید آنلاین",
    description: "با پرداخت امن از درگاه زرین‌پال، محصول را خریداری کنید",
  },
  {
    icon: Download,
    step: "۲",
    title: "دریافت لایسنس",
    description: "بلافاصله کد لایسنس منحصر به فرد خود را دریافت می‌کنید",
  },
  {
    icon: Play,
    step: "۳",
    title: "شروع یادگیری",
    description: "در اپلیکیشن لایسنس را وارد کنید و آموزش را شروع کنید",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-surface">
      <div className="container">
        <h2 className="mb-4 text-center text-heading md:text-display-sm text-foreground">
          نحوه فعال‌سازی
        </h2>
        <p className="mb-12 text-center text-body-lg text-muted-foreground">
          در سه مرحله ساده به دوره دسترسی پیدا کنید
        </p>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-0 top-10 hidden h-0.5 w-full bg-border md:block" />
              )}

              {/* Step circle */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <step.icon className="h-8 w-8" />
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-body-sm font-bold">
                  {step.step}
                </span>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-heading-sm text-foreground">{step.title}</h3>
              <p className="text-body text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
