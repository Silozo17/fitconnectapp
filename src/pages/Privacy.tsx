import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { usePlatformContact } from "@/hooks/usePlatformContact";

const Privacy = () => {
  const { contact } = usePlatformContact();
  return (
    <PageLayout
      title="Privacy Policy"
      description="Learn how FitConnect collects, uses, and protects your personal information. Our commitment to your privacy and data security."
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-20" variant="pink" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Policy
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
                <h2>1. Introduction</h2>
                <p>
                  Welcome to FitConnect ("we," "our," or "us"). We are committed to protecting your personal information 
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you use our website and mobile application (collectively, the "Platform").
                </p>
                <p>
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                  please do not access the Platform.
                </p>

                <h2>2. Information We Collect</h2>
                
                <h3>Personal Information You Provide</h3>
                <p>We collect personal information that you voluntarily provide when you:</p>
                <ul>
                  <li>Register for an account (name, email address, phone number)</li>
                  <li>Complete your profile (profile photo, bio, fitness goals, health information)</li>
                  <li>Book coaching sessions (scheduling preferences, location)</li>
                  <li>Make payments (payment card details processed by our payment provider)</li>
                  <li>Communicate with coaches or our support team (message content)</li>
                  <li>Apply to become a coach (certifications, experience, background information)</li>
                </ul>

                <h3>Information Automatically Collected</h3>
                <p>When you access the Platform, we automatically collect certain information, including:</p>
                <ul>
                  <li>Device information (device type, operating system, unique device identifiers)</li>
                  <li>Log data (IP address, browser type, pages visited, time spent)</li>
                  <li>Location data (general location based on IP address, precise location if permitted)</li>
                  <li>Usage data (features used, actions taken, session duration)</li>
                </ul>

                <h3>Health and Fitness Information</h3>
                <p>
                  To provide personalized coaching services, we may collect health-related information such as:
                </p>
                <ul>
                  <li>Physical measurements (height, weight, body measurements)</li>
                  <li>Fitness goals and exercise history</li>
                  <li>Dietary preferences and restrictions</li>
                  <li>Progress photos and workout logs</li>
                  <li>Medical conditions or injuries (only if you choose to share)</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Create and manage your account</li>
                  <li>Connect you with appropriate coaches based on your goals</li>
                  <li>Process payments and transactions</li>
                  <li>Facilitate communication between clients and coaches</li>
                  <li>Track your fitness progress and provide insights</li>
                  <li>Send administrative information (confirmations, updates, security alerts)</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Improve and optimize the Platform</li>
                  <li>Detect and prevent fraud, abuse, or security incidents</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>We may share your information in the following circumstances:</p>
                
                <h3>With Coaches and Clients</h3>
                <p>
                  When you book a session, your profile information, fitness goals, and relevant health data 
                  will be shared with your coach to facilitate your training. Coaches' profiles are visible 
                  to potential clients.
                </p>

                <h3>With Service Providers</h3>
                <p>
                  We share information with third-party service providers who perform services on our behalf, 
                  including payment processing (Stripe), cloud hosting, analytics, and customer support.
                </p>

                <h3>For Legal Purposes</h3>
                <p>
                  We may disclose information if required by law, regulation, legal process, or governmental 
                  request, or to protect our rights, privacy, safety, or property.
                </p>

                <h3>Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                  as part of that transaction.
                </p>

                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information, including:
                </p>
                <ul>
                  <li>256-bit SSL/TLS encryption for data in transit</li>
                  <li>Encryption of sensitive data at rest</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection practices</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet or electronic storage is 100% secure. 
                  While we strive to protect your personal information, we cannot guarantee absolute security.
                </p>

                <h2>6. Your Rights and Choices</h2>
                <p>Depending on your location, you may have the following rights:</p>
                <ul>
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at {contact.privacyEmail}. We will respond to your 
                  request within 30 days.
                </p>

                <h2>7. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to collect information about your browsing 
                  activities. These technologies help us:
                </p>
                <ul>
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our Platform</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Analyze and improve our services</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Note that disabling cookies may affect 
                  the functionality of certain features.
                </p>

                <h2>8. Third-Party Services</h2>
                <p>
                  The Platform may contain links to third-party websites or integrate with third-party services. 
                  This Privacy Policy does not apply to those third parties. We encourage you to review their 
                  privacy policies before providing any information.
                </p>

                <h2>9. Children's Privacy</h2>
                <p>
                  The Platform is not intended for individuals under 18 years of age. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a child, 
                  please contact us immediately.
                </p>

                <h2>10. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country of 
                  residence. These countries may have different data protection laws. We ensure appropriate 
                  safeguards are in place for such transfers.
                </p>

                <h2>11. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined 
                  in this Privacy Policy, unless a longer retention period is required by law. When you delete 
                  your account, we will delete or anonymize your personal information within 30 days, except 
                  where we need to retain it for legal compliance.
                </p>

                <h2>12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage 
                  you to review this Privacy Policy periodically.
                </p>

                <h2>13. Contact Us</h2>
                <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <ul>
                  <li>Email: {contact.privacyEmail}</li>
                  <li>Address: {contact.address}</li>
                  {contact.phone && <li>Phone: {contact.phone}</li>}
                </ul>

                <p className="text-sm text-muted-foreground mt-8">
                  By using FitConnect, you acknowledge that you have read and understood this Privacy Policy 
                  and agree to its terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Privacy;
