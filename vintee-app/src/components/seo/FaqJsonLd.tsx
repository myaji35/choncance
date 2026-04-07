import { generateFaqs, type PropertyForFaq, type ReviewSummary } from "@/lib/utils/geo";

interface FaqJsonLdProps {
  property: PropertyForFaq;
  summary: ReviewSummary;
}

export default function FaqJsonLd({ property, summary }: FaqJsonLdProps) {
  const faqs = generateFaqs(property, summary);
  if (faqs.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
