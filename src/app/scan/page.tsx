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
      // forçar a câmera traseira
      facingMode: { exact: "environment" },
    };

    const startScanner = async () => {
      try {
        await scanner.start(
          "environment",
          config,
          (text: string) => {
            console.log("QR Code:", text);

            // Redireciona automaticamente para o link
            window.location.href = text;

            // Parar o scanner
            scanner.stop().catch((err) => console.error("Erro ao parar scanner:", err));
          },
          (err) => {
            console.warn("Erro ao escanear:", err);
          }
        );
      } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
      }
    };

    startScanner();

    // Cleanup ao desmontar
    return () => {
      // Ignorar promessa conforme recomendado pela regra no-floating-promises
      void scanner.stop().catch(() => {
        // Ignorar erro ao parar scanner
      });
      try {
        scanner.clear();
      } catch {
        // Ignorar erro ao limpar scanner
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
