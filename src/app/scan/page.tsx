"use client";

import { useEffect } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function ScanPage() {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          console.error("Nenhuma câmera disponível.");
          return;
        }

        // Tenta achar câmera traseira
        const backCamera = devices.find(device =>
          device.label.toLowerCase().includes("back")
        ) || devices[0]; // Fallback: primeira câmera

        if (!backCamera) {
          console.error("Nenhuma câmera traseira encontrada.");
          return;
        }

        await scanner.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
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

    void startScanner();

    return () => {
      void scanner.stop().catch(() => {});
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
