"use client"; // obrigatório se usar APIs do navegador como câmera

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);

    scanner.render(
      (text: string) => {
        console.log("QR Code:", text);
        alert("QR Code: " + text);
        scanner.clear(); // para parar após escanear
      },
      (err: string) => {
        console.warn("Erro ao escanear:", err);
      }
    );
  }, []);

  return (
    <div>
      <h1>Escanear QR Code</h1>
      <div id="reader" style={{ width: 300 }} />
    </div>
  );
}