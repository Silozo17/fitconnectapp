import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";

interface Location {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postcode: string | null;
}

interface LocationStepProps {
  locations: Location[];
  isLoading: boolean;
  onNext: () => void;
}

export function LocationStep({ locations, isLoading, onNext }: LocationStepProps) {
  const { formData, updateFormData } = useSignupWizard();

  const handleSelectLocation = (locationId: string) => {
    // For single-location plans, this becomes the member's permanent location
    // For all-location plans, this is just for filtering/context
    updateFormData({ 
      locationId, 
      planId: null,
      memberLocationId: locationId, // Store as member's chosen location
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No locations available.</p>
        </CardContent>
      </Card>
    );
  }

  // If only one location, auto-select it
  if (locations.length === 1 && !formData.locationId) {
    updateFormData({ 
      locationId: locations[0].id,
      memberLocationId: locations[0].id,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Location</h2>
        <p className="text-muted-foreground">Select the gym location you'd like to join</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {locations.map((location) => (
          <Card
            key={location.id}
            className={`cursor-pointer transition-all ${
              formData.locationId === location.id
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => handleSelectLocation(location.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{location.name}</CardTitle>
                {formData.locationId === location.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  {location.address && <div>{location.address}</div>}
                  {(location.city || location.postcode) && (
                    <div>
                      {location.city}
                      {location.city && location.postcode && ", "}
                      {location.postcode}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!formData.locationId}>
          Continue
        </Button>
      </div>
    </div>
  );
}
