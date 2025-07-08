'use client';
import Link from "next/link";
import Header from "@/components/Header";
import { Dumbbell, ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function ExercisesPages() {
    const router = useRouter();

    return (
        <div className="bg-gradient-to-b from-[#121111] to-[#020217]">
            <Header />
            <main className="flex min-h-screen flex-col items-center py-6  text-white">
                <div className="container flex flex-col items-center justify-center p-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-white mb-4 hover:underline absolute top-12 left-4 font-"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </button>
                    <div className="flex items-center mb-4">
                        <h1 className="text-3xl font-bold">Exercícios</h1>
                        <Dumbbell className="h-8 w-8 text-white ml-2" />
                    </div>
                    <p className="text-center"> Selecione um grupo muscular para ver os exercícios disponíveis.</p>
                </div>

                <div className="container flex flex-col items-center justify-center gap-8 px-4 py-10">
                    <Link
                        className="flex w-64 h-32 flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 items-center justify-center"
                        href="/exercise/upper-body"
                    >
                        <div className="text-lg flex flex-col gap-2 text-center items-center justify-center">
                            <span className="ml-2">Parte Superior</span>
                        </div>
                    </Link>
                    <Link
                        className="flex w-64 h-32 flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 items-center justify-center"
                        href="/exercise/lower-body"
                    >
                        <div className="text-lg flex flex-col gap-2 text-center items-center justify-center">
                            <span className="ml-2 ">Parte Inferior</span>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}