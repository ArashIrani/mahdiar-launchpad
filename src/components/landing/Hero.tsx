import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick?: () => void;
}

const Hero = ({ title, subtitle, ctaText, onCtaClick }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-secondary via-background to-background py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-body-sm font-medium text-primary">
            <Play className="h-4 w-4" />
            <span>آموزش ویدیویی نرم‌افزار هلو</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-display-sm md:text-display text-foreground">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-body-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg font-semibold shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30"
              onClick={onCtaClick}
            >
              {ctaText}
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
            
            <p className="text-body-sm text-muted-foreground">
              دسترسی فوری بعد از خرید
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
