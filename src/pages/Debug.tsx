import { useState } from 'react';
import { getDespiaRuntime } from '@/lib/despia';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Debug() {
  const [copied, setCopied] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const readSteps = async () => {
    setLoading(true);
    setResponse('Reading...');

    const runtime = getDespiaRuntime();
    if (!runtime) {
      setResponse('Native HealthKit debug is only available in the native app runtime.');
      setLoading(false);
      toast({ title: 'Not available on web preview' });
      return;
    }

    const result = await runtime(
      'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=7',
      ['healthkitResponse']
    );

    setResponse(JSON.stringify(result, null, 2));
    setLoading(false);
  };

  const testParsing = async () => {
    setLoading(true);
    const logs: string[] = [];

    const runtime = getDespiaRuntime();
    if (!runtime) {
      setResponse('Native HealthKit debug is only available in the native app runtime.');
      setLoading(false);
      toast({ title: 'Not available on web preview' });
      return;
    }

    logs.push('1. Calling Despia SDK...');

    const res = await runtime(
      'healthkit://read?types=HKQuantityTypeIdentifierStepCount&days=7',
      ['healthkitResponse']
    );

    logs.push(`2. Raw response type: ${typeof res}`);
    logs.push(`3. Raw response: ${JSON.stringify(res, null, 2)}`);
    
    const data = (res as Record<string, unknown>)?.healthkitResponse;
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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
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
        <Button onClick={copyToClipboard} disabled={!response} variant="outline" size="icon">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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