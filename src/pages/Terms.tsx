import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { usePlatformContact } from "@/hooks/usePlatformContact";

const Terms = () => {
  const { contact } = usePlatformContact();
  return (
    <PageLayout
      title="Terms of Service | FitConnect User Agreement"
      description="FitConnect terms and conditions for clients and coaches. Understand your rights, payments, refunds and platform usage policies."
      canonicalPath="/terms"
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
          <p className="text-muted-foreground">Last updated: December 26, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card variant="glass">
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

                <h3>Account Eligibility and Age Requirements</h3>
                <p>
                  <strong>You must be at least 18 years old to create an account and use FitConnect.</strong> By 
                  creating an account, you represent and warrant that:
                </p>
                <ul>
                  <li>You are at least 18 years of age</li>
                  <li>You have the legal capacity to enter into these Terms</li>
                  <li>You are not using the Platform on behalf of any person under 18 years of age</li>
                  <li>All registration information you submit is truthful and accurate</li>
                </ul>
                <p>
                  <strong>Parental Consent:</strong> FitConnect does not knowingly collect or solicit personal 
                  information from anyone under 18 years of age. If you are under 18, please do not attempt to 
                  register for the Platform or send any personal information about yourself to us. If we learn 
                  that we have collected personal information from a person under 18, we will delete that 
                  information as quickly as possible and terminate the associated account. If you believe a 
                  person under 18 has provided us with personal information, please contact us at {contact.email}.
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

                <h3>In-App Purchases (iOS and Android)</h3>
                <p>
                  When purchasing subscriptions or digital products through the FitConnect mobile app:
                </p>
                <ul>
                  <li><strong>iOS Purchases:</strong> Payments made through the iOS app are processed by Apple and 
                    subject to the <a href="https://www.apple.com/legal/internet-services/itunes/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Media Services Terms and Conditions</a>. 
                    Refunds for iOS purchases must be requested through Apple.</li>
                  <li><strong>Android Purchases:</strong> Payments made through the Android app are processed by 
                    Google Play and subject to <a href="https://play.google.com/intl/en_uk/about/play-terms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Terms of Service</a>. 
                    Refunds for Android purchases must be requested through Google Play.</li>
                </ul>

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

                <h2>8A. Digital Products and Content</h2>
                <p>
                  Coaches may create and sell digital products ("Digital Content") through the Platform, including 
                  but not limited to e-books, workout templates, video tutorials, training programs, meal plan 
                  templates, and other downloadable or streamable content.
                </p>

                <h3>License to Digital Content</h3>
                <p>
                  When you purchase Digital Content, you are granted a limited, non-exclusive, non-transferable, 
                  revocable license to access and use the Digital Content for your personal, non-commercial use only.
                </p>

                <h3>Restrictions on Digital Content</h3>
                <p>You may not:</p>
                <ul>
                  <li>Resell, redistribute, or share purchased Digital Content with others</li>
                  <li>Copy, reproduce, or create derivative works from Digital Content</li>
                  <li>Use Digital Content for commercial purposes or in a commercial setting</li>
                  <li>Upload, publish, or share Digital Content on file-sharing sites or social media</li>
                  <li>Remove or alter any copyright notices or branding on Digital Content</li>
                </ul>

                <h3>Access Period</h3>
                <p>
                  Unless otherwise specified at the time of purchase, Digital Content remains accessible through 
                  your FitConnect account for as long as your account is active and in good standing. Some Digital 
                  Content may have expiration dates, which will be clearly stated at the time of purchase.
                </p>

                <h3>Digital Content Refunds</h3>
                <p>
                  <strong>Due to the nature of digital products, no refunds are provided once Digital Content has 
                  been accessed, downloaded, or streamed.</strong> If you experience technical issues preventing 
                  access to purchased content, please contact support at {contact.email} within 7 days of purchase.
                </p>

                <h3>Content Bundles</h3>
                <p>
                  Coaches may offer bundled Digital Content at a discounted price. When purchasing bundles, all 
                  included items are subject to these Digital Content terms. Individual items within a bundle 
                  cannot be refunded separately.
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

                <h2>11A. Video Conferencing Services</h2>
                <p>
                  FitConnect integrates with third-party video conferencing services, including Zoom Video 
                  Communications, Inc. ("Zoom") and Google Meet, to facilitate online coaching sessions. This 
                  section governs your use of these integrated services.
                </p>

                <h3>Third-Party Service Terms</h3>
                <p>
                  When you use video conferencing features through FitConnect, you agree to also be bound by the 
                  terms and privacy policies of the respective service providers:
                </p>
                <ul>
                  <li><strong>Zoom:</strong> <a href="https://www.zoom.com/en/trust/terms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zoom Terms of Service</a> and <a href="https://www.zoom.com/en/trust/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zoom Privacy Policy</a></li>
                  <li><strong>Google Meet:</strong> <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Terms of Service</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
                </ul>

                <h3>Coach Responsibilities</h3>
                <p>Coaches who connect video conferencing accounts agree to:</p>
                <ul>
                  <li>Use the integration solely for conducting legitimate coaching sessions with clients</li>
                  <li>Comply with the terms of service of the connected video conferencing provider</li>
                  <li>Not use the integration for any purpose unrelated to FitConnect coaching services</li>
                  <li>Obtain appropriate consent before recording any video sessions</li>
                  <li>Protect any recordings in accordance with applicable data protection laws</li>
                </ul>

                <h3>Client Responsibilities</h3>
                <p>Clients participating in video coaching sessions agree to:</p>
                <ul>
                  <li>Conduct themselves professionally during video sessions</li>
                  <li>Ensure their participation complies with the video provider's terms of service</li>
                  <li>Not record sessions without the express consent of the Coach</li>
                  <li>Not share meeting links with unauthorized third parties</li>
                </ul>

                <h3>Disclaimer of Liability for Video Services</h3>
                <p>
                  <strong>IMPORTANT:</strong> FitConnect is not responsible for the availability, performance, 
                  security, or functionality of third-party video conferencing services. You acknowledge and agree that:
                </p>
                <ul>
                  <li>FitConnect does not control and is not liable for any disruptions, outages, or technical 
                    issues with Zoom, Google Meet, or any other video conferencing service</li>
                  <li>FitConnect does not have access to, and is not responsible for, the content of your video calls</li>
                  <li>Any recordings made during video sessions are the responsibility of the parties involved, 
                    subject to applicable laws and the Coach's policies</li>
                  <li>FitConnect is not liable for any data breaches or security incidents that occur within the 
                    third-party video conferencing platforms</li>
                </ul>

                <h3>Disconnection of Video Services</h3>
                <p>
                  Coaches may disconnect their video conferencing accounts at any time through Settings → 
                  Integrations. Upon disconnection, FitConnect will no longer be able to create or manage 
                  video meetings on the Coach's behalf. Existing meeting links for scheduled sessions may 
                  remain active until the meetings occur or are manually cancelled.
                </p>

                <h2>11B. AI-Generated Content and Features</h2>
                <p>
                  FitConnect incorporates artificial intelligence ("AI") features to assist Coaches and enhance 
                  the user experience. This section governs the use of AI-powered functionality within the Platform.
                </p>

                <h3>AI-Assisted Features</h3>
                <p>AI is used within FitConnect for the following purposes:</p>
                <ul>
                  <li><strong>Workout Plan Generation:</strong> AI may suggest workout routines based on client goals, 
                    fitness level, available equipment, and preferences</li>
                  <li><strong>Meal Plan Suggestions:</strong> AI may generate meal plan ideas based on nutritional 
                    targets, dietary restrictions, and preferences</li>
                  <li><strong>Macro and Calorie Calculations:</strong> AI assists in calculating nutritional targets 
                    based on user data</li>
                  <li><strong>Exercise Alternatives:</strong> AI may suggest alternative exercises when needed</li>
                  <li><strong>Food Substitutions:</strong> AI may recommend food alternatives for dietary needs</li>
                  <li><strong>Progress Analysis:</strong> AI may analyze user data to provide insights</li>
                  <li><strong>Product Descriptions:</strong> AI may assist Coaches in creating product descriptions</li>
                </ul>

                <h3>AI Content Disclaimer</h3>
                <p>
                  <strong>IMPORTANT - PLEASE READ CAREFULLY:</strong>
                </p>
                <ul>
                  <li>AI-generated content is provided as <strong>suggestions only</strong> and should not be 
                    considered professional medical, nutritional, or fitness advice</li>
                  <li>All AI-generated workout and meal plans are subject to <strong>Coach review and approval</strong> 
                    before being delivered to Clients</li>
                  <li>AI suggestions are based on general principles and may not account for your specific 
                    individual circumstances, health conditions, or needs</li>
                  <li>FitConnect does not guarantee the accuracy, completeness, or appropriateness of AI-generated content</li>
                  <li>You should always consult with qualified healthcare professionals before making significant 
                    changes to your diet or exercise routine</li>
                </ul>

                <h3>Coach Responsibility for AI Content</h3>
                <p>
                  Coaches who use AI features to assist in creating client programs are responsible for:
                </p>
                <ul>
                  <li>Reviewing all AI-generated content before sharing with clients</li>
                  <li>Modifying AI suggestions to suit individual client needs</li>
                  <li>Ensuring AI-generated content is appropriate for each client's circumstances</li>
                  <li>Taking full professional responsibility for any content delivered to clients, regardless 
                    of whether it was AI-assisted</li>
                </ul>

                <h3>Limitation of Liability for AI</h3>
                <p>
                  FitConnect is not liable for any injuries, health issues, adverse effects, or damages resulting 
                  from following AI-generated suggestions. AI features are tools to assist human professionals, 
                  not replacements for professional judgment.
                </p>

                <h2>11C. Challenges and Gamification</h2>
                <p>
                  FitConnect offers challenges, badges, experience points (XP), levels, leaderboards, and other 
                  gamification features to encourage engagement and fitness progress.
                </p>

                <h3>Virtual Rewards</h3>
                <p>
                  Badges, XP, levels, avatars, and other virtual rewards earned through FitConnect:
                </p>
                <ul>
                  <li>Have <strong>no monetary value</strong> and cannot be exchanged for cash or other consideration</li>
                  <li>Are for entertainment and motivational purposes only</li>
                  <li>Remain the property of FitConnect and are licensed to you for use within the Platform</li>
                  <li>May be modified, removed, or reset at FitConnect's discretion</li>
                  <li>Are non-transferable between accounts</li>
                </ul>

                <h3>Challenge Participation</h3>
                <p>When participating in challenges, you agree that:</p>
                <ul>
                  <li>Participation is entirely voluntary</li>
                  <li>Challenge rules and requirements may vary and will be displayed before joining</li>
                  <li>FitConnect reserves the right to verify challenge completion through wearable data or 
                    other means</li>
                  <li>Cheating, manipulating data, or fraudulent completion of challenges may result in 
                    disqualification, badge removal, or account suspension</li>
                  <li>FitConnect may modify or cancel challenges at any time with reasonable notice</li>
                </ul>

                <h3>Leaderboards</h3>
                <p>
                  Leaderboard participation may display your display name, location, and ranking publicly within 
                  the Platform. You can control your leaderboard visibility through your privacy settings. By 
                  appearing on leaderboards, you consent to this display of information.
                </p>

                <h3>Challenge Rewards</h3>
                <p>
                  Some challenges may offer prizes or rewards. Prize fulfillment is subject to challenge-specific 
                  rules, eligibility requirements, and any applicable laws. FitConnect reserves the right to 
                  substitute prizes of equal or greater value.
                </p>

                <h2>11D. External Links and Third-Party Services</h2>
                <p>
                  FitConnect may include links to external websites and third-party services for your convenience.
                </p>

                <h3>Shopping Links</h3>
                <p>
                  FitConnect provides links to external grocery retailers (including Tesco, Asda, Sainsbury's, 
                  and others) to help you purchase ingredients for your meal plans. When using these links:
                </p>
                <ul>
                  <li>FitConnect only generates shopping list links; we do not process any grocery purchases</li>
                  <li>All purchases are conducted directly with the retailer and subject to their terms and conditions</li>
                  <li>Prices, availability, and delivery options are determined by the retailer</li>
                  <li>FitConnect is not responsible for product quality, delivery issues, or any disputes with retailers</li>
                  <li>No personal or payment information is shared by FitConnect with grocery retailers</li>
                </ul>

                <h3>External Links Disclaimer</h3>
                <p>
                  FitConnect is not responsible for the content, accuracy, privacy practices, or availability of 
                  third-party websites. Links to external sites do not imply endorsement. We encourage you to 
                  review the terms and privacy policies of any external sites you visit.
                </p>

                <h2>11E. Beta and Pre-Release Features</h2>
                <p>
                  FitConnect may offer access to beta, preview, or pre-release features ("Beta Features") to 
                  gather feedback and improve the Platform.
                </p>

                <h3>Beta Feature Terms</h3>
                <p>By using Beta Features, you acknowledge and agree that:</p>
                <ul>
                  <li>Beta Features are provided "AS-IS" and "AS-AVAILABLE" without any warranties</li>
                  <li>Beta Features may contain bugs, errors, or instabilities</li>
                  <li>Beta Features may be changed, limited, or discontinued at any time without notice</li>
                  <li>Data created using Beta Features may be lost or reset during development</li>
                  <li>Your feedback about Beta Features may be used by FitConnect to improve the Platform 
                    without compensation or attribution</li>
                </ul>

                <h3>Confidentiality</h3>
                <p>
                  Unless otherwise stated, Beta Features are confidential. You agree not to publicly discuss, 
                  screenshot, or share information about Beta Features without FitConnect's prior written consent.
                </p>

                <h2>11F. Cookies and Local Storage</h2>
                <p>
                  FitConnect uses cookies and browser local storage to provide and improve the Platform. This 
                  section summarizes our cookie practices; for full details, see Section 7 of our Privacy Policy.
                </p>

                <h3>Consent Banner</h3>
                <p>
                  When you first visit FitConnect, a cookie consent banner appears allowing you to accept, reject, 
                  or customize your preferences. Your choice is stored and respected across all Platform features.
                </p>

                <h3>Cookie Categories</h3>
                <ul>
                  <li><strong>Essential:</strong> Required for core functionality (login, security, navigation). 
                    These cannot be disabled.</li>
                  <li><strong>Location:</strong> Optional. Enables automatic location detection for marketplace 
                    personalization and local leaderboards.</li>
                  <li><strong>Preferences:</strong> Optional. Remembers your UI settings and dismissed banners.</li>
                  <li><strong>Analytics:</strong> Optional. Reserved for future usage improvements.</li>
                </ul>

                <h3>Your Choices</h3>
                <p>
                  You can change your cookie preferences at any time via the cookie preferences modal accessible 
                  from the footer. Rejecting optional cookies does not affect core Platform functionality—you can 
                  still use all features, though some personalization (like automatic location) will be disabled.
                </p>

                <h3>Continued Use</h3>
                <p>
                  By continuing to use FitConnect after making your consent choice, you agree to the storage and 
                  use of cookies as described. Essential cookies are necessary for the Platform to function and 
                  your use of the Platform constitutes acceptance of these essential cookies.
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
                
                <h3>Apple App Store</h3>
                <p>
                  You acknowledge and agree that Apple Inc. and its subsidiaries are third-party beneficiaries of 
                  these Terms as they relate to your use of the App on iOS devices. Upon your acceptance of these 
                  Terms, Apple will have the right (and will be deemed to have accepted the right) to enforce these 
                  Terms against you as a third-party beneficiary thereof.
                </p>

                <h3>Google Play Store</h3>
                <p>
                  Similarly, Google LLC and its subsidiaries are third-party beneficiaries of these Terms as they 
                  relate to your use of the App on Android devices. You acknowledge that Google Play and its terms 
                  apply to your use of the App.
                </p>

                <h3>App Store and Play Store Terms</h3>
                <p>
                  You acknowledge that your use of the App is also subject to the terms and conditions of the 
                  Apple App Store Terms of Service and/or the Google Play Terms of Service, as applicable. In the 
                  event of any conflict between these Terms and the App Store or Play Store terms, the App Store 
                  or Play Store terms shall prevail with respect to your use of the App.
                </p>

                <h3>Google Play Data Safety Compliance</h3>
                <p>
                  FitConnect complies with the Google Play Developer Program Policies, including the User Data 
                  policy. Our data collection, usage, and sharing practices are disclosed in our Privacy Policy 
                  and the Google Play Data Safety section of our app listing.
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
