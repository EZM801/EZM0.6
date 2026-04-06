"use client"

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const startScanning = async () => {
      try {
        if (!videoRef.current) return;

        const codeReader = new BrowserQRCodeReader();
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          throw new Error('No video input devices found');
        }

        // Use the first available camera
        const selectedDeviceId = videoInputDevices[0].deviceId;

        controlsRef.current = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result: Result | undefined, error?: Error) => {
            if (result) {
              const scannedText = result.getText();
              stopScanning();
              onScan(scannedText);
            }
            if (error) {
              setError(error.message);
              onError?.(error);
            }
          }
        );

        setIsScanning(true);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        onError?.(error);
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [onScan, onError]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        className="w-full rounded-lg shadow-lg"
        playsInline
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-white text-center p-4">{error}</p>
        </div>
      )}
      {isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-blue-500 rounded-lg animate-pulse" />
        </div>
      )}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70"
          onClick={() => {
            stopScanning();
            onClose();
          }}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      )}
    </div>
  );
}

