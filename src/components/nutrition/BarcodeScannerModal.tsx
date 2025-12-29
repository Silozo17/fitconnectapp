import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Keyboard, AlertCircle } from "lucide-react";
import { useOpenFoodFactsBarcode } from "@/hooks/useOpenFoodFacts";
import { useUserLocalePreference } from "@/hooks/useUserLocalePreference";
import { toast } from "sonner";
import { enableScanningMode, disableScanningMode, isDespia } from "@/lib/despia";

interface BarcodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodFound: (food: {
    external_id: string;
    name: string;
    calories_per_100g: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    serving_size_g: number;
    serving_description: string;
    image_url?: string | null;
    allergens?: string[];
    dietary_preferences?: string[];
    barcode: string;
  }) => void;
}

export const BarcodeScannerModal = ({
  open,
  onOpenChange,
  onFoodFound,
}: BarcodeScannerModalProps) => {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { countryPreference } = useUserLocalePreference();
  const barcodeMutation = useOpenFoodFactsBarcode();
  const isLoading = barcodeMutation.isPending;

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    
    // Disable Despia scanning mode
    if (isDespia()) {
      disableScanningMode();
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    
    // Enable Despia scanning mode for optimal brightness
    if (isDespia()) {
      enableScanningMode();
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        
        // Start barcode detection using BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          startBarcodeDetection();
        } else {
          setCameraError("Barcode detection not supported in this browser. Please enter barcode manually.");
          setMode("manual");
        }
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Could not access camera. Please check permissions or enter barcode manually.");
      setMode("manual");
    }
  }, []);

  const startBarcodeDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      // @ts-ignore - BarcodeDetector is experimental
      const barcodeDetector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
      });
      
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;
        
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            handleBarcodeDetected(barcode);
          }
        } catch (e) {
          // Detection failed, continue scanning
        }
      }, 200);
    } catch (error) {
      console.error("BarcodeDetector error:", error);
      setCameraError("Barcode detection failed. Please enter barcode manually.");
      setMode("manual");
    }
  }, []);

  const handleBarcodeDetected = async (barcode: string) => {
    stopCamera();
    await lookupBarcodeAndNotify(barcode);
  };

  const lookupBarcodeAndNotify = async (barcode: string) => {
    try {
      const result = await barcodeMutation.mutateAsync({ barcode, region: countryPreference });
      
      if (result.found && result.food) {
        onFoodFound({
          external_id: result.food.external_id,
          name: result.food.name,
          calories_per_100g: result.food.calories_per_100g,
          protein_g: result.food.protein_g,
          carbs_g: result.food.carbs_g,
          fat_g: result.food.fat_g,
          fiber_g: result.food.fiber_g || 0,
          serving_size_g: result.food.serving_size_g,
          serving_description: result.food.serving_description,
          image_url: result.food.image_url,
          allergens: result.food.allergens,
          dietary_preferences: result.food.dietary_preferences,
          barcode: barcode,
        });
        onOpenChange(false);
        toast.success(`Found: ${result.food.name}`);
      } else {
        toast.error("Product not found in database");
        if (mode === "camera") {
          startCamera();
        }
      }
    } catch (error) {
      console.error("Barcode lookup error:", error);
      toast.error("Failed to look up product");
      if (mode === "camera") {
        startCamera();
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      lookupBarcodeAndNotify(manualBarcode.trim());
    }
  };

  useEffect(() => {
    if (open && mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, mode, startCamera, stopCamera]);

  useEffect(() => {
    if (!open) {
      setManualBarcode("");
      setCameraError(null);
      setMode("camera");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === "camera" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("camera")}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("manual")}
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual
            </Button>
          </div>

          {mode === "camera" ? (
            <div className="relative">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">{cameraError}</p>
                </div>
              ) : (
                <>
                  <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-24 border-2 border-primary rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                        
                        {isScanning && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-primary/50 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Position the barcode within the frame
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode Number</Label>
                <Input
                  id="barcode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter barcode (e.g., 5000159407236)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Enter the numbers below the barcode on the product packaging
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!manualBarcode.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  "Look Up Product"
                )}
              </Button>
            </form>
          )}

          {isLoading && mode === "camera" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Looking up product...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScannerModal;
