/**
 * DisciplineSetup - Choose your discipline onboarding flow
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Swords,
  Users,
  PersonStanding,
  Waves,
  Bike,
  Medal,
  Dumbbell,
  Flame,
  Mountain,
  MessageSquarePlus,
} from "lucide-react";
import { DISCIPLINE_LIST, DISCIPLINE_CATEGORIES, getDisciplineConfig } from "@/config/disciplines/catalog";
import { DisciplineConfig } from "@/config/disciplines/types";
import { useClientDisciplines } from "@/hooks/useClientDisciplines";
import { DisciplineWidget } from "@/components/discipline/DisciplineWidget";
import { RequestDisciplineModal } from "@/components/discipline/RequestDisciplineModal";

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords,
  Users,
  PersonStanding,
  Waves,
  Bike,
  Medal,
  Dumbbell,
  Flame,
  Mountain,
};

type Step = 'select' | 'preview';

export default function DisciplineSetup() {
  const navigate = useNavigate();
  const { addDiscipline, isUpdating, isReady, isLoading, clientProfileId } = useClientDisciplines();
  const [step, setStep] = useState<Step>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Debug logging
  console.log('[DisciplineSetup] isReady:', isReady, 'isLoading:', isLoading, 'clientProfileId:', clientProfileId);

  const selectedConfig = selectedId ? getDisciplineConfig(selectedId) : null;

  function handleSelect(id: string) {
    setSelectedId(id);
  }

  function handleContinue() {
    if (selectedId) {
      setStep('preview');
    }
  }

  function handleConfirm() {
    if (selectedId) {
      addDiscipline(
        { disciplineId: selectedId, isPrimary: true },
        {
          onSuccess: () => {
            navigate('/dashboard/client');
          },
        }
      );
    }
  }

  function handleBack() {
    if (step === 'preview') {
      setStep('select');
    } else {
      navigate('/dashboard/client');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 pt-safe-status">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {step === 'select' ? 'Choose Your Discipline' : 'Preview Your Widget'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'select' 
                ? 'Select the sport or training style you want to track'
                : 'This is how your widget will appear on your dashboard'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {step === 'select' ? (
          <>
            {/* Combat Sports */}
            <CategorySection 
              title="Combat Sports"
              disciplines={DISCIPLINE_CATEGORIES.combat.map(id => getDisciplineConfig(id)!).filter(Boolean)}
              selectedId={selectedId}
              onSelect={handleSelect}
            />

            {/* Endurance Sports */}
            <CategorySection 
              title="Endurance Sports"
              disciplines={DISCIPLINE_CATEGORIES.endurance.map(id => getDisciplineConfig(id)!).filter(Boolean)}
              selectedId={selectedId}
              onSelect={handleSelect}
            />

            {/* Strength Sports */}
            <CategorySection 
              title="Strength Sports"
              disciplines={DISCIPLINE_CATEGORIES.strength.map(id => getDisciplineConfig(id)!).filter(Boolean)}
              selectedId={selectedId}
              onSelect={handleSelect}
            />

            {/* Request More */}
            <div className="mt-8 p-4 rounded-xl border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Don't see your discipline?
              </p>
              <Button 
                variant="outline" 
                onClick={() => setRequestModalOpen(true)}
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Request a Discipline
              </Button>
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-sm border-t border-border">
              <div className="container max-w-4xl mx-auto">
                <Button 
                  className="w-full"
                  size="lg"
                  disabled={!selectedId}
                  onClick={handleContinue}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Spacer for fixed button */}
            <div className="h-24" />
          </>
        ) : (
          /* Preview Step */
          <div className="space-y-6">
            <div className="max-w-md mx-auto">
              {selectedId && <DisciplineWidget disciplineId={selectedId} />}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Your metrics will appear here once you start logging
            </p>

            <div className="flex gap-3 max-w-md mx-auto">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setStep('select')}
              >
                Change
              </Button>
              <Button 
                className="flex-1"
                onClick={handleConfirm}
                disabled={isUpdating || !isReady}
              >
                {isUpdating ? 'Saving...' : 'Confirm'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <RequestDisciplineModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
      />
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  disciplines: DisciplineConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function CategorySection({ title, disciplines, selectedId, onSelect }: CategorySectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {disciplines.map((config) => {
          const IconComponent = iconMap[config.icon] || Dumbbell;
          const isSelected = selectedId === config.id;

          return (
            <button
              key={config.id}
              onClick={() => onSelect(config.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected 
                  ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background" 
                  : "border-border bg-card"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                "bg-gradient-to-br",
                config.theme.gradient
              )}>
                <IconComponent className={cn("w-5 h-5", config.theme.accent)} />
              </div>
              <p className="font-medium text-sm">{config.name}</p>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
