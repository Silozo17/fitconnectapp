import { createContext, useContext, useState, ReactNode } from "react";

export interface SignupFormData {
  // Step 1: Location
  locationId: string | null;
  
  // Step 2: Plan
  planId: string | null;
  
  // Member's chosen location for single-location plans (stored to gym_memberships.location_id)
  memberLocationId: string | null;
  
  // Step 3: Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  
  // Medical
  hasMedicalConditions: boolean;
  medicalConditions: string;
  hasInjuries: boolean;
  injuries: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Step 4: Email Verification (for existing users)
  emailVerified: boolean;
  requiresOtpVerification: boolean;
  
  // Step 5: Marketing
  referredByEmail: string;
  marketingSource: string;
  marketingSourceOther: string;
  
  // Step 6: Contracts
  signedContractIds: string[];
}

interface SignupWizardContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  resetForm: () => void;
  totalSteps: number;
}

const initialFormData: SignupFormData = {
  locationId: null,
  planId: null,
  memberLocationId: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  hasMedicalConditions: false,
  medicalConditions: "",
  hasInjuries: false,
  injuries: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  emailVerified: false,
  requiresOtpVerification: false,
  referredByEmail: "",
  marketingSource: "",
  marketingSourceOther: "",
  signedContractIds: [],
};

const SignupWizardContext = createContext<SignupWizardContextType | undefined>(undefined);

export function SignupWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const totalSteps = 7; // Added email verification step

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return (
    <SignupWizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        resetForm,
        totalSteps,
      }}
    >
      {children}
    </SignupWizardContext.Provider>
  );
}

export function useSignupWizard() {
  const context = useContext(SignupWizardContext);
  if (!context) {
    throw new Error("useSignupWizard must be used within SignupWizardProvider");
  }
  return context;
}
