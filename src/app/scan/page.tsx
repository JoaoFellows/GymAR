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
        await scanner.start(
          { facingMode: "environment" }, // Força o uso da câmera traseira
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
      void scanner.stop().catch((err) =>
        console.warn("Erro ao parar scanner na desmontagem:", err)
      );
      try {
        scanner.clear();
      } catch (err) {
        console.error("Erro ao limpar scanner:", err);
      }
    };
  }, []);

    return (
        <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
            <h1 style={{ position: "absolute", top: 10, left: 0, width: "100%", textAlign: "center", color: "#fff", zIndex: 2 }}>
            Escaneando QR Code...
            </h1>
            <div
            id="reader"
            style={{
                width: "100vw",
                height: "100vh",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                background: "#000"
            }}
            />
        </div>
    );
}
