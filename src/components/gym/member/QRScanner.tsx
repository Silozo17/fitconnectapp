import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onScanSuccess: (data: { userId: string; gymId: string; classId?: string }) => Promise<void>;
  gymId: string;
  classId?: string;
}

export function QRScanner({ onScanSuccess, gymId, classId }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await handleScan(decodedText);
        },
        () => {
          // Ignore scan errors (no QR found in frame)
        }
      );

      setScanning(true);
    } catch (error) {
      console.error("Failed to start scanner:", error);
      toast.error("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error("Failed to stop scanner:", error);
      }
    }
    setScanning(false);
  };

  const handleScan = async (decodedText: string) => {
    if (processing) return;

    // Pause scanning while processing
    setProcessing(true);
    await stopScanning();

    try {
      // Parse QR code data
      if (!decodedText.startsWith("GYM_CHECKIN:")) {
        throw new Error("Invalid QR code format");
      }

      const token = decodedText.replace("GYM_CHECKIN:", "");
      const payload = JSON.parse(atob(token));

      // Validate expiry
      if (Date.now() > payload.exp) {
        throw new Error("QR code has expired");
      }

      // Validate gym ID matches
      if (payload.gymId !== gymId) {
        throw new Error("QR code is for a different gym");
      }

      // If classId is specified, validate it matches
      if (classId && payload.classId && payload.classId !== classId) {
        throw new Error("QR code is for a different class");
      }

      // Process check-in
      await onScanSuccess({
        userId: payload.userId,
        gymId: payload.gymId,
        classId: payload.classId || classId,
      });

      setLastResult({
        success: true,
        message: "Check-in successful!",
      });

      toast.success("Member checked in successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process QR code";
      setLastResult({
        success: false,
        message,
      });
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan a member's QR code to check them in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scanner Container */}
        <div 
          id="qr-reader" 
          ref={containerRef}
          className="w-full aspect-square max-w-md mx-auto bg-muted rounded-lg overflow-hidden"
        >
          {!scanning && !processing && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <CameraOff className="h-12 w-12 mb-4 opacity-50" />
              <p>Camera not active</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!scanning ? (
            <Button onClick={startScanning} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={stopScanning}>
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Last Result */}
        {lastResult && (
          <Alert variant={lastResult.success ? "default" : "destructive"}>
            {lastResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription className="ml-2">
              {lastResult.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Scanning indicator */}
        {scanning && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Scanning for QR codes...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
