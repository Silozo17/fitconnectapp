import { useState } from 'react';
import despia from 'despia-native';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Debug() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const readSteps = async () => {
    setLoading(true);
    setResponse('Reading...');
    
    // Direct Despia call - exactly per docs
    const result = await despia(
      'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=7',
      ['healthkitResponse']
    );
    
    setResponse(JSON.stringify(result, null, 2));
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4 min-h-screen bg-background">
      <h1 className="text-xl font-bold text-foreground">HealthKit Debug</h1>
      
      <Button onClick={readSteps} disabled={loading}>
        {loading ? 'Reading...' : 'Read Steps (7 days)'}
      </Button>
      
      <Textarea 
        value={response} 
        readOnly 
        className="h-96 font-mono text-sm"
        placeholder="Response will appear here..."
      />
    </div>
  );
}
