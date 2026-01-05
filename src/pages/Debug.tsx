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
    
    const result = await despia(
      'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=7',
      ['healthkitResponse']
    );
    
    setResponse(JSON.stringify(result, null, 2));
    setLoading(false);
  };

  const testParsing = async () => {
    setLoading(true);
    const logs: string[] = [];
    
    logs.push('1. Calling Despia SDK...');
    
    const response = await despia(
      'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=7',
      ['healthkitResponse']
    );
    
    logs.push(`2. Raw response type: ${typeof response}`);
    logs.push(`3. Raw response: ${JSON.stringify(response, null, 2)}`);
    
    const data = (response as Record<string, unknown>)?.healthkitResponse;
    logs.push(`4. data = response.healthkitResponse: ${typeof data}`);
    logs.push(`5. data value: ${JSON.stringify(data, null, 2)}`);
    
    if (!data) {
      logs.push('❌ FAIL: data is falsy');
    } else if (typeof data !== 'object') {
      logs.push(`❌ FAIL: data is not object, it's ${typeof data}`);
    } else if (Array.isArray(data)) {
      logs.push('❌ FAIL: data is an array, not an object');
      logs.push(`   Array length: ${data.length}`);
      if (data.length > 0) {
        logs.push(`   First item: ${JSON.stringify(data[0])}`);
      }
    } else {
      logs.push('✅ data is a valid object');
      const keys = Object.keys(data);
      logs.push(`6. Keys in data: ${JSON.stringify(keys)}`);
      
      for (const key of keys) {
        const readings = (data as Record<string, unknown>)[key];
        logs.push(`7. ${key}: ${Array.isArray(readings) ? `array of ${readings.length}` : typeof readings}`);
        
        if (Array.isArray(readings) && readings.length > 0) {
          logs.push(`   First reading: ${JSON.stringify(readings[0])}`);
        }
      }
    }
    
    setResponse(logs.join('\n'));
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4 min-h-screen bg-background">
      <h1 className="text-xl font-bold text-foreground">HealthKit Debug</h1>
      
      <div className="flex gap-2">
        <Button onClick={readSteps} disabled={loading}>
          Read Raw
        </Button>
        <Button onClick={testParsing} disabled={loading} variant="secondary">
          Test Parsing
        </Button>
      </div>
      
      <Textarea 
        value={response} 
        readOnly 
        className="h-96 font-mono text-xs"
        placeholder="Response will appear here..."
      />
    </div>
  );
}
