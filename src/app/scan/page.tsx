"use client";

import { useEffect } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function ScanPage() {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      facingMode: "environment",
    };

    const startScanner = async () => {
      try {
        await scanner.start(
          config.facingMode,
          config,
          (text: string) => {
            console.log("QR Code:", text);

            window.location.href = text;

            scanner.stop().catch((err) =>
              console.error("Erro ao parar scanner:", err)
            );
          },
          (err) => {
            console.warn("Erro ao escanear:", err);
          }
        );
      } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
      }
    };

    // Evita erro de no-floating-promises
    void startScanner();

    return () => {
        void scanner.stop().catch(() => {
            // Ignorar erro ao parar scanner
        });
        try {
            scanner.clear();
        } catch (err) {
            console.error("Erro ao limpar scanner:", err);
        }
    };
  }, []);

  return (
    <div>
      <h1>Escaneando QR Code...</h1>
      <div id="reader" style={{ width: 300 }} />
    </div>
  );
}
