import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useClientProfileData, calculateBMI } from '@/hooks/useClientProfileData';
import { BMICircle } from '@/components/stats/BMICircle';

export function BMIWidget() {
  const { data: profile, isLoading } = useClientProfileData();
  
  if (isLoading) {
    return (
      <Card variant="elevated" className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm);
  const hasMissingData = !profile?.weight_kg || !profile?.height_cm;
  
  return (
    <Card variant="floating" className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground font-display">Body Mass Index</h3>
          {hasMissingData && (
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
              <Link to="/dashboard/client/settings/profile">
                <Settings className="h-4 w-4 mr-1" />
                Set up
              </Link>
            </Button>
          )}
        </div>
        
        {hasMissingData ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <BMICircle bmi={null} size="lg" />
            <p className="text-sm text-muted-foreground mt-4">
              {!profile?.height_cm && !profile?.weight_kg 
                ? 'Add your height and weight to see BMI'
                : !profile?.height_cm 
                  ? 'Add your height to calculate BMI'
                  : 'Log your weight to calculate BMI'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <BMICircle bmi={bmi} size="lg" showCategory />
          </div>
        )}
      </CardContent>
    </Card>
  );
}