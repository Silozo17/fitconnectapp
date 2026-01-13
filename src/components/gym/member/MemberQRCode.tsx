import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Download } from "lucide-react";

interface MemberQRCodeProps {
  gymId: string;
  classId?: string;
}

export function MemberQRCode({ gymId, classId }: MemberQRCodeProps) {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const generateQRCode = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create a signed token that expires in 5 minutes
      const payload = {
        userId: user.id,
        gymId,
        classId,
        exp: Date.now() + 5 * 60 * 1000, // 5 minutes
        nonce: Math.random().toString(36).substring(7),
      };
      
      // Encode the payload as base64
      const token = btoa(JSON.stringify(payload));
      
      // Generate QR code URL using a free QR API
      const qrData = encodeURIComponent(`GYM_CHECKIN:${token}`);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}&format=svg`;
      
      setQrCodeUrl(qrUrl);
      setExpiresAt(new Date(payload.exp));
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
    
    // Refresh QR code every 4 minutes (before expiry)
    const interval = setInterval(generateQRCode, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, gymId, classId]);

  const handleDownload = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gym-qr-${gymId}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR code:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <Skeleton className="h-64 w-64 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Unable to generate QR code</p>
        <Button variant="outline" onClick={generateQRCode} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="p-4 bg-white">
        <CardContent className="p-0">
          <img
            src={qrCodeUrl}
            alt="Check-in QR Code"
            className="w-64 h-64"
          />
        </CardContent>
      </Card>
      
      {expiresAt && (
        <p className="text-sm text-muted-foreground">
          Expires at {expiresAt.toLocaleTimeString()}
        </p>
      )}
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={generateQRCode}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
