import { useState, useEffect, useMemo } from "react";
import { Calculator, Loader2, Target, Lightbulb, User, AlertTriangle, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAIMacroCalculator, MacroCalculation } from "@/hooks/useAI";
import { useCoachClients, CoachClient } from "@/hooks/useCoachClients";
import { 
  mapClientProfileToFormData, 
  getClientDisplayName,
  NutritionContext,
  ClientProfileData,
  getConditionSeverity,
} from "@/lib/client-profile-mapping";
import { cn } from "@/lib/utils";

interface AIMacroCalculatorProps {
  onMacrosCalculated?: (macros: MacroCalculation, context?: NutritionContext) => void;
  showClientSelector?: boolean;
}

export const AIMacroCalculator = ({ 
  onMacrosCalculated,
  showClientSelector = true,
}: AIMacroCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const { calculateMacros, isLoading } = useAIMacroCalculator();
  const { data: clients = [], isLoading: isLoadingClients } = useCoachClients();
  const [result, setResult] = useState<MacroCalculation | null>(null);

  // Selected client state
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [nutritionContext, setNutritionContext] = useState<NutritionContext | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isPrefilledFromClient, setIsPrefilledFromClient] = useState(false);

  // Form state
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(175);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp'>('maintain');
  const [dietaryPreference, setDietaryPreference] = useState<'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan'>('balanced');

  // Client search filter
  const [clientSearch, setClientSearch] = useState("");

  // Get selected client object
  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clients.find(c => c.client_id === selectedClientId) || null;
  }, [selectedClientId, clients]);

  // Filter clients for search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const search = clientSearch.toLowerCase();
    return clients.filter(client => {
      const name = getClientDisplayName(client.client_profile || { first_name: null, last_name: null });
      return name.toLowerCase().includes(search);
    });
  }, [clients, clientSearch]);

  // Handle client selection
  const handleClientSelect = (clientId: string | null) => {
    if (!clientId) {
      // Reset to manual mode
      resetToManualMode();
      return;
    }

    const client = clients.find(c => c.client_id === clientId);
    if (!client?.client_profile) {
      resetToManualMode();
      return;
    }

    const profile = client.client_profile as ClientProfileData;
    const { formData, context, validation } = mapClientProfileToFormData(profile);

    // Update form with client data
    setAge(formData.age);
    setGender(formData.gender);
    setWeightKg(formData.weightKg);
    setHeightCm(formData.heightCm);
    setDietaryPreference(formData.dietaryPreference);
    setGoal(formData.goal);

    // Store context and validation
    setSelectedClientId(clientId);
    setNutritionContext(context);
    setValidationWarnings(validation.warnings);
    setIsPrefilledFromClient(true);
    setClientSelectorOpen(false);
  };

  const resetToManualMode = () => {
    setSelectedClientId(null);
    setNutritionContext(null);
    setValidationWarnings([]);
    setIsPrefilledFromClient(false);
    // Reset to default values
    setAge(30);
    setGender('male');
    setWeightKg(75);
    setHeightCm(175);
    setActivityLevel('moderate');
    setGoal('maintain');
    setDietaryPreference('balanced');
  };

  // Check if required fields are present for calculation
  const canCalculate = useMemo(() => {
    return age > 0 && weightKg > 0 && heightCm > 0;
  }, [age, weightKg, heightCm]);

  const handleCalculate = async () => {
    const calculation = await calculateMacros({
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      dietaryPreference,
    });

    if (calculation) {
      // Attach nutrition context to calculation
      if (nutritionContext) {
        calculation.nutritionContext = {
          clientId: nutritionContext.clientId,
          clientName: nutritionContext.clientName,
          allergies: nutritionContext.allergies,
          dietaryRestrictions: nutritionContext.dietaryRestrictions,
          medicalConditions: nutritionContext.medicalConditions,
          inferredDietType: nutritionContext.inferredDietType,
        };
      }
      setResult(calculation);
    }
  };

  const handleUseMacros = () => {
    if (result && onMacrosCalculated) {
      onMacrosCalculated(result, nutritionContext || undefined);
      setOpen(false);
    }
  };

  // Reset result when dialog closes
  useEffect(() => {
    if (!open) {
      setResult(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          AI Macro Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            AI Macro Calculator
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!result ? (
            <div className="space-y-4">
              {/* Client Selector (Coach View Only) */}
              {showClientSelector && clients.length > 0 && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Select Client (Optional)
                    </Label>
                    <Popover open={clientSelectorOpen} onOpenChange={setClientSelectorOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={clientSelectorOpen}
                          className="w-full justify-between"
                        >
                          {selectedClient ? (
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              {getClientDisplayName(selectedClient.client_profile || { first_name: null, last_name: null })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Manual entry (no client selected)</span>
                          )}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Search clients..." 
                            value={clientSearch}
                            onValueChange={setClientSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No clients found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="manual"
                                onSelect={() => handleClientSelect(null)}
                                className="cursor-pointer"
                              >
                                <span className="text-muted-foreground">Manual entry (no client)</span>
                              </CommandItem>
                              {filteredClients.map((client) => (
                                <CommandItem
                                  key={client.client_id}
                                  value={client.client_id}
                                  onSelect={() => handleClientSelect(client.client_id)}
                                  className="cursor-pointer"
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  {getClientDisplayName(client.client_profile || { first_name: null, last_name: null })}
                                  {client.client_profile?.weight_kg && client.client_profile?.height_cm && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      {client.client_profile.weight_kg}kg, {client.client_profile.height_cm}cm
                                    </span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {isLoadingClients && (
                      <p className="text-xs text-muted-foreground">Loading clients...</p>
                    )}
                  </div>

                  {/* Prefilled Indicator */}
                  {isPrefilledFromClient && (
                    <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary">
                        Pre-filled from {nutritionContext?.clientName}'s profile
                      </span>
                    </div>
                  )}

                  {/* Validation Warnings */}
                  {validationWarnings.length > 0 && (
                    <div className="space-y-1">
                      {validationWarnings.map((warning, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/20 rounded-md">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span className="text-sm text-warning">{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Client Constraints Display */}
                  {nutritionContext && (
                    <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
                      <h4 className="text-sm font-medium text-foreground">Client Constraints</h4>
                      
                      {/* Allergies */}
                      {nutritionContext.allergies.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Allergies</Label>
                          <div className="flex flex-wrap gap-1">
                            {nutritionContext.allergies.map((allergy, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dietary Restrictions */}
                      {nutritionContext.dietaryRestrictions.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Dietary Restrictions</Label>
                          <div className="flex flex-wrap gap-1">
                            {nutritionContext.dietaryRestrictions.map((restriction, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medical Conditions */}
                      {nutritionContext.medicalConditions.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Medical Conditions</Label>
                          <div className="flex flex-wrap gap-1">
                            {nutritionContext.medicalConditions.map((condition, idx) => {
                              const severity = getConditionSeverity(condition);
                              return (
                                <Badge 
                                  key={idx} 
                                  variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'warning' : 'outline'}
                                  className="text-xs"
                                >
                                  {condition}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Empty state */}
                      {nutritionContext.allergies.length === 0 && 
                       nutritionContext.dietaryRestrictions.length === 0 && 
                       nutritionContext.medicalConditions.length === 0 && (
                        <p className="text-xs text-muted-foreground">No constraints on file</p>
                      )}
                    </div>
                  )}

                  <Separator />
                </>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Age
                    {isPrefilledFromClient && <Badge variant="outline" className="text-[10px] px-1">From profile</Badge>}
                  </Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className={cn(!age && "border-destructive")}
                  />
                  {!age && <p className="text-xs text-destructive">Required for calculation</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Gender
                    {isPrefilledFromClient && <Badge variant="outline" className="text-[10px] px-1">From profile</Badge>}
                  </Label>
                  <Select value={gender} onValueChange={(v: 'male' | 'female') => setGender(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Weight (kg)
                    {isPrefilledFromClient && <Badge variant="outline" className="text-[10px] px-1">From profile</Badge>}
                  </Label>
                  <Input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className={cn(!weightKg && "border-destructive")}
                  />
                  {!weightKg && <p className="text-xs text-destructive">Required for calculation</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Height (cm)
                    {isPrefilledFromClient && <Badge variant="outline" className="text-[10px] px-1">From profile</Badge>}
                  </Label>
                  <Input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    className={cn(!heightCm && "border-destructive")}
                  />
                  {!heightCm && <p className="text-xs text-destructive">Required for calculation</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={activityLevel} onValueChange={(v: typeof activityLevel) => setActivityLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (office job, no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (athlete/physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Goal
                  {isPrefilledFromClient && nutritionContext?.inferredGoal && (
                    <Badge variant="outline" className="text-[10px] px-1">From profile</Badge>
                  )}
                </Label>
                <Select value={goal} onValueChange={(v: typeof goal) => setGoal(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="build_muscle">Build Muscle</SelectItem>
                    <SelectItem value="body_recomp">Body Recomposition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Dietary Preference
                  {isPrefilledFromClient && nutritionContext?.inferredDietType !== 'balanced' && (
                    <Badge variant="outline" className="text-[10px] px-1">From profile</Badge>
                  )}
                </Label>
                <Select value={dietaryPreference} onValueChange={(v: typeof dietaryPreference) => setDietaryPreference(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="high_protein">High Protein</SelectItem>
                    <SelectItem value="low_carb">Low Carb</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isLoading || !canCalculate}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Macros
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client Context Badge */}
              {nutritionContext && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">
                    Calculated for {nutritionContext.clientName}
                  </span>
                </div>
              )}

              {/* TDEE & Target */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">BMR</p>
                  <p className="text-xl font-bold text-foreground">{Math.round(result.bmr)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">TDEE</p>
                  <p className="text-xl font-bold text-foreground">{Math.round(result.tdee)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day</p>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-xl font-bold text-primary">{Math.round(result.targetCalories)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day</p>
                </div>
              </div>

              {/* Macro Targets */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Daily Macro Targets</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span className="font-semibold text-red-500">{Math.round(result.macros.protein)}g</span>
                    </div>
                    <Progress value={result.percentages?.protein || 30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbohydrates</span>
                      <span className="font-semibold text-yellow-500">{Math.round(result.macros.carbs)}g</span>
                    </div>
                    <Progress value={result.percentages?.carbs || 40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span className="font-semibold text-blue-500">{Math.round(result.macros.fat)}g</span>
                    </div>
                    <Progress value={result.percentages?.fat || 30} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold mb-2">Why These Targets?</h4>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Tips</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Recalculate
                </Button>
                <Button onClick={handleUseMacros} className="flex-1">
                  Use These Macros
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
