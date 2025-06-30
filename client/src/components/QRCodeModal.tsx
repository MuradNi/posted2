import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: number | null;
  botName: string;
}

export function QRCodeModal({ isOpen, onClose, botId, botName }: QRCodeModalProps) {
  const [retryCount, setRetryCount] = useState(0);

  const { data: qrData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/whatsapp-bots', botId, 'qr', retryCount],
    enabled: isOpen && botId !== null,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  useEffect(() => {
    if (!isOpen) {
      setRetryCount(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect WhatsApp - {botName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Scan the QR code below with your WhatsApp mobile app to connect the bot.
          </p>
          
          <div className="w-64 h-64 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-gray-500">Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center space-y-2 text-center">
                <p className="text-sm text-red-600">Failed to load QR code</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : qrData?.qrCode ? (
              <img 
                src={qrData.qrCode} 
                alt="WhatsApp QR Code" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center space-y-2 text-center">
                <p className="text-sm text-gray-500">QR code not available</p>
                <p className="text-xs text-gray-400">Bot may already be connected</p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>1. Open WhatsApp on your phone</p>
            <p>2. Go to Settings → Linked Devices</p>
            <p>3. Tap "Link a Device" and scan this QR code</p>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
