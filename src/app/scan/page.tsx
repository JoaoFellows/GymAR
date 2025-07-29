import { Html5QrcodeScanner } from "html5-qrcode";

const qrScanner = new Html5QrcodeScanner(
  "reader", 
  { fps: 10, qrbox: 250 },
  false
);

qrScanner.render(
  (decodedText: string, decodedResult) => {
    console.log("QR Code:", decodedText);
    document.getElementById("result")!.innerText = decodedText;
    qrScanner.clear(); // para parar após ler
  },
  (errorMessage: string) => {
    // ignora erros contínuos
  }
);