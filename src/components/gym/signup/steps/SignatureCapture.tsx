import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Eraser, PenTool, Type } from "lucide-react";
import { format } from "date-fns";

interface SignatureCaptureProps {
  name: string;
  date: string;
  signatureData: string;
  signatureType: 'drawn' | 'typed';
  onNameChange: (name: string) => void;
  onSignatureChange: (data: string, type: 'drawn' | 'typed') => void;
}

export function SignatureCapture({
  name,
  date,
  signatureData,
  signatureType,
  onNameChange,
  onSignatureChange,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedSignature, setTypedSignature] = useState(signatureType === 'typed' ? signatureData : '');
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>(signatureType === 'drawn' ? 'draw' : 'type');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set drawing styles
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore existing signature if any
    if (signatureType === 'drawn' && signatureData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = signatureData;
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl, 'drawn');
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSignatureChange('', 'drawn');
  };

  const handleTypedSignatureChange = (value: string) => {
    setTypedSignature(value);
    onSignatureChange(value, 'typed');
  };

  const handleTabChange = (value: string) => {
    const newTab = value as 'draw' | 'type';
    setActiveTab(newTab);
    
    if (newTab === 'type') {
      onSignatureChange(typedSignature, 'typed');
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        onSignatureChange(dataUrl, 'drawn');
      }
    }
  };

  const formattedDate = date || format(new Date(), 'dd/MM/yyyy');

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signatureName">Full Name</Label>
            <Input
              id="signatureName"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your full legal name"
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={formattedDate} disabled className="bg-muted" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Signature</Label>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Type
              </TabsTrigger>
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Draw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="mt-4">
              <div className="relative">
                <Input
                  value={typedSignature}
                  onChange={(e) => handleTypedSignatureChange(e.target.value)}
                  placeholder="Type your signature"
                  className="h-20 text-2xl italic"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                />
                {typedSignature && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none text-3xl italic text-foreground"
                    style={{ fontFamily: "'Brush Script MT', cursive" }}
                  >
                    {typedSignature}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="draw" className="mt-4">
              <div className="space-y-2">
                <div className="relative border rounded-lg bg-white overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-32 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="absolute bottom-2 left-0 right-0 border-b border-dashed border-muted-foreground/30 mx-4" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="flex items-center gap-2"
                >
                  <Eraser className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
