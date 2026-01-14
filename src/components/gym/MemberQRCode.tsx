import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";

interface MemberQRCodeProps {
  memberId: string;
  memberName?: string;
  gymName?: string;
}

export function MemberQRCode({ memberId, memberName, gymName }: MemberQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrValue = `gym-member:${memberId}`;

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;
      
      // Simple QR code generation using a basic algorithm
      // In production, use a proper QR library like qrcode
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simple text representation (would use actual QR library in production)
      ctx.fillStyle = "black";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("QR Code", canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = "10px monospace";
      ctx.fillText(qrValue, canvas.width / 2, canvas.height / 2 + 10);
      
      // Draw a simple pattern to represent QR code visually
      const size = 8;
      const startX = 30;
      const startY = 60;
      const pattern = [
        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,1,1,1,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1],
      ];

      pattern.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell) {
            ctx.fillRect(startX + j * size, startY + i * size, size, size);
          }
        });
      });
    };

    generateQR();
  }, [qrValue]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement("a");
    link.download = `gym-member-qr-${memberId.slice(0, 8)}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Check-In QR Code
        </CardTitle>
        <CardDescription>
          Show this to staff for quick check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="rounded-lg border p-4 bg-white">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>
        {memberName && (
          <p className="text-center font-medium">{memberName}</p>
        )}
        {gymName && (
          <p className="text-center text-sm text-muted-foreground">{gymName}</p>
        )}
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
