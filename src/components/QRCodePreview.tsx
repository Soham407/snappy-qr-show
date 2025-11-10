// src/components/QRCodePreview.tsx

import { useRef, useEffect } from "react";
import QRCodeStyling, { type Options as QRCodeOptions } from "qr-code-styling";
import { getRedirectUrl } from "@/lib/qr-utils";

// Define the shape of the design data
type DesignOptions = {
  dot_color: string | null;
  background_color: string | null;
  corner_color: string | null;
  logo_url: string | null;
  frame_text: string | null;
};

type QRPreviewProps = {
  type: "static" | "dynamic";
  data: string; // This will be destination_url or short_url
  design: Partial<DesignOptions>;
  width?: number;
  height?: number;
};

const QRCodePreview = ({ type, data, design, width = 200, height = 200 }: QRPreviewProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  
  // Determine if this is a small preview (like in list view)
  const isSmall = width <= 50;

  useEffect(() => {
    if (!qrRef.current) return;

    // Clear previous QR code
    qrRef.current.innerHTML = "";

    // Determine the data to encode. Dynamic codes use the redirect URL.
    const qrData = type === 'dynamic' ? getRedirectUrl(data) : data;

    // Define a narrowed option type for qr-code-styling constructor to avoid `any`.
    const qrOptions: Partial<QRCodeOptions> = {
      width,
      height,
      type: "svg",
      data: qrData,
      dotsOptions: {
        color: design.dot_color || "#000000",
        type: "rounded" as const,
      },
      backgroundOptions: {
        color: design.background_color || "#ffffff",
      },
      cornersSquareOptions: {
        color: design.corner_color || design.dot_color || "#000000",
        type: "extra-rounded" as const,
      },
      cornersDotOptions: {
        color: design.corner_color || design.dot_color || "#000000",
        type: "dot" as const,
      },
    };

    // Always supply imageOptions object to avoid library accessing properties of undefined (hideBackgroundDots)
    qrOptions.imageOptions = {
      crossOrigin: "anonymous",
      margin: design.logo_url ? 8 : 0,
      hideBackgroundDots: false,
      imageSize: 0.4,
    };
    if (design.logo_url) {
      qrOptions.image = design.logo_url;
    }

    // Add native frame support if frame text exists
    if (design.frame_text) {
      qrOptions.qrOptions = {
        errorCorrectionLevel: "H"
      };
      qrOptions.imageOptions = {
        ...qrOptions.imageOptions,
        margin: 10
      };
    }

    // Create and append new QR code
    qrCode.current = new QRCodeStyling(qrOptions);
    qrCode.current.append(qrRef.current);

  }, [type, data, design, width, height, isSmall]);

  // This renders the QR code with native frame
  // For small previews (list view), use minimal styling
  if (isSmall) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div ref={qrRef} className="flex items-center justify-center" />
      </div>
    );
  }

  // For larger previews (grid/sheet), use full styling
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative p-4 bg-white rounded-2xl shadow-lg">
        <div ref={qrRef} className="flex items-center justify-center" />
        {design.frame_text && (
          <div className="mt-2 text-center">
            <p className="font-semibold text-sm text-foreground">{design.frame_text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodePreview;