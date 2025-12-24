import { Check, X } from "lucide-react";

interface TargetAudienceProps {
  forWho: string[];
  notForWho: string[];
}

const TargetAudience = ({ forWho, notForWho }: TargetAudienceProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <h2 className="mb-12 text-center text-heading md:text-display-sm text-foreground">
          این دوره مناسب چه کسانی است؟
        </h2>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* For Who */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8">
            <h3 className="mb-6 flex items-center gap-3 text-heading-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-5 w-5" />
              </span>
              مناسب برای شما
            </h3>
            <ul className="space-y-4">
              {forWho.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-body text-foreground">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not For Who */}
          <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-8">
            <h3 className="mb-6 flex items-center gap-3 text-heading-sm text-destructive">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                <X className="h-5 w-5" />
              </span>
              مناسب نیست برای
            </h3>
            <ul className="space-y-4">
              {notForWho.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-body text-foreground">
                  <X className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
