import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
}

const FAQSection = ({ title, items }: FAQSectionProps) => {
  return (
    <section className="py-20 bg-surface">
      <div className="container">
        <h2 className="mb-12 text-center text-heading md:text-display-sm text-foreground">
          {title}
        </h2>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border bg-card px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-body-lg font-semibold text-card-foreground hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-body text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
