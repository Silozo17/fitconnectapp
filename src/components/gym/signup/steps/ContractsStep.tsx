import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";
import { SignatureCapture } from "./SignatureCapture";
import DOMPurify from "dompurify";
import { format } from "date-fns";

interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  is_required: boolean;
}

interface ContractsStepProps {
  contracts: ContractTemplate[];
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
}

// Standard UK Direct Debit Guarantee text
const DIRECT_DEBIT_GUARANTEE = `
<h3>The Direct Debit Guarantee</h3>
<ul>
  <li>This Guarantee is offered by all banks and building societies that accept instructions to pay Direct Debits.</li>
  <li>If there are any changes to the amount, date or frequency of your Direct Debit, the organisation will notify you 10 working days in advance of your account being debited or as otherwise agreed. If you request the organisation to collect a payment, confirmation of the amount and date will be given to you at the time of the request.</li>
  <li>If an error is made in the payment of your Direct Debit by the organisation or your bank or building society, you are entitled to a full and immediate refund of the amount paid from your bank or building society.</li>
  <li>If you receive a refund you are not entitled to, you must pay it back when the organisation asks you to.</li>
  <li>You can cancel a Direct Debit at any time by simply contacting your bank or building society. Written confirmation may be required. Please also notify the organisation.</li>
</ul>
`;

export function ContractsStep({ contracts, isLoading, onNext, onBack }: ContractsStepProps) {
  const { formData, updateFormData } = useSignupWizard();
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrolledToBottom, setScrolledToBottom] = useState<Record<string, boolean>>(
    formData.agreementScrolledToBottom || {}
  );

  // Get all contracts - membership first, then DD guarantee, then others
  const membershipContract = contracts.find(c => c.type === 'membership');
  const directDebitContract = contracts.find(c => c.type === 'direct_debit');
  const otherContracts = contracts.filter(c => c.type !== 'membership' && c.type !== 'direct_debit');

  // Track if all required agreements are signed
  const allRequiredSigned = contracts
    .filter(c => c.is_required)
    .every(c => formData.signedContractIds.includes(c.id));

  // Check if DD guarantee is agreed (virtual agreement, not in DB)
  const [ddGuaranteeAgreed, setDdGuaranteeAgreed] = useState(false);
  const [ddGuaranteeScrolled, setDdGuaranteeScrolled] = useState(false);

  // Check if signature is complete
  const signatureComplete = formData.signatureName.trim().length > 0 && 
    (formData.signatureType === 'typed' ? formData.signatureData.trim().length > 0 : formData.signatureData.length > 0);

  // Check if can continue
  const canContinue = allRequiredSigned && ddGuaranteeAgreed && signatureComplete;

  const handleScroll = useCallback((contractId: string, element: HTMLDivElement | null) => {
    if (!element) return;
    
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    if (isAtBottom && !scrolledToBottom[contractId]) {
      setScrolledToBottom(prev => {
        const updated = { ...prev, [contractId]: true };
        updateFormData({ agreementScrolledToBottom: updated });
        return updated;
      });
    }
  }, [scrolledToBottom, updateFormData]);

  const handleDdGuaranteeScroll = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isAtBottom && !ddGuaranteeScrolled) {
      setDdGuaranteeScrolled(true);
    }
  }, [ddGuaranteeScrolled]);

  const toggleContract = (contractId: string) => {
    const isCurrentlySigned = formData.signedContractIds.includes(contractId);
    if (isCurrentlySigned) {
      updateFormData({
        signedContractIds: formData.signedContractIds.filter((id) => id !== contractId),
      });
    } else {
      updateFormData({
        signedContractIds: [...formData.signedContractIds, contractId],
      });
    }
  };

  const handleSignatureChange = (data: string, type: 'drawn' | 'typed') => {
    updateFormData({
      signatureData: data,
      signatureType: type,
    });
  };

  const handleSignatureNameChange = (name: string) => {
    updateFormData({
      signatureName: name,
      signatureDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  // Initialize signature date
  useEffect(() => {
    if (!formData.signatureDate) {
      updateFormData({ signatureDate: format(new Date(), 'yyyy-MM-dd') });
    }
  }, [formData.signatureDate, updateFormData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Agreements</h2>
          <p className="text-muted-foreground">No contracts require your signature</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">
              You're all set! Click continue to proceed to payment.
            </p>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext}>Continue to Payment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Agreements & Contracts</h2>
        <p className="text-muted-foreground">
          Please read and accept the following agreements to continue
        </p>
      </div>

      {/* Membership Agreement */}
      {membershipContract && (
        <AgreementSection
          id={membershipContract.id}
          title="Membership Agreement"
          content={membershipContract.content}
          isRequired={membershipContract.is_required}
          isAgreed={formData.signedContractIds.includes(membershipContract.id)}
          isScrolled={scrolledToBottom[membershipContract.id] || false}
          onScroll={(el) => handleScroll(membershipContract.id, el)}
          onAgree={() => toggleContract(membershipContract.id)}
          scrollRef={(el) => { scrollRefs.current[membershipContract.id] = el; }}
        />
      )}

      {/* Direct Debit Guarantee */}
      {directDebitContract && (
        <AgreementSection
          id={directDebitContract.id}
          title="Direct Debit Mandate"
          content={directDebitContract.content}
          isRequired={directDebitContract.is_required}
          isAgreed={formData.signedContractIds.includes(directDebitContract.id)}
          isScrolled={scrolledToBottom[directDebitContract.id] || false}
          onScroll={(el) => handleScroll(directDebitContract.id, el)}
          onAgree={() => toggleContract(directDebitContract.id)}
          scrollRef={(el) => { scrollRefs.current[directDebitContract.id] = el; }}
        />
      )}

      {/* Standard DD Guarantee */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Direct Debit Guarantee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea 
            className="h-48 rounded-lg border bg-white p-4"
            onScrollCapture={(e) => handleDdGuaranteeScroll(e.currentTarget as HTMLDivElement)}
          >
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(DIRECT_DEBIT_GUARANTEE) }}
            />
          </ScrollArea>
          
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="dd-guarantee"
              checked={ddGuaranteeAgreed}
              onCheckedChange={() => setDdGuaranteeAgreed(!ddGuaranteeAgreed)}
              disabled={!ddGuaranteeScrolled}
              className="mt-0.5"
            />
            <Label 
              htmlFor="dd-guarantee" 
              className={`text-sm cursor-pointer ${!ddGuaranteeScrolled ? 'text-muted-foreground' : ''}`}
            >
              I understand and accept the Direct Debit Guarantee
              {!ddGuaranteeScrolled && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Please scroll to the bottom to enable this checkbox
                </span>
              )}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Other Contracts */}
      {otherContracts.map((contract) => (
        <AgreementSection
          key={contract.id}
          id={contract.id}
          title={contract.name}
          content={contract.content}
          isRequired={contract.is_required}
          isAgreed={formData.signedContractIds.includes(contract.id)}
          isScrolled={scrolledToBottom[contract.id] || false}
          onScroll={(el) => handleScroll(contract.id, el)}
          onAgree={() => toggleContract(contract.id)}
          scrollRef={(el) => { scrollRefs.current[contract.id] = el; }}
        />
      ))}

      {/* Signature Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Signature
        </h3>
        <p className="text-sm text-muted-foreground">
          Please sign below to confirm you agree to all the above terms and conditions
        </p>
        <SignatureCapture
          name={formData.signatureName}
          date={formData.signatureDate}
          signatureData={formData.signatureData}
          signatureType={formData.signatureType}
          onNameChange={handleSignatureNameChange}
          onSignatureChange={handleSignatureChange}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}

interface AgreementSectionProps {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  isAgreed: boolean;
  isScrolled: boolean;
  onScroll: (element: HTMLDivElement | null) => void;
  onAgree: () => void;
  scrollRef: (element: HTMLDivElement | null) => void;
}

function AgreementSection({
  id,
  title,
  content,
  isRequired,
  isAgreed,
  isScrolled,
  onScroll,
  onAgree,
  scrollRef,
}: AgreementSectionProps) {
  const handleScrollEvent = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget);
  };

  return (
    <Card className={isAgreed ? "border-green-500/50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </span>
          {isRequired && (
            <span className="text-xs text-red-500 font-normal">Required</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea 
          className="h-64 rounded-lg border bg-white p-4"
          onScrollCapture={handleScrollEvent}
        >
          <div
            ref={scrollRef}
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        </ScrollArea>
        
        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id={id}
            checked={isAgreed}
            onCheckedChange={onAgree}
            disabled={!isScrolled}
            className="mt-0.5"
          />
          <Label 
            htmlFor={id} 
            className={`text-sm cursor-pointer ${!isScrolled ? 'text-muted-foreground' : ''}`}
          >
            I have read and agree to the {title.toLowerCase()}
            {!isScrolled && (
              <span className="block text-xs text-muted-foreground mt-1">
                Please scroll to the bottom to enable this checkbox
              </span>
            )}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
