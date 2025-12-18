import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { usePlatformContact } from "@/hooks/usePlatformContact";

const Terms = () => {
  const { contact } = usePlatformContact();
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
          <p className="text-muted-foreground">Last updated: December 18, 2024</p>
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
                  These Terms constitute a legally binding agreement between you and AMW Media Ltd, trading as 
                  FitConnect, a company registered in England and Wales ("FitConnect," "we," "us," or "our"). We 
                  may update these Terms from time to time, and your continued use of the Platform constitutes 
                  acceptance of any changes.
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

                <h2>3. Mobile Application License (EULA)</h2>
                <p>
                  Subject to your compliance with these Terms, FitConnect grants you a limited, non-exclusive, 
                  non-transferable, revocable license to download, install, and use the FitConnect mobile application 
                  ("App") on devices that you own or control, solely for your personal, non-commercial use.
                </p>

                <h3>License Restrictions</h3>
                <p>You may not:</p>
                <ul>
                  <li>Copy, modify, or create derivative works based on the App</li>
                  <li>Reverse engineer, disassemble, decompile, or attempt to derive the source code of the App</li>
                  <li>Sell, resell, rent, lease, loan, sublicense, distribute, or transfer the App to any third party</li>
                  <li>Make the App available over a network where it could be used by multiple devices at the same time</li>
                  <li>Remove, alter, or obscure any proprietary notices on the App</li>
                  <li>Use the App for any illegal, unauthorized, or harmful purpose</li>
                  <li>Use automated systems, bots, or scrapers to access or interact with the App</li>
                </ul>

                <h3>License Termination</h3>
                <p>
                  This license is effective until terminated. Your rights under this license will terminate 
                  automatically without notice if you fail to comply with any of these Terms. Upon termination, 
                  you must cease all use of the App and delete all copies from your devices.
                </p>

                <h3>Updates and Modifications</h3>
                <p>
                  FitConnect may from time to time develop and provide App updates, which may include upgrades, 
                  bug fixes, patches, and other error corrections and/or new features. Updates may also modify 
                  or delete features and functionality in their entirety. You agree that FitConnect has no 
                  obligation to provide any updates or to continue to provide or enable any particular features 
                  or functionality.
                </p>

                <h2>4. User Accounts</h2>
                
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

                <h2>5. Coach Requirements and Responsibilities</h2>
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

                <h2>6. Client Responsibilities</h2>
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

                <h2>7. Payments and Fees</h2>
                
                <h3>Client Payments</h3>
                <p>
                  Clients agree to pay for coaching sessions at the rates displayed on Coach profiles. Payment is 
                  processed through our secure payment system (powered by Stripe) at the time of booking. All fees 
                  are in GBP unless otherwise specified.
                </p>

                <h3>Coach Earnings</h3>
                <p>
                  Coaches receive payment for completed sessions minus a platform commission fee that varies based 
                  on their subscription tier:
                </p>
                <ul>
                  <li><strong>Free Plan:</strong> 4% platform commission</li>
                  <li><strong>Starter Plan:</strong> 3% platform commission</li>
                  <li><strong>Pro Plan:</strong> 2% platform commission</li>
                  <li><strong>Enterprise Plan:</strong> 1% platform commission</li>
                </ul>
                <p>
                  Payments are processed within 3-5 business days after session completion and transferred to the 
                  Coach's connected Stripe account. Coaches can reduce their commission rate by upgrading their 
                  subscription plan at any time.
                </p>

                <h3>Refunds</h3>
                <p>
                  Clients may request a refund for their first session with a new Coach within 48 hours if unsatisfied. 
                  Package refunds are prorated based on unused sessions. Refund requests are reviewed on a case-by-case 
                  basis and may take up to 10 business days to process.
                </p>

                <h2>8. Subscription Services and Auto-Renewal</h2>
                
                <h3>Coach Platform Subscriptions</h3>
                <p>
                  Coaches may subscribe to paid platform tiers (Starter, Pro, Enterprise) that provide additional 
                  features and reduced commission rates. Subscription pricing is displayed on our pricing page 
                  and in the app before purchase.
                </p>

                <h3>Auto-Renewal Terms</h3>
                <p>
                  <strong>IMPORTANT - PLEASE READ CAREFULLY:</strong> When you subscribe to a paid plan, your 
                  subscription will automatically renew at the end of each billing period (monthly or annually, 
                  depending on your selection) unless you cancel it before the renewal date.
                </p>
                <ul>
                  <li><strong>Billing:</strong> You will be charged through your iTunes Account (iOS) or Google Play 
                    Account (Android) at confirmation of purchase and at the start of each renewal period</li>
                  <li><strong>Renewal:</strong> Your subscription automatically renews unless auto-renew is turned off 
                    at least 24 hours before the end of the current billing period</li>
                  <li><strong>Price Changes:</strong> We will notify you at least 30 days in advance of any price 
                    increases. Price changes will take effect at the start of your next billing period following 
                    the notice</li>
                </ul>

                <h3>How to Cancel Auto-Renewal</h3>
                <p>
                  You can cancel your subscription at any time. To prevent being charged for the next billing period, 
                  you must cancel at least 24 hours before your renewal date.
                </p>
                <ul>
                  <li><strong>iOS:</strong> Go to Settings → [Your Name] → Subscriptions → FitConnect → Cancel Subscription</li>
                  <li><strong>Android:</strong> Go to Google Play Store → Menu → Subscriptions → FitConnect → Cancel</li>
                  <li><strong>Web:</strong> Go to FitConnect Settings → Subscription → Cancel Subscription</li>
                </ul>
                <p>
                  After cancellation, you will continue to have access to your subscription features until the end 
                  of your current billing period. No refunds are provided for partial billing periods.
                </p>

                <h3>Client Subscriptions to Coaches</h3>
                <p>
                  Some Coaches offer subscription plans for ongoing coaching services. These subscriptions are 
                  agreements between you and the Coach, processed through our platform. The same auto-renewal 
                  terms apply. Coach subscription pricing, terms, and cancellation policies are displayed on 
                  each Coach's profile before purchase.
                </p>

                <h2>9. Cancellation Policy</h2>
                <p>
                  Sessions may be cancelled or rescheduled free of charge up to 24 hours before the scheduled time. 
                  Cancellations within 24 hours may be subject to the Coach's individual cancellation policy, which 
                  is displayed on their profile. No-shows may result in full session charges.
                </p>

                <h2>10. User Content and License</h2>

                <h3>Your Content</h3>
                <p>
                  You retain ownership of all content you submit, post, or display on or through the Platform 
                  ("User Content"), including but not limited to profile information, progress photos, reviews, 
                  messages, workout logs, and any other materials.
                </p>

                <h3>License Grant to FitConnect</h3>
                <p>
                  By submitting User Content to the Platform, you grant FitConnect a worldwide, non-exclusive, 
                  royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare 
                  derivative works of, display, and perform your User Content in connection with the Platform 
                  and FitConnect's business, including for promoting and redistributing part or all of the Platform.
                </p>

                <h3>Reviews and Testimonials</h3>
                <p>
                  If you leave a review or testimonial, you grant FitConnect permission to use your first name, 
                  location, and review content for marketing purposes on our website, social media, and 
                  promotional materials. You may request removal of your testimonial at any time by contacting 
                  {contact.email}.
                </p>

                <h3>Content Moderation</h3>
                <p>
                  FitConnect reserves the right to review, moderate, and remove any User Content that violates 
                  these Terms, is illegal, harmful, abusive, offensive, or otherwise objectionable, at our sole discretion.
                </p>

                <h3>Content Survival</h3>
                <p>
                  The license granted above survives termination of your account only with respect to User Content 
                  that has been shared publicly (such as reviews) or that is reasonably necessary for FitConnect 
                  to maintain archived copies for legal compliance, dispute resolution, or enforcement of these Terms.
                </p>

                <h2>11. Intellectual Property</h2>
                <p>
                  The Platform, including its design, features, content, and technology, is owned by FitConnect and 
                  protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any 
                  part of the Platform without our written permission.
                </p>
                <p>
                  Coaches retain ownership of their original content (workout plans, nutritional guides, etc.) but 
                  grant FitConnect a license to display such content on the Platform for service delivery purposes.
                </p>

                <h2>12. Health and Fitness Disclaimer</h2>
                <p>
                  <strong>IMPORTANT - READ CAREFULLY:</strong>
                </p>
                <ul>
                  <li>
                    FitConnect is a technology platform that connects users with fitness professionals. We do not 
                    provide medical advice, diagnoses, or treatment recommendations.
                  </li>
                  <li>
                    The information and services provided through the Platform, including workout plans, nutrition 
                    guidance, and coaching advice, are for general informational and educational purposes only.
                  </li>
                  <li>
                    <strong>Consult Your Physician:</strong> Before beginning any exercise program, dietary change, 
                    or using any information or services obtained through FitConnect, you should consult with a 
                    qualified healthcare provider. This is especially important if you have any pre-existing health 
                    conditions, injuries, or are pregnant.
                  </li>
                  <li>
                    <strong>Assumption of Risk:</strong> You understand and agree that physical exercise involves 
                    inherent risks, including but not limited to risk of injury, illness, or death. You voluntarily 
                    assume all such risks and agree to release FitConnect from any liability related to your 
                    participation in fitness activities.
                  </li>
                  <li>
                    <strong>Coaches Are Not Medical Professionals:</strong> Unless specifically stated on their 
                    profile, Coaches on FitConnect are fitness professionals, not medical doctors, physiotherapists, 
                    or licensed healthcare providers. They are not qualified to diagnose medical conditions or 
                    prescribe medical treatments.
                  </li>
                  <li>
                    <strong>No Guarantee of Results:</strong> Individual results from fitness coaching vary based 
                    on numerous factors including genetics, adherence to programs, diet, rest, and other lifestyle 
                    factors. FitConnect and Coaches do not guarantee any specific results.
                  </li>
                </ul>

                <h2>13. Limitation of Liability</h2>
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

                <h2>14. Disclaimer of Warranties</h2>
                <p>
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR 
                  IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DO 
                  NOT GUARANTEE ANY SPECIFIC RESULTS FROM COACHING SERVICES.
                </p>

                <h2>15. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless FitConnect, its officers, directors, employees, and agents 
                  from any claims, damages, losses, or expenses (including attorney's fees) arising from your use of 
                  the Platform, violation of these Terms, or infringement of any third-party rights.
                </p>

                <h2>16. Third-Party Beneficiaries</h2>
                <p>
                  You acknowledge and agree that Apple Inc. and its subsidiaries are third-party beneficiaries of 
                  these Terms as they relate to your use of the App on iOS devices. Upon your acceptance of these 
                  Terms, Apple will have the right (and will be deemed to have accepted the right) to enforce these 
                  Terms against you as a third-party beneficiary thereof.
                </p>
                <p>
                  Similarly, Google LLC and its subsidiaries are third-party beneficiaries of these Terms as they 
                  relate to your use of the App on Android devices.
                </p>
                <p>
                  You acknowledge that your use of the App is also subject to the terms and conditions of the 
                  Apple App Store Terms of Service and/or the Google Play Terms of Service, as applicable. In the 
                  event of any conflict between these Terms and the App Store or Play Store terms, the App Store 
                  or Play Store terms shall prevail with respect to your use of the App.
                </p>

                <h2>17. Dispute Resolution</h2>
                <p>
                  We hope to resolve any disputes amicably. If you have a complaint, please contact us first at{" "}
                  {contact.legalEmail} and we will try to resolve the matter.
                </p>
                <p>
                  For disputes between Clients and Coaches regarding services, both parties agree to first attempt 
                  resolution through FitConnect's support team before pursuing formal proceedings.
                </p>
                <p>
                  If we cannot resolve a dispute informally, any legal proceedings shall be brought exclusively in 
                  the courts of England and Wales. Both parties agree to submit to the exclusive jurisdiction of 
                  these courts.
                </p>

                <h2>18. Termination</h2>
                <p>
                  We may suspend or terminate your account at any time for violation of these Terms, fraudulent 
                  activity, or any other reason at our discretion. You may terminate your account at any time by 
                  going to Settings → Account → Delete Account or by contacting support. Upon termination, your 
                  right to use the Platform ceases immediately.
                </p>

                <h2>19. Export Compliance</h2>
                <p>
                  The App may be subject to export control laws and regulations. You agree not to export, re-export, 
                  or transfer the App to any country or person prohibited by applicable laws, including:
                </p>
                <ul>
                  <li>Countries subject to UK, US, EU, or UN sanctions or embargoes</li>
                  <li>Any person or entity on the UK HM Treasury sanctions list, US Treasury Department's Specially 
                    Designated Nationals list, or similar restricted party lists</li>
                </ul>
                <p>
                  By using the App, you represent and warrant that you are not located in any such country or on 
                  any such list. You also agree to comply with all applicable export control laws and regulations, 
                  including the UK Export Control Act 2002 and US Export Administration Regulations (EAR).
                </p>

                <h2>20. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of England and Wales. 
                  Nothing in these Terms shall affect your statutory rights as a consumer under applicable UK law, 
                  including the Consumer Rights Act 2015.
                </p>

                <h2>21. Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue 
                  in full force and effect.
                </p>

                <h2>22. Entire Agreement</h2>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
                  FitConnect regarding the Platform and supersede any prior agreements.
                </p>

                <h2>23. Contact Information</h2>
                <p>For questions about these Terms, please contact us:</p>
                <ul>
                  <li>Email: {contact.legalEmail}</li>
                  <li>Address: {contact.address}</li>
                  {contact.phone && <li>Phone: {contact.phone}</li>}
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