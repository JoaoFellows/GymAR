'use client';
import { use } from "react";
import Header from "@/components/Header";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { exercises } from "@/data/exercises";
import { useWorkoutPlanner } from "@/hooks/useWorkoutPlanner";
import Toast from "@/components/Toast";

type Props = { params: Promise<{ category: string; }>; };

export default function CategoryPage({ params }: Props) {
    const { category } = use(params);
    const router = useRouter();
    const { addExercise, isExerciseSelected, toast, hideToast } = useWorkoutPlanner();

    if (!category) {
        notFound();
    }

    const handleAddToWorkout = (exercise: typeof exercises[0]) => {
        addExercise(exercise);
    };

    return (
        <div className="bg-gradient-to-b from-[#121111] to-[#020217] min-h-screen text-white text-center">
            <Header />
            <button
                onClick={() => router.back()}
                className="flex items-center text-white mb-4 hover:underline absolute top-12 left-4"
                aria-label="Voltar"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
            </button>
            <main>
                <h1 className="text-3xl font-bold mb-8 pt-8">Exercícios de {category}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {exercises.filter(ex => ex.category === category).map(exercise => (
                        <div key={exercise.id} className="bg-[#1e1e2f] p-4 rounded-lg hover:bg-[#292945] transition">
                            <h2 className="text-lg font-bold mb-2">{exercise.title}</h2>
                            <p className="text-gray-300 mb-4">{exercise.description}</p>
                            <div className="flex gap-2 justify-center">
                                <Link
                                    href={`/exercise/${category}/${exercise.slug}`}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
                                >
                                    Visualizar AR
                                </Link>
                                <button
                                    onClick={() => handleAddToWorkout(exercise)}
                                    disabled={isExerciseSelected(exercise.id)}
                                    className={`px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1 ${
                                        isExerciseSelected(exercise.id)
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    <Plus className="h-4 w-4" />
                                    {isExerciseSelected(exercise.id) ? 'Adicionado' : 'Adicionar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Link para o Workout Planner */}
                <div className="mt-8 pb-8">
                    <Link
                        href="/workout-planner"
                        className="inline-flex items-center bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Ver Treino do Dia
                    </Link>
                </div>
            </main>
            
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
}
