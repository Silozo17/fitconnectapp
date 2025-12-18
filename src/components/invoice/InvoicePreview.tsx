import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TemplateId } from "@/hooks/useCoachInvoiceSettings";

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  clientName: string;
  clientEmail?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  notes?: string;
  status?: string;
}

export interface BusinessDetails {
  businessName?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
  vatNumber?: string;
  logoUrl?: string;
  bankDetails?: string;
  paymentTerms?: string;
}

interface InvoicePreviewProps {
  invoice: InvoiceData;
  business: BusinessDetails;
  templateId: TemplateId;
  accentColor?: string;
  className?: string;
}

const defaultLogoUrl = "/logo.svg";

export function InvoicePreview({
  invoice,
  business,
  templateId,
  accentColor = "#BEFF00",
  className,
}: InvoicePreviewProps) {
  const logoUrl = business.logoUrl || defaultLogoUrl;
  const currencySymbol = "£";

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return <ModernTemplate invoice={invoice} business={business} logoUrl={logoUrl} accentColor={accentColor} formatCurrency={formatCurrency} />;
      case "classic":
        return <ClassicTemplate invoice={invoice} business={business} logoUrl={logoUrl} formatCurrency={formatCurrency} />;
      case "minimal":
        return <MinimalTemplate invoice={invoice} business={business} logoUrl={logoUrl} formatCurrency={formatCurrency} />;
      case "bold":
        return <BoldTemplate invoice={invoice} business={business} logoUrl={logoUrl} formatCurrency={formatCurrency} />;
      case "professional":
        return <ProfessionalTemplate invoice={invoice} business={business} logoUrl={logoUrl} accentColor="#2563eb" formatCurrency={formatCurrency} />;
      default:
        return <ModernTemplate invoice={invoice} business={business} logoUrl={logoUrl} accentColor={accentColor} formatCurrency={formatCurrency} />;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg overflow-hidden", className)}>
      {renderTemplate()}
    </div>
  );
}

interface TemplateProps {
  invoice: InvoiceData;
  business: BusinessDetails;
  logoUrl: string;
  accentColor?: string;
  formatCurrency: (amount: number) => string;
}

function ModernTemplate({ invoice, business, logoUrl, accentColor, formatCurrency }: TemplateProps) {
  return (
    <div className="p-8 text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-2" />
          <h1 className="text-2xl font-bold" style={{ color: accentColor }}>INVOICE</h1>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{invoice.invoiceNumber}</p>
          <p className="text-gray-500">Date: {format(invoice.date, "MMM d, yyyy")}</p>
          <p className="text-gray-500">Due: {format(invoice.dueDate, "MMM d, yyyy")}</p>
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">From</p>
          <p className="font-semibold">{business.businessName || "Your Business"}</p>
          {business.businessAddress && <p className="text-sm text-gray-600 whitespace-pre-line">{business.businessAddress}</p>}
          {business.businessEmail && <p className="text-sm text-gray-600">{business.businessEmail}</p>}
          {business.vatNumber && <p className="text-sm text-gray-600">VAT: {business.vatNumber}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Bill To</p>
          <p className="font-semibold">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-sm text-gray-600">{invoice.clientEmail}</p>}
        </div>
      </div>

      {/* Line Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2" style={{ borderColor: accentColor }}>
            <th className="text-left py-3 text-sm font-semibold">Description</th>
            <th className="text-center py-3 text-sm font-semibold w-20">Qty</th>
            <th className="text-right py-3 text-sm font-semibold w-24">Price</th>
            <th className="text-right py-3 text-sm font-semibold w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-3 text-sm">{item.description}</td>
              <td className="py-3 text-sm text-center">{item.quantity}</td>
              <td className="py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 text-sm text-right">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate && (
            <div className="flex justify-between py-2 text-sm">
              <span>VAT ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 text-lg font-bold border-t-2" style={{ borderColor: accentColor }}>
            <span>Total</span>
            <span style={{ color: accentColor }}>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Payment */}
      {(invoice.notes || business.paymentTerms || business.bankDetails) && (
        <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
          {business.paymentTerms && <p className="mb-2">{business.paymentTerms}</p>}
          {business.bankDetails && <p className="mb-2 whitespace-pre-line">{business.bankDetails}</p>}
          {invoice.notes && <p className="italic">{invoice.notes}</p>}
        </div>
      )}
    </div>
  );
}

function ClassicTemplate({ invoice, business, logoUrl, formatCurrency }: TemplateProps) {
  return (
    <div className="p-8 text-gray-900 font-serif">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="font-bold mb-1">{business.businessName || "Your Business"}</p>
          {business.businessAddress && <p className="text-sm whitespace-pre-line">{business.businessAddress}</p>}
          {business.businessPhone && <p className="text-sm">{business.businessPhone}</p>}
          {business.vatNumber && <p className="text-sm">VAT: {business.vatNumber}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm"><span className="font-bold">Invoice #:</span> {invoice.invoiceNumber}</p>
          <p className="text-sm"><span className="font-bold">Date:</span> {format(invoice.date, "MMMM d, yyyy")}</p>
          <p className="text-sm"><span className="font-bold">Due Date:</span> {format(invoice.dueDate, "MMMM d, yyyy")}</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="font-bold mb-1">Bill To:</p>
        <p>{invoice.clientName}</p>
        {invoice.clientEmail && <p className="text-sm">{invoice.clientEmail}</p>}
      </div>

      {/* Table */}
      <table className="w-full mb-8 border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left py-2 px-3 border-b border-gray-300 text-sm">Description</th>
            <th className="text-center py-2 px-3 border-b border-gray-300 text-sm w-20">Qty</th>
            <th className="text-right py-2 px-3 border-b border-gray-300 text-sm w-24">Rate</th>
            <th className="text-right py-2 px-3 border-b border-gray-300 text-sm w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2 px-3 border-b border-gray-200 text-sm">{item.description}</td>
              <td className="py-2 px-3 border-b border-gray-200 text-sm text-center">{item.quantity}</td>
              <td className="py-2 px-3 border-b border-gray-200 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2 px-3 border-b border-gray-200 text-sm text-right">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 border border-gray-300">
          <div className="flex justify-between py-2 px-3 text-sm border-b border-gray-200">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate && (
            <div className="flex justify-between py-2 px-3 text-sm border-b border-gray-200">
              <span>VAT ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 px-3 font-bold bg-gray-100">
            <span>Total Due</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-800 pt-4 text-sm">
        {business.paymentTerms && <p className="mb-2">{business.paymentTerms}</p>}
        {business.bankDetails && <p className="mb-2 whitespace-pre-line">{business.bankDetails}</p>}
        {invoice.notes && <p className="italic mt-4">{invoice.notes}</p>}
      </div>
    </div>
  );
}

function MinimalTemplate({ invoice, business, logoUrl, formatCurrency }: TemplateProps) {
  return (
    <div className="p-10 text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain opacity-80" />
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Invoice</p>
          <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-12 mb-12 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
          <p>{format(invoice.date, "MMM d, yyyy")}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Due</p>
          <p>{format(invoice.dueDate, "MMM d, yyyy")}</p>
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-12 mb-12 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">From</p>
          <p className="font-medium">{business.businessName || "Your Business"}</p>
          {business.businessEmail && <p className="text-gray-500">{business.businessEmail}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">To</p>
          <p className="font-medium">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-gray-500">{invoice.clientEmail}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="mb-12">
        {invoice.lineItems.map((item, idx) => (
          <div key={idx} className="flex justify-between py-4 border-b border-gray-100 text-sm">
            <div>
              <p>{item.description}</p>
              <p className="text-gray-400 text-xs">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
            </div>
            <p className="font-medium">{formatCurrency(item.total)}</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="text-right">
          {invoice.taxRate && (
            <p className="text-sm text-gray-500 mb-2">VAT ({invoice.taxRate}%): {formatCurrency(invoice.taxAmount || 0)}</p>
          )}
          <p className="text-2xl font-light">{formatCurrency(invoice.total)}</p>
        </div>
      </div>

      {/* Notes */}
      {(invoice.notes || business.bankDetails) && (
        <div className="mt-16 pt-8 border-t border-gray-100 text-xs text-gray-400">
          {business.bankDetails && <p className="whitespace-pre-line mb-2">{business.bankDetails}</p>}
          {invoice.notes && <p>{invoice.notes}</p>}
        </div>
      )}
    </div>
  );
}

function BoldTemplate({ invoice, business, logoUrl, formatCurrency }: TemplateProps) {
  return (
    <div className="bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain mb-4 invert" />
          <h1 className="text-4xl font-black tracking-tight">INVOICE</h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
          <p className="text-gray-400 text-sm mt-2">{format(invoice.date, "MMM d, yyyy")}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase mb-2">From</p>
          <p className="font-bold">{business.businessName || "Your Business"}</p>
          {business.businessAddress && <p className="text-gray-400 whitespace-pre-line">{business.businessAddress}</p>}
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-xs uppercase mb-2">Bill To</p>
          <p className="font-bold">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-gray-400">{invoice.clientEmail}</p>}
          <p className="text-gray-400 mt-2">Due: {format(invoice.dueDate, "MMM d, yyyy")}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-8">
        <div className="grid grid-cols-12 gap-4 py-3 border-b border-gray-700 text-xs uppercase tracking-wider text-gray-400">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        {invoice.lineItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 py-4 border-b border-gray-800">
            <div className="col-span-6">{item.description}</div>
            <div className="col-span-2 text-center text-gray-400">{item.quantity}</div>
            <div className="col-span-2 text-right text-gray-400">{formatCurrency(item.unitPrice)}</div>
            <div className="col-span-2 text-right font-bold">{formatCurrency(item.total)}</div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-end mb-10">
        <div className="bg-white text-gray-900 rounded-lg p-6 min-w-[200px]">
          <div className="flex justify-between mb-2 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate && (
            <div className="flex justify-between mb-2 text-sm text-gray-500">
              <span>VAT ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 text-xl font-black">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {(invoice.notes || business.bankDetails) && (
        <div className="text-sm text-gray-500 border-t border-gray-800 pt-6">
          {business.bankDetails && <p className="whitespace-pre-line mb-2">{business.bankDetails}</p>}
          {invoice.notes && <p>{invoice.notes}</p>}
        </div>
      )}
    </div>
  );
}

function ProfessionalTemplate({ invoice, business, logoUrl, accentColor, formatCurrency }: TemplateProps) {
  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Header Bar */}
      <div className="bg-blue-600 text-white px-8 py-6">
        <div className="flex justify-between items-center">
          <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
          <div className="text-right">
            <h1 className="text-xl font-bold">INVOICE</h1>
            <p className="text-blue-200 text-sm">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">From</p>
            <p className="font-semibold">{business.businessName || "Your Business"}</p>
            {business.businessAddress && <p className="text-slate-600 whitespace-pre-line">{business.businessAddress}</p>}
            {business.businessEmail && <p className="text-slate-600">{business.businessEmail}</p>}
            {business.vatNumber && <p className="text-slate-600">VAT: {business.vatNumber}</p>}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-slate-600">{invoice.clientEmail}</p>}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Details</p>
            <div className="space-y-1">
              <p><span className="text-slate-500">Date:</span> {format(invoice.date, "MMM d, yyyy")}</p>
              <p><span className="text-slate-500">Due:</span> {format(invoice.dueDate, "MMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="bg-slate-200">
              <th className="text-left py-3 px-4 font-semibold">Description</th>
              <th className="text-center py-3 px-4 font-semibold w-20">Qty</th>
              <th className="text-right py-3 px-4 font-semibold w-28">Unit Price</th>
              <th className="text-right py-3 px-4 font-semibold w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="flex justify-between py-2 px-4 text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxRate && (
              <div className="flex justify-between py-2 px-4 text-sm">
                <span className="text-slate-600">VAT ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 bg-blue-600 text-white font-bold rounded">
              <span>Total Due</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(invoice.notes || business.paymentTerms || business.bankDetails) && (
          <div className="border-t border-slate-200 pt-6 text-sm text-slate-600">
            {business.paymentTerms && <p className="mb-2 font-medium">{business.paymentTerms}</p>}
            {business.bankDetails && <p className="mb-2 whitespace-pre-line">{business.bankDetails}</p>}
            {invoice.notes && <p className="italic">{invoice.notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
