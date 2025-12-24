import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  ctaText: string;
  onCtaClick?: () => void;
  highlighted?: boolean;
}

const PricingCard = ({
  title,
  price,
  originalPrice,
  features,
  ctaText,
  onCtaClick,
  highlighted = false,
}: PricingCardProps) => {
  return (
    <div
      className={`relative rounded-2xl border-2 p-8 transition-all ${
        highlighted
          ? "border-accent bg-gradient-to-b from-accent/5 to-background shadow-xl shadow-accent/10"
          : "border-border bg-card"
      }`}
    >
      {/* Badge for highlighted */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-body-sm font-semibold text-accent-foreground">
          پیشنهاد ویژه
        </div>
      )}

      {/* Title */}
      <h3 className="mb-4 text-heading text-card-foreground">{title}</h3>

      {/* Price */}
      <div className="mb-6">
        {originalPrice && (
          <p className="text-body text-muted-foreground line-through">
            {originalPrice}
          </p>
        )}
        <p className="text-display-sm text-foreground">
          {price}
          <span className="text-body text-muted-foreground"> تومان</span>
        </p>
      </div>

      {/* Features */}
      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-body text-card-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-3 w-3" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        size="lg"
        className={`w-full py-6 text-lg font-semibold ${
          highlighted
            ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
        onClick={onCtaClick}
      >
        {ctaText}
        <ArrowLeft className="mr-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default PricingCard;
