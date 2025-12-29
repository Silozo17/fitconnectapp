import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Keyboard, AlertCircle } from "lucide-react";
import { useOpenFoodFactsBarcode } from "@/hooks/useOpenFoodFacts";
import { useUserLocalePreference } from "@/hooks/useUserLocalePreference";
import { toast } from "sonner";
import { enableScanningMode, disableScanningMode, isDespia } from "@/lib/despia";
import { Html5Qrcode } from "html5-qrcode";

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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "barcode-scanner-container";
  const isProcessingRef = useRef(false);

  const { countryPreference } = useUserLocalePreference();
  const barcodeMutation = useOpenFoodFactsBarcode();
  const isLoading = barcodeMutation.isPending;

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await scannerRef.current.stop();
        }
      } catch (e) {
        // Scanner might already be stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    isProcessingRef.current = false;
    
    if (isDespia()) {
      disableScanningMode();
    }
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    
    if (isDespia()) {
      enableScanningMode();
    }
    
    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const container = document.getElementById(scannerContainerId);
    if (!container) {
      setCameraError("Scanner container not found");
      return;
    }

    try {
      // Create new scanner instance
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError("No cameras found on this device");
        setMode("manual");
        return;
      }

      // Prefer back camera
      const backCamera = cameras.find(
        cam => cam.label.toLowerCase().includes('back') || 
               cam.label.toLowerCase().includes('rear') ||
               cam.label.toLowerCase().includes('environment')
      );
      const cameraId = backCamera?.id || cameras[cameras.length - 1].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            handleBarcodeDetected(decodedText);
          }
        },
        () => {
          // QR code scanning failure - ignore, keep scanning
        }
      );
      
      setIsScanning(true);
    } catch (error: any) {
      console.error("Scanner error:", error);
      
      let errorMessage = "Could not start camera scanner.";
      if (error?.message?.includes("Permission")) {
        errorMessage = "Camera permission denied. Please allow camera access or enter barcode manually.";
      } else if (error?.message?.includes("NotAllowed")) {
        errorMessage = "Camera access not allowed. Please check your browser settings.";
      } else if (error?.message?.includes("NotFound")) {
        errorMessage = "No camera found. Please enter barcode manually.";
      }
      
      setCameraError(errorMessage);
      setMode("manual");
    }
  }, []);

  const handleBarcodeDetected = async (barcode: string) => {
    await stopScanner();
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
        isProcessingRef.current = false;
        if (mode === "camera") {
          startScanner();
        }
      }
    } catch (error) {
      console.error("Barcode lookup error:", error);
      toast.error("Failed to look up product");
      isProcessingRef.current = false;
      if (mode === "camera") {
        startScanner();
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
      startScanner();
    } else {
      stopScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [open, mode, startScanner, stopScanner]);

  useEffect(() => {
    if (!open) {
      setManualBarcode("");
      setCameraError(null);
      setMode("camera");
      isProcessingRef.current = false;
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
          <DialogDescription className="sr-only">
            Scan a product barcode to look up nutritional information
          </DialogDescription>
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
                  <div 
                    id={scannerContainerId}
                    className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden [&_video]:!object-cover [&_video]:!rounded-lg"
                  />
                  
                  {isScanning && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Position the barcode within the frame
                    </p>
                  )}
                  
                  {!isScanning && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
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
