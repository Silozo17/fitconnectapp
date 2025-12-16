import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIMealSuggestionProps {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  onSuggestionReceived?: (suggestion: string) => void;
}

export const AIMealSuggestion = ({
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  onSuggestionReceived,
}: AIMealSuggestionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [preferences, setPreferences] = useState('');

  const generateSuggestion = async () => {
    setIsLoading(true);
    setSuggestion('');
    
    try {
      const response = await supabase.functions.invoke('ai-meal-suggestion', {
        body: {
          targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
          preferences,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const suggestionText = response.data?.suggestion || 'No suggestion available';
      setSuggestion(suggestionText);
      onSuggestionReceived?.(suggestionText);
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('Failed to generate meal suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Meal Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Get AI-powered meal suggestions based on your macro targets:
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-primary font-medium">{targetCalories} cal</span>
            <span className="text-red-400">P: {targetProtein}g</span>
            <span className="text-yellow-400">C: {targetCarbs}g</span>
            <span className="text-blue-400">F: {targetFat}g</span>
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Any dietary preferences or restrictions? (e.g., vegetarian, no dairy, high fiber, quick meals...)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="bg-background border-border min-h-[80px]"
          />
        </div>

        <Button
          onClick={generateSuggestion}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Meal Plan
            </>
          )}
        </Button>

        {suggestion && (
          <div className="bg-background border border-border rounded-lg p-4 mt-4">
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-foreground">
                {suggestion}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
