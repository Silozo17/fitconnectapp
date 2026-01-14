import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, FileText, CheckCircle, Eye } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";
import DOMPurify from "dompurify";

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

export function ContractsStep({ contracts, isLoading, onNext, onBack }: ContractsStepProps) {
  const { formData, updateFormData } = useSignupWizard();
  const [viewingContract, setViewingContract] = useState<ContractTemplate | null>(null);

  const requiredContracts = contracts.filter((c) => c.is_required);
  const optionalContracts = contracts.filter((c) => !c.is_required);

  const allRequiredSigned = requiredContracts.every((c) =>
    formData.signedContractIds.includes(c.id)
  );

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

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case "membership":
        return "Membership Agreement";
      case "terms":
        return "Terms & Conditions";
      case "direct_debit":
        return "Direct Debit Agreement";
      case "waiver":
        return "Liability Waiver";
      case "health":
        return "Health Declaration";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
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

      {/* Required Contracts */}
      {requiredContracts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Required Agreements
          </h3>
          {requiredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              isSigned={formData.signedContractIds.includes(contract.id)}
              onToggle={() => toggleContract(contract.id)}
              onView={() => setViewingContract(contract)}
              getTypeLabel={getContractTypeLabel}
            />
          ))}
        </div>
      )}

      {/* Optional Contracts */}
      {optionalContracts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Optional Agreements
          </h3>
          {optionalContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              isSigned={formData.signedContractIds.includes(contract.id)}
              onToggle={() => toggleContract(contract.id)}
              onView={() => setViewingContract(contract)}
              getTypeLabel={getContractTypeLabel}
            />
          ))}
        </div>
      )}

      {/* Contract Viewer Dialog */}
      <Dialog open={!!viewingContract} onOpenChange={() => setViewingContract(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewingContract?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(viewingContract?.content || ""),
              }}
            />
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setViewingContract(null)}>
              Close
            </Button>
            {viewingContract && !formData.signedContractIds.includes(viewingContract.id) && (
              <Button
                onClick={() => {
                  toggleContract(viewingContract.id);
                  setViewingContract(null);
                }}
              >
                I Agree
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!allRequiredSigned}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}

interface ContractCardProps {
  contract: ContractTemplate;
  isSigned: boolean;
  onToggle: () => void;
  onView: () => void;
  getTypeLabel: (type: string) => string;
}

function ContractCard({
  contract,
  isSigned,
  onToggle,
  onView,
  getTypeLabel,
}: ContractCardProps) {
  return (
    <Card
      className={`transition-colors ${
        isSigned ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id={contract.id}
              checked={isSigned}
              onCheckedChange={onToggle}
              className="mt-1"
            />
            <div>
              <CardTitle className="text-base">{contract.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <FileText className="h-3 w-3" />
                {getTypeLabel(contract.type)}
                {contract.is_required && (
                  <span className="text-red-500 text-xs">• Required</span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Label
          htmlFor={contract.id}
          className="text-sm text-muted-foreground cursor-pointer"
        >
          I have read and agree to the {contract.name.toLowerCase()}
        </Label>
      </CardContent>
    </Card>
  );
}
