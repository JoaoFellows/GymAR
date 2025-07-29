"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);

    const startScanner = () => {
      scanner.render(
        (text: string) => {
          console.log("QR Code:", text);
          alert("QR Code: " + text);

          // scanner.clear() retorna uma Promise, então trate corretamente:
          scanner.clear().catch((err) => {
            console.error("Erro ao limpar scanner:", err);
          });
        },
        (err: string) => {
          console.warn("Erro ao escanear:", err);
        }
      );
    };

    startScanner();
  }, []);

  return (
    <div>
      <h1>Escanear QR Code</h1>
      <div id="reader" style={{ width: 300 }} />
    </div>
  );
}
