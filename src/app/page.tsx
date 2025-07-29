import Link from "next/link";
import Image from "next/image";
import { ScanQrCode, Dumbbell } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#121111] to-[#020217] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-10">
          <Image src="/logo.png" alt="GymAR Logo" width={200} height={200}/>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href=""
          >
            <div className="text-lg items-center justify-center flex flex-col gap-2 text-center">
              <ScanQrCode className="h-40 w-30 text-white" />
              Use seu celular para escanear o QR Code do aparelho e obter informações sobre ele.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/exercise"
          >
            <div className="text-lg items-center justify-center flex flex-col gap-2 text-center">
              <Dumbbell className="h-40 w-30 text-white" />
              <span className="ml-2">Escolha o exercício que deseja realizar.</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
