import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { 
  Shield, FileCheck, UserCheck, Award, 
  CheckCircle, Clock, Eye, RefreshCw,
  BadgeCheck, Lock, AlertTriangle, Sparkles
} from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import { Helmet } from "react-helmet-async";

const TrustAndVerification = () => {
  const verificationSteps = [
    {
      step: "01",
      icon: FileCheck,
      title: "Document Submission",
      description: "Coaches submit their professional credentials, certifications, and identification documents through our secure portal.",
      details: [
        "Government-issued photo ID verification",
        "Professional certifications (e.g., NASM, ACE, ISSA, REPs)",
        "Valid liability insurance certificate",
        "Proof of qualifications and training"
      ]
    },
    {
      step: "02",
      icon: Eye,
      title: "Initial Review",
      description: "Our automated system performs initial checks on submitted documents for authenticity and completeness.",
      details: [
        "Document format and validity checks",
        "Expiration date verification",
        "Cross-reference with certification bodies",
        "Completeness assessment"
      ]
    },
    {
      step: "03",
      icon: UserCheck,
      title: "Manual Verification",
      description: "Our verification team manually reviews each application, contacting certification bodies when necessary.",
      details: [
        "Direct verification with issuing organisations",
        "Background screening checks",
        "Professional reference verification",
        "Identity confirmation"
      ]
    },
    {
      step: "04",
      icon: BadgeCheck,
      title: "Verification Decision",
      description: "Upon successful verification, coaches receive a verified badge displayed prominently on their profile.",
      details: [
        "Verified badge awarded to profile",
        "Higher visibility in search results",
        "Access to exclusive avatar rewards",
        "Enhanced client trust signals"
      ]
    }
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: "Credential Verification",
      description: "Every coach's qualifications are verified against official certification databases and issuing bodies."
    },
    {
      icon: Lock,
      title: "Secure Document Storage",
      description: "All submitted documents are encrypted and stored securely, accessible only to authorised verification staff."
    },
    {
      icon: RefreshCw,
      title: "Ongoing Monitoring",
      description: "Certifications and insurance are monitored for expiration, with automatic reminders for renewal."
    },
    {
      icon: AlertTriangle,
      title: "Continuous Quality Checks",
      description: "Client reviews and feedback are monitored to maintain high standards across all verified coaches."
    }
  ];

  const requiredDocuments = [
    {
      title: "Government-Issued ID",
      description: "Valid passport or driving licence for identity verification",
      required: true
    },
    {
      title: "Professional Certifications",
      description: "NASM, ACE, ISSA, REPs, or equivalent fitness industry certifications",
      required: true
    },
    {
      title: "Liability Insurance",
      description: "Valid professional liability insurance certificate",
      required: true
    },
    {
      title: "Additional Qualifications",
      description: "Specialist certifications, degrees, or advanced training certificates",
      required: false
    }
  ];

  // FAQPage Schema for structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does FitConnect verify coach credentials?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FitConnect verifies coach credentials through a rigorous 4-step process: document submission, automated checks, manual verification by our team, and direct confirmation with certification bodies. All coaches must submit valid ID, professional certifications, and liability insurance."
        }
      },
      {
        "@type": "Question",
        "name": "What certifications are accepted on FitConnect?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FitConnect accepts major fitness industry certifications including NASM, ACE, ISSA, REPs (UK), CIMSPA, and equivalent international qualifications. Specialist certifications for nutrition, boxing, MMA, and other disciplines are also verified."
        }
      },
      {
        "@type": "Question",
        "name": "How long does coach verification take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Coach verification typically takes 24-72 hours after all required documents are submitted. Complex cases requiring additional verification may take up to 5 business days."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if a coach's certification expires?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FitConnect monitors certification expiry dates and sends automatic reminders 30 and 7 days before expiration. Coaches must upload renewed certifications to maintain their verified status."
        }
      }
    ]
  };

  return (
    <PageLayout
      title="Coach Verification | How We Vet Fitness Professionals"
      description="Every FitConnect coach is verified. Learn about our credential checks, background screening and ongoing quality monitoring to ensure your safety."
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {/* Decorative Avatars */}
      <DecorativeAvatar 
        avatarSlug="verified-eagle" 
        position="top-right" 
        size="lg" 
        opacity={18}
        className="right-8 top-40 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Your Safety First
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Trust &{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Verification
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every coach on FitConnect undergoes rigorous credential verification. 
            We ensure you train with qualified, insured, and trustworthy professionals.
          </p>
        </div>
      </section>

      {/* Why Verification Matters */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Verification{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Matters
              </span>
            </h2>
            <p className="text-muted-foreground">
              Your health and safety are paramount. Our verification process protects you 
              by ensuring every coach meets professional standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature, index) => (
              <Card key={index} variant="glass" className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Verification{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Process
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A rigorous 4-step process ensures every verified coach meets our high standards
            </p>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {verificationSteps.map((step, index) => (
              <div key={index} className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary/30 to-secondary/30 bg-clip-text text-transparent">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, dIndex) => (
                      <li key={dIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <Card variant="glass" className="aspect-square flex items-center justify-center">
                    <step.icon className="w-24 h-24 text-primary/30" />
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Required{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Documents
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Coaches must provide the following documentation to achieve verified status
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {requiredDocuments.map((doc, index) => (
              <Card key={index} variant="glass" className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.required ? 'bg-primary/20' : 'bg-muted'}`}>
                      {doc.required ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{doc.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${doc.required ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {doc.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-start gap-6">
                  <div className="hidden md:block">
                    <Clock className="w-16 h-16 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Verification Timeline</h3>
                    <p className="text-muted-foreground mb-4">
                      Our verification process is designed to be thorough yet efficient:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <strong>24-72 hours</strong> for standard verifications
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <strong>Up to 5 business days</strong> for complex cases
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <strong>Instant notification</strong> when verification is complete
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <strong>30-day reminder</strong> before certifications expire
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Award className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Train with{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Verified Coaches
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse our marketplace of verified fitness professionals. 
            Every verified badge represents our commitment to your safety and success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/coaches">
              <GradientButton size="lg">Find Verified Coaches</GradientButton>
            </Link>
            <Link to="/for-coaches">
              <GradientButton size="lg" variant="outline">Get Verified as a Coach</GradientButton>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default TrustAndVerification;