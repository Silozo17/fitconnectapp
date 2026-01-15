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

const faqItems: FAQItem[] = [
  {
    question: "How long does the migration process take?",
    answer: "Most gyms are fully migrated within 2-4 weeks. Our team handles everything—member data, payment methods, schedules, and more. You'll have a dedicated account manager guiding you through each step, and we ensure zero downtime so you can keep running classes during the transition.",
  },
  {
    question: "What if I need help setting up?",
    answer: "Every gym gets a dedicated account manager who handles your entire setup. They'll configure your membership types, import your data, train your staff, and stay with you for the first 90 days to ensure everything runs smoothly. Plus, our UK-based support team is available via phone, email, and chat.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, absolutely. We don't believe in locking you into long contracts. You can cancel your subscription at any time with 30 days notice. No cancellation fees, no hidden charges. We're confident you'll stay because you love the product, not because you're trapped.",
  },
  {
    question: "Do you support multiple locations?",
    answer: "Yes! Multi-location support is built in. Additional locations are just £25/month each. You get a centralised dashboard to manage all your gyms, with the ability to drill down into individual locations. Staff can be assigned to specific locations, and members can access any location with their membership.",
  },
  {
    question: "What payment methods do you support?",
    answer: "We process payments through Stripe, which supports all major debit and credit cards, Apple Pay, Google Pay, and Direct Debit (GoCardless). Members can pay by card at the gym or set up recurring payments. All transactions are PCI-DSS compliant and fully encrypted.",
  },
  {
    question: "Is my data secure?",
    answer: "Security is our top priority. We use bank-level encryption (256-bit SSL), and all data is stored in UK-based data centres. We're fully GDPR compliant, with regular security audits and penetration testing. Your member data is backed up daily and you can export it anytime.",
  },
  {
    question: "What's included in the £99/month base price?",
    answer: "The base price includes: unlimited members and staff, all core features (member management, class scheduling, check-ins, billing, reports), QR check-in system, automated communications, Stripe payment integration, and UK-based support. The only additional costs are £1 per member payment processed and £25/month for additional locations.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! We offer a 14-day free trial with full access to all features—no credit card required. This gives you time to import your data, explore the system, and see how it works for your gym before committing.",
  },
  {
    question: "Can I import data from my current software?",
    answer: "Absolutely. We can import from most gym management systems including Mindbody, Glofox, ClubRight, TeamUp, Gymcatch, and more. We also handle CSV/Excel imports if you're coming from spreadsheets. Our migration team ensures all your member data, payment history, and schedules are transferred accurately.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide multiple support channels: live chat (response in under 2 minutes during business hours), email support (under 24-hour response), phone support for urgent issues, and a comprehensive knowledge base with video tutorials. Every new gym also gets a dedicated account manager for the first 90 days.",
  },
];

export function GymFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqItems.map((item, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border border-border rounded-xl px-6 bg-card hover:border-primary/30 transition-colors"
        >
          <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-5">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Export FAQ data for schema markup
export const faqSchemaData = faqItems.map(item => ({
  "@type": "Question",
  "name": item.question,
  "acceptedAnswer": {
    "@type": "Answer",
    "text": item.answer,
  },
}));
