import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <PageLayout
      title="Terms of Service"
      description="Read FitConnect's Terms of Service. Understand your rights and responsibilities when using our fitness coaching platform."
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-20" variant="pink" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-muted-foreground">Last updated: December 16, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-soft bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12 prose prose-gray dark:prose-invert max-w-none">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  Welcome to FitConnect. By accessing or using our website, mobile application, and services 
                  (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you do not agree to these Terms, please do not use the Platform.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and FitConnect Inc. ("FitConnect," 
                  "we," "us," or "our"). We may update these Terms from time to time, and your continued use of the 
                  Platform constitutes acceptance of any changes.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                  FitConnect is a platform that connects fitness professionals ("Coaches") with individuals seeking 
                  fitness coaching services ("Clients"). We provide the technology and platform for Coaches and Clients 
                  to discover, communicate, schedule sessions, and process payments.
                </p>
                <p>
                  <strong>Important:</strong> FitConnect is not a fitness coaching provider. We do not employ Coaches, 
                  and Coaches are independent contractors responsible for their own services, advice, and conduct. We 
                  do not guarantee any specific results from coaching services.
                </p>

                <h2>3. User Accounts</h2>
                
                <h3>Account Registration</h3>
                <p>To use certain features of the Platform, you must create an account. You agree to:</p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>

                <h3>Account Eligibility</h3>
                <p>
                  You must be at least 18 years old to create an account. By creating an account, you represent that 
                  you are at least 18 years of age and have the legal capacity to enter into these Terms.
                </p>

                <h2>4. Coach Requirements and Responsibilities</h2>
                <p>If you register as a Coach on FitConnect, you agree to:</p>
                <ul>
                  <li>Hold valid certifications from accredited organizations in your area of expertise</li>
                  <li>Maintain a minimum of 2 years of professional coaching experience</li>
                  <li>Complete and pass our background check process</li>
                  <li>Maintain professional liability insurance throughout your time on the platform</li>
                  <li>Provide accurate information about your qualifications and experience</li>
                  <li>Deliver services professionally and in accordance with industry standards</li>
                  <li>Respond to client inquiries and bookings in a timely manner</li>
                  <li>Honor scheduled sessions or provide adequate notice for cancellations</li>
                  <li>Not provide medical advice or services outside your scope of practice</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
                <p>
                  FitConnect reserves the right to verify credentials, conduct ongoing quality monitoring, and 
                  remove Coaches who do not meet our standards or violate these Terms.
                </p>

                <h2>5. Client Responsibilities</h2>
                <p>If you use FitConnect as a Client, you agree to:</p>
                <ul>
                  <li>Provide accurate information about your health, fitness level, and any limitations</li>
                  <li>Consult with a healthcare provider before beginning any fitness program</li>
                  <li>Inform your Coach of any medical conditions, injuries, or changes in health status</li>
                  <li>Attend scheduled sessions or provide adequate notice for cancellations</li>
                  <li>Follow safety guidelines and instructions provided by your Coach</li>
                  <li>Make payments for services as agreed</li>
                  <li>Treat Coaches and other users with respect</li>
                </ul>

                <h2>6. Payments and Fees</h2>
                
                <h3>Client Payments</h3>
                <p>
                  Clients agree to pay for coaching sessions at the rates displayed on Coach profiles. Payment is 
                  processed through our secure payment system (powered by Stripe) at the time of booking. All fees 
                  are in US dollars unless otherwise specified.
                </p>

                <h3>Coach Earnings</h3>
                <p>
                  Coaches receive payment for completed sessions minus a platform fee of 15%. Payments are processed 
                  within 3-5 business days after session completion and transferred to the Coach's connected bank account.
                </p>

                <h3>Refunds</h3>
                <p>
                  Clients may request a refund for their first session with a new Coach within 48 hours if unsatisfied. 
                  Package refunds are prorated based on unused sessions. Refund requests are reviewed on a case-by-case 
                  basis and may take up to 10 business days to process.
                </p>

                <h2>7. Cancellation Policy</h2>
                <p>
                  Sessions may be cancelled or rescheduled free of charge up to 24 hours before the scheduled time. 
                  Cancellations within 24 hours may be subject to the Coach's individual cancellation policy, which 
                  is displayed on their profile. No-shows may result in full session charges.
                </p>

                <h2>8. Intellectual Property</h2>
                <p>
                  The Platform, including its design, features, content, and technology, is owned by FitConnect and 
                  protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any 
                  part of the Platform without our written permission.
                </p>
                <p>
                  Coaches retain ownership of their original content (workout plans, nutritional guides, etc.) but 
                  grant FitConnect a license to display such content on the Platform for service delivery purposes.
                </p>

                <h2>9. Limitation of Liability</h2>
                <p>
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
                </p>
                <ul>
                  <li>
                    FitConnect is not liable for any injuries, health issues, or other damages resulting from coaching 
                    services obtained through the Platform.
                  </li>
                  <li>
                    FitConnect is not responsible for the conduct, advice, or services provided by Coaches, as they 
                    are independent contractors.
                  </li>
                  <li>
                    FitConnect is not liable for any indirect, incidental, special, consequential, or punitive damages.
                  </li>
                  <li>
                    Our total liability shall not exceed the amount you paid to FitConnect in the 12 months preceding 
                    the claim.
                  </li>
                </ul>

                <h2>10. Disclaimer of Warranties</h2>
                <p>
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR 
                  IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DO 
                  NOT GUARANTEE ANY SPECIFIC RESULTS FROM COACHING SERVICES.
                </p>

                <h2>11. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless FitConnect, its officers, directors, employees, and agents 
                  from any claims, damages, losses, or expenses (including attorney's fees) arising from your use of 
                  the Platform, violation of these Terms, or infringement of any third-party rights.
                </p>

                <h2>12. Dispute Resolution</h2>
                <p>
                  Any disputes arising from these Terms or your use of the Platform shall be resolved through binding 
                  arbitration in San Francisco, California, in accordance with the American Arbitration Association 
                  rules. You waive any right to participate in a class action lawsuit or class-wide arbitration.
                </p>
                <p>
                  For disputes between Clients and Coaches regarding services, both parties agree to first attempt 
                  resolution through FitConnect's support team before pursuing arbitration.
                </p>

                <h2>13. Termination</h2>
                <p>
                  We may suspend or terminate your account at any time for violation of these Terms, fraudulent 
                  activity, or any other reason at our discretion. You may terminate your account at any time by 
                  contacting support. Upon termination, your right to use the Platform ceases immediately.
                </p>

                <h2>14. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of California, 
                  without regard to conflict of law principles.
                </p>

                <h2>15. Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue 
                  in full force and effect.
                </p>

                <h2>16. Entire Agreement</h2>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
                  FitConnect regarding the Platform and supersede any prior agreements.
                </p>

                <h2>17. Contact Information</h2>
                <p>For questions about these Terms, please contact us:</p>
                <ul>
                  <li>Email: legal@fitconnect.com</li>
                  <li>Address: FitConnect Inc., 123 Fitness Street, San Francisco, CA 94102</li>
                  <li>Phone: 1-800-FIT-CNCT</li>
                </ul>

                <p className="text-sm text-muted-foreground mt-8">
                  By using FitConnect, you acknowledge that you have read, understood, and agree to be bound by 
                  these Terms of Service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Terms;
