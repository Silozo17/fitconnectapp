import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Save } from "lucide-react";
import { InvoiceTemplateSelector } from "@/components/invoice/InvoiceTemplateSelector";
import { InvoicePreview, InvoiceData, BusinessDetails } from "@/components/invoice/InvoicePreview";
import {
  useCoachInvoiceSettings,
  useUpdateInvoiceSettings,
  useUploadInvoiceLogo,
  TemplateId,
} from "@/hooks/useCoachInvoiceSettings";

interface InvoiceSettingsSectionProps {
  coachId: string;
}

export function InvoiceSettingsSection({ coachId }: InvoiceSettingsSectionProps) {
  const { data: settings, isLoading } = useCoachInvoiceSettings(coachId);
  const updateSettings = useUpdateInvoiceSettings();
  const uploadLogo = useUploadInvoiceLogo();

  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    businessEmail: "",
    businessPhone: "",
    vatNumber: "",
    companyRegistration: "",
    templateId: "modern" as TemplateId,
    accentColor: "#BEFF00",
    defaultPaymentTerms: "Payment due within 14 days",
    defaultNotes: "",
    bankDetails: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.business_name || "",
        businessAddress: settings.business_address || "",
        businessEmail: settings.business_email || "",
        businessPhone: settings.business_phone || "",
        vatNumber: settings.vat_number || "",
        companyRegistration: settings.company_registration || "",
        templateId: (settings.template_id as TemplateId) || "modern",
        accentColor: settings.accent_color || "#BEFF00",
        defaultPaymentTerms: settings.default_payment_terms || "Payment due within 14 days",
        defaultNotes: settings.default_notes || "",
        bankDetails: settings.bank_details || "",
        logoUrl: settings.logo_url || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      coachId,
      settings: {
        business_name: formData.businessName || null,
        business_address: formData.businessAddress || null,
        business_email: formData.businessEmail || null,
        business_phone: formData.businessPhone || null,
        vat_number: formData.vatNumber || null,
        company_registration: formData.companyRegistration || null,
        template_id: formData.templateId,
        accent_color: formData.accentColor,
        default_payment_terms: formData.defaultPaymentTerms || null,
        default_notes: formData.defaultNotes || null,
        bank_details: formData.bankDetails || null,
      },
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLogo.mutateAsync({ coachId, file });
    setFormData((prev) => ({ ...prev, logoUrl: url }));
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
  };

  // Sample invoice for preview
  const sampleInvoice: InvoiceData = {
    invoiceNumber: "INV-001",
    date: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    clientName: "John Smith",
    clientEmail: "john@example.com",
    lineItems: [
      { description: "Personal Training Session (1hr)", quantity: 4, unitPrice: 60, total: 240 },
      { description: "Nutrition Consultation", quantity: 1, unitPrice: 50, total: 50 },
    ],
    subtotal: 290,
    taxRate: 20,
    taxAmount: 58,
    total: 348,
    notes: formData.defaultNotes || undefined,
  };

  const businessDetails: BusinessDetails = {
    businessName: formData.businessName,
    businessAddress: formData.businessAddress,
    businessEmail: formData.businessEmail,
    businessPhone: formData.businessPhone,
    vatNumber: formData.vatNumber,
    logoUrl: formData.logoUrl,
    bankDetails: formData.bankDetails,
    paymentTerms: formData.defaultPaymentTerms,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Details</CardTitle>
          <CardDescription>Your business information shown on invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div>
            <Label>Business Logo</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload your logo or leave blank to use FitConnect logo
            </p>
            <div className="flex items-center gap-4">
              {formData.logoUrl ? (
                <div className="relative">
                  <img
                    src={formData.logoUrl}
                    alt="Business logo"
                    className="h-16 w-auto object-contain border rounded-lg p-2"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-16 w-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
                  <span className="text-xs">No logo</span>
                </div>
              )}
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploadLogo.isPending}
                />
                <Button variant="outline" size="sm" asChild disabled={uploadLogo.isPending}>
                  <span className="cursor-pointer">
                    {uploadLogo.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Logo
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Business Name</Label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                placeholder="billing@yourbusiness.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.businessPhone}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                placeholder="+44 123 456 7890"
              />
            </div>
            <div>
              <Label>VAT Number (optional)</Label>
              <Input
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                placeholder="GB123456789"
              />
            </div>
          </div>

          <div>
            <Label>Business Address</Label>
            <Textarea
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              placeholder="123 Business Street&#10;City, Postcode&#10;Country"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Design */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Design</CardTitle>
          <CardDescription>Choose a template style for your invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <InvoiceTemplateSelector
            selectedTemplate={formData.templateId}
            onSelect={(template) => setFormData({ ...formData, templateId: template })}
            accentColor={formData.accentColor}
          />

          {formData.templateId === "modern" && (
            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-32"
                  placeholder="#BEFF00"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Terms</CardTitle>
          <CardDescription>Pre-fill these on every new invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Payment Terms</Label>
            <Input
              value={formData.defaultPaymentTerms}
              onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
              placeholder="Payment due within 14 days"
            />
          </div>
          <div>
            <Label>Bank Details</Label>
            <Textarea
              value={formData.bankDetails}
              onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
              placeholder="Bank: Your Bank&#10;Sort Code: 12-34-56&#10;Account: 12345678"
              rows={3}
            />
          </div>
          <div>
            <Label>Default Notes</Label>
            <Textarea
              value={formData.defaultNotes}
              onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
              placeholder="Thank you for your business!"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>How your invoices will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden max-w-2xl mx-auto">
            <InvoicePreview
              invoice={sampleInvoice}
              business={businessDetails}
              templateId={formData.templateId}
              accentColor={formData.accentColor}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Invoice Settings
        </Button>
      </div>
    </div>
  );
}
