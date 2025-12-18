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
          <p className="text-muted-foreground">Last updated: December 18, 2024</p>
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
                  Welcome to FitConnect, a trading name of AMW Media Ltd ("we," "our," or "us"). We are committed 
                  to protecting your personal information and your right to privacy. This Privacy Policy explains 
                  how we collect, use, disclose, and safeguard your information when you use our website and mobile 
                  application (collectively, the "Platform").
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
                  We share information with third-party service providers who perform services on our behalf:
                </p>
                <ul>
                  <li><strong>Stripe:</strong> Payment processing and financial transactions</li>
                  <li><strong>Supabase:</strong> Database hosting, authentication, and file storage</li>
                  <li><strong>Resend:</strong> Transactional email delivery (booking confirmations, notifications)</li>
                  <li><strong>Google Cloud:</strong> AI services for meal and workout suggestions</li>
                  <li><strong>Zoom Video Communications:</strong> Video conferencing for online sessions</li>
                  <li><strong>Apple (HealthKit):</strong> Health and fitness data synchronization</li>
                  <li><strong>Fitbit:</strong> Activity and health data from Fitbit devices</li>
                  <li><strong>Garmin:</strong> Training and activity data from Garmin devices</li>
                </ul>
                <p>
                  These service providers are contractually obligated to protect your data and use it only for 
                  the specific purposes we direct.
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
                  safeguards are in place for such transfers in accordance with the UK General Data Protection 
                  Regulation (UK GDPR) and the Data Protection Act 2018.
                </p>
                <p>
                  For transfers outside the UK and EEA, we rely on adequacy decisions, Standard Contractual 
                  Clauses (SCCs), or other lawful transfer mechanisms approved by the UK Information 
                  Commissioner's Office (ICO).
                </p>

                <h2>11. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined 
                  in this Privacy Policy, unless a longer retention period is required by law. When you delete 
                  your account, we will delete or anonymize your personal information within 30 days, except 
                  where we need to retain it for legal compliance.
                </p>

                <h2>12. Google Services Integration</h2>
                <p>
                  FitConnect integrates with various Google services to enhance your experience. This section 
                  explains how we use Google APIs and your rights regarding this data.
                </p>

                <h3>Google Sign-In (OAuth 2.0)</h3>
                <p>When you choose to sign in with Google, we access:</p>
                <ul>
                  <li>Your basic profile information (name, email address, profile picture)</li>
                  <li>Your email address for account identification and communication</li>
                </ul>
                <p>
                  We use this information solely to create and authenticate your FitConnect account. We do not 
                  post to your Google account or access any other Google services without your explicit consent.
                </p>

                <h3>Google Calendar Integration</h3>
                <p>
                  Coaches and clients can optionally connect their Google Calendar to sync coaching sessions. 
                  When you connect Google Calendar, we request access to:
                </p>
                <ul>
                  <li><strong>calendar.events scope:</strong> To create, read, and update calendar events for your coaching sessions</li>
                </ul>
                <p>We use this access to:</p>
                <ul>
                  <li>Automatically add confirmed coaching sessions to your calendar</li>
                  <li>Update calendar events when sessions are rescheduled</li>
                  <li>Remove calendar events when sessions are cancelled</li>
                </ul>
                <p>
                  We only access calendar events created by FitConnect. We do not read, modify, or delete your 
                  other calendar events.
                </p>

                <h3>Google Fit Integration</h3>
                <p>
                  Clients can optionally connect Google Fit to sync fitness and health data. When you connect 
                  Google Fit, we may request access to:
                </p>
                <ul>
                  <li><strong>fitness.activity.read:</strong> To read your activity data (steps, active minutes, calories burned)</li>
                  <li><strong>fitness.body.read:</strong> To read body measurements (weight, body fat percentage)</li>
                  <li><strong>fitness.sleep.read:</strong> To read sleep data for wellness tracking</li>
                </ul>
                <p>We use this data to:</p>
                <ul>
                  <li>Display your fitness metrics on your dashboard</li>
                  <li>Share relevant data with your connected coaches (with your consent)</li>
                  <li>Track progress towards fitness goals and habits</li>
                  <li>Verify challenge completion for gamification features</li>
                </ul>

                <h3>Revoking Google Access</h3>
                <p>
                  You can disconnect Google services from FitConnect at any time through your account settings. 
                  Additionally, you can revoke FitConnect's access to your Google account directly through Google:
                </p>
                <ul>
                  <li>Visit <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">myaccount.google.com/permissions</a></li>
                  <li>Find "FitConnect" in the list of apps with access</li>
                  <li>Click "Remove Access" to revoke all permissions</li>
                </ul>
                <p>
                  When you disconnect or revoke access, we stop receiving new data from Google services. Previously 
                  synced data remains in your FitConnect account unless you request its deletion.
                </p>

                <h2>13. Apple HealthKit Integration</h2>
                <p>
                  FitConnect integrates with Apple HealthKit to provide comprehensive health and fitness tracking 
                  for iOS users. This integration is optional and requires your explicit consent.
                </p>

                <h3>Data We Access from HealthKit</h3>
                <p>With your permission, we may read the following data types from Apple HealthKit:</p>
                <ul>
                  <li><strong>Activity Data:</strong> Steps, active energy burned, exercise minutes, stand hours</li>
                  <li><strong>Workout Data:</strong> Workout type, duration, distance, calories burned</li>
                  <li><strong>Body Measurements:</strong> Weight, height, body fat percentage, body mass index</li>
                  <li><strong>Heart Data:</strong> Resting heart rate, heart rate variability (for recovery tracking)</li>
                  <li><strong>Sleep Data:</strong> Sleep duration, sleep stages (if available)</li>
                </ul>

                <h3>How We Use HealthKit Data</h3>
                <p>HealthKit data is used exclusively to:</p>
                <ul>
                  <li>Display your health metrics on your FitConnect dashboard</li>
                  <li>Track progress toward fitness goals set with your coach</li>
                  <li>Auto-complete habits linked to activity metrics (e.g., step goals)</li>
                  <li>Verify challenge completion for gamification features</li>
                  <li>Share relevant metrics with your connected coaches (with your explicit consent)</li>
                </ul>

                <h3>HealthKit Data Protection</h3>
                <p>
                  <strong>Important:</strong> In accordance with Apple's requirements and our commitment to your privacy:
                </p>
                <ul>
                  <li>HealthKit data is <strong>never</strong> used for advertising or marketing purposes</li>
                  <li>HealthKit data is <strong>never</strong> sold to third parties</li>
                  <li>HealthKit data is <strong>never</strong> shared with third parties for their marketing purposes</li>
                  <li>HealthKit data is stored securely using encryption and transmitted only over secure connections</li>
                  <li>Access to your HealthKit data can be revoked at any time through iOS Settings</li>
                </ul>

                <h3>Revoking HealthKit Access</h3>
                <p>You can revoke FitConnect's access to HealthKit at any time:</p>
                <ul>
                  <li>Go to iOS Settings → Privacy & Security → Health → FitConnect</li>
                  <li>Toggle off any data types you no longer wish to share</li>
                  <li>Or disable all access by turning off FitConnect entirely</li>
                </ul>

                <h2>14. Fitbit Integration</h2>
                <p>
                  FitConnect can connect to your Fitbit account to sync fitness and health data from your Fitbit 
                  devices. This integration uses the official Fitbit Web API.
                </p>

                <h3>Data We Access from Fitbit</h3>
                <p>With your authorization, we may access:</p>
                <ul>
                  <li><strong>Activity & Exercise:</strong> Steps, distance, floors climbed, active minutes, logged exercises</li>
                  <li><strong>Body & Weight:</strong> Weight logs, body fat percentage, BMI</li>
                  <li><strong>Sleep:</strong> Sleep duration, sleep stages, sleep score</li>
                  <li><strong>Heart Rate:</strong> Resting heart rate, heart rate zones during exercise</li>
                </ul>

                <h3>How We Use Fitbit Data</h3>
                <ul>
                  <li>Sync your activity data to display on your FitConnect dashboard</li>
                  <li>Track progress towards fitness goals and habits</li>
                  <li>Share relevant metrics with your connected coaches</li>
                  <li>Verify challenge completion for gamification features</li>
                </ul>

                <h3>Revoking Fitbit Access</h3>
                <p>You can disconnect Fitbit from FitConnect at any time:</p>
                <ul>
                  <li>Through FitConnect: Settings → Integrations → Fitbit → Disconnect</li>
                  <li>Through Fitbit: Visit <a href="https://www.fitbit.com/settings/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fitbit.com/settings/applications</a> and revoke FitConnect's access</li>
                </ul>

                <h2>15. Garmin Integration</h2>
                <p>
                  FitConnect integrates with Garmin Connect to sync training data from your Garmin devices. 
                  This integration uses the official Garmin Connect API.
                </p>

                <h3>Data We Access from Garmin</h3>
                <p>With your authorization, we may access:</p>
                <ul>
                  <li><strong>Activity Summaries:</strong> Daily steps, calories, distance, active minutes</li>
                  <li><strong>Workout Data:</strong> Running, cycling, swimming, strength training activities with detailed metrics</li>
                  <li><strong>Body Composition:</strong> Weight and body composition data from Garmin Index scales</li>
                  <li><strong>Sleep Data:</strong> Sleep duration, sleep stages, sleep score</li>
                  <li><strong>Stress & Recovery:</strong> Stress levels, Body Battery, HRV status</li>
                </ul>

                <h3>How We Use Garmin Data</h3>
                <ul>
                  <li>Display your training metrics and activity data on your dashboard</li>
                  <li>Track progress towards fitness goals set with your coach</li>
                  <li>Auto-complete habits linked to activity metrics</li>
                  <li>Share relevant training data with your connected coaches</li>
                </ul>

                <h3>Revoking Garmin Access</h3>
                <p>You can disconnect Garmin from FitConnect at any time:</p>
                <ul>
                  <li>Through FitConnect: Settings → Integrations → Garmin → Disconnect</li>
                  <li>Through Garmin: Visit <a href="https://connect.garmin.com/modern/settings/accountInformation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Garmin Connect Settings</a> → Connected Apps → Revoke FitConnect access</li>
                </ul>

                <h2>16. Video Conferencing (Zoom & Google Meet)</h2>
                <p>
                  FitConnect enables online coaching sessions through video conferencing integrations. 
                  Coaches can create video meeting links for their sessions.
                </p>

                <h3>Zoom Integration</h3>
                <p>When coaches connect their Zoom account, we request access to:</p>
                <ul>
                  <li>Create meeting links for scheduled coaching sessions</li>
                  <li>Update or cancel meetings when sessions are rescheduled or cancelled</li>
                </ul>
                <p>
                  <strong>Important:</strong> FitConnect does not record, store, or have access to the content of 
                  your video calls. All video sessions are conducted directly through Zoom's infrastructure and 
                  are subject to Zoom's Privacy Policy.
                </p>

                <h3>Google Meet Integration</h3>
                <p>
                  When Google Calendar is connected, coaches can generate Google Meet links for online sessions. 
                  We only create meeting links; we do not record or access meeting content.
                </p>

                <h2>17. Mobile Application Permissions</h2>
                <p>
                  The FitConnect mobile application may request the following device permissions to provide our services:
                </p>

                <h3>Camera Access</h3>
                <p>Used to:</p>
                <ul>
                  <li>Take and upload progress photos</li>
                  <li>Take profile pictures</li>
                  <li>Scan QR codes for quick actions</li>
                </ul>
                <p>Camera access is only activated when you explicitly use these features.</p>

                <h3>Photo Library Access</h3>
                <p>Used to:</p>
                <ul>
                  <li>Select existing photos for progress tracking</li>
                  <li>Upload profile pictures from your gallery</li>
                  <li>Save images generated by the app</li>
                </ul>

                <h3>Push Notifications</h3>
                <p>Used to send you:</p>
                <ul>
                  <li>Session reminders and booking confirmations</li>
                  <li>New message notifications</li>
                  <li>Payment confirmations and receipts</li>
                  <li>Challenge updates and achievement notifications</li>
                  <li>Important account and security alerts</li>
                </ul>
                <p>You can manage notification preferences in your device settings or within the app.</p>

                <h3>Location Services (Optional)</h3>
                <p>If enabled, used to:</p>
                <ul>
                  <li>Find coaches near your location</li>
                  <li>Display location-based leaderboards</li>
                  <li>Improve coach discovery recommendations</li>
                </ul>
                <p>Location access is optional and can be disabled at any time in your device settings.</p>

                <h3>Biometric Authentication (Optional)</h3>
                <p>
                  If your device supports Face ID or Touch ID, you can enable biometric authentication for 
                  quick and secure login. Biometric data is processed entirely on your device and is never 
                  transmitted to or stored by FitConnect.
                </p>

                <h2>18. Account Deletion</h2>
                <p>
                  You have the right to delete your FitConnect account at any time. This section explains 
                  how to delete your account and what happens to your data.
                </p>

                <h3>How to Delete Your Account</h3>
                <p>You can delete your account through the following methods:</p>
                <ul>
                  <li><strong>In-App:</strong> Go to Settings → Account → Delete Account</li>
                  <li><strong>Email:</strong> Send a request to {contact.privacyEmail} with subject "Account Deletion Request"</li>
                </ul>

                <h3>What Happens When You Delete Your Account</h3>
                <p><strong>Immediately deleted:</strong></p>
                <ul>
                  <li>Your profile information (name, bio, profile photo)</li>
                  <li>Your fitness goals and preferences</li>
                  <li>Your progress photos</li>
                  <li>Your meal plans and workout plans</li>
                  <li>Your connected device data (HealthKit, Fitbit, Garmin)</li>
                  <li>Your notification preferences</li>
                </ul>

                <p><strong>Retained for 30 days (then deleted):</strong></p>
                <ul>
                  <li>Account recovery data (in case you change your mind)</li>
                  <li>Backup copies in our disaster recovery systems</li>
                </ul>

                <p><strong>Retained as required by law:</strong></p>
                <ul>
                  <li>Payment transaction records (required for tax and accounting purposes, typically 7 years)</li>
                  <li>Legal compliance records</li>
                  <li>Fraud prevention data</li>
                </ul>

                <p><strong>Note for Coaches:</strong> If you have active clients or pending bookings, you will need 
                  to complete or transfer these commitments before account deletion can be processed.</p>

                <h3>Data Export Before Deletion</h3>
                <p>
                  Before deleting your account, you can request a copy of your data by going to Settings → 
                  Privacy → Download My Data. We will provide your data in a machine-readable format (JSON/CSV) 
                  within 30 days of your request.
                </p>

                <h2>19. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date. For 
                  material changes, we will provide additional notice through in-app notifications or email. 
                  We encourage you to review this Privacy Policy periodically.
                </p>

                <h2>20. Contact Us</h2>
                <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <ul>
                  <li>Email: {contact.privacyEmail}</li>
                  <li>Address: {contact.address}</li>
                  {contact.phone && <li>Phone: {contact.phone}</li>}
                </ul>
                <p>
                  For UK-specific privacy inquiries or to contact our Data Protection representative, please 
                  email {contact.privacyEmail} with "UK GDPR Request" in the subject line.
                </p>

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