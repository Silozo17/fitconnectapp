import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { usePlatformContact } from "@/hooks/usePlatformContact";

/**
 * Standalone EULA Page
 * Required for iOS App Store compliance - Apple requires EULA to be a separate, accessible page
 * Contains all 10 Apple Minimum EULA Requirements per App Store Review Guidelines
 */
const Eula = () => {
  const { contact } = usePlatformContact();
  
  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://getfitconnect.co.uk" },
      { "@type": "ListItem", "position": 2, "name": "End User License Agreement", "item": "https://getfitconnect.co.uk/eula" }
    ]
  };

  return (
    <PageLayout
      title="End User License Agreement (EULA) | FitConnect App License"
      description="FitConnect End User License Agreement for iOS and Android mobile applications. Review the license terms for using the FitConnect app."
      canonicalPath="/eula"
      keywords={["FitConnect EULA", "app license agreement", "mobile app terms", "iOS app license"]}
      schema={breadcrumbSchema}
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-20" variant="pink" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            End User License{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Agreement
            </span>
          </h1>
          <p className="text-muted-foreground">Last updated: January 6, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card variant="glass">
              <CardContent className="p-8 md:p-12 prose prose-gray dark:prose-invert max-w-none">
                
                {/* 1. Acknowledgement */}
                <h2>1. Acknowledgement</h2>
                <p>
                  This End User License Agreement ("EULA") is a legal agreement between you ("End User" or "you") 
                  and AMW Media Ltd, trading as FitConnect ("Developer", "we", "us", or "our"), and governs your 
                  use of the FitConnect mobile application ("Licensed Application" or "App").
                </p>
                <p>
                  <strong>IMPORTANT:</strong> By downloading, installing, or using the Licensed Application, you 
                  acknowledge that you have read, understood, and agree to be bound by the terms and conditions 
                  of this EULA. If you do not agree to these terms, do not download, install, or use the App.
                </p>
                <p>
                  You acknowledge that this EULA is between you and AMW Media Ltd only, and not with Apple Inc., 
                  Google LLC, or any app store operator ("App Store Provider"). AMW Media Ltd, not the App Store 
                  Provider, is solely responsible for the Licensed Application and its content.
                </p>

                {/* 2. Scope of License */}
                <h2>2. Scope of License</h2>
                <p>
                  Subject to your compliance with this EULA, the Developer grants you a limited, non-exclusive, 
                  non-transferable, revocable license to download, install, and use the Licensed Application on 
                  any device that you own or control, solely for your personal, non-commercial use.
                </p>
                
                <h3>2.1 Device Restrictions</h3>
                <p>
                  For iOS devices: The license is limited to use on any Apple-branded products that you own or 
                  control and as permitted by the Usage Rules set forth in the Apple Media Services Terms and 
                  Conditions.
                </p>
                <p>
                  For Android devices: The license is limited to use on Android devices that you own or control 
                  and as permitted by the Google Play Terms of Service.
                </p>

                <h3>2.2 Family Sharing</h3>
                <p>
                  The Licensed Application may be accessed and used by other accounts associated with the 
                  purchaser through Family Sharing or volume purchasing, where applicable under the App Store 
                  Provider's terms.
                </p>

                <h3>2.3 License Restrictions</h3>
                <p>You may not:</p>
                <ul>
                  <li>Copy, modify, or create derivative works based on the Licensed Application</li>
                  <li>Reverse engineer, disassemble, decompile, or attempt to derive the source code of the App</li>
                  <li>Sell, resell, rent, lease, loan, sublicense, distribute, or transfer the App to any third party</li>
                  <li>Make the App available over a network where it could be used by multiple devices simultaneously</li>
                  <li>Remove, alter, or obscure any proprietary notices on the App</li>
                  <li>Use the App for any illegal, unauthorized, or harmful purpose</li>
                  <li>Use automated systems, bots, or scrapers to access or interact with the App</li>
                </ul>

                {/* 3. Maintenance and Support */}
                <h2>3. Maintenance and Support</h2>
                <p>
                  AMW Media Ltd is solely responsible for providing any maintenance and support services with 
                  respect to the Licensed Application, as specified in this EULA, or as required under applicable 
                  law.
                </p>
                <p>
                  You acknowledge that neither Apple Inc. nor Google LLC has any obligation whatsoever to furnish 
                  any maintenance and support services with respect to the Licensed Application.
                </p>
                <p>
                  Support is available via email at {contact.email}. We aim to respond to support inquiries within 
                  48 hours during business days.
                </p>

                {/* 4. Warranty */}
                <h2>4. Warranty</h2>
                <p>
                  AMW Media Ltd warrants that the Licensed Application will perform substantially in accordance 
                  with its documentation for a period of ninety (90) days from the date of your initial download 
                  ("Warranty Period").
                </p>
                <p>
                  If the Licensed Application fails to conform to this warranty, you may notify us and we will, 
                  at our option: (a) attempt to correct the nonconformity; or (b) provide a refund of the purchase 
                  price, if applicable.
                </p>
                <p>
                  <strong>App Store Refund Rights:</strong> In the event of any failure of the Licensed Application 
                  to conform to any applicable warranty, you may notify the App Store Provider, and the App Store 
                  Provider will refund the purchase price for the Licensed Application, if applicable. To the 
                  maximum extent permitted by applicable law, the App Store Provider will have no other warranty 
                  obligation whatsoever with respect to the Licensed Application.
                </p>
                <p>
                  <strong>Disclaimer:</strong> EXCEPT FOR THE EXPRESS WARRANTY SET FORTH ABOVE, THE LICENSED 
                  APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
                  PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>

                {/* 5. Product Claims */}
                <h2>5. Product Claims</h2>
                <p>
                  AMW Media Ltd, not Apple Inc. or Google LLC, is responsible for addressing any claims you or 
                  any third party may have relating to the Licensed Application or your possession and/or use 
                  of the Licensed Application, including but not limited to:
                </p>
                <ul>
                  <li>Product liability claims</li>
                  <li>Any claim that the Licensed Application fails to conform to any applicable legal or regulatory requirement</li>
                  <li>Claims arising under consumer protection, privacy, or similar legislation</li>
                  <li>Claims relating to Apple HealthKit or Health Connect data, if applicable</li>
                  <li>Claims relating to HomeKit framework integration, if applicable</li>
                </ul>
                <p>
                  This EULA does not limit AMW Media Ltd's liability beyond what is permitted by applicable law.
                </p>

                {/* 6. Intellectual Property Rights */}
                <h2>6. Intellectual Property Rights</h2>
                <p>
                  AMW Media Ltd, not Apple Inc. or Google LLC, shall be solely responsible for the investigation, 
                  defense, settlement, and discharge of any intellectual property infringement claim that may 
                  arise in connection with the Licensed Application.
                </p>
                <p>
                  The Licensed Application, including all content, features, and functionality, is owned by 
                  AMW Media Ltd and is protected by copyright, trademark, and other intellectual property laws. 
                  You acknowledge that you acquire no ownership rights by downloading or using the App.
                </p>

                {/* 7. Legal Compliance */}
                <h2>7. Legal Compliance</h2>
                <p>
                  You represent and warrant that:
                </p>
                <ul>
                  <li>You are not located in a country that is subject to a UK Government embargo, or that has 
                      been designated by the UK Government as a "terrorist supporting" country</li>
                  <li>You are not listed on any UK Government list of prohibited or restricted parties</li>
                  <li>You will comply with all applicable local, national, and international laws and regulations 
                      in your use of the Licensed Application</li>
                </ul>

                {/* 8. Developer Contact Information */}
                <h2>8. Developer Contact Information</h2>
                <p>
                  For any questions, complaints, or claims with respect to the Licensed Application, please 
                  contact us at:
                </p>
                <address className="not-italic">
                  <strong>AMW Media Ltd</strong><br />
                  Trading as FitConnect<br />
                  Company Number: 15747911<br />
                  Registered in England and Wales<br /><br />
                  <strong>Email:</strong> {contact.email}<br />
                  <strong>Privacy Enquiries:</strong> {contact.privacyEmail}<br />
                  <strong>Website:</strong> <a href="https://getfitconnect.co.uk" className="text-primary hover:underline">https://getfitconnect.co.uk</a>
                </address>

                {/* 9. Third-Party Terms of Agreement */}
                <h2>9. Third-Party Terms of Agreement</h2>
                <p>
                  You must comply with applicable third-party terms of agreement when using the Licensed 
                  Application. For example:
                </p>
                <ul>
                  <li>
                    <strong>iOS Users:</strong> You must comply with the{" "}
                    <a 
                      href="https://www.apple.com/legal/internet-services/itunes/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Apple Media Services Terms and Conditions
                    </a>
                  </li>
                  <li>
                    <strong>Android Users:</strong> You must comply with the{" "}
                    <a 
                      href="https://play.google.com/intl/en_uk/about/play-terms/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Play Terms of Service
                    </a>
                  </li>
                  <li>When using video conferencing features, you must comply with the terms of service of 
                      the respective provider (Zoom, Google Meet)</li>
                  <li>When using health integrations, you must comply with the terms of the health platform 
                      (Apple Health, Google Fit, Fitbit, Garmin)</li>
                </ul>

                {/* 10. Third-Party Beneficiary */}
                <h2>10. Third-Party Beneficiary</h2>
                <p>
                  You acknowledge and agree that Apple Inc. and its subsidiaries (for iOS users), and Google LLC 
                  and its subsidiaries (for Android users), are third-party beneficiaries of this EULA.
                </p>
                <p>
                  Upon your acceptance of the terms and conditions of this EULA, the App Store Provider will 
                  have the right (and will be deemed to have accepted the right) to enforce this EULA against 
                  you as a third-party beneficiary thereof.
                </p>

                {/* Additional Sections */}
                <h2>11. Updates and Modifications</h2>
                <p>
                  AMW Media Ltd may from time to time develop and provide updates to the Licensed Application, 
                  which may include upgrades, bug fixes, patches, and other error corrections and/or new features. 
                  Updates may also modify or delete features and functionality in their entirety.
                </p>
                <p>
                  You agree that AMW Media Ltd has no obligation to provide any updates or to continue to provide 
                  or enable any particular features or functionality. Based on your device settings, when your 
                  device is connected to the internet, either: (a) the Application will automatically download 
                  and install all available updates; or (b) you may receive notice of or be prompted to download 
                  and install available updates.
                </p>
                <p>
                  You shall promptly download and install all updates. Your continued use of the Application after 
                  an update has been made available constitutes your acceptance of such update.
                </p>

                <h2>12. License Termination</h2>
                <p>
                  This license is effective until terminated by you or AMW Media Ltd. Your rights under this 
                  license will terminate automatically without notice from AMW Media Ltd if you fail to comply 
                  with any term(s) of this EULA.
                </p>
                <p>
                  Upon termination of this license, you shall cease all use of the Licensed Application and 
                  delete all copies, full or partial, of the Licensed Application from your devices.
                </p>
                <p>
                  Sections 4 (Warranty), 5 (Product Claims), 6 (Intellectual Property Rights), and 10 (Third-Party 
                  Beneficiary) shall survive any termination of this EULA.
                </p>

                <h2>13. Governing Law</h2>
                <p>
                  This EULA shall be governed by and construed in accordance with the laws of England and Wales, 
                  without regard to its conflict of law provisions. Any disputes arising under or in connection 
                  with this EULA shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>

                <h2>14. Entire Agreement</h2>
                <p>
                  This EULA, together with our{" "}
                  <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, 
                  constitutes the entire agreement between you and AMW Media Ltd with respect to the Licensed 
                  Application and supersedes all prior or contemporaneous understandings and agreements, whether 
                  written or oral, with respect to the Licensed Application.
                </p>

                <h2>15. Contact</h2>
                <p>
                  If you have any questions about this EULA, please contact us at{" "}
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                    {contact.email}
                  </a>.
                </p>

              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Eula;
